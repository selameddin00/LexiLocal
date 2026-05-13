import os
import json
import time
from typing import Dict, List, Any, Optional, Tuple

import chromadb
from sentence_transformers import SentenceTransformer
from openai import OpenAI, RateLimitError
from dotenv import load_dotenv

load_dotenv()


TOP_K_PER_LABEL = 3
COLLECTION_NAME = "rag_chunks"
EMBEDDING_MODEL_NAME = "paraphrase-multilingual-MiniLM-L12-v2"
TOGETHER_BASE_URL: str = "https://api.together.xyz/v1"
TOGETHER_MODEL_NAME: str = "meta-llama/Llama-3.3-70B-Instruct-Turbo"
GROQ_POST_CALL_SLEEP_SECONDS: float = 2.0
GROQ_MAX_RETRY_ATTEMPTS: int = 3
GROQ_INITIAL_BACKOFF_SECONDS: float = 2.0


_model: Optional[SentenceTransformer] = None
_chroma_client = None
_collection = None
_chunk_map: Optional[Dict[str, Dict[str, Any]]] = None


def _error_result(message: str, labels: List[str] = None) -> Dict[str, Any]:
    return {
        "error": message,
        "rag_report": None,
        "used_chunks": [],
        "chunks_per_label": {},
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


def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer(EMBEDDING_MODEL_NAME)
    return _model


def _get_chroma_client():
    global _chroma_client
    if _chroma_client is None:
        _chroma_client = chromadb.Client()
    return _chroma_client


def _initialize_rag_index() -> Tuple[SentenceTransformer, Any, Dict[str, Dict[str, Any]]]:
    """Load all reference chunks into a singleton ChromaDB collection on first call."""
    global _collection, _chunk_map

    if _collection is not None and _chunk_map is not None:
        return _get_model(), _collection, _chunk_map

    model = _get_model()
    client = _get_chroma_client()

    all_chunks = _load_reference_chunks()

    chunk_map: Dict[str, Dict[str, Any]] = {}
    documents: List[str] = []
    ids: List[str] = []
    metadatas: List[Dict[str, Any]] = []
    for index, chunk in enumerate(all_chunks):
        if not isinstance(chunk, dict):
            continue
        chunk_id = str(chunk.get("id") or f"chunk_{index}")
        chunk_map[chunk_id] = chunk
        documents.append(str(chunk.get("content", "")))
        ids.append(chunk_id)
        metadatas.append(
            {
                "label": str(chunk.get("label", "")),
                "type": str(chunk.get("type", "")),
            }
        )

    if not documents:
        raise RuntimeError("Referans chunk verisi boş.")

    try:
        client.delete_collection(COLLECTION_NAME)
    except Exception:
        pass

    collection = client.create_collection(COLLECTION_NAME)
    embeddings = model.encode(documents, show_progress_bar=False).tolist()
    collection.add(
        ids=ids,
        documents=documents,
        embeddings=embeddings,
        metadatas=metadatas,
    )

    _collection = collection
    _chunk_map = chunk_map
    return model, collection, chunk_map


def _semantic_select_chunks(
    model: SentenceTransformer,
    collection: Any,
    chunk_map: Dict[str, Dict[str, Any]],
    labels: List[str],
    student_data: Dict[str, Any],
) -> Dict[str, List[Dict[str, Any]]]:
    result: Dict[str, List[Dict[str, Any]]] = {label: [] for label in labels}

    label_counts: Dict[str, int] = {}
    for chunk in chunk_map.values():
        chunk_label = str(chunk.get("label", ""))
        if chunk_label:
            label_counts[chunk_label] = label_counts.get(chunk_label, 0) + 1

    for label in labels:
        available = label_counts.get(label, 0)
        safe_n = min(TOP_K_PER_LABEL, available)
        if safe_n <= 0:
            result[label] = []
            continue

        query = f"{label} {json.dumps(student_data, ensure_ascii=False)}"
        query_embedding = model.encode([query], show_progress_bar=False).tolist()
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
    metrikler = f"""- Okuma hızı: {student_data.get('reading_speed', '-')} kelime/dakika
- Okuma doğruluğu: {student_data.get('accuracy', '-')}%
- Ses farkındalığı: {student_data.get('phonological_awareness_percent', '-')}%
- Görsel ayırt etme puanı: {student_data.get('visual_discrimination_score', '-')}
- Görsel takip süresi: {student_data.get('visual_tracking_seconds', '-')} saniye
- Sıralama becerisi puanı: {student_data.get('sequencing_score', '-')}"""

    return f"""Sen bir eğitim destek uzmanısın. Aşağıdaki öğrenci verilerini ve referans bilgileri kullanarak Türkçe bir destek raporu yaz.

KURALLAR:
- Raporun tamamı Türkçe olacak.
- Tıbbi teşhis koyma, yalnızca gözlem ve öneri sun.
- Öğretmen ve veliye hitap et.
- "görülmektedir", "anlaşılmaktadır", "ifade etmektedir", "gösterebilir", "sağlayabilir" gibi robotik ifadeler kullanma.
- Aktif, net ve anlaşılır cümleler kur.
- student_id, "Örnek Student", "Ham Veri", "Kimlik", "Öğrenci Verisi" gibi teknik ifadeleri rapora yansıtma.
- Aşağıdaki çıktı şablonunu birebir kullan.
- Önce ## Genel Öneriler, ardından tespit edilen her label için şablondaki blok sırasıyla gelsin; bu genel sırayı değiştirme.
- Her tespit edilen label için aynı label yapısını tekrarla.
- Tespit edilmeyen alanlar için bölüm üretme.
- Referans bilgileri kullan, ancak birebir kopyalama.
- Öneriler somut, uygulanabilir ve öğretmen/veli tarafından anlaşılır olmalı.
- Raporun en başına "## Genel Öneriler" başlığı ekle.
- "## Genel Öneriler" bölümüne tüm alanlara uygulanabilecek genel destek önerilerini yaz.
- "Özel eğitime katılım", "uzman desteği", "aile-öğretmen iş birliği", "düzenli takip" gibi genel öneriler yalnızca "## Genel Öneriler" bölümünde yer almalı.
- Genel önerileri her metrik altında tekrar etme.
- Her metrik altındaki **Öneriler:** bölümüne yalnızca o metriğe özgü, referans bilgilerden çıkarılan spesifik yöntemleri yaz.
- Her metrik altındaki öneriler ilgili alanın güçlüğüne doğrudan bağlı olmalı.
- Farklı metrikler altında aynı yöntemi tekrar etme.
- Öneriler bölümünde her öneriyi yöntem adıyla başlat ve yöntem adını **bold** yaz.
- Yöntemin nasıl uygulanacağını referans bilgilerden çıkar.
- Teknik terimleri öğretmen ve velinin anlayacağı şekilde sadeleştir.
- Referans metni birebir kopyalama, içeriği kavrayıp yeniden ifade et.
- **Etkisi:** bölümünü somut ve hissettiren bir dille yaz.
- "Zorluk yaşayabilir", "etkileyebilir", "güçlük oluşturabilir" gibi yüzeysel ve belirsiz ifadeler kullanma.
- **Etkisi:** bölümünde şu anlatım mantığını kullan: "Bu yetersizlik nedeniyle öğrenci [somut güçlük 1], [somut güçlük 2] ve [somut güçlük 3] ile karşılaşır."
- Okuyucunun öğrencinin yaşadığı güçlüğü somut olarak anlayacağı açık örnekler kullan.
- Her label için yalnızca o label ile ilişkili somut etki ve yöntemleri yaz.
- Yeni bölüm başlığı ekleme. Yalnızca "## Genel Öneriler" ve her label için "## [LABEL TÜRKÇE ADI]" başlıklarını kullan.

ÖĞRENCİ METRİKLERİ:
{metrikler}

TESPİT EDİLEN ALANLAR:
{", ".join(labels)}

LABEL TÜRKÇE KARŞILIKLARI:
- OKUMA_HIZI → Okuma Hızı
- OKUMA_DOGRULUGU → Okuma Doğruluğu
- FONOLOJIK_FARKINDALIK → Fonolojik Farkındalık
- GORSEL_ISLEME → Görsel İşleme
- GORSEL_TAKIP → Görsel Takip
- CALISMA_BELLEGI_SIRALAMA → Çalışma Belleği ve Sıralama

REFERANS BİLGİLER:
{chunks_text}

FORMAT ZORUNLULUKLARI:
- Rapor "## Genel Öneriler" ile başlamalı; bu başlıktan önce --- koyma.
- Genel öneri maddelerinde her maddeyi "- **[Kısa başlık]:** açıklama" biçiminde yaz.
- "## Genel Öneriler" bölümünden sonra her label bloğu --- ile başlayacak; --- satırından sonra ## ile Türkçe alan başlığı gelecek.
- Her label için ## başlık kullan; başlıkta yalnızca yukarıdaki eşleştirmeye göre Türkçe alan adı yaz.
- Her label altında yalnızca şu üç bölüm olacak ve bu sırayı değiştirme:
  - **Durum:**
  - **Etkisi:**
  - **Öneriler:**
- "Genel Değerlendirme", "Ham Veri", "Kimlik", "Öğrenci Bilgisi" veya bunlara benzeyen ekstra bölümler oluşturma.
- Çıktıda köşeli parantezli yer tutucu ifadeleri bırakma; hepsini dolu Türkçe metinle değiştir.
- Markdown formatını koru.

ÇIKTI ŞABLONU:
Aşağıdaki yapıyı birebir kullan. Köşeli parantezleri çıktı içinde bırakma, içlerini doldur.

## Genel Öneriler

- **[Genel Öneri 1]:** [Tüm alanlara uygulanabilecek genel destek önerisi.]
- **[Genel Öneri 2]:** [...]

---
## [İLK LABEL TÜRKÇE ADI]

**Durum:** [Bu alandaki ölçüm değerini ve ne anlama geldiğini 1-2 cümleyle açıkla.]

**Etkisi:** [Bu yetersizlik nedeniyle öğrencinin yaşayacağı somut güçlükleri, yukarıdaki üçlü yapı ve açık örneklerle anlat; "etkileyebilir" gibi belirsiz ifadeler kullanma.]

**Öneriler:**
- **[Yöntem Adı]:** [Bu yöntemi referans bilgilerden anlayarak, teknik terimleri sadeleştirerek açıkla. Birebir kopyalama.]
- **[Yöntem Adı]:** [...]

---
## [İKİNCİ LABEL TÜRKÇE ADI]

**Durum:** [...]

**Etkisi:** [...]

**Öneriler:**
- **[Yöntem Adı]:** [...]
- **[Yöntem Adı]:** [...]

---
[Her label için aynı yapıyı tekrarla.]"""


def _call_groq_once(client: OpenAI, prompt: str) -> str:
    response = client.chat.completions.create(
        model=TOGETHER_MODEL_NAME,
        max_tokens=8000,
        temperature=0,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    report_text = (response.choices[0].message.content or "").strip()
    if not report_text:
        raise ValueError("LLM boş rapor döndürdü.")
    return report_text


def _generate_with_gemini(prompt: str) -> str:
    api_key = os.getenv("TOGETHER_API_KEY")
    if not api_key:
        raise ValueError("TOGETHER_API_KEY bulunamadı")

    client = OpenAI(
        api_key=api_key,
        base_url=TOGETHER_BASE_URL,
        max_retries=0,
    )

    backoff_seconds = GROQ_INITIAL_BACKOFF_SECONDS
    last_rate_limit_error: Optional[RateLimitError] = None

    for attempt in range(1, GROQ_MAX_RETRY_ATTEMPTS + 1):
        try:
            report_text = _call_groq_once(client, prompt)
            time.sleep(GROQ_POST_CALL_SLEEP_SECONDS)
            return report_text
        except RateLimitError as exc:
            last_rate_limit_error = exc
            if attempt >= GROQ_MAX_RETRY_ATTEMPTS:
                break
            time.sleep(backoff_seconds)
            backoff_seconds *= 2

    raise RuntimeError(
        f"LLM rate limit aşıldı ({GROQ_MAX_RETRY_ATTEMPTS} deneme): {last_rate_limit_error}"
    )


def generate_rag_report(
    labels: List[str],
    student_data: Dict[str, Any],
) -> Dict[str, Any]:
    if not labels:
        return _error_result("Label listesi boş.", labels=[])

    try:
        model, collection, chunk_map = _initialize_rag_index()
    except Exception as exc:
        return _error_result(f"RAG index hazırlama hatası: {exc}", labels=labels)

    try:
        chunks_by_label = _semantic_select_chunks(
            model=model,
            collection=collection,
            chunk_map=chunk_map,
            labels=labels,
            student_data=student_data,
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

    used_chunks: List[str] = []
    chunks_per_label: Dict[str, List[Dict[str, Any]]] = {}
    for label in labels:
        label_chunks: List[Dict[str, Any]] = []
        for chunk in chunks_by_label.get(label, []):
            used_chunks.append(
                f"{chunk.get('id', 'no_id')} | {label} | {chunk.get('type', 'unknown')} | {chunk.get('content', '')}"
            )
            label_chunks.append(
                {
                    "id": chunk.get("id"),
                    "label": label,
                    "type": chunk.get("type"),
                    "content": chunk.get("content", ""),
                }
            )
        chunks_per_label[label] = label_chunks

    return {
        "rag_report": rag_report,
        "used_chunks": used_chunks,
        "chunks_per_label": chunks_per_label,
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
                        "chunks_per_label": {},
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
