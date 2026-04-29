require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require("express");
const { spawn } = require("child_process");
const path = require("path");
const { Pool } = require('pg');
const app = express();

app.use(express.json());

/** DB disi: son okuma istegiyle gelen ek metrikler (analiz icin; sema degisikligi yok) */
const lastReadingExtraMetrics = Object.create(null);

function optFiniteNum(v) {
  if (v === undefined || v === null || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function normalizeReadingDataBody(body) {
  const reading_speed =
    body.reading_speed != null ? body.reading_speed : body.reading_speed_wpcm;
  const accuracy =
    body.accuracy != null ? body.accuracy : body.reading_accuracy_percent;
  let errors = body.errors;
  if (errors == null && body.error_count != null) {
    const n = Math.max(0, parseInt(body.error_count, 10) || 0);
    errors = Array.from({ length: Math.min(n, 50) }, (_, i) => `hata_${i + 1}`);
  }
  if (!Array.isArray(errors)) errors = [];
  return {
    reading_speed,
    accuracy,
    errors,
    phonological_awareness_percent: optFiniteNum(body.phonological_awareness_percent),
    visual_discrimination_score: optFiniteNum(body.visual_discrimination_score),
    visual_tracking_seconds: optFiniteNum(body.visual_tracking_seconds),
    sequencing_score: optFiniteNum(body.sequencing_score),
  };
}

function extraMetricsFromBody(body) {
  if (!body || typeof body !== "object") return {};
  return {
    phonological_awareness_percent: optFiniteNum(body.phonological_awareness_percent),
    visual_discrimination_score: optFiniteNum(body.visual_discrimination_score),
    visual_tracking_seconds: optFiniteNum(body.visual_tracking_seconds),
    sequencing_score: optFiniteNum(body.sequencing_score),
  };
}

function validateReadingMetrics(data) {
  const rs = data.reading_speed;
  const acc = data.accuracy;
  const nrs = typeof rs === "number" ? rs : Number(rs);
  if (!Number.isFinite(nrs)) {
    return { ok: false, message: "reading_speed sayı değil veya eksik" };
  }
  if (acc != null && acc !== "") {
    const nacc = typeof acc === "number" ? acc : Number(acc);
    if (!Number.isFinite(nacc)) {
      return { ok: false, message: "accuracy sayı değil" };
    }
  }
  return { ok: true };
}

function runPythonBridge(payload) {
  return new Promise((resolve, reject) => {
    const analysisDir = path.join(__dirname, "..", "analysis");
    const script = path.join(analysisDir, "analysis.py");
    const py = spawn("python", ["-X", "utf8", script, "--bridge"], {
      cwd: analysisDir,
      windowsHide: true,
      env: {
        ...process.env,
        PYTHONIOENCODING: "utf-8",
        PYTHONUTF8: "1",
      },
    });
    let out = "";
    let err = "";
    py.stdout.on("data", (c) => {
      out += c.toString("utf8");
    });
    py.stderr.on("data", (c) => {
      err += c.toString("utf8");
    });
    py.on("error", (e) => reject(e));
    py.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(err.trim() || `Python çıkış kodu ${code}`));
        return;
      }
      try {
        const parsed = JSON.parse(out.trim());
        resolve(parsed);
      } catch (e) {
        reject(new Error(`Python JSON ayrıştırma hatası: ${e.message}`));
      }
    });
    py.stdin.write(Buffer.from(JSON.stringify(payload), "utf8"));
    py.stdin.end();
  });
}

function runPythonRAG(labels, studentData) {
  return new Promise((resolve, reject) => {
    const analysisDir = path.join(__dirname, "..", "analysis");
    const script = path.join(analysisDir, "rag_report.py");
    const py = spawn("python", ["-X", "utf8", script, "--generate"], {
      cwd: analysisDir,
      windowsHide: true,
      env: {
        ...process.env,
        PYTHONIOENCODING: "utf-8",
        PYTHONUTF8: "1",
      },
    });
    let out = "";
    let err = "";
    py.stdout.on("data", (c) => {
      out += c.toString("utf8");
    });
    py.stderr.on("data", (c) => {
      err += c.toString("utf8");
    });
    py.on("error", (e) => reject(e));
    py.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(err.trim() || `Python RAG çıkış kodu ${code}`));
        return;
      }
      try {
        const parsed = JSON.parse(out.trim());
        resolve(parsed);
      } catch (e) {
        reject(new Error(`Python RAG JSON ayrıştırma hatası: ${e.message}`));
      }
    });
    py.stdin.write(
      Buffer.from(
        JSON.stringify({
          labels: Array.isArray(labels) ? labels : [],
          student_data: studentData || {},
        }),
        "utf8"
      )
    );
    py.stdin.end();
  });
}

// 1. PostgreSQL Bağlantı Ayarları
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "lexi_local",
  password: "1234",
  port: 5432,
  options: "-c client_encoding=UTF8",
});

// Bağlantıyı Test Et
pool.connect((err) => {
  if (err) {
    console.error("Veritabanı bağlantı hatası ❌:", err.stack);
  } else {
    console.log("PostgreSQL veritabanına başarıyla bağlandık! 🚀");
  }
});

// Ana Sayfa Testi
app.get("/", (req, res) => {
  res.send("LexiLocal Backend Çalışıyor 🚀");
});

// --- STUDENT API ---

// Öğrenci Ekleme (DB Kayıt)
app.post("/students", async (req, res) => {
  const { name, age, grade, diagnosis } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO students (name, age, grade, diagnosis) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, age, grade, diagnosis]
    );
    res.json({ message: "Öğrenci eklendi ✅", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tüm Öğrencileri Getir
app.get("/students", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM students");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- READING DATA API ---

// Okuma Verisi Ekleme
app.post("/reading-data", async (req, res) => {
  const { student_id } = req.body;
  const normalized = normalizeReadingDataBody(req.body);
  const {
    reading_speed,
    accuracy,
    errors,
    phonological_awareness_percent,
    visual_discrimination_score,
    visual_tracking_seconds,
    sequencing_score,
  } = normalized;
  lastReadingExtraMetrics[String(student_id)] = {
    phonological_awareness_percent,
    visual_discrimination_score,
    visual_tracking_seconds,
    sequencing_score,
  };
  try {
    const result = await pool.query(
      "INSERT INTO reading_data (student_id, reading_speed, accuracy, errors) VALUES ($1, $2, $3, $4) RETURNING *",
      [student_id, reading_speed, accuracy, errors]
    );
    res.json({ message: "Okuma verisi eklendi ✅", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ANALYZE API ---

app.post("/analyze/:studentId", async (req, res) => {
  const studentId = req.params.studentId;

  try {
    if (studentId === undefined || studentId === null || String(studentId).trim() === "") {
      return res.status(400).json({ message: "student_id gerekli" });
    }

    const studentRes = await pool.query("SELECT * FROM students WHERE id = $1", [studentId]);
    const dataRes = await pool.query("SELECT * FROM reading_data WHERE student_id = $1 ORDER BY id DESC LIMIT 1", [studentId]);

    if (studentRes.rows.length === 0 || dataRes.rows.length === 0) {
      return res.status(404).json({ message: "Öğrenci veya veri bulunamadı" });
    }

    const student = studentRes.rows[0];
    const data = dataRes.rows[0];

    const v = validateReadingMetrics(data);
    if (!v.ok) {
      return res.status(400).json({ message: v.message });
    }

    const speed = data.reading_speed;
    const acc = data.accuracy != null ? data.accuracy : 100;

    const fromReq = extraMetricsFromBody(req.body);
    const fromLast = lastReadingExtraMetrics[String(studentId)] || {};
    const M = {
      phonological_awareness_percent:
        fromReq.phonological_awareness_percent !== undefined
          ? fromReq.phonological_awareness_percent
          : fromLast.phonological_awareness_percent,
      visual_discrimination_score:
        fromReq.visual_discrimination_score !== undefined
          ? fromReq.visual_discrimination_score
          : fromLast.visual_discrimination_score,
      visual_tracking_seconds:
        fromReq.visual_tracking_seconds !== undefined
          ? fromReq.visual_tracking_seconds
          : fromLast.visual_tracking_seconds,
      sequencing_score:
        fromReq.sequencing_score !== undefined
          ? fromReq.sequencing_score
          : fromLast.sequencing_score,
    };

    /*
     * PASIF — Node karar motoru (etiket / aciklama / risk): devre disi.
     * Analiz Python (analysis.py --bridge) uzerinden yapilir.
     *
    const labels = [];
    const explanations = [];

    if (speed < 40) {
      labels.push("Düşük Akıcılık / Robotik Okuma");
      explanations.push(
        "Dakikada doğru okunan kelime sayısı kritik eşik altındadır."
      );
    } else if (speed <= 60) {
      labels.push("Düşük Akıcılık / Robotik Okuma");
      explanations.push("Okuma akıcılığı riskli aralıktadır.");
    }

    if (acc < 85) {
      labels.push("Düşük Doğruluk / Tahminci Okuma");
      explanations.push("Okuma doğruluğu kritik eşik altındadır.");
    } else if (acc <= 91) {
      labels.push("Düşük Doğruluk / Tahminci Okuma");
      explanations.push("Okuma doğruluğu riskli aralıktadır.");
    }

    const errorCount = Array.isArray(data.errors) ? data.errors.length : 0;
    if (errorCount >= 5) {
      labels.push("Yüksek hata yükü");
      explanations.push("Çok sayıda okuma hatası kaydı bulunmaktadır.");
    } else if (errorCount >= 2) {
      labels.push("Dikkat: okuma hataları");
      explanations.push("Birden fazla okuma hatası tespit edildi.");
    }

    const pa = M.phonological_awareness_percent;
    if (pa !== undefined) {
      if (pa < 50) {
        labels.push("Ses farkındalığı: yüksek risk");
        explanations.push("Fonolojik farkındalık yüzdesi kritik eşik altındadır.");
      } else if (pa <= 70) {
        labels.push("Ses farkındalığı: orta risk");
        explanations.push("Fonolojik farkındalık yüzdesi riskli aralıktadır.");
      }
    }

    const vd = M.visual_discrimination_score;
    if (vd !== undefined && vd < 7) {
      labels.push("Düşük görsel ayırt etme");
      explanations.push("Görsel ayırt etme puanı düşüktür.");
    }

    const vt = M.visual_tracking_seconds;
    if (vt !== undefined && vt > 90) {
      labels.push("Görsel takip zayıf");
      explanations.push("Görsel takip süresi yüksek; takip performansı zayıf olabilir.");
    }

    const seq = M.sequencing_score;
    if (seq !== undefined && seq < 85) {
      labels.push("Sıralama problemi");
      explanations.push("Sıralama puanı kritik eşik altındadır.");
    }

    if (labels.length === 0) {
      labels.push("Normal");
      explanations.push("Öğrencinin ölçümleri normal aralıktadır.");
    }

    let summary = "Okuma iyi";
    let level = "good";
    if (speed < 80) {
      summary = "Okuma hızı düşük";
      level = "low";
    } else if (acc < 85) {
      summary = "Okuma doğruluğu düşük";
      level = "low";
    } else if (errorCount >= 3) {
      summary = "Okuma hataları fazla";
      level = "low";
    }

    let recommendations;
    if (level === "low") {
      recommendations = ["Günlük okuma çalışması"];
      if (acc < 85) recommendations.push("Doğruluk için tekrar okuma");
      if (errorCount >= 3) recommendations.push("Hata analizi yapın");
    } else {
      recommendations = ["Daha zor metinler okut"];
    }
    */

    const bridgePayload = {
      student_id: studentId,
      reading_speed: speed,
      accuracy: acc,
      errors: Array.isArray(data.errors) ? data.errors : [],
    };
    if (M.phonological_awareness_percent !== undefined) {
      bridgePayload.phonological_awareness_percent = M.phonological_awareness_percent;
    }
    if (M.visual_discrimination_score !== undefined) {
      bridgePayload.visual_discrimination_score = M.visual_discrimination_score;
    }
    if (M.visual_tracking_seconds !== undefined) {
      bridgePayload.visual_tracking_seconds = M.visual_tracking_seconds;
    }
    if (M.sequencing_score !== undefined) {
      bridgePayload.sequencing_score = M.sequencing_score;
    }

    const analysis = await runPythonBridge(bridgePayload);

    const studentDataForRag = {
      reading_speed: speed,
      accuracy: acc,
      errors: Array.isArray(data.errors) ? data.errors : [],
    };
    if (M.phonological_awareness_percent !== undefined) {
      studentDataForRag.phonological_awareness_percent = M.phonological_awareness_percent;
    }
    if (M.visual_discrimination_score !== undefined) {
      studentDataForRag.visual_discrimination_score = M.visual_discrimination_score;
    }
    if (M.visual_tracking_seconds !== undefined) {
      studentDataForRag.visual_tracking_seconds = M.visual_tracking_seconds;
    }
    if (M.sequencing_score !== undefined) {
      studentDataForRag.sequencing_score = M.sequencing_score;
    }

    let ragReport = null;
    try {
      const ragResult = await runPythonRAG(analysis.labels || [], studentDataForRag);
      ragReport = ragResult && typeof ragResult.rag_report === "string" ? ragResult.rag_report : null;
    } catch (ragErr) {
      console.error("RAG raporu üretilemedi:", ragErr.message);
      ragReport = null;
    }

    await pool.query(
      "INSERT INTO analysis_results (student_id, summary, level, recommendations) VALUES ($1, $2, $3, $4)",
      [studentId, analysis.summary, analysis.level, analysis.recommendations]
    );

    res.json({
      student: {
        id: student.id,
        name: student.name,
        grade: student.grade,
        age: student.age,
        diagnosis: student.diagnosis,
      },
      analysis: {
        labels: analysis.labels || [],
        explanations: analysis.explanations || [],
        summary: analysis.summary,
        level: analysis.level,
        recommendations: analysis.recommendations || [],
        rag_report: ragReport,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Öğrencinin Analiz Geçmişini Getir
app.get("/analysis/:studentId", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM analysis_results WHERE student_id = $1", [req.params.studentId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("Server 3000 portunda çalışıyor");
});