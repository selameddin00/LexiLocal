# LexiLocal

LexiLocal projesi için sprint planlama, MVP geliştirme ve ekip içi iş birliği deposu.

## Proje Hakkında

LexiLocal, çocukların okuma performansını analiz etmeye yönelik geliştirilen bir karar destek sistemidir. Sistem; frontend (React), backend (Node.js/Express) ve analiz katmanı (Python) olmak üzere üç ana bileşenden oluşur.

Frontend üzerinden alınan veriler backend API katmanına iletilir, burada normalize edilerek Python tabanlı kural analiz motoruna gönderilir ve elde edilen sonuç tekrar kullanıcıya sunulur.

## Güncel Durum (Sprint 1)

Sprint 1 kapsamında sistemin temel çalışan yapısı oluşturulmuştur:

- Sentetik veri üretimi sağlandı  
- Python tabanlı kural analiz motoru geliştirildi  
- Frontend → Backend → Analiz akışı kuruldu  
- Tüm bileşenler entegre edilerek uçtan uca çalışan bir MVP elde edildi  

Sistem şu an küçük ölçekli ancak tamamen çalışır durumdadır.

## Proje Yapısı

Proje, sorumluluklara göre modüler şekilde ayrılmıştır:

- `frontend/` → React tabanlı kullanıcı arayüzü  
- `backend/` → Express API ve veri akışı yönetimi  
- `analysis/` → Python analiz motoru  
- `database/` → Veritabanı şeması  
- `docs/` → Proje dokümanları ve raporlar  

## Dokümantasyon

Proje sürecine ait analizler, raporlar ve geliştirme notları `docs/` klasörü altında bulunmaktadır.

Öne çıkan belgeler:

- Sprint analizleri  
- Backend / frontend raporları  
- Sistem iyileştirme notları  
- Refactor ve kontrol dokümanları  

## Sunumlar

Proje sunumlarına aşağıdaki bağlantılardan ulaşabilirsiniz:

- 2. hafta sunumu linkimiz https://gamma.app/docs/Yapay-Zeka-Destekli-Disleksi-Karar-Destek-Sistemi-w4q800epuczm0s5
- 1. hafta sunumunda kullandığımız slayt pdf olarak Sunumlar ve Raporlar klasöründedir  

## Not

Bu proje MVP aşamasındadır. İlerleyen sprintlerde:

- Gerçek veri entegrasyonu  
- RAG tabanlı analiz sistemi  
- Daha gelişmiş kullanıcı arayüzü  

gibi geliştirmeler planlanmaktadır.
