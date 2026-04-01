import { useState, useCallback } from "react";

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max, decimals = 1) {
  return Number((Math.random() * (max - min) + min).toFixed(decimals));
}

/**
 * Python `ogrenci_uret` ile uyumlu araliklar; ara sıra dusuk/orta/yuksek profil.
 */
function generateSyntheticPayload(studentId) {
  const r = Math.random();
  const band = r < 0.34 ? "low" : r < 0.67 ? "mid" : "high";

  const ranges = {
    low: {
      reading_speed: [40, 59],
      accuracy: [85, 88],
      pa: [50, 55],
      vd: [5.0, 6.5],
      vt: [88.0, 92.25],
      seq: [85, 88],
    },
    mid: {
      reading_speed: [60, 100],
      accuracy: [89, 95],
      pa: [56, 75],
      vd: [6.5, 9.0],
      vt: [70.0, 88.0],
      seq: [88, 100],
    },
    high: {
      reading_speed: [100, 150],
      accuracy: [95, 100],
      pa: [76, 100],
      vd: [9.0, 13.0],
      vt: [57.5, 75.0],
      seq: [100, 115],
    },
  };

  const rg = ranges[band];
  return {
    student_id: studentId,
    reading_speed: randInt(rg.reading_speed[0], rg.reading_speed[1]),
    accuracy: randInt(rg.accuracy[0], rg.accuracy[1]),
    errors: [],
    phonological_awareness_percent: randInt(rg.pa[0], rg.pa[1]),
    visual_discrimination_score: randFloat(rg.vd[0], rg.vd[1]),
    visual_tracking_seconds: randFloat(rg.vt[0], rg.vt[1]),
    sequencing_score: randInt(rg.seq[0], rg.seq[1]),
  };
}

const METRICS = [
  { key: "reading_speed", title: "Okuma Akıcılığı", unit: " kelime/dk", fmt: (v) => String(v) },
  { key: "accuracy", title: "Okuma Doğruluğu", unit: "%", fmt: (v) => String(v) },
  {
    key: "phonological_awareness_percent",
    title: "Ses Farkındalığı",
    unit: "%",
    fmt: (v) => String(v),
  },
  {
    key: "visual_discrimination_score",
    title: "Görsel Ayırt Etme",
    unit: "",
    fmt: (v) => String(v),
  },
  {
    key: "visual_tracking_seconds",
    title: "Görsel Takip",
    unit: " sn",
    fmt: (v) => String(v),
  },
  {
    key: "sequencing_score",
    title: "Sıralama Becerisi",
    unit: "",
    fmt: (v) => String(v),
  },
];

export default function App() {
  const [studentIdInput, setStudentIdInput] = useState("1");
  const [currentData, setCurrentData] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isDataReady, setIsDataReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const studentIdNum = Number(studentIdInput);
  const studentIdValid = Number.isInteger(studentIdNum) && studentIdNum > 0;

  const runGenerate = useCallback(async () => {
    setStatusMsg(null);
    setAnalysisResult(null);
    if (!studentIdValid) {
      setStatusMsg({ type: "error", text: "Geçerli bir öğrenci ID girin (pozitif tam sayı)." });
      return;
    }
    const payload = generateSyntheticPayload(studentIdNum);
    setCurrentData(payload);
    setIsDataReady(false);
    setBusy(true);
    try {
      const res = await fetch("/reading-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || body.message || `HTTP ${res.status}`);
      }
      setIsDataReady(true);
      setStatusMsg({ type: "ok", text: body.message || "Okuma verisi kaydedildi." });
    } catch (e) {
      setStatusMsg({ type: "error", text: e.message || String(e) });
    } finally {
      setBusy(false);
    }
  }, [studentIdNum, studentIdValid]);

  const runAnalyze = useCallback(async () => {
    if (!isDataReady || !studentIdValid) return;
    setStatusMsg(null);
    setBusy(true);
    try {
      const res = await fetch(`/analyze/${studentIdNum}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || body.message || `HTTP ${res.status}`);
      }
      setAnalysisResult(body);
      setStatusMsg({ type: "ok", text: "Analiz tamamlandı." });
    } catch (e) {
      setStatusMsg({ type: "error", text: e.message || String(e) });
      setAnalysisResult(null);
    } finally {
      setBusy(false);
    }
  }, [isDataReady, studentIdNum, studentIdValid]);

  const a = analysisResult?.analysis;

  return (
    <div className="app">
      <h1>LexiLocal — Okuma analizi</h1>
      <p className="sub">
        Sentetik veri üretin, sunucuya gönderin ve analiz raporunu görüntüleyin. Backend{" "}
        <code>http://localhost:3000</code> (geliştirme: Vite proxy).
      </p>

      <div className="toolbar">
        <div className="field">
          <label htmlFor="sid">Öğrenci ID</label>
          <input
            id="sid"
            type="number"
            min={1}
            step={1}
            value={studentIdInput}
            onChange={(e) => setStudentIdInput(e.target.value)}
            disabled={busy}
          />
          <small>Veritabanında kayıtlı öğrenci kimliği (ör. 1).</small>
        </div>
        <div className="actions">
          <button type="button" onClick={runGenerate} disabled={busy}>
            Veri Üret
          </button>
          <button
            type="button"
            className="secondary"
            onClick={runAnalyze}
            disabled={busy || !isDataReady}
          >
            Analiz Et
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className={`msg ${statusMsg.type === "error" ? "error" : "ok"}`}>{statusMsg.text}</div>
      )}

      <h2 className="section-title">Metrikler</h2>
      <div className="metrics">
        {METRICS.map(({ key, title, unit, fmt }) => {
          const raw = currentData?.[key];
          const has = raw !== undefined && raw !== null && raw !== "";
          return (
            <div key={key} className="metric-card">
              <h2>{title}</h2>
              <div className={`value ${!has ? "empty" : ""}`}>
                {!has ? "—" : `${fmt(raw)}${unit}`}
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="section-title">Rapor</h2>
      <div className={`report ${!a ? "empty" : ""}`}>
        {!a ? (
          "Analiz sonrası etiketler, açıklamalar, özet ve seviye burada görünür."
        ) : (
          <>
            <div>
              <span className={`level ${a.level === "good" ? "level-good" : "level-low"}`}>
                Seviye: {a.level === "good" ? "iyi" : "düşük risk / dikkat"}
              </span>
            </div>
            <p>
              <strong>Özet:</strong> {a.summary}
            </p>
            {Array.isArray(a.recommendations) && a.recommendations.length > 0 && (
              <div>
                <strong>Öneriler</strong>
                <ul>
                  {a.recommendations.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="pairs">
              <strong>Etiketler ve açıklamalar</strong>
              {Array.isArray(a.labels) &&
                a.labels.map((label, i) => (
                  <div key={i} className="pair">
                    <strong>{label}</strong>
                    <span>{Array.isArray(a.explanations) ? a.explanations[i] : ""}</span>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
