import random

def reading_data_api_format(student_id_db, row):
    """Node POST /reading-data ile uyumlu govde (alan eslemesi: wpcm/percent -> DB kolonlari)."""
    return {
        "student_id": student_id_db,
        "reading_speed": row["reading_speed_wpcm"],
        "accuracy": row["reading_accuracy_percent"],
        "errors": [],
    }

def ogrenci_uret():
    return {
        "student_id": f"STU_{random.randint(100, 999)}",
        "reading_speed_wpcm": random.randint(40, 150),
        "reading_accuracy_percent": random.randint(85, 100),
        "phonological_awareness_percent": random.randint(50, 100),
        "visual_discrimination_score": round(random.uniform(5.0, 13.0), 1),
        "visual_tracking_seconds": round(random.uniform(57.5, 92.25), 1),
        "sequencing_score": random.randint(85, 115)
    }

def analiz_et(row):
    sonuclar = []
    genel_aciklamalar = []

    # 1. Düşük Akıcılık / Robotik Okuma
    if row["reading_speed_wpcm"] < 40:
        sonuclar.append({
            "etiket": "Düşük Akıcılık / Robotik Okuma",
            "risk": "yüksek",
            "aciklama": "Dakikada doğru okunan kelime sayısı kritik eşik altındadır."
        })
        genel_aciklamalar.append("Okuma akıcılığı kritik düzeyde düşüktür.")
    elif 40 <= row["reading_speed_wpcm"] <= 60:
        sonuclar.append({
            "etiket": "Düşük Akıcılık / Robotik Okuma",
            "risk": "orta",
            "aciklama": "Okuma akıcılığı riskli aralıktadır."
        })
        genel_aciklamalar.append("Okuma akıcılığı riskli düzeydedir.")

    # 2. Düşük Doğruluk / Tahminci Okuma
    if row["reading_accuracy_percent"] < 85:
        sonuclar.append({
            "etiket": "Düşük Doğruluk / Tahminci Okuma",
            "risk": "yüksek",
            "aciklama": "Okuma doğruluğu kritik eşik altındadır."
        })
        genel_aciklamalar.append("Okuma doğruluğu kritik düzeyde düşüktür.")
    elif 85 <= row["reading_accuracy_percent"] <= 91:
        sonuclar.append({
            "etiket": "Düşük Doğruluk / Tahminci Okuma",
            "risk": "orta",
            "aciklama": "Okuma doğruluğu riskli aralıktadır."
        })
        genel_aciklamalar.append("Okuma doğruluğu riskli düzeydedir.")

    # 3. Zayıf Ses Farkındalığı
    if row["phonological_awareness_percent"] < 50:
        sonuclar.append({
            "etiket": "Zayıf Ses Farkındalığı",
            "risk": "yüksek",
            "aciklama": "Ses farkındalığı kritik eşik altındadır."
        })
        genel_aciklamalar.append("Ses farkındalığı ciddi düzeyde düşüktür.")
    elif 50 <= row["phonological_awareness_percent"] <= 70:
        sonuclar.append({
            "etiket": "Zayıf Ses Farkındalığı",
            "risk": "orta",
            "aciklama": "Ses farkındalığı riskli aralıktadır."
        })
        genel_aciklamalar.append("Ses farkındalığı riskli düzeydedir.")

    # 4. Görsel Ayırt Etme Güçlüğü
    if row["visual_discrimination_score"] < 6.01:
        sonuclar.append({
            "etiket": "Görsel Ayırt Etme Güçlüğü",
            "risk": "yüksek",
            "aciklama": "Görsel ayırt etme puanı kritik eşik altındadır."
        })
        genel_aciklamalar.append("Görsel ayırt etme becerisi kritik düzeyde düşüktür.")
    elif 6.01 <= row["visual_discrimination_score"] <= 7.0:
        sonuclar.append({
            "etiket": "Görsel Ayırt Etme Güçlüğü",
            "risk": "orta",
            "aciklama": "Görsel ayırt etme puanı riskli aralıktadır."
        })
        genel_aciklamalar.append("Görsel ayırt etme becerisi riskli düzeydedir.")

    # 5. Görsel Takip Eksikliği
    if row["visual_tracking_seconds"] > 92.25:
        sonuclar.append({
            "etiket": "Görsel Takip Eksikliği",
            "risk": "yüksek",
            "aciklama": "Görsel takip süresi kritik eşik üzerindedir."
        })
        genel_aciklamalar.append("Görsel takip performansı kritik düzeyde zayıftır.")
    elif 85 <= row["visual_tracking_seconds"] <= 92.25:
        sonuclar.append({
            "etiket": "Görsel Takip Eksikliği",
            "risk": "orta",
            "aciklama": "Görsel takip performansı riskli aralıktadır."
        })
        genel_aciklamalar.append("Görsel takip performansı riskli düzeydedir.")

    # 6. Sıralama (Sequencing) Hatası
    if row["sequencing_score"] < 85:
        sonuclar.append({
            "etiket": "Sıralama (Sequencing) Hatası",
            "risk": "yüksek",
            "aciklama": "Sıralama becerisi kritik eşik altındadır."
        })
        genel_aciklamalar.append("Sıralama becerisi kritik düzeyde düşüktür.")
    elif 85 <= row["sequencing_score"] <= 90:
        sonuclar.append({
            "etiket": "Sıralama (Sequencing) Hatası",
            "risk": "orta",
            "aciklama": "Sıralama becerisi riskli aralıktadır."
        })
        genel_aciklamalar.append("Sıralama becerisi riskli düzeydedir.")

    if not sonuclar:
        sonuclar.append({
            "etiket": "Normal",
            "risk": "düşük",
            "aciklama": "Öğrencinin tüm ölçümleri normal aralıktadır."
        })
        genel_aciklamalar.append("Öğrencinin genel performansı normal düzeydedir.")

    return {
        "student_id": row["student_id"],
        "veri": row,
        "sonuclar": sonuclar,
        "genel_aciklama": " ".join(genel_aciklamalar)
    }

def _payload_to_analiz_row(payload):
    """Node bridge'den gelen JSON -> analiz_et satir formati.
    Eksik ek metrikler icin notr degerler (Node'da undefined iken etiket uretilmiyordu)."""
    sid = payload.get("student_id", "")
    rs = payload.get("reading_speed")
    acc = payload.get("accuracy")
    if rs is None:
        rs = payload.get("reading_speed_wpcm")
    if acc is None:
        acc = payload.get("reading_accuracy_percent")

    def neu_int(key, default):
        v = payload.get(key)
        if v is None or v == "":
            return default
        return int(v)

    def neu_float(key, default):
        v = payload.get(key)
        if v is None or v == "":
            return default
        return float(v)

    return {
        "student_id": sid,
        "reading_speed_wpcm": int(rs) if rs is not None else 0,
        "reading_accuracy_percent": int(acc) if acc is not None else 100,
        "phonological_awareness_percent": neu_int("phonological_awareness_percent", 100),
        "visual_discrimination_score": neu_float("visual_discrimination_score", 10.0),
        "visual_tracking_seconds": neu_float("visual_tracking_seconds", 50.0),
        "sequencing_score": neu_int("sequencing_score", 100),
    }


def _level_from_sonuclar(sonuclar):
    if len(sonuclar) == 1 and sonuclar[0].get("etiket") == "Normal":
        return "good"
    if any(s.get("risk") == "yüksek" for s in sonuclar):
        return "low"
    if any(s.get("risk") == "orta" for s in sonuclar):
        return "low"
    return "good"


def _recommendations_from_sonuclar(sonuclar, level):
    if level == "good":
        return ["Daha zor metinler okut"]
    recs = ["Günlük okuma çalışması"]
    et = [s.get("etiket", "") for s in sonuclar]
    if any("Doğruluk" in x for x in et):
        recs.append("Doğruluk için tekrar okuma")
    if any("hata" in x.lower() or "Hata" in x for x in et):
        recs.append("Hata analizi yapın")
    return recs


def bridge_analyze_json(payload):
    """Node icin tek JSON cikti: labels, explanations, summary, level, recommendations."""
    row = _payload_to_analiz_row(payload)
    raw = analiz_et(row)
    sonuclar = raw["sonuclar"]
    labels = [s["etiket"] for s in sonuclar]
    explanations = [s["aciklama"] for s in sonuclar]
    summary = raw.get("genel_aciklama") or ""
    level = _level_from_sonuclar(sonuclar)
    recommendations = _recommendations_from_sonuclar(sonuclar, level)
    return {
        "labels": labels,
        "explanations": explanations,
        "summary": summary,
        "level": level,
        "recommendations": recommendations,
    }


if __name__ == "__main__":
    import json
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "--bridge":
        try:
            payload = json.load(sys.stdin)
            out = bridge_analyze_json(payload)
            print(json.dumps(out, ensure_ascii=False))
        except Exception as e:
            print(json.dumps({"error": str(e)}), file=sys.stderr)
            sys.exit(1)
    else:
        ogrenci = ogrenci_uret()
        sonuc = analiz_et(ogrenci)

        print("Üretilen Öğrenci Verisi:")
        print(ogrenci)
        print("\nAnaliz Sonucu:")
        print(sonuc)

        ornek_db_id = 1
        print("\nNode API icin okuma verisi govdesi (ornek student_id=%s):" % ornek_db_id)
        print(reading_data_api_format(ornek_db_id, ogrenci))