# Revizyon: Ek Okuma Metrikleri (Node.js API)

**Dosya:** `server.js`  
**Amaç:** Python tarafındaki (`analysis.py`) ek metrik başlıklarını backend’de kabul etmek ve `POST /analyze/:studentId` analizinde etiket + açıklama üretmek. Mevcut route ve DB şeması korunmuştur.

---

## 1. Yeni yardımcılar

| Öğe | Görev |
|-----|--------|
| `lastReadingExtraMetrics` | DB’ye yazılmayan dört metriği, öğrenci kimliğine göre son okuma isteğinde bellekte tutar (`student_id` string anahtar). |
| `optFiniteNum(v)` | İsteğe bağlı sayı alanları için: `undefined` / `null` / boş string → `undefined`; geçerli sonlu sayı → sayı; aksi → `undefined`. |
| `extraMetricsFromBody(body)` | `POST /analyze` gövdesinden aynı dört alanı güvenli şekilde okur. |

---

## 2. `normalizeReadingDataBody` genişletmesi

Dönüş nesnesine eklenen alanlar (hepsi isteğe bağlı):

- `phonological_awareness_percent`
- `visual_discrimination_score`
- `visual_tracking_seconds`
- `sequencing_score`

Mevcut alanlar (`reading_speed`, `accuracy`, `errors`) ve eşleme mantığı değiştirilmedi.

---

## 3. `POST /reading-data`

- Gövdeden normalize edilmiş dört alan okunur.
- Veritabanı `INSERT` ifadesi **aynı**: yalnızca `student_id`, `reading_speed`, `accuracy`, `errors`.
- Her istekte `lastReadingExtraMetrics[String(student_id)]` güncellenir; gönderilmeyen alanlar `undefined` kalır.

---

## 4. `POST /analyze/:studentId`

- Önce `req.body` içindeki dört metrik (`extraMetricsFromBody`) kullanılır; bir alan gövdede yoksa `lastReadingExtraMetrics` içindeki son değer devreye girer.
- Mevcut hız / doğruluk / hata sayısı blokları **aynen** bırakıldı; ardından aşağıdaki kurallar eklendi.

| Metrik | Koşul | Etiket | Açıklama (özet) |
|--------|--------|--------|------------------|
| `phonological_awareness_percent` | &lt; 50 | Ses farkındalığı: yüksek risk | Fonolojik farkındalık kritik eşik altı |
| | 50–70 (dahil) | Ses farkındalığı: orta risk | Riskli aralık |
| `visual_discrimination_score` | &lt; 7 | Düşük görsel ayırt etme | Puan düşük |
| `visual_tracking_seconds` | &gt; 90 | Görsel takip zayıf | Süre yüksek; takip zayıf olabilir |
| `sequencing_score` | &lt; 85 | Sıralama problemi | Kritik eşik altı |

Metrik `undefined` ise ilgili kural **çalışmaz** (zorunlu değil).

`summary`, `level`, `recommendations` ve `analysis_results` INSERT’i önceki davranışla uyumludur; yalnızca `labels` / `explanations` dizileri yeni metriklerle genişler.

---

## 5. Sınırlamalar ve kullanım notları

- Ek metrikler **veritabanına yazılmaz**; sunucu yeniden başlarsa bellekteki son değerler kaybolur.
- Analiz sırasında metrikleri doğrudan göndermek için `POST /analyze/:studentId` isteğinin gövdesinde aynı dört alan kullanılabilir (öncelik gövdede).
- Çok süreçli / ölçeklenen ortamda kalıcılık için ileride DB veya başka bir depolama gerekebilir; bu revizyon bilinçli olarak şema değişikliği içermez.

---

## 6. Özet

- **Genişletilen:** istek gövdesi okuma, bellekte son ek metrikler, analiz etiketleri/açıklamaları.  
- **Değiştirilmeyen:** PostgreSQL tablo şeması, mevcut endpoint sözleşmesinin çekirdeği, özet/öneri mantığının yapısı.
