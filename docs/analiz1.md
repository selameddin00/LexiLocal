# LexiLocal — Sprint 1 Teknik İnceleme Raporu

## 1. Frontend analizi

**Teknoloji:** Repoda HTML, CSS, JavaScript framework’ü (React/Vue vb.), Blazor veya statik `wwwroot` içeriği **yok**. `package.json` içinde frontend bağımlılığı da yok; tek çalışan yüzey `server.js` içindeki `GET /` metnidir.

**Çalışır / statik:** Kullanıcı arayüzü tanımlı değil; “sadece statik sayfa” bile yok — UI katmanı eksik.

**Veri alma:** Form, istemci doğrulama veya tarayıcıdan API çağrısı yapan bir kod yok.

**Backend bağlantısı:** Tasarımsal olarak Express API (`/students`, `/reading-data`, `/analyze/:studentId`, `/analysis/:studentId`) Postman/curl ile kullanılabilir; ancak bunu kullanan bir istemci repoda yok.

**Sonuç gösterme:** Tarayıcıda sonuç gösteren bir ekran yok.

**Frontend durumu: Eksik**

| Yapılanlar | Eksikler |
|------------|----------|
| Yok (UI yok) | Web/mobil arayüz, kullanıcı akışı, API tüketimi, sonuç görselleştirme |

---

## 2. Backend analizi

**Ana analiz fonksiyonu:** Node tarafında ayrı bir `analyze_student` modülü yok; mantık `POST /analyze/:studentId` route’unun içinde satır içi. Python’da `analiz_et(row)` var fakat **Node sunucusu tarafından çağrılmıyor**; `analysis.py` bağımsız bir script.

**Input → output:**

- Akış: `students` + son `reading_data` satırı okunuyor → `reading_speed` için tek eşik (`< 80`) ile `summary`, `level`, `recommendations` üretilip `analysis_results`’a yazılıyor ve JSON dönülüyor.
- `SELECT` ile gelen `student` nesnesi analizde **kullanılmıyor**.
- `reading_data` şemasında `accuracy` ve `errors` var; analizde **yalnızca `reading_speed`** kullanılıyor.

**Kurallar:** İki durum (düşük hız / diğer). Okuma akıcılığı, doğruluk, ses farkındalığı, görsel metrikler bu pipeline’da **işlenmiyor** — bunlar yalnızca `analysis.py` içinde.

**Metrikler (gerçek durum):**

| Metrik | Node API | Python `analiz_et` |
|--------|----------|---------------------|
| Okuma hızı | Evet (`reading_speed`, tek eşik) | Evet (`reading_speed_wpcm`, eşikler) |
| Doğruluk | Hayır (DB’de var, kullanılmıyor) | Evet |
| Ses farkındalığı | Hayır | Evet |
| Görsel ayırt etme / takip | Hayır | Evet |
| Sıralama | Hayır | Evet |

**Modülerlik:** `server.js` tek dosyada toplanmış; servis katmanı, doğrulama, analiz modülü ayrışmamış. Python tarafı ayrı dosya ama ürünle entegre değil.

**Backend durumu: Kısmen hazır** (CRUD + basit analiz + DB şeması var; gerçek “disleksi/okuma profili” analizi repoda iki paralel dünyada: zengin kural seti Python’da, canlı API’de sadeleştirilmiş ve eksik.)

---

## 3. Sentetik veri üretimi

**Var mı:** `analysis.py` içinde `ogrenci_uret()` — **rastgele aralıklar**, senaryo tabanlı sabit vaka seti yok.

**Backend ile uyum:**

- PostgreSQL `students.id` sayısal; Python `student_id` `STU_xxx` string.
- Tabloda `reading_speed`, `accuracy`; Python’da `reading_speed_wpcm`, `reading_accuracy_percent` vb. — **şema ve isimlendirme uyumsuz**.
- Node’un beklediği veri yapısı ile Python’un ürettiği yapı **doğrudan eşlenmemiş**.

**Risk senaryoları:** Python kuralları yüksek/orta/düşük risk üretmek için yazılmış; ancak `ogrenci_uret()` aralıkları bazı dalları fiilen **üretilemez** kılıyor (örnekler, repodaki sayılara göre):

- `reading_speed_wpcm`: `random.randint(40, 150)` → `< 40` dalı hiç tetiklenmez.
- `reading_accuracy_percent`: `85–100` → `< 85` “yüksek risk” dalı bu üreticide çıkmaz.
- `phonological_awareness_percent`: `50–100` → `< 50` dalı çıkmaz.
- `visual_tracking_seconds`: üst sınır `92.25` iken `> 92.25` yüksek risk dalı bu üreticide çıkmaz.
- `sequencing_score`: `85–115` → `< 85` yüksek risk dalı çıkmaz.

**Sentetik veri sistemi durumu: Orta** (çok boyutlu rastgele üretim ve kurallar var; API/DB ile bağlantı yok, aralıklar–kurallar uyumu zayıf, bazı risk senaryoları bu üreticiyle test edilemiyor.)

---

## 4. Karar / rapor sistemi

**Python (`analiz_et`):** Etiket, `risk`, satır içi `aciklama`, birleşik `genel_aciklama` üretiliyor; etiket–açıklama bağlantısı açık.

**Node API:** `summary`, `level`, `recommendations` — anlamlı ama **tek boyutlu** (hız). Etiket/risk sözlüğü Python ile **hizalı değil**.

**Kullanıcıya anlamlı çıktı:** Python çıktısı raporlama için daha zengin; ürün yolunda olan HTTP API ise sınırlı özet. Birleşik bir “karar sistemi” yok — iki farklı semantik.

**Karar sistemi durumu: Orta** (Python tarafı güçlü prototip; üretim yolundaki API zayıf ve ayrık.)

---

## Genel değerlendirme

1. **MVP’ye yakınlık (tahmini):** **%35–45**

   - “Tam ürün” (UI + tutarlı analiz + tek veri modeli): düşük uç.
   - “API + DB + manuel test” demo’su: daha yüksek; yine de Python–Node bütünleşmesi ve arayüz eksik.

2. **En kritik 3 eksik**

   - **Kullanıcı arayüzü yok** — son kullanıcı akışı ve demo deneyimi yok.
   - **Analiz mantığının tekilleştirilmemesi** — zengin kurallar Python’da, API’de yalın kural; veri şeması iki dünyayı taşımıyor.
   - **Sentetik veri ↔ API/DB uyumu ve test edilebilirlik** — üretici aralıkları bazı risk dallarını kapatıyor; entegrasyon yok.

3. **Sprint 1 sonunda demo çıkar mı?**

   - **Evet, sınırlı:** PostgreSQL kurulu iken `node server.js` ile REST çağrıları ve `analysis.py`’yi ayrı çalıştırarak “iki parçalı” teknik gösterim mümkün.
   - **Hayır, bütünleşik ürün olarak:** Tek tıkla uçtan uca (veri girişi → analiz → anlamlı çok boyutlu rapor) demo bu repodaki haliyle **hazır değil**.

---

## Özet tablo

| Bölüm | Durum |
|------|--------|
| Frontend | **Eksik** |
| Backend | **Kısmen hazır** |
| Sentetik veri | **Orta** |
| Karar/rapor | **Orta** (Python güçlü, API zayıf ve kopuk) |

---

*Bu rapor yalnızca depoda görünen dosyalara dayanır; çalışma zamanı veya dağıtım ortamı doğrulanmadı.*
