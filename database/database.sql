-- 1. Öğrenci bilgilerinin tutulacağı ana tablo
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    age INT,
    grade VARCHAR(10),
    diagnosis VARCHAR(50)
);

-- 2. Okuma testlerinden gelen verilerin tutulacağı tablo
CREATE TABLE reading_data (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id), -- Hangi öğrenciye ait olduğunu bağlar
    reading_speed INT,
    accuracy INT,
    errors TEXT[],
    date DATE DEFAULT CURRENT_DATE
);

-- 3. Yapay zeka analiz sonuçlarının tutulacağı tablo
CREATE TABLE analysis_results (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id), -- Hangi öğrenciye ait olduğunu bağlar
    summary TEXT,
    level VARCHAR(20),
    recommendations TEXT[]
);