import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MetricInput from '../components/MetricInput';
import { mockAnalyze } from '../utils/mockAnalyze';

const FIELDS = [
  { name: 'okumaHizi',            label: 'Okuma Hızı',            inputType: 'number', min: 0, max: 300, description: 'Çocuğunuzun dakikada doğru okuduğu kelime sayısı'   },
  { name: 'dogrulukOrani',        label: 'Doğruluk Oranı',        inputType: 'slider', min: 0, max: 100, description: 'Okunan kelimelerin doğruluk yüzdesi'                 },
  { name: 'fonolojikFarkındalık', label: 'Fonolojik Farkındalık', inputType: 'slider', min: 0, max: 100, description: 'Ses ve hece farkındalığı puanı'                      },
  { name: 'gorselIsleme',         label: 'Görsel İşleme',         inputType: 'slider', min: 0, max: 100, description: 'Görsel algı ve işleme becerisi puanı'                 },
  { name: 'gorselTakip',          label: 'Görsel Takip',          inputType: 'slider', min: 0, max: 100, description: 'Göz takip becerisi puanı'                             },
  { name: 'siralamaBecerisi',     label: 'Sıralama Becerisi',     inputType: 'slider', min: 0, max: 100, description: 'Sıralama ve dizi anlama puanı'                        },
];

const HERO_CHIPS = [
  { icon: '⏱', text: '~5 Dakika'    },
  { icon: '📊', text: '6 Metrik'     },
  { icon: '🎯', text: 'Anlık Sonuç'  },
  { icon: '🆓', text: 'Ücretsiz'     },
];

const METRIC_ICONS = ['🏃', '✅', '🔊', '👁️', '👀', '🔢'];

const INITIAL_VALUES = Object.fromEntries(FIELDS.map((f) => [f.name, 0]));
const INITIAL_ERRORS = Object.fromEntries(FIELDS.map((f) => [f.name, null]));

function validate(formData) {
  const errors = { ...INITIAL_ERRORS };
  let valid = true;
  for (const field of FIELDS) {
    const val = Number(formData[field.name]);
    if (formData[field.name] === '' || formData[field.name] === null || isNaN(val)) {
      errors[field.name] = 'Bu alan zorunludur.';
      valid = false;
    } else if (val < field.min || val > field.max) {
      errors[field.name] = `${field.min}–${field.max} aralığında bir değer girin.`;
      valid = false;
    }
  }
  return { errors, valid };
}

function filledCount(formData) {
  return FIELDS.filter((f) => {
    const val = Number(formData[f.name]);
    return !isNaN(val) && val >= f.min && val <= f.max && formData[f.name] !== '';
  }).length;
}

export default function TestPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(INITIAL_VALUES);
  const [errors, setErrors]     = useState(INITIAL_ERRORS);
  const [uiState, setUiState]   = useState('idle');
  const [isMobile]              = useState(() => window.innerWidth < 768);
  const [backHover, setBackHover] = useState(false);

  const isLoading = uiState === 'loading';
  const filled    = filledCount(formData);

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

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #F0F7FF 0%, #EFF6FF 100%)',
        minHeight: '100vh',
        fontFamily: "'Nunito', system-ui, sans-serif",
      }}
    >
      {/* ── NAVBAR ── */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: '#ffffff',
          borderBottom: '1px solid #E5E7EB',
          boxShadow: '0 2px 8px rgba(30,58,95,0.06)',
          padding: isMobile ? '0 16px' : '0 40px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #1E3A5F, #2E86C1)',
              borderRadius: '12px',
              padding: '3px',
              display: 'inline-flex',
              flexShrink: 0,
            }}
          >
            <svg width="38" height="38" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="52" height="52" rx="10" fill="white"/>
              <rect x="8" y="13" width="16" height="26" rx="2" fill="#2E86C1" transform="rotate(-3 8 13)"/>
              <rect x="28" y="13" width="16" height="26" rx="2" fill="#1E3A5F" transform="rotate(3 44 13)"/>
              <rect x="25" y="11" width="2" height="30" rx="1" fill="white" opacity="0.9"/>
              <rect x="11" y="20" width="10" height="1.5" rx="0.75" fill="white" opacity="0.5"/>
              <rect x="11" y="24" width="8" height="1.5" rx="0.75" fill="white" opacity="0.5"/>
              <rect x="11" y="28" width="10" height="1.5" rx="0.75" fill="white" opacity="0.5"/>
              <rect x="31" y="20" width="10" height="1.5" rx="0.75" fill="white" opacity="0.5"/>
              <rect x="31" y="24" width="8" height="1.5" rx="0.75" fill="white" opacity="0.5"/>
              <rect x="31" y="28" width="10" height="1.5" rx="0.75" fill="white" opacity="0.5"/>
            </svg>
          </div>
          <div>
            <div style={{ lineHeight: 1 }}>
              <span style={{ fontFamily: 'Georgia, serif', fontSize: '21px', fontWeight: 900, color: '#1E3A5F', letterSpacing: '-0.5px' }}>Lexi</span>
              <span style={{ fontFamily: 'Georgia, serif', fontSize: '21px', fontWeight: 900, color: '#2E86C1', letterSpacing: '-0.5px' }}>Local</span>
            </div>
            {!isMobile && (
              <div style={{ fontSize: '10px', color: '#9CA3AF', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '3px' }}>
                Disleksi Destek Platformu
              </div>
            )}
          </div>
        </div>

        {/* Orta başlık */}
        {!isMobile && (
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#1E3A5F' }}>
            Metrik Değerlendirme
          </div>
        )}

        {/* Sağ: ilerleme rozeti */}
        <div
          style={{
            background: filled === FIELDS.length
              ? 'linear-gradient(135deg, #16A34A, #22C55E)'
              : 'linear-gradient(135deg, #1E3A5F, #2E86C1)',
            color: '#ffffff',
            borderRadius: '9999px',
            padding: '6px 16px',
            fontSize: '13px',
            fontWeight: 700,
            transition: 'background 0.3s',
          }}
        >
          {filled === FIELDS.length ? '✅ Hazır' : `${filled} / ${FIELDS.length} Dolduruldu`}
        </div>
      </nav>

      {/* ── BİLGİ ŞERİDİ ── */}
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
        {HERO_CHIPS.map((c) => (
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

      {/* ── ANA İÇERİK ── */}
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: isMobile ? '24px 16px 64px' : '40px 24px 64px',
        }}
      >
        {/* Geri butonu */}
        <button
          onClick={() => navigate('/dashboard')}
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
          ← Dashboard'a Dön
        </button>

        {/* Hero kartı */}
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
          {/* Dekoratif daireler */}
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
              📝 Okuma Metrikleri Değerlendirmesi
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
              Çocuğunuzun Okuma<br />Performansını Ölçün
            </h1>

            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px', lineHeight: 1.6, margin: '0 0 24px', maxWidth: '480px' }}>
              Her metrik için ölçüm değerini girin. Sistem verilerinizi işleyerek
              kişiselleştirilmiş bir analiz raporu oluşturacak.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[
                { icon: '🔬', label: 'Bilimsel Analiz' },
                { icon: '📊', label: 'Detaylı Rapor'  },
                { icon: '💡', label: 'Öneriler'        },
              ].map((tag) => (
                <div
                  key={tag.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(255,255,255,0.12)',
                    color: '#ffffff',
                    borderRadius: '9999px',
                    padding: '6px 14px',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: '1px solid rgba(255,255,255,0.18)',
                  }}
                >
                  {tag.icon} {tag.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* İlerleme kartı */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '20px 24px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 8px rgba(30,58,95,0.05)',
            marginBottom: '28px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1E3A5F' }}>
              📋 Tamamlanma Durumu
            </div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: filled === FIELDS.length ? '#16A34A' : '#2E86C1',
              }}
            >
              {filled} / {FIELDS.length} metrik
            </div>
          </div>

          {/* Adım göstergesi */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            {FIELDS.map((f, i) => {
              const val = Number(formData[f.name]);
              const isDone = !isNaN(val) && val >= f.min && val <= f.max && formData[f.name] !== '';
              return (
                <div
                  key={f.name}
                  title={f.label}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '9999px',
                      background: isDone
                        ? 'linear-gradient(135deg, #1E3A5F, #2E86C1)'
                        : '#F3F4F6',
                      color: isDone ? '#ffffff' : '#9CA3AF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: isDone ? '14px' : '16px',
                      fontWeight: 700,
                      transition: 'all 0.2s',
                    }}
                  >
                    {isDone ? '✓' : METRIC_ICONS[i]}
                  </div>
                  {!isMobile && (
                    <div style={{ fontSize: '10px', color: isDone ? '#2E86C1' : '#9CA3AF', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>
                      {f.label.split(' ')[0]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div
            style={{
              background: '#E5E7EB',
              borderRadius: '9999px',
              height: '6px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                background: filled === FIELDS.length
                  ? 'linear-gradient(90deg, #16A34A, #22C55E)'
                  : 'linear-gradient(90deg, #1E3A5F, #2E86C1)',
                borderRadius: '9999px',
                height: '100%',
                width: `${(filled / FIELDS.length) * 100}%`,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Yükleniyor / Hata banneri */}
        {isLoading && (
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
            Veriler işleniyor, lütfen bekleyin...
          </div>
        )}
        {uiState === 'error' && (
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
            ❌ Analiz tamamlanamadı. Lütfen tekrar deneyin.
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {FIELDS.map((field) => (
              <MetricInput
                key={field.name}
                label={field.label}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange(field.name)}
                min={field.min}
                max={field.max}
                inputType={field.inputType}
                description={field.description}
                error={errors[field.name]}
                disabled={isLoading}
              />
            ))}
          </div>

          {/* Gönder alanı */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '28px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 4px 16px rgba(30,58,95,0.08)',
              marginTop: '28px',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px', lineHeight: 1.6 }}>
              {filled < FIELDS.length
                ? `Henüz ${FIELDS.length - filled} metrik eksik. Tüm alanlar doldurulduğunda analiz başlatılabilir.`
                : '✅ Tüm metrikler dolduruldu. Analizi başlatabilirsiniz.'}
            </p>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '16px',
                background: isLoading
                  ? '#E5E7EB'
                  : 'linear-gradient(135deg, #1E3A5F 0%, #2E86C1 100%)',
                color: isLoading ? '#9CA3AF' : '#ffffff',
                border: 'none',
                borderRadius: '14px',
                fontSize: '17px',
                fontWeight: 800,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: isLoading ? 'none' : '0 8px 24px rgba(30,58,95,0.3)',
                transition: 'all 0.2s',
                fontFamily: "'Nunito', system-ui, sans-serif",
                letterSpacing: '0.3px',
              }}
            >
              {isLoading ? '⏳ Analiz ediliyor...' : '🔍 Analizi Başlat'}
            </button>
            <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '12px' }}>
              🔒 Verileriniz güvenle işlenir ve saklanmaz
            </p>
          </div>
        </form>

        {/* Alt footer */}
        <div
          style={{
            marginTop: '32px',
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap',
          }}
        >
          {['🔒 SSL Güvenli', '✅ KVKK Uyumlu', '🏥 Uzman Onaylı'].map((b) => (
            <span key={b} style={{ fontSize: '12px', color: '#9CA3AF' }}>{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
