import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSample, analyzeDirectly } from '../utils/api';

const RISK_CARDS = [
  {
    risk: 'yuksek_risk',
    title: 'Yüksek Risk',
    subtitle: 'Örnek profil: yüksek_risk',
    accent: 'linear-gradient(135deg, #DC2626, #F87171)',
    icon: '⚠️',
  },
  {
    risk: 'orta_risk',
    title: 'Orta Risk',
    subtitle: 'Örnek profil: orta_risk',
    accent: 'linear-gradient(135deg, #D97706, #FBBF24)',
    icon: '⚡',
  },
  {
    risk: 'normal',
    title: 'Normal',
    subtitle: 'Örnek profil: normal',
    accent: 'linear-gradient(135deg, #16A34A, #4ADE80)',
    icon: '✅',
  },
];

const PREVIEW_METRICS = [
  { key: 'reading_speed_wpcm', label: 'Okuma Hızı', suffix: '' },
  { key: 'reading_accuracy_percent', label: 'Okuma Doğruluğu', suffix: ' %' },
  { key: 'phonological_awareness_score', label: 'Fonolojik Farkındalık', suffix: '' },
  { key: 'letter_symbol_recognition_accuracy', label: 'Harf-Sembol Tanıma', suffix: '' },
  { key: 'rereading_rate', label: 'Yeniden Okuma Oranı', suffix: ' %' },
  { key: 'working_memory_accuracy', label: 'Çalışma Belleği', suffix: '' },
];

export default function TestPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('select');
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [sampleData, setSampleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [isMobile] = useState(() => window.innerWidth < 768);
  const [backHover, setBackHover] = useState(false);

  const loadSample = async (risk) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSample(risk);
      setSampleData(data);
      setStep('preview');
    } catch (e) {
      setError(
        e.message === 'Sample getirilemedi'
          ? 'Örnek veri alınamadı. Sunucunun çalıştığından ve CSV dosyasının yüklü olduğundan emin olun.'
          : e.message || 'Örnek veri yüklenirken bir hata oluştu.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRiskSelect = async (risk) => {
    setSelectedRisk(risk);
    await loadSample(risk);
  };

  const handleDifferentSample = async () => {
    if (!selectedRisk) return;
    await loadSample(selectedRisk);
  };

  const handleAnalyze = async () => {
    if (!sampleData) return;
    setAnalyzing(true);
    setError(null);
    try {
      const response = await analyzeDirectly(sampleData);
      sessionStorage.setItem('analysisResult', JSON.stringify(response));
      navigate('/report/result');
    } catch (e) {
      setError(
        e.message === 'Analiz başarısız'
          ? 'Analiz tamamlanamadı. Python analiz motorunun kurulu olduğundan emin olun ve tekrar deneyin.'
          : e.message || 'Analiz sırasında bir hata oluştu.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const goBackToSelect = () => {
    setStep('select');
    setSampleData(null);
    setSelectedRisk(null);
    setError(null);
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #F0F7FF 0%, #EFF6FF 100%)',
        minHeight: '100vh',
        fontFamily: "'Nunito', system-ui, sans-serif",
      }}
    >
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'linear-gradient(135deg, #1E3A5F 0%, #2E86C1 100%)',
          borderBottom: 'none',
          boxShadow: '0 2px 12px rgba(30,58,95,0.2)',
          padding: isMobile ? '0 16px' : '0 40px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '12px',
              padding: '4px',
              display: 'inline-flex',
              flexShrink: 0,
            }}
          >
            <svg width="38" height="38" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="52" height="52" rx="10" fill="white" />
              <rect x="8" y="13" width="16" height="26" rx="2" fill="#2E86C1" transform="rotate(-3 8 13)" />
              <rect x="28" y="13" width="16" height="26" rx="2" fill="#1E3A5F" transform="rotate(3 44 13)" />
              <rect x="25" y="11" width="2" height="30" rx="1" fill="white" opacity="0.9" />
              <rect x="11" y="20" width="10" height="1.5" rx="0.75" fill="white" opacity="0.5" />
              <rect x="11" y="24" width="8" height="1.5" rx="0.75" fill="white" opacity="0.5" />
              <rect x="11" y="28" width="10" height="1.5" rx="0.75" fill="white" opacity="0.5" />
              <rect x="31" y="20" width="10" height="1.5" rx="0.75" fill="white" opacity="0.5" />
              <rect x="31" y="24" width="8" height="1.5" rx="0.75" fill="white" opacity="0.5" />
              <rect x="31" y="28" width="10" height="1.5" rx="0.75" fill="white" opacity="0.5" />
            </svg>
          </div>
          <div>
            <div style={{ lineHeight: 1 }}>
              <span style={{ fontFamily: 'Georgia, serif', fontSize: '21px', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.5px' }}>Lexi</span>
              <span style={{ fontFamily: 'Georgia, serif', fontSize: '21px', fontWeight: 900, color: '#7DD3FC', letterSpacing: '-0.5px' }}>Local</span>
            </div>
            {!isMobile && (
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '3px' }}>
                Disleksi Destek Platformu
              </div>
            )}
          </div>
        </div>

        {!isMobile && (
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
            Metrik Değerlendirme
          </div>
        )}

        <div
          style={{
            background: 'linear-gradient(135deg, #1E3A5F, #2E86C1)',
            color: '#ffffff',
            borderRadius: '9999px',
            padding: '6px 16px',
            fontSize: '13px',
            fontWeight: 700,
          }}
        >
          {step === 'select' ? '1 / 2' : '2 / 2'}
        </div>
      </nav>

      <div
        style={{
          background: 'linear-gradient(135deg, #1E3A5F 0%, #2E86C1 100%)',
          padding: isMobile ? '10px 16px' : '10px 40px',
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '12px' : '24px',
          flexWrap: 'wrap',
        }}
      >
        {[
          { icon: '📁', text: 'CSV veri seti' },
          { icon: '🔬', text: 'Python analiz' },
          { icon: '🎯', text: 'RAG raporu (opsiyonel)' },
        ].map((c) => (
          <div
            key={c.text}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'rgba(255,255,255,0.85)',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            <span>{c.icon}</span>
            <span>{c.text}</span>
          </div>
        ))}
      </div>

      <div
        style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: isMobile ? '24px 16px 64px' : '40px 24px 64px',
        }}
      >
        <button
          type="button"
          onClick={() => (step === 'preview' ? goBackToSelect() : navigate('/dashboard'))}
          onMouseEnter={() => setBackHover(true)}
          onMouseLeave={() => setBackHover(false)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#ffffff',
            border: `2px solid ${backHover ? '#1E3A5F' : '#E5E7EB'}`,
            borderRadius: '10px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 600,
            color: backHover ? '#1E3A5F' : '#6B7280',
            cursor: 'pointer',
            marginBottom: '28px',
            transition: 'all 0.15s',
            fontFamily: "'Nunito', system-ui, sans-serif",
          }}
        >
          {step === 'preview' ? '← Risk seçimine dön' : '← Dashboard\'a Dön'}
        </button>

        <div
          style={{
            background: 'linear-gradient(135deg, #1E3A5F 0%, #2E86C1 100%)',
            borderRadius: '20px',
            padding: isMobile ? '28px 24px' : '36px 40px',
            marginBottom: '24px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', right: '-50px', top: '-50px', width: '180px', height: '180px', borderRadius: '9999px', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', left: '-30px', bottom: '-40px', width: '120px', height: '120px', borderRadius: '9999px', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255,255,255,0.15)',
                color: '#ffffff',
                borderRadius: '9999px',
                padding: '6px 16px',
                fontSize: '13px',
                fontWeight: 700,
                marginBottom: '16px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              📊 Sentetik örnek
            </div>
            <h1
              style={{
                color: '#ffffff',
                fontSize: 'clamp(22px, 3vw, 30px)',
                fontWeight: 900,
                lineHeight: 1.3,
                margin: '0 0 12px',
              }}
            >
              {step === 'select' ? 'Risk profili seçin' : 'Örnek metrikleri inceleyin'}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px', lineHeight: 1.6, margin: 0, maxWidth: '560px' }}>
              {step === 'select'
                ? 'Veri setinden rastgele bir öğrenci satırı çekilir. Ardından Python köprüsü ile etiketleme ve isteğe bağlı RAG raporu üretilir.'
                : 'Aşağıdaki değerler salt okunurdur. İsterseniz aynı riskten yeni örnek isteyebilir veya analizi başlatabilirsiniz.'}
            </p>
          </div>
        </div>

        {loading && (
          <div
            role="status"
            aria-live="polite"
            style={{
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: '12px',
              padding: '16px 20px',
              color: '#1E3A5F',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <style>{`@keyframes tp-spin { to { transform: rotate(360deg); } } .tp-spin { width:20px;height:20px;border:3px solid #BFDBFE;border-top-color:#2E86C1;border-radius:9999px;animation:tp-spin 0.8s linear infinite;flex-shrink:0; }`}</style>
            <div className="tp-spin" />
            Örnek kayıt yükleniyor...
          </div>
        )}

        {analyzing && (
          <div
            role="status"
            aria-live="polite"
            style={{
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: '12px',
              padding: '16px 20px',
              color: '#1E3A5F',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <style>{`@keyframes tp-spin2 { to { transform: rotate(360deg); } } .tp-spin2 { width:20px;height:20px;border:3px solid #BFDBFE;border-top-color:#2E86C1;border-radius:9999px;animation:tp-spin2 0.8s linear infinite;flex-shrink:0; }`}</style>
            <div className="tp-spin2" />
            Analiz çalışıyor, lütfen bekleyin...
          </div>
        )}

        {error && (
          <div
            role="alert"
            style={{
              background: '#FEE2E2',
              border: '1px solid #FCA5A5',
              borderLeft: '4px solid #DC2626',
              borderRadius: '12px',
              padding: '16px 20px',
              color: '#DC2626',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '20px',
            }}
          >
            {error}
          </div>
        )}

        {step === 'select' && !loading && (
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: '20px',
            }}
          >
            {RISK_CARDS.map((c) => (
              <button
                key={c.risk}
                type="button"
                disabled={loading || analyzing}
                onClick={() => handleRiskSelect(c.risk)}
                style={{
                  flex: 1,
                  minHeight: '200px',
                  textAlign: 'left',
                  cursor: loading || analyzing ? 'wait' : 'pointer',
                  border: '1px solid #E5E7EB',
                  borderRadius: '16px',
                  padding: '24px',
                  background: '#ffffff',
                  boxShadow: '0 4px 16px rgba(30,58,95,0.08)',
                  fontFamily: "'Nunito', system-ui, sans-serif",
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: c.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '16px' }}>
                  {c.icon}
                </div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#1E3A5F', marginBottom: '8px' }}>{c.title}</div>
                <div style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.5 }}>{c.subtitle}</div>
                <div style={{ marginTop: '16px', fontSize: '13px', fontWeight: 700, color: '#2E86C1' }}>Seç →</div>
              </button>
            ))}
          </div>
        )}

        {step === 'preview' && sampleData && (
          <>
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '20px 24px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 2px 8px rgba(30,58,95,0.05)',
                marginBottom: '24px',
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1E3A5F', marginBottom: '4px' }}>Öğrenci</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#111827' }}>{sampleData.student_id}</div>
              <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '8px' }}>
                Risk profili (CSV): <strong>{sampleData.risk_profili}</strong>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                gap: '16px',
                marginBottom: '28px',
              }}
            >
              {PREVIEW_METRICS.map((m) => (
                <div
                  key={m.key}
                  style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    padding: '20px',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 2px 8px rgba(30,58,95,0.05)',
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    {m.label}
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: '#1E3A5F' }}>
                    {sampleData[m.key]}
                    {m.suffix}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '28px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 4px 16px rgba(30,58,95,0.08)',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                disabled={loading || analyzing}
                onClick={handleDifferentSample}
                style={{
                  flex: 1,
                  minWidth: '160px',
                  padding: '14px',
                  background: '#ffffff',
                  color: '#1E3A5F',
                  border: '2px solid #E5E7EB',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: loading || analyzing ? 'not-allowed' : 'pointer',
                  fontFamily: "'Nunito', system-ui, sans-serif",
                }}
              >
                Farklı Örnek Getir
              </button>
              <button
                type="button"
                disabled={loading || analyzing}
                onClick={handleAnalyze}
                style={{
                  flex: 1,
                  minWidth: '160px',
                  padding: '14px',
                  background: analyzing || loading ? '#E5E7EB' : 'linear-gradient(135deg, #1E3A5F 0%, #2E86C1 100%)',
                  color: analyzing || loading ? '#9CA3AF' : '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: 800,
                  cursor: loading || analyzing ? 'not-allowed' : 'pointer',
                  boxShadow: analyzing || loading ? 'none' : '0 8px 24px rgba(30,58,95,0.25)',
                  fontFamily: "'Nunito', system-ui, sans-serif",
                }}
              >
                Analiz Et
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
