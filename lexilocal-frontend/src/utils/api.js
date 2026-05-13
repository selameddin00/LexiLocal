const BASE = 'http://localhost:3000';

export async function fetchSample(risk) {
  const res = await fetch(`${BASE}/api/sample?risk=${risk}`);
  if (!res.ok) throw new Error('Sample getirilemedi');
  return res.json();
}

export async function analyzeDirectly(sampleData) {
  const res = await fetch(`${BASE}/api/analyze-direct`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sampleData),
  });
  if (!res.ok) throw new Error('Analiz başarısız');
  return res.json();
}
