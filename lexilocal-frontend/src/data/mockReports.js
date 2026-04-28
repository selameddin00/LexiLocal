export const mockReports = {
  r001: {
    id: "r001",
    date: "12.05.2025",
    generalAssessment: {
      riskLevel: "medium",
      riskLabel: "Orta Risk",
      overallScore: 54,
      summary:
        "Değerlendirme sonuçları, çocuğun bazı alanlarda destekten yararlanabileceğine işaret etmektedir. Özellikle okuma hızı ve fonolojik farkındalık düşük performans sergilemekte; ancak doğruluk oranı ve görsel işleme becerileri yaş düzeyinde seyretmektedir. Erken müdahale ile olumlu gelişme beklenmektedir."
    },
    metrics: [
      {
        metricName: "Okuma Hızı",
        measuredValue: 62,
        label: "low",
        labelText: "Düşük",
        description: "Dakikada okunan doğru sözcük sayısını ölçer; akıcı okuma gelişiminin göstergesidir.",
        impact: "Düşük okuma hızı, ders materyallerini zamanında işlemeyi zorlaştırır ve akademik verimi düşürebilir.",
        suggestions: [
          "Günlük 10–15 dakika tekrarlı okuma (repeated reading) alıştırmaları yapılmalıdır.",
          "Sesli okuma sırasında zamanlama kullanılarak hız farkındalığı geliştirilmelidir."
        ],
        source: "Wolf, M., & Katzir-Cohen, T. (2001). Reading fluency and its intervention. Scientific Studies of Reading, 5(3), 211–239."
      },
      {
        metricName: "Doğruluk Oranı",
        measuredValue: 81,
        label: "normal",
        labelText: "Normal",
        description: "Okunan metindeki doğru tanınan sözcüklerin toplam sözcük sayısına oranıdır.",
        impact: "Normal doğruluk oranı, sözcük tanıma mekanizmasının yeterince geliştiğini göstermektedir.",
        suggestions: [
          "Düzeye uygun okuma materyalleri seçilerek kazanımlar pekiştirilmelidir.",
          "Yanlış okunan sözcükler not edilmeli ve haftada bir kez gözden geçirilmelidir."
        ],
        source: "Rasinski, T. V. (2004). Assessing reading fluency. Pacific Resources for Education and Learning."
      },
      {
        metricName: "Fonolojik Farkındalık",
        measuredValue: 45,
        label: "low",
        labelText: "Düşük",
        description: "Sesleri ayırt etme, hece bölme ve kafiye kurma gibi sözlü dil birimlerini işleme yeteneğidir.",
        impact: "Fonolojik farkındalık eksikliği, harf-ses eşleştirme güçlüğüne ve yazım hatalarına yol açabilir.",
        suggestions: [
          "Hece bölme ve kafiye oyunları içeren yapılandırılmış dil etkinlikleri uygulanmalıdır.",
          "Ses sentezi (blending) ve analizi (segmenting) alıştırmaları haftada en az 3 kez yapılmalıdır."
        ],
        source: "Goswami, U. (2003). Phonological awareness, language development, and learning to read. Scientific Studies of Reading, 6(4), 351–368."
      },
      {
        metricName: "Görsel İşleme",
        measuredValue: 76,
        label: "normal",
        labelText: "Normal",
        description: "Görsel uyaranları doğru ve hızlı biçimde algılama, ayırt etme ve bellekte tutma kapasitesidir.",
        impact: "Yaş düzeyinde görsel işleme, harf ve sözcük formlarının tanınmasını destekler.",
        suggestions: [
          "Görsel dikkat oyunları ile mevcut düzey korunmalıdır.",
          "Karmaşık sayfa düzenlerinden kaçınarak okunabilir materyaller kullanılmalıdır."
        ],
        source: "Stein, J. (2019). The magnocellular theory of developmental dyslexia. Dyslexia, 7(1), 12–36."
      },
      {
        metricName: "Görsel Takip",
        measuredValue: 70,
        label: "normal",
        labelText: "Normal",
        description: "Gözlerin metin üzerinde soldan sağa düzenli ve atlama yapmadan ilerleyebilme becerisidir.",
        impact: "Yeterli görsel takip, satır kaybetmeden akıcı okumayı mümkün kılar.",
        suggestions: [
          "Parmak veya kalem kılavuzluğuyla okuma alışkanlığı desteklenmelidir.",
          "Geniş satır aralıklı ve büyük punto kullanılan metinler tercih edilmelidir."
        ],
        source: "Rayner, K. (1998). Eye movements in reading and information processing: 20 years of research. Psychological Bulletin, 124(3), 372–422."
      },
      {
        metricName: "Sıralama Becerisi",
        measuredValue: 48,
        label: "low",
        labelText: "Düşük",
        description: "Harf, sözcük veya olayları doğru sırayla bellekte tutma ve yeniden üretme yeteneğidir.",
        impact: "Sıralama güçlüğü, sözcük sıralaması hatalarına, yazım yanlışlıklarına ve yönerge takibinde zorluğa neden olabilir.",
        suggestions: [
          "Görsel sıralama kartlarıyla somut egzersizler yapılmalıdır.",
          "Adım adım yönerge takibini destekleyen yapılandırılmış rutinler oluşturulmalıdır."
        ],
        source: "Dehn, M. J. (2008). Working memory and academic learning: Assessment and intervention. John Wiley & Sons."
      }
    ],
    generalSuggestions: [
      "Okuma hızı ve fonolojik farkındalık alanlarında uzman bir öğrenme güçlüğü uzmanından bireysel destek alınması önerilmektedir.",
      "Ev ortamında günlük kısa süreli sesli okuma seansları düzenlenerek akıcılık gelişimi desteklenmelidir.",
      "Öğretmenle işbirliği yapılarak sınav süresi uzatma veya alternatif değerlendirme yöntemleri talep edilebilir."
    ],
    references: [
      "Wolf, M., & Katzir-Cohen, T. (2001). Reading fluency and its intervention. Scientific Studies of Reading, 5(3), 211–239. https://doi.org/10.1207/S1532799XSSR0503_2",
      "Goswami, U. (2003). Phonological awareness, language development, and learning to read. Scientific Studies of Reading, 6(4), 351–368. https://doi.org/10.1207/S1532799XSSR0604_4",
      "Dehn, M. J. (2008). Working memory and academic learning: Assessment and intervention. John Wiley & Sons.",
      "Shaywitz, S. E., & Shaywitz, B. A. (2005). Dyslexia (specific reading disability). Biological Psychiatry, 57(11), 1301–1309. https://doi.org/10.1016/j.biopsych.2005.01.043"
    ]
  },

  r002: {
    id: "r002",
    date: "03.04.2025",
    generalAssessment: {
      riskLevel: "low",
      riskLabel: "Düşük Risk",
      overallScore: 82,
      summary:
        "Çocuğun okuma ve dil işleme profili yaş grubuna uygun seviyelerde seyretmektedir. Tüm alt ölçümlerde ortalama veya ortalamanın üzerinde performans gözlemlenmiştir. Mevcut destekleyici ortamın sürdürülmesi yeterli olmakla birlikte periyodik takip önerilmektedir."
    },
    metrics: [
      {
        metricName: "Okuma Hızı",
        measuredValue: 85,
        label: "normal",
        labelText: "Normal",
        description: "Dakikada okunan doğru sözcük sayısını ölçer; akıcı okuma gelişiminin göstergesidir.",
        impact: "Yaş normlarıyla uyumlu okuma hızı, akademik materyalleri zamanında işlemeyi kolaylaştırır.",
        suggestions: [
          "Çeşitli türlerde kitap okuyarak hız ve kelime dağarcığı geliştirilmelidir.",
          "Sesli okuma etkinlikleri ile akıcılık pekiştirilmelidir."
        ],
        source: "Rasinski, T. V. (2004). Assessing reading fluency. Pacific Resources for Education and Learning."
      },
      {
        metricName: "Doğruluk Oranı",
        measuredValue: 91,
        label: "normal",
        labelText: "Normal",
        description: "Okunan metindeki doğru tanınan sözcüklerin toplam sözcük sayısına oranıdır.",
        impact: "Yüksek doğruluk oranı, sözcük tanıma sürecinin sağlıklı işlediğini göstermektedir.",
        suggestions: [
          "Kelime dağarcığını genişletecek okuma materyalleri seçilmelidir.",
          "Yeni sözcükleri bağlam içinde öğrenme stratejileri kullanılmalıdır."
        ],
        source: "Rasinski, T. V. (2004). Assessing reading fluency. Pacific Resources for Education and Learning."
      },
      {
        metricName: "Fonolojik Farkındalık",
        measuredValue: 80,
        label: "normal",
        labelText: "Normal",
        description: "Sesleri ayırt etme, hece bölme ve kafiye kurma gibi sözlü dil birimlerini işleme yeteneğidir.",
        impact: "İyi fonolojik farkındalık, yeni sözcükleri çözümleme ve yazım becerilerini destekler.",
        suggestions: [
          "Şiir ve kafiyeli metinler okuyarak bu beceri eğlenceli biçimde sürdürülmelidir.",
          "Sözcük oyunları ve bulmacalar ile dil farkındalığı zenginleştirilmelidir."
        ],
        source: "Goswami, U. (2003). Phonological awareness, language development, and learning to read. Scientific Studies of Reading, 6(4), 351–368."
      },
      {
        metricName: "Görsel İşleme",
        measuredValue: 83,
        label: "normal",
        labelText: "Normal",
        description: "Görsel uyaranları doğru ve hızlı biçimde algılama, ayırt etme ve bellekte tutma kapasitesidir.",
        impact: "Güçlü görsel işleme, harf ve sözcük kalıplarının hızlı tanınmasını sağlar.",
        suggestions: [
          "Görsel-uzamsal etkinlikler (bulmaca, yapboz) ile beceri desteklenmelidir.",
          "Yeterli aydınlatma ve düzenli çalışma ortamı sağlanmalıdır."
        ],
        source: "Stein, J. (2019). The magnocellular theory of developmental dyslexia. Dyslexia, 7(1), 12–36."
      },
      {
        metricName: "Görsel Takip",
        measuredValue: 79,
        label: "normal",
        labelText: "Normal",
        description: "Gözlerin metin üzerinde soldan sağa düzenli ve atlama yapmadan ilerleyebilme becerisidir.",
        impact: "Düzenli göz hareketi, satır kaybetmeden ve düşük bilişsel yükle okumayı sağlar.",
        suggestions: [
          "Ekrana bakış süresi sınırlandırılarak göz yorgunluğu önlenmelidir.",
          "Okuma sırasında yeterli ışık ve kontrast sağlanmalıdır."
        ],
        source: "Rayner, K. (1998). Eye movements in reading and information processing: 20 years of research. Psychological Bulletin, 124(3), 372–422."
      },
      {
        metricName: "Sıralama Becerisi",
        measuredValue: 77,
        label: "normal",
        labelText: "Normal",
        description: "Harf, sözcük veya olayları doğru sırayla bellekte tutma ve yeniden üretme yeteneğidir.",
        impact: "Sağlıklı sıralama becerisi, yazılı anlatımda cümle düzeni ve yönerge takibini destekler.",
        suggestions: [
          "Sıralı hikâye anlatma etkinlikleri ile dil becerileri pekiştirilmelidir.",
          "Günlük rutin kontrol listeleri kullanılarak düzenlilik alışkanlığı kazandırılmalıdır."
        ],
        source: "Dehn, M. J. (2008). Working memory and academic learning: Assessment and intervention. John Wiley & Sons."
      }
    ],
    generalSuggestions: [
      "Mevcut okuma alışkanlıklarının sürdürülmesi ve çeşitli türlerde kitaplara yönlendirilmesi önerilmektedir.",
      "6 ay sonra tekrar değerlendirme yapılarak gelişim takip edilmelidir."
    ],
    references: [
      "Rasinski, T. V. (2004). Assessing reading fluency. Pacific Resources for Education and Learning.",
      "Goswami, U. (2003). Phonological awareness, language development, and learning to read. Scientific Studies of Reading, 6(4), 351–368. https://doi.org/10.1207/S1532799XSSR0604_4",
      "Rayner, K. (1998). Eye movements in reading and information processing: 20 years of research. Psychological Bulletin, 124(3), 372–422. https://doi.org/10.1037/0033-2909.124.3.372",
      "Dehn, M. J. (2008). Working memory and academic learning: Assessment and intervention. John Wiley & Sons."
    ]
  },

  r003: {
    id: "r003",
    date: "18.03.2025",
    generalAssessment: {
      riskLevel: "high",
      riskLabel: "Yüksek Risk",
      overallScore: 28,
      summary:
        "Değerlendirme sonuçları, çocuğun okuma ve dil işleme süreçlerinde ciddi güçlükler yaşadığına işaret etmektedir. Tüm alt alanlarda belirgin düşük performans gözlemlenmiş olup kapsamlı bir psikoeğitimsel değerlendirme ve uzman müdahalesi aciliyetle önerilmektedir. Erken ve yoğun müdahale sonuçları önemli ölçüde iyileştirebilir."
    },
    metrics: [
      {
        metricName: "Okuma Hızı",
        measuredValue: 28,
        label: "low",
        labelText: "Düşük",
        description: "Dakikada okunan doğru sözcük sayısını ölçer; akıcı okuma gelişiminin göstergesidir.",
        impact: "Çok düşük okuma hızı, sınıf içi etkinliklere katılımı ciddi biçimde kısıtlar ve akademik başarıyı olumsuz etkiler.",
        suggestions: [
          "Bireyselleştirilmiş okuma müdahale programı (örn. Reading Recovery) başlatılmalıdır.",
          "Ses teknolojileri (metin okuyucu yazılımlar) akademik yükü azaltmak için kullanılmalıdır."
        ],
        source: "Wolf, M., & Katzir-Cohen, T. (2001). Reading fluency and its intervention. Scientific Studies of Reading, 5(3), 211–239."
      },
      {
        metricName: "Doğruluk Oranı",
        measuredValue: 41,
        label: "low",
        labelText: "Düşük",
        description: "Okunan metindeki doğru tanınan sözcüklerin toplam sözcük sayısına oranıdır.",
        impact: "Düşük doğruluk oranı, metnin anlamını kavramayı engeller ve okuma motivasyonunu azaltır.",
        suggestions: [
          "Düzeyin çok altındaki kısa ve görsel destekli metinlerle yeniden başlanmalıdır.",
          "Sözcük bankası oluşturularak sık karşılaşılan sözcükler tekrar edilmelidir."
        ],
        source: "Rasinski, T. V. (2004). Assessing reading fluency. Pacific Resources for Education and Learning."
      },
      {
        metricName: "Fonolojik Farkındalık",
        measuredValue: 22,
        label: "low",
        labelText: "Düşük",
        description: "Sesleri ayırt etme, hece bölme ve kafiye kurma gibi sözlü dil birimlerini işleme yeteneğidir.",
        impact: "Çok düşük fonolojik farkındalık, çözümleme ve yazım süreçlerini temelden sekteye uğratır.",
        suggestions: [
          "Orfonik (phonics) temelli yoğun bireysel eğitim programı başlatılmalıdır.",
          "Ses-harf ilişkisini somutlaştıran manipülatif materyaller (harf kartları, ses kutuları) kullanılmalıdır."
        ],
        source: "Goswami, U. (2003). Phonological awareness, language development, and learning to read. Scientific Studies of Reading, 6(4), 351–368."
      },
      {
        metricName: "Görsel İşleme",
        measuredValue: 35,
        label: "low",
        labelText: "Düşük",
        description: "Görsel uyaranları doğru ve hızlı biçimde algılama, ayırt etme ve bellekte tutma kapasitesidir.",
        impact: "Zayıf görsel işleme, benzer görünümlü harflerin (b/d, p/q) karıştırılmasına ve okuma hatalarına yol açar.",
        suggestions: [
          "Görsel ayrıştırma egzersizleri içeren özel çalışma sayfaları kullanılmalıdır.",
          "Renkli font ve yüksek kontrastlı materyaller sunularak görsel yük azaltılmalıdır."
        ],
        source: "Stein, J. (2019). The magnocellular theory of developmental dyslexia. Dyslexia, 7(1), 12–36."
      },
      {
        metricName: "Görsel Takip",
        measuredValue: 30,
        label: "low",
        labelText: "Düşük",
        description: "Gözlerin metin üzerinde soldan sağa düzenli ve atlama yapmadan ilerleyebilme becerisidir.",
        impact: "Bozuk görsel takip, satır kaybetmeye, tekrar okumaya ve okuma yorgunluğuna neden olur.",
        suggestions: [
          "Satır kılavuzu (reading strip / typoscope) kullanımı alışkanlığı kazandırılmalıdır.",
          "Görsel motor bütünleşme egzersizleri için göz-motor terapisti veya optometrist konsültasyonu önerilir."
        ],
        source: "Rayner, K. (1998). Eye movements in reading and information processing: 20 years of research. Psychological Bulletin, 124(3), 372–422."
      },
      {
        metricName: "Sıralama Becerisi",
        measuredValue: 24,
        label: "low",
        labelText: "Düşük",
        description: "Harf, sözcük veya olayları doğru sırayla bellekte tutma ve yeniden üretme yeteneğidir.",
        impact: "Ağır sıralama güçlüğü, harf sırası hatalarını, anlatı organizasyonunu ve çoklu yönerge takibini ciddi biçimde etkiler.",
        suggestions: [
          "Çalışma belleği kapasitesini artırmaya yönelik bilişsel egzersiz programı uygulanmalıdır.",
          "Günlük görevler küçük adımlara bölünerek görsel çizelgelerle sunulmalıdır."
        ],
        source: "Dehn, M. J. (2008). Working memory and academic learning: Assessment and intervention. John Wiley & Sons."
      }
    ],
    generalSuggestions: [
      "Klinisyen veya eğitim psikoloğu tarafından kapsamlı psikoeğitimsel değerlendirme yapılması aciliyetle önerilmektedir.",
      "Okul yönetimiyle birlikte bireyselleştirilmiş eğitim planı (BEP) hazırlanmalı ve uygulamaya alınmalıdır.",
      "Aile, öğretmen ve uzman üçgeninde düzenli iletişim toplantıları planlanarak gelişim takip edilmelidir."
    ],
    references: [
      "Shaywitz, S. E., & Shaywitz, B. A. (2005). Dyslexia (specific reading disability). Biological Psychiatry, 57(11), 1301–1309. https://doi.org/10.1016/j.biopsych.2005.01.043",
      "Wolf, M., & Katzir-Cohen, T. (2001). Reading fluency and its intervention. Scientific Studies of Reading, 5(3), 211–239. https://doi.org/10.1207/S1532799XSSR0503_2",
      "Goswami, U. (2003). Phonological awareness, language development, and learning to read. Scientific Studies of Reading, 6(4), 351–368. https://doi.org/10.1207/S1532799XSSR0604_4",
      "Dehn, M. J. (2008). Working memory and academic learning: Assessment and intervention. John Wiley & Sons.",
      "Peterson, R. L., & Pennington, B. F. (2012). Developmental dyslexia. The Lancet, 379(9830), 1997–2007. https://doi.org/10.1016/S0140-6736(12)60198-6"
    ]
  }
};
