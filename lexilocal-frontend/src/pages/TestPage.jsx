import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MetricInput from '../components/MetricInput';
import { mockAnalyze } from '../utils/mockAnalyze';

const FIELDS = [
  { name: 'okumaHizi',             label: 'Okuma Hızı',             inputType: 'number', min: 0, max: 300 },
  { name: 'dogrulukOrani',         label: 'Doğruluk Oranı',         inputType: 'slider', min: 0, max: 100 },
  { name: 'fonolojikFarkındalık',  label: 'Fonolojik Farkındalık',  inputType: 'slider', min: 0, max: 100 },
  { name: 'gorselIsleme',          label: 'Görsel İşleme',          inputType: 'slider', min: 0, max: 100 },
  { name: 'gorselTakip',           label: 'Görsel Takip',           inputType: 'slider', min: 0, max: 100 },
  { name: 'siralamaBecerisi',      label: 'Sıralama Becerisi',      inputType: 'slider', min: 0, max: 100 },
];

const INITIAL_VALUES = Object.fromEntries(FIELDS.map((f) => [f.name, 0]));
const INITIAL_ERRORS = Object.fromEntries(FIELDS.map((f) => [f.name, null]));

function validate(formData) {
  const errors = { ...INITIAL_ERRORS };
  let valid = true;

  for (const field of FIELDS) {
    const raw = formData[field.name];
    const val = Number(raw);

    if (raw === '' || raw === null || raw === undefined) {
      errors[field.name] = 'Bu alan zorunludur.';
      valid = false;
    } else if (isNaN(val) || val < field.min || val > field.max) {
      errors[field.name] = `${field.min}–${field.max} aralığında bir değer girin.`;
      valid = false;
    }
  }

  return { errors, valid };
}

export default function TestPage() {
  const navigate = useNavigate();
  const [formData, setFormData]   = useState(INITIAL_VALUES);
  const [errors, setErrors]       = useState(INITIAL_ERRORS);
  const [uiState, setUiState]     = useState('idle'); // "idle" | "loading" | "error"

  const handleChange = (name) => (value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { errors: newErrors, valid } = validate(formData);
    setErrors(newErrors);
    if (!valid) return;

    setUiState('loading');
    try {
      await mockAnalyze(formData);
      sessionStorage.setItem('activeReportId', 'r001');
      navigate('/report/r_' + Date.now(), { replace: true });
    } catch {
      setUiState('error');
    }
  };

  const isLoading = uiState === 'loading';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F9FAFB',
        padding: '40px 16px 64px',
      }}
    >
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        {/* Başlık */}
        <h1
          style={{
            color: '#1E3A5F',
            fontSize: '26px',
            fontWeight: 700,
            marginBottom: '8px',
          }}
        >
          Metrik Değerlendirme Formu
        </h1>
        <p style={{ color: '#6B7280', fontSize: '15px', marginBottom: '32px' }}>
          Lütfen her metrik için ölçüm değerini girin.
        </p>

        {/* Hata Banner */}
        {uiState === 'error' && (
          <div
            role="alert"
            style={{
              background: '#FEE2E2',
              border: '1px solid #DC2626',
              borderRadius: '6px',
              padding: '12px 16px',
              color: '#DC2626',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '24px',
            }}
          >
            Analiz tamamlanamadı. Lütfen tekrar deneyin.
          </div>
        )}

        {/* Yükleme Göstergesi */}
        {isLoading && (
          <div
            aria-live="polite"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '24px',
              color: '#1E3A5F',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            <Spinner />
            Analiz ediliyor, lütfen bekleyin…
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {FIELDS.map((field) => (
              <div
                key={field.name}
                style={{
                  background: '#ffffff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  padding: '20px',
                }}
              >
                <MetricInput
                  label={field.label}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange(field.name)}
                  min={field.min}
                  max={field.max}
                  inputType={field.inputType}
                  error={errors[field.name]}
                  disabled={isLoading}
                />
              </div>
            ))}
          </div>

          <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center' }}>
            <SubmitButton loading={isLoading} />
          </div>
        </form>
      </div>
    </div>
  );
}

function SubmitButton({ loading }) {
  const [hover, setHover] = useState(false);

  return (
    <button
      type="submit"
      disabled={loading}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '14px 48px',
        background: '#1E3A5F',
        color: '#ffffff',
        border: 'none',
        borderRadius: '6px',
        fontSize: '15px',
        fontWeight: 600,
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : hover ? 0.9 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      {loading ? 'Analiz ediliyor...' : 'Analiz Et'}
    </button>
  );
}

function Spinner() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ animation: 'spin 0.8s linear infinite' }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="9" cy="9" r="7" stroke="#CBD5E1" strokeWidth="2" />
      <path d="M9 2a7 7 0 0 1 7 7" stroke="#1E3A5F" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
