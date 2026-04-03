# Bridge refactor raporu

Node.js backend, karar motoru rolünden çıkarılıp doğrulama + veri köprüsü (Python analizine iletim) olarak sadeleştirildi. Veritabanı şeması değiştirilmedi.

---

## Dosya: `server.js`

**Ne değişti:** `child_process.spawn` ve `path` eklendi. `validateReadingMetrics`, `runPythonBridge` yardımcıları eklendi. `POST /analyze/:studentId` içindeki etiket/açıklama/özet/seviye/öneri üreten Node mantığı çok satırlı blok yorum (`/* ... */`) ile pasifleştirildi (silinmedi). Aynı rota artık birleştirilmiş okuma + ek metrikleri JSON olarak `python analysis.py --bridge` sürecine yazar, stdout’tan JSON okur, `analysis_results` tablosuna Python çıktısındaki `summary`, `level`, `recommendations` ile INSERT yapar ve yanıtı `{ student, analysis }` şeklinde döner. `student_id` boş kontrolü ve `reading_speed` / `accuracy` doğrulaması eklendi.

**Neden değişti:** Mimari gereksinim: analiz kararları Node’da değil Python’da üretilsin; Node yalnızca doğrulasın, taşısın ve sonucu iletsin.

**Sistem etkisi:** `POST /analyze/:studentId` JSON gövdesi artık düz alanlar (`student_id`, `summary`, …) yerine iç içe `student` + `analysis` nesnesi döner; mevcut istemciler bu endpoint’i kullanıyorsa uyarlama gerekir. `GET /analysis/:studentId` değişmedi. Python çalıştırılabilir olmalı (`python` PATH’te); aksi halde analiz 500 döner.

---

## Dosya: `analysis.py`

**Ne değişti:** Mevcut fonksiyonlar ve dosya sonundaki örnek çıktı silinmedi; `if __name__ == "__main__"` ile ikiye ayrıldı: `--bridge` argümanı varken stdin’den JSON okunur, `bridge_analyze_json` ile `labels`, `explanations`, `summary`, `level`, `recommendations` üretilir ve stdout’a JSON yazılır. Argüman yokken önceki davranış (rastgele öğrenci + `analiz_et` yazdırma) korunur. `_payload_to_analiz_row`, `_level_from_sonuclar`, `_recommendations_from_sonuclar` köprü katmanı eklendi; ek metrik gönderilmediğinde nötr varsayılanlar kullanılır (Node’da `undefined` iken ilgili etiketlerin üretilmemesine paralel).

**Neden değişti:** Node’un `child_process` ile tek giriş/tek çıkış JSON sözleşmesi ve mevcut `analiz_et` mantığının yeniden kullanılması.

**Sistem etkisi:** Üretim analiz yolu `python analysis.py --bridge` üzerinden; script doğrudan çalıştırıldığında köprü modu için `--bridge` gerekir. Türkçe çıktı UTF-8 (`ensure_ascii=False`) korunur.

---

## Özet risk notu

- **Şema:** Tablo/kolon eklenmedi veya kaldırılmadı.
- **Büyük refactor:** Yeni framework yok; tek route ve Python köprü girişi.
- **İstemci:** Sadece `/analyze/:studentId` yanıt şekli değişti; bilinçli kırılım, dokümante edildi.
