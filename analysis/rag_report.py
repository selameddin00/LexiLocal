import os
import json
from typing import List, Dict, Any

import chromadb
from sentence_transformers import SentenceTransformer
from google import genai


PRIORITY_ORDER = ["method", "benefit", "application", "effect", "definition"]
MAX_CHUNKS_PER_LABEL = 5
TOP_K_PER_LABEL = 3
COLLECTION_NAME = "rag_chunks"
EMBEDDING_MODEL_NAME = "paraphrase-multilingual-MiniLM-L12-v2"


def _error_result(message: str, labels: List[str] = None) -> Dict[str, Any]:
    return {
        "error": message,
        "rag_report": None,
        "used_chunks": [],
        "labels": labels or [],
    }


def _load_reference_chunks() -> List[Dict[str, Any]]:
    base_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(base_dir, "referans_metrikleri_raporu.json")

    with open(json_path, "r", encoding="utf-8") as file:
        data = json.load(file)

    if not isinstance(data, list):
        raise ValueError("Referans JSON list formatında değil.")

    return data


def _filter_chunks_by_labels(
    all_chunks: List[Dict[str, Any]],
    labels: List[str],
) -> Dict[str, List[Dict[str, Any]]]:
    grouped: Dict[str, List[Dict[str, Any]]] = {label: [] for label in labels}

    for label in labels:
        label_chunks = [
            chunk for chunk in all_chunks if str(chunk.get("label", "")).strip() == label
        ]
        sorted_chunks = sorted(
            label_chunks,
            key=lambda item: PRIORITY_ORDER.index(item.get("type"))
            if item.get("type") in PRIORITY_ORDER
            else len(PRIORITY_ORDER),
        )
        grouped[label] = sorted_chunks[:MAX_CHUNKS_PER_LABEL]

    return grouped


def _flatten_chunks(grouped_chunks: Dict[str, List[Dict[str, Any]]]) -> List[Dict[str, Any]]:
    flat_chunks: List[Dict[str, Any]] = []
    for label, chunks in grouped_chunks.items():
        for chunk in chunks:
            chunk_copy = dict(chunk)
            chunk_copy["label"] = label
            chunk_id = chunk_copy.get("id")
            if not chunk_id:
                chunk_copy["id"] = f"{label}_{len(flat_chunks)}"
            flat_chunks.append(chunk_copy)
    return flat_chunks


def _build_embeddings_collection(filtered_chunks: List[Dict[str, Any]]):
    try:
        model = SentenceTransformer(EMBEDDING_MODEL_NAME)
        client = chromadb.Client()
        collection = client.create_collection(COLLECTION_NAME)
    except Exception as exc:
        raise RuntimeError(f"Embedding/Chroma başlatma hatası: {exc}") from exc

    try:
        documents = [str(chunk.get("content", "")) for chunk in filtered_chunks]
        embeddings = model.encode(documents).tolist()
        ids = [str(chunk.get("id", f"chunk_{i}")) for i, chunk in enumerate(filtered_chunks)]
        metadatas = [
            {
                "label": str(chunk.get("label", "")),
                "type": str(chunk.get("type", "")),
            }
            for chunk in filtered_chunks
        ]
        collection.add(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
        )
        return collection, model
    except Exception as exc:
        raise RuntimeError(f"Embedding oluşturma/ekleme hatası: {exc}") from exc


def _semantic_select_chunks(
    collection,
    model,
    labels: List[str],
    student_data: Dict[str, Any],
    filtered_chunks: List[Dict[str, Any]],
) -> Dict[str, List[Dict[str, Any]]]:
    chunk_map = {str(chunk.get("id")): chunk for chunk in filtered_chunks}
    result: Dict[str, List[Dict[str, Any]]] = {label: [] for label in labels}

    for label in labels:
        label_chunks_list = [c for c in filtered_chunks if c.get("label") == label]
        safe_n = min(TOP_K_PER_LABEL, len(label_chunks_list))
        if safe_n <= 0:
            result[label] = []
            continue

        query = f"{label} {json.dumps(student_data, ensure_ascii=False)}"
        query_embedding = model.encode([query]).tolist()
        query_result = collection.query(
            query_embeddings=query_embedding,
            n_results=safe_n,
            where={"label": label},
        )

        ids_for_label = query_result.get("ids", [[]])[0]
        selected = [chunk_map[chunk_id] for chunk_id in ids_for_label if chunk_id in chunk_map]
        result[label] = selected

    return result


def _format_chunks_by_label(labels: List[str], chunks_by_label: Dict[str, List[Dict[str, Any]]]) -> str:
    chunks_text = ""
    for label in labels:
        chunks_text += f"\n## {label}\n"
        for chunk in chunks_by_label.get(label, []):
            chunk_type = chunk.get("type", "unknown")
            content = chunk.get("content", "")
            chunks_text += f"- [{chunk_type}] {content}\n"
    return chunks_text.strip()


def _build_prompt(labels: List[str], student_data: Dict[str, Any], chunks_text: str) -> str:
    return f"""Sen bir eğitim uzmanısın.

Amaç:
Disleksi riski taşıyan bir öğrenci için açıklayıcı bir rapor üretmek.

Kurallar:
- Teknik ama anlaşılır dil kullan
- Tıbbi teşhis koyma
- Öğretmen ve veliye yönelik yaz
- Her başlıkta kısa açıklama + öneri ver

Öğrenci Verisi:
{json.dumps(student_data, ensure_ascii=False, indent=2)}

Tespit Edilen Alanlar:
{", ".join(labels)}

Referans Bilgiler (label gruplu):
{chunks_text}

Çıktı formatı:
Her tespit edilen alan için:
1. Durum Açıklaması
2. Olası Etkiler
3. Literatüre Dayalı Öneriler
"""


def _generate_with_gemini(prompt: str) -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY bulunamadı")

    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )
    report_text = (response.text or "").strip()

    if not report_text:
        raise ValueError("Gemini boş rapor döndürdü.")

    return report_text


def generate_rag_report(
    labels: List[str],
    student_data: Dict[str, Any],
) -> Dict[str, Any]:
    if not labels:
        return _error_result("Label listesi boş.", labels=[])

    try:
        all_chunks = _load_reference_chunks()
    except Exception as exc:
        return _error_result(f"JSON yükleme hatası: {exc}", labels=labels)

    filtered_by_label = _filter_chunks_by_labels(all_chunks, labels)
    filtered_chunks = _flatten_chunks(filtered_by_label)

    if not filtered_chunks:
        return _error_result("Seçilen label'lar için uygun chunk bulunamadı.", labels=labels)

    try:
        collection, model = _build_embeddings_collection(filtered_chunks)
    except Exception as exc:
        return _error_result(str(exc), labels=labels)

    try:
        chunks_by_label = _semantic_select_chunks(
            collection=collection,
            model=model,
            labels=labels,
            student_data=student_data,
            filtered_chunks=filtered_chunks,
        )
    except Exception as exc:
        return _error_result(f"Semantic selection hatası: {exc}", labels=labels)

    selected_count = sum(len(v) for v in chunks_by_label.values())
    if selected_count == 0:
        return _error_result("Semantic selection sonrası chunk bulunamadı.", labels=labels)

    chunks_text = _format_chunks_by_label(labels, chunks_by_label)
    prompt = _build_prompt(labels, student_data, chunks_text)

    try:
        rag_report = _generate_with_gemini(prompt)
    except Exception as exc:
        return _error_result(f"Gemini API hatası: {exc}", labels=labels)

    used_chunks = []
    for label in labels:
        for chunk in chunks_by_label.get(label, []):
            used_chunks.append(
                f"{chunk.get('id', 'no_id')} | {label} | {chunk.get('type', 'unknown')} | {chunk.get('content', '')}"
            )

    return {
        "rag_report": rag_report,
        "used_chunks": used_chunks,
        "labels": labels,
    }


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "--generate":
        try:
            payload = json.load(sys.stdin)
            result = generate_rag_report(
                payload.get("labels", []),
                payload.get("student_data", {}),
            )
            print(json.dumps(result, ensure_ascii=False))
        except Exception as exc:
            print(
                json.dumps(
                    {
                        "error": f"--generate çalıştırma hatası: {exc}",
                        "rag_report": None,
                        "used_chunks": [],
                        "labels": [],
                    },
                    ensure_ascii=False,
                )
            )
    else:
        sample_labels = ["OKUMA_HIZI"]
        sample_data = {"reading_speed": 70}

        result = generate_rag_report(sample_labels, sample_data)
        print(result)
