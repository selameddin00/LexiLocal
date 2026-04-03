# Sprint 1 – Sistem Röntgeni

Bu belge, `LexiLocal` deposunun **yalnızca mevcut dosya ve kod içeriğine** dayanır; çalıştırma veya dış sistem varsayımı yapılmamıştır.

---

## 1. Projede Kullanılan Teknolojiler

### Backend

| Teknoloji | Sürüm (package.json) | Rol |
|-----------|----------------------|-----|
| **Node.js** | (runtime, sürüm dosyada sabitlenmemiş) | `server.js` ile HTTP API sunumu |
| **Express** | ^5.2.1 | Rota tanımı, JSON gövde ayrıştırma (`express.json`) |
| **pg (node-postgres)** | ^8.20.0 | PostgreSQL bağlantı havuzu (`Pool`), sorgular |

### Veritabanı

| Teknoloji | Rol |
|-----------|-----|
| **PostgreSQL** | `database.sql` şeması: `students`, `reading_data`, `analysis_results` tabloları; `server.js` içinde `dyslexia_project` veritabanına bağlanma |

### Script / analiz

| Teknoloji | Rol |
|-----------|-----|
| **Python 3** (stdlib) | `analysis.py`: `random` ile sentetik satır üretimi ve `analiz_et()` ile kural tabanlı değerlendirme; **Node ile import/call yok** |

### Frontend

| Durum | Açıklama |
|-------|----------|
| **Yok** | Depoda `.html`, React/Vue, `public/` veya `wwwroot` benzeri bir istemci klasörü bulunmuyor. `package.json` içinde `main: "index.js"` tanımlı olsa da depoda `index.js` dosyası yok. |

### Yardımcı kütüphaneler / bağımlılıklar

- **express**, **pg**: tek üretim bağımlılıkları.
- **Test script**: `npm test` tanımlı ama gerçek test yok (`exit 1`).

### Dosya ve klasör yapısına göre bileşenler

| Dosya / öğe | Bileşen rolü |
|-------------|--------------|
| `server.js` | Tek backend uygulaması; tüm API mantığı burada |
| `database.sql` | İlk şema tanımı (migration aracı yok) |
| `analysis.py` | Bağımsız sentetik veri + analiz prototipi |
| `package.json` / `package-lock.json` | Node bağımlılık kilidi |
| `README.md` | Depo açıklaması (teknik mimari detayı yok) |
| `analiz1.md`, `degisiklikler1.md`, `revizasyon.md` | Belgeler (bu raporda kod kaynağı olarak `server.js` / `analysis.py` esas alındı) |

---

## 2. Karar Sistemi Röntgeni (6 Başlık)

Aşağıdaki tablolar **kodda görülen** alan adları, eşikler ve çıktıları yansıtır.

### 2.1 Özet tablolar

#### Node API (`server.js`) — `/analyze/:studentId`

| # | Başlık (işlevsel) | Metrik / alan | Dosya | Eşik / aralık | Etiket (label) | Açıklama (explanation) | API’de kullanım | Karar verebiliyor mu? |
|---|-------------------|---------------|--------|---------------|----------------|---------------------------|-----------------|------------------------|
| 1 | Okuma akıcılığı | `data.reading_speed` (DB `reading_data`) | `server.js` | `<40`: bir etiket; `40–60`: aynı etiket (farklı açıklama) | `Düşük Akıcılık / Robotik Okuma` | Kritik / riskli aralık cümleleri | Evet | Evet (hız DB’den) |
| 2 | Okuma doğruluğu | `data.accuracy` (varsayılan 100) | `server.js` | `<85`; `85–91` | `Düşük Doğruluk / Tahminci Okuma` | Kritik / riskli | Evet | Evet |
| 3 | Ses farkındalığı | `phonological_awareness_percent` (`M`, istek veya bellek) | `server.js` | `<50`; `50–70` (üst sınır yok) | `Ses farkındalığı: yüksek risk` / `... orta risk` | Fonolojik farkındalık cümleleri | Evet, **DB’de yok**; gövde veya `lastReadingExtraMetrics` | Koşullu: metrik yoksa bu başlık **atlanır** |
| 4 | Görsel ayırt etme | `visual_discrimination_score` (`M`) | `server.js` | **Yalnızca** `vd < 7` | `Düşük görsel ayırt etme` | Tek cümle | Evet, **DB’de yok** | Kısmen: **orta risk bandı yok** (Python’da var) |
| 5 | Görsel takip | `visual_tracking_seconds` (`M`) | `server.js` | **Yalnızca** `vt > 90` | `Görsel takip zayıf` | Süre yüksek | Evet, **DB’de yok** | Kısmen: eşik Python’dan **farklı** |
| 6 | Sıralama becerisi | `sequencing_score` (`M`) | `server.js` | **Yalnızca** `seq < 85` | `Sıralama problemi` | Kritik eşik altı | Evet, **DB’de yok** | Kısmen: **orta risk bandı yok** |

#### Python (`analysis.py`) — `analiz_et(row)`

| # | Başlık | Metrik / alan | Dosya | Eşik / aralık | Etiket | Risk alanı | API ile uyum |
|---|--------|---------------|--------|---------------|--------|------------|--------------|
| 1 | Okuma akıcılığı | `reading_speed_wpcm` | `analysis.py` | `<40`; `40–60` | `Düşük Akıcılık / Robotik Okuma` | yüksek/orta | Node ile **aynı eşikler**, etiket metni aynı |
| 2 | Okuma doğruluğu | `reading_accuracy_percent` | `analysis.py` | `<85`; `85–91` | `Düşük Doğruluk / Tahminci Okuma` | yüksek/orta | Node ile **aynı eşikler** |
| 3 | Ses farkındalığı | `phonological_awareness_percent` | `analysis.py` | `<50`; `50–70` | **`Zayıf Ses Farkındalığı`** | yüksek/orta | **Etiket metni Node’dan farklı** |
| 4 | Görsel ayırt etme | `visual_discrimination_score` | `analysis.py` | **`<6.01`**; **`6.01–7.0`** | **`Görsel Ayırt Etme Güçlüğü`** | yüksek/orta | Node: tek koşul `vd < 7`; **Python’da iki kademe var** |
| 5 | Görsel takip | `visual_tracking_seconds` | `analysis.py` | **`>92.25`**; **`85–92.25`** | **`Görsel Takip Eksikliği`** | yüksek/orta | Node: **`>90`** tek koşul — **eşik ve kademeler farklı** |
| 6 | Sıralama | `sequencing_score` | `analysis.py` | **`<85`**; **`85–90`** | **`Sıralama (Sequencing) Hatası`** | yüksek/orta | Node: **yalnızca `<85`** — **orta band yok** |

### 2.2 Başlık başlık yorum

1. **Okuma akıcılığı** — Node ve Python aynı sayısal eşikleri kullanıyor; fakat **özet mantığı** (`summary`/`level`) Node’da `speed < 80` ile ayrıca değerlendiriliyor; yani **etiket eşiği (40/60) ile genel özet eşiği (80) tutarsız** iki katman var.
2. **Okuma doğruluğu** — İki tarafta eşikler uyumlu; etiket metinleri uyumlu.
3. **Ses farkındalığı** — Sayılar benzer; **üretilen etiket adları farklı** (API: “Ses farkındalığı: … risk”; Python: “Zayıf Ses Farkındalığı”).
4. **Görsel ayırt etme** — **İki yerde farklı kullanım:** Python’da 6.01 altı / 6.01–7 orta; Node’da sadece `<7` tek koşul, **orta risk ayrımı yok**.
5. **Görsel takip** — **İki yerde farklı:** Python `>92.25` ve `85–92.25`; Node yalnızca `>90`. Aynı sayısal girdi iki sistemde **farklı sonuç** üretebilir.
6. **Sıralama becerisi** — Python’da `85–90` orta risk var; Node’da yok. **Etiket metinleri farklı** (“Sıralama problemi” vs “Sıralama (Sequencing) Hatası”).

---

## 3. API ve Backend Analizi

### 3.1 Endpoint listesi

| Metod | Yol | Girdi | Çıktı | Analiz yapıyor mu? |
|-------|-----|-------|-------|---------------------|
| GET | `/` | — | Düz metin: “LexiLocal Backend Çalışıyor 🚀” | Hayır |
| POST | `/students` | JSON: `name`, `age`, `grade`, `diagnosis` | `{ message, data }` satır | Hayır |
| GET | `/students` | — | Öğrenci dizisi | Hayır |
| POST | `/reading-data` | JSON: `student_id` + okuma alanları (aşağıda) | `{ message, data }` eklenen satır | Hayır (sadece INSERT) |
| POST | `/analyze/:studentId` | JSON gövde **opsiyonel** (ek metrikler) | `summary`, `level`, `recommendations`, `labels`, `explanations` | **Evet** |
| GET | `/analysis/:studentId` | — | `analysis_results` satırları | Hayır (sadece okuma) |

### 3.2 `/reading-data` — alanlar

`normalizeReadingDataBody` şunları kabul ediyor:

- `reading_speed` veya `reading_speed_wpcm`
- `accuracy` veya `reading_accuracy_percent`
- `errors` veya `error_count` (sayıdan sentetik `hata_1`… dizisi, en fazla 50)
- `phonological_awareness_percent`, `visual_discrimination_score`, `visual_tracking_seconds`, `sequencing_score`

**Veritabanına yazılan:** yalnızca `student_id`, `reading_speed`, `accuracy`, `errors` (`INSERT` ifadesi buna göre).

**Bellek:** `lastReadingExtraMetrics[student_id]` dört ek metrik için güncelleniyor (sunucu süreci içi, kalıcı değil).

### 3.3 `/analyze/:studentId` — veri akışı

1. `students` ve son `reading_data` satırı çekilir.
2. Ek metrikler: önce `req.body` (`extraMetricsFromBody`), yoksa `lastReadingExtraMetrics[studentId]`.
3. `speed`, `acc`, `errorCount` ile etiketler ve açıklamalar üretilir.
4. `summary` / `level`: önce hız `<80`, sonra doğruluk `<85`, sonra `errorCount >= 3` ile “low” mantığı.
5. `recommendations` dizi olarak `level`’a göre doldurulur.
6. **DB INSERT:** `analysis_results(student_id, summary, level, recommendations)` — **`labels` ve `explanations` kaydedilmiyor.**

### 3.4 Kalıcı / geçici ayrımı

| Veri | Kalıcı (PostgreSQL) | Geçici (bellek) |
|------|----------------------|-----------------|
| Öğrenci, okuma hızı/doğruluk/hatalar | Evet | — |
| Ek dört metrik | **Hayır** | `lastReadingExtraMetrics` |
| Analiz özeti, seviye, öneriler | Evet | — |
| Etiketler ve açıklama metinleri | **Hayır** (yalnızca HTTP yanıtında) | — |

---

## 4. Sentetik Veri Üretimi

### 4.1 Nerede?

- **Dosya:** `analysis.py`, fonksiyon `ogrenci_uret()`.

### 4.2 Üretilen alanlar

| Alan | Üretim kuralı |
|------|----------------|
| `student_id` | `STU_` + 100–999 arası tamsayı (string; **gerçek DB `students.id` ile uyumsuz biçim**) |
| `reading_speed_wpcm` | `randint(40, 150)` |
| `reading_accuracy_percent` | `randint(85, 100)` |
| `phonological_awareness_percent` | `randint(50, 100)` |
| `visual_discrimination_score` | `uniform(5.0, 13.0)` yuvarlanmış |
| `visual_tracking_seconds` | `uniform(57.5, 92.25)` |
| `sequencing_score` | `randint(85, 115)` |

### 4.3 Random / kontrollü

- **Tamamen rastgele** (stdlib `random`); seed yok; tekrarlanabilirlik yok.

### 4.4 Analiz eşikleriyle tetiklenme (gerçek aralıklar)

| Risk | Bu üretimle tetiklenebilir mi? |
|------|--------------------------------|
| Akıcılık `<40` veya `40–60` | **Hayır** — alt sınır 40; kritik ve orta akıcılık **üretilmez** |
| Doğruluk `<85` veya `85–91` | **Hayır** — alt sınır 85; riskli doğruluk **üretilmez** |
| Ses farkındalığı `<50` veya `50–70` | **Hayır** — alt sınır 50 |
| Görsel ayırt etme (Python eşikleri) | **Kısmen** — 5.0–13.0 aralığı `<6.01` ve `6.01–7` ile **üst üste biner**; tetiklenebilir |
| Görsel takip (Python) | Üst uç 92.25; `>92.25` **üretilmez**; `85–92.25` orta risk **üretilebilir** |
| Sıralama `<85` veya `85–90` | **Hayır** — alt sınır 85 |

### 4.5 API uyumluluğu

- `reading_data_api_format()` yalnızca `student_id`, `reading_speed`, `accuracy`, `errors` döndürüyor; **ek dört alan API gövdesine dahil edilmiyor**.
- Sentetik `student_id` formatı (`STU_xxx`) ile PostgreSQL’deki tamsayı `id` kullanımı **doğrudan uyumlu değil** (manuel eşleme gerekir).

### 4.6 “Sentetik veri sistemi gerçekten çalışıyor mu?”

- **Python içinde:** Çalışıyor — her çalıştırmada satır üretiliyor ve `analiz_et` ile yapılandırılmış çıktı üretiliyor.
- **Node API ile uçtan uca otomatik zincir:** Depoda **yok** — Python’u Node çağırmıyor; `reading_data_api_format` ek metrikleri taşımıyor.

---

## 5. Üretilen Veriyi Değerlendirme Mekanizması

| Soru | Repo gerçeği |
|------|----------------|
| Sentetik veri analiz edilebiliyor mu? | **Python’da evet** (`analiz_et`). |
| Python’da mı, Node’da mı? | **İkisi de ayrı kural setleri**; **ortak modül yok**. |
| Aynı veri iki tarafta aynı sonuç mu? | **Hayır garantisi yok** — eşik ve etiket farkları (özellikle görsel takip, görsel ayırt etme, sıralama orta bandı, ses etiket adı). |
| Tek tutarlı karar sistemi mi? | **Hayır** — iki paralel implementasyon. |
| veri üret → analiz → çıktı zinciri mümkün mü? | **Python tek başına:** Evet. **Node ile:** Yalnızca manuel olarak API’ye doğru `student_id` ve tam gövde (ek metrikler dahil) gönderilirse; **otomatik entegrasyon yok**. |

---

## 6. Frontend Durumu

| Kontrol | Sonuç |
|---------|--------|
| Gerçek frontend var mı? | **Hayır** — HTML/JS/CSS istemci dosyası yok. |
| Kullanıcı arayüzü | **Yok**. |
| Veri üret / analiz / sonuç butonları | **Yok**. |
| Backend ile bağlı UI | **Yok**. |
| Demo akışı | **API test araçları (Postman, curl vb.) ile manuel**; depo içi demo uygulaması yok. |

---

## 7. Entegrasyon Röntgeni

| Bağlantı | Durum |
|----------|--------|
| Python ↔ Node | **Kopuk** — subprocess/HTTP çağrısı yok; `analysis.py` script olarak çalışır. |
| Node ↔ PostgreSQL | **Entegre** — gerçek sorgular tanımlı. |
| Python ↔ PostgreSQL | **Yok** |
| Frontend ↔ Node | **Yok** |

**Sınıflandırma:** Aynı depoda duran **üç ayrı parça**: (1) Node API + PG, (2) bağımsız Python prototipi, (3) şema SQL. **Tek parça sistem değil**; **iki parçalı prototip** (Node+DB birlikte; Python ayrı) ve **modüller ayrı ayrı çalışır** nitelikte.

**Kabaca entegrasyon yüzdesi (yorum):** Node–DB ~%100; Python–Node ~%0 (kod bağlantısı yok); uçtan uca ürün ~**%25–35** (manuel müdahale ile artar).

---

## 8. Sonuç Raporu

1. **Ne yapabiliyor?** Öğrenci ve okuma verisi kaydı; son okuma satırına göre **Node içinde** kural tabanlı etiket/özet/öneri üretimi; özetin DB’ye yazılması; analiz geçmişini listeleme; Python’da **bağımsız** sentetik veri ve analiz çıktısı yazdırma.

2. **Ne yapamıyor?** Kalıcı ek dört metrik saklama; etiketlerin DB’de saklanması; Python–Node otomasyonu; web arayüzü; sentetik üretimin çoğu başlık için risk senaryolarını kapsaması; `package.json` `main` ile uyumlu giriş dosyası (index.js yok).

3. **6 başlıktan kaçı backend’de aktif?** **Altısı da** `POST /analyze` içinde **koşullu olarak** değerlendirilebilir; ancak **dörtü** ek metrik gerektirir ve bu metrikler **DB’de tutulmadığı** için analiz, yalnızca son POST ile gelen gövde veya bellek yedeğiyle tutarlıdır. **Sayısal olarak tam kapsama** için 6/6 sürekli aktif değil.

4. **Sentetik veri ne kadar işlevsel?** **Üretim ve Python analizi işlevsel**; fakat **rastgele aralıklar** çoğu kuralı **hiç tetiklemiyor**; **API ile uyumlu otomatik akış** tanımlı değil.

5. **Veri üret → analiz → çıktı ne kadar gerçek?** **Python içinde gerçek.** **Node hattında** yalnızca manuel ve eksiksiz API kullanımıyla anlamlı; depo bunu otomatikleştirmiyor.

6. **MVP’ye yakınlık:** Backend + DB iskeleti var; **istemci yok**, **tek kaynak karar motoru yok**, **veri modeli** ek metrikleri ve etiketleri tam taşımıyor — **erken prototip / MVP öncesi** seviye.

7. **En kritik 5 sorun**

   1. **İki ayrı karar motoru** (Node vs Python) — eşik ve etiket uyumsuzluğu.
   2. **Ek metriklerin DB’de olmaması** + **bellek yedeği** — analiz tekrarlanabilirliği ve sunucu yeniden başlatma riski.
   3. **Sentetik üretim aralıkları** çoğu riski dışarıda bırakıyor; **eğitim/test değeri sınırlı**.
   4. **`reading_data_api_format`** ek alanları göndermediği için **Python→Node tek gövde ile 6 başlık taşınamıyor**.
   5. **Özet (`summary`/`level`) ile etiket eşikleri** (ör. hız 80 vs 40/60) **aynı modelle hizalı değil**.

---

*Rapor dosyası: `check.md` — kod değişikliği yapılmamıştır; yalnızca bu dosya eklenmiştir.*
