const express = require("express");
const { Pool } = require('pg');
const app = express();

app.use(express.json());

// 1. PostgreSQL Bağlantı Ayarları
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "dyslexia_project",
  password: "1234", 
  port: 5432,
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
  const { student_id, reading_speed, accuracy, errors } = req.body;
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
    // DB'den öğrenciyi ve son okuma verisini çek
    const studentRes = await pool.query("SELECT * FROM students WHERE id = $1", [studentId]);
    const dataRes = await pool.query("SELECT * FROM reading_data WHERE student_id = $1 ORDER BY id DESC LIMIT 1", [studentId]);

    if (studentRes.rows.length === 0 || dataRes.rows.length === 0) {
      return res.status(404).json({ message: "Öğrenci veya veri bulunamadı" });
    }

    const student = studentRes.rows[0];
    const data = dataRes.rows[0];

    let result = {
      student_id: studentId,
      summary: data.reading_speed < 80 ? "Okuma hızı düşük" : "Okuma iyi",
      level: data.reading_speed < 80 ? "low" : "good",
      recommendations: data.reading_speed < 80 ? ["Günlük okuma çalışması"] : ["Daha zor metinler okut"]
    };

    // Analiz sonucunu DB'ye kaydet
    await pool.query(
      "INSERT INTO analysis_results (student_id, summary, level, recommendations) VALUES ($1, $2, $3, $4)",
      [result.student_id, result.summary, result.level, result.recommendations]
    );

    res.json(result);
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