import os
import json
from typing import List, Dict, Any

import chromadb
from sentence_transformers import SentenceTransformer
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()


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


def _generate_with_gemini(prompt: str) -> str:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY bulunamadı")

    client = Groq(api_key=api_key)

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
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
        raise ValueError("Groq boş rapor döndürdü.")

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


