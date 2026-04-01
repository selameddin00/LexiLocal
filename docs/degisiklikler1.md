## Sprint 1 – Değişiklik Raporu

Amaç: Yapılan değişikliklerin izlenebilir ve anlaşılabilir olması.

---

### Dosya: `analysis.py`

- **Değişiklik:** Dosyanın başına, `import random` ile `def ogrenci_uret()` arasına yeni bir yardımcı fonksiyon eklendi.

  **Önce:** Doğrudan `import random` sonrası `def ogrenci_uret():` ile başlıyordu.

  **Sonra:**

```python
def reading_data_api_format(student_id_db, row):
    """Node POST /reading-data ile uyumlu govde (alan eslemesi: wpcm/percent -> DB kolonlari)."""
    return {
        "student_id": student_id_db,
        "reading_speed": row["reading_speed_wpcm"],
        "accuracy": row["reading_accuracy_percent"],
        "errors": [],
    }

def ogrenci_uret():
```

- **Satır(lar):** Yaklaşık **3–10** (yeni fonksiyon bloğu).

- **Değişiklik tipi:** Mapping + veri uyumu.

- **Neden yapıldı:** Python tarafında üretilen iç alan adları (`reading_speed_wpcm`, `reading_accuracy_percent`) ile Node `POST /reading-data` ve veritabanı kolon adları (`reading_speed`, `accuracy`) uyumsuzdu; üretim mantığı değiştirilmeden tek bir dönüşüm katmanı ile API gövdesi üretilebilmesi hedeflendi.

- **Etkisi:** Script çalıştırıldığında, aynı iç satırdan Node’un beklediği yapıda bir sözlük türetilebiliyor; `errors` sentetik akışta boş dizi olarak sabitlendi (şema ile uyum).

---

### Dosya: `analysis.py`

- **Değişiklik:** Script sonundaki çıktı bloğuna, örnek veritabanı öğrenci kimliği ve API gövdesinin yazdırılması eklendi.

  **Önce:** `print(sonuc)` ile bitiyordu.

  **Sonra:**

```python
# Ornek: veritabanindaki ogrenci id'si ile API govdesi (POST /reading-data)
ornek_db_id = 1
print("\nNode API icin okuma verisi govdesi (ornek student_id=%s):" % ornek_db_id)
print(reading_data_api_format(ornek_db_id, ogrenci))
```

- **Satır(lar):** Yaklaşık **146–149**.

- **Değişiklik tipi:** Veri uyumu + çıktı düzenleme (operasyonel örnek).

- **Neden yapıldı:** Sentetik satırın Node’a nasıl POST edileceğinin elle takip edilebilmesi için; `student_id`’nin gerçek kullanımda veritabanındaki sayısal `students.id` olması gerektiği örneklenerek vurgulandı.

- **Etkisi:** Konsolda ek bir blok çıkar; entegrasyon testi veya manuel kopyalama için referans verir.

---

### Dosya: `server.js`

- **Değişiklik:** `app.use(express.json());` ile PostgreSQL `Pool` tanımı arasına `normalizeReadingDataBody` fonksiyonu eklendi.

  **Önce:** `app.use` sonrası doğrudan `// 1. PostgreSQL...` ve `const pool = new Pool(...)` geliyordu.

  **Sonra:** Gövdeden `reading_speed` / `accuracy` / `errors` üretir; yoksa `reading_speed_wpcm`, `reading_accuracy_percent` ve isteğe bağlı `error_count` (sayıdan placeholder dizi) ile doldurur.

- **Satır(lar):** Yaklaşık **7–19**.

- **Değişiklik tipi:** Mapping + veri uyumu.

- **Neden yapıldı:** İstemci veya yardımcı scriptler farklı alan adları gönderdiğinde tek INSERT yolunda birleşmesi; Python/legacy isimlerinin kırılmadan kabul edilmesi.

- **Etkisi:** `POST /reading-data` aynı route üzerinden hem yeni hem eski isimlendirmeyle çalışabilir; `errors` dizi değilse boş diziye düşer.

---

### Dosya: `server.js`

- **Değişiklik:** `POST /reading-data` route gövdesi, `req.body` alanlarını doğrudan destructuring yerine normalizasyon üzerinden okuyacak şekilde güncellendi.

  **Önce:**

```javascript
const { student_id, reading_speed, accuracy, errors } = req.body;
// ... INSERT [student_id, reading_speed, accuracy, errors]
```

  **Sonra:**

```javascript
const { student_id } = req.body;
const { reading_speed, accuracy, errors } = normalizeReadingDataBody(req.body);
```

- **Satır(lar):** Yaklaşık **73–75**.

- **Değişiklik tipi:** Veri uyumu (route içi bağlama).

- **Neden yapıldı:** Yukarıdaki helper’ın gerçekten kullanılması ve INSERT parametrelerinin normalize edilmiş değerler olması.

- **Etkisi:** Veritabanına yazılan satır, artık mümkün olan en tutarlı `reading_speed` / `accuracy` / `errors` ile oluşur.

---

### Dosya: `server.js`

- **Değişiklik:** `POST /analyze/:studentId` içinde, tek satırlık `reading_speed` eşiğine dayalı `result` nesnesi genişletildi: `speed`, `acc`, `errorCount` türetildi; `labels` ve `explanations` dizileri eşik tabanlı `if` bloklarıyla dolduruldu; `summary`, `level`, `recommendations` önceki davranışı koruyacak şekilde ama doğruluk ve hata sayısına göre genişletildi; `result` nesnesine `labels` ve `explanations` eklendi.

  **Önce (özet):** Yalnızca `reading_speed < 80` ile `summary` / `level` / `recommendations` atanıyordu.

  **Sonra (özet):** Hız için &lt;40 ve 40–60 bantları; doğruluk için &lt;85 ve 85–91; `errors` uzunluğu için ≥5 ve ≥2; hiç etiket yoksa “Normal”; özet ve seviye için öncelik sırası (hız → doğruluk → hata sayısı); düşük seviyede öneri listesine koşullu ek maddeler.

- **Satır(lar):** Yaklaşık **104–171** (önceki tek blok yerine bu mantık bloğu).

- **Değişiklik tipi:** Mantık genişletme + output düzenleme.

- **Neden yapıldı:** Node analizinin yalnızca hıza dayanması ile veritabanında zaten bulunan `accuracy` ve `errors` alanlarının kullanılmaması problemi; Python’daki etiket/açıklama dilinin API yanıtında da okunabilir olması (yeni şema olmadan).

- **Etkisi:** JSON yanıtında `summary`, `level`, `recommendations` korunur; ek olarak `labels` ve `explanations` dizileri döner. `INSERT INTO analysis_results` hâlâ yalnızca `summary`, `level`, `recommendations` yazar; yeni alanlar yalnızca HTTP yanıtında yer alır.

---

## Genel özet

- **Toplam dosya sayısı:** **2** (`analysis.py`, `server.js`).

- **Sistem artık neyi yapabiliyor:** Python sentetik satırından, değiştirilmeden kalan iç yapı üzerinden Node’un beklediği alan adlarıyla okuma verisi gövdesi üretilebiliyor; backend hem eski hem yeni alan adlarını okuma verisinde kabul edip tek formatta kaydedebiliyor; analiz uç noktası hızın yanında doğruluk ve hata kayıt sayısını da dikkate alarak zenginleştirilmiş özet ve öneriler üretiyor ve istemciye etiket/açıklama dizileri sunuyor.

- **Hala eksik veya dikkat edilmesi gereken kritik noktalar:**
  - `analysis.py` içindeki `student_id` (`STU_xxx` string) ile PostgreSQL’deki `students.id` (tamsayı) doğrudan aynı değil; gerçek akışta önce öğrenci oluşturulup dönen `id` kullanılmalı.
  - `labels` / `explanations` veritabanı tablosuna yazılmıyor; sadece `POST /analyze` JSON cevabında var; geçmiş analiz sorgusu (`GET /analysis/:studentId`) bu alanları içermez.
  - Node tarafındaki analiz, Python’daki tüm metrikleri (fonolojik, görsel vb.) kapsamaz; yalnızca DB’de bulunan okuma alanları ve eşikler kullanılır.
  - `normalizeReadingDataBody`: hem `reading_speed` hem `reading_speed_wpcm` gönderilirse öncelik `reading_speed` tarafındadır (`!= null` kontrolü).
  - `error_count` ile üretilen placeholder dizisi en fazla 50 elemanla sınırlıdır.
