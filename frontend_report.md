# LexiLocal frontend raporu

## Bileşenler ve dosya yapısı

| Dosya | Açıklama |
|--------|----------|
| `frontend/src/App.jsx` | Tek sayfalık arayüz (JSX): metrik kartları, “Veri Üret” / “Analiz Et”, durum mesajları, rapor alanı. |
| `frontend/src/App.js` | Varsayılan export’u `App.jsx` üzerinden yeniden dışa aktarır; `main.jsx` bu dosyayı import eder (Vite’ta JSX’in `.jsx` dosyasında tutulması gerekir). |
| `frontend/src/main.jsx` | React root ve `App` bileşeninin mount edilmesi. |
| `frontend/src/index.css` | Basit yerleşim, kart ve rapor stilleri. |
| `frontend/index.html` | Vite giriş HTML’i. |
| `frontend/vite.config.js` | React eklentisi; geliştirme sunucusunda `/reading-data` ve `/analyze` isteklerinin `http://localhost:3000` adresine proxy ile yönlendirilmesi (CORS gerekmeden çalışma). |

## Kullanılan API uçları

| Yöntem | Uç | Kullanım |
|--------|-----|----------|
| `POST` | `/reading-data` | Üretilen sentetik okuma gövdesi (öğrenci ID + altı metrik + `errors`) sunucuya ve veritabanına yazılır. |
| `POST` | `/analyze/:studentId` | Son kaydedilen okuma satırı ve Node’un tuttuğu ek metriklerle Python köprüsü çalıştırılır; JSON analiz döner. |

İstekler geliştirmede göreli yol ile yapılır; Vite proxy bunları backend’e iletir. Üretim önizlemesinde veya statik dosya farklı bir origin’den sunuluyorsa backend’e tam taban URL ile istek atılması gerekir (bu repoda yalnızca geliştirme proxy’si tanımlıdır).

## State (`App.jsx` / `App.js`)

- **`currentData`**: Son üretilen ve ekranda gösterilen metrik nesnesi (`reading_speed`, `accuracy`, dört ek alan).
- **`analysisResult`**: `POST /analyze/:id` yanıtının tamamı (`student` + `analysis`).
- **`isDataReady`**: `/reading-data` başarılı olduktan sonra `true`; “Analiz Et” yalnızca bu durumda etkindir.
- Ek: `studentIdInput`, `busy`, `statusMsg` kullanıcı geri bildirimi ve çift tıklama koruması için.

## Veri üretimi (yalnızca frontend)

Python `analysis.py` içindeki `ogrenci_uret` ile uyumlu genel aralıklar kullanılır; ayrıca rastgele **düşük / orta / yüksek** profil bantları seçilerek değerler alt aralıklara çekilir (tüm altı metrik dolar). Backend veya Python çağrılmaz; üretilen gövde doğrudan `POST /reading-data` ile gönderilir.

## Veri akışı

1. Kullanıcı veritabanında var olan bir **öğrenci ID** girer (ör. `1`).
2. **Veri Üret**: Frontend sentetik veri üretir → kutular dolar → aynı gövde `POST /reading-data` ile gönderilir → başarılıysa `isDataReady = true`, “Analiz Et” açılır.
3. **Analiz Et**: `POST /analyze/:studentId` (gövde `{}`) çağrılır; Node son okuma kaydını ve ek metrikleri Python’a iletir.
4. Dönen `analysis.labels`, `explanations`, `summary`, `level` (ve `recommendations`) rapor bölümünde gösterilir.

## Kullanıcı akışı (özet)

Sayfa açılışında yalnızca **Veri Üret** anlamlı şekilde kullanılabilir; **Analiz Et** pasiftir. Veri üretilip sunucuya başarıyla yazıldıktan sonra **Analiz Et** etkinleşir; analiz sonrası rapor alanı dolar.

## Çalıştırma

- Backend: `node server.js` (port `3000`, PostgreSQL gerekli).
- Frontend: `cd frontend && npm install && npm run dev` (Vite, tipik olarak `5173`).
