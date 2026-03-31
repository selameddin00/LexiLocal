const express = require("express");
const app = express();

app.use(express.json());

let students = [];
let readingData = [];
let analysisResults = [];

app.get("/", (req, res) => {
  res.send("Backend çalışıyor 🚀");
});

app.post("/students", (req, res) => {
  const student = req.body;

  students.push(student);

  res.json({
    message: "Öğrenci eklendi",
    data: student
  });
});

app.get("/students", (req, res) => {
  res.json(students);
});

// READING DATA API 
app.post("/reading-data", (req, res) => {
  const data = req.body;

  readingData.push(data);

  res.json({
    message: "Okuma verisi eklendi",
    data: data
  });
});

app.get("/reading-data", (req, res) => {
  res.json(readingData);
});

app.post("/analyze/:studentId", (req, res) => {
  const studentId = req.params.studentId;

  const student = students.find(s => s.id == studentId);
  const data = readingData.find(d => d.student_id == studentId);

  if (!student || !data) {
    return res.status(404).json({
      message: "Öğrenci veya veri bulunamadı"
    });
  }

  let result = {
    student_id: studentId,
    summary: "",
    level: "",
    recommendations: []
  };

  if (data.reading_speed < 80) {
    result.summary = "Okuma hızı düşük";
    result.level = "low";
    result.recommendations.push("Günlük okuma çalışması");
  } else {
    result.summary = "Okuma iyi";
    result.level = "good";
    result.recommendations.push("Daha zor metinler okut");
  }

  analysisResults.push(result);

res.json(result);
});

app.get("/analysis/:studentId", (req, res) => {
  const studentId = req.params.studentId;

  const results = analysisResults.filter(r => r.student_id == studentId);

  res.json(results);
});

app.listen(3000, () => {
  console.log("Server 3000 portunda çalışıyor");
});