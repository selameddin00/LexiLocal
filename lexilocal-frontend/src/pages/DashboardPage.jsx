import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RiskBadge from '../components/RiskBadge';
import { mockHistory } from '../data/mockHistory';

const STATS = [
  { icon: '📊', value: '3',          label: 'Toplam Test'  },
  { icon: '✅', value: '2',          label: 'Tamamlanan'   },
  { icon: '⚠️', value: '1',          label: 'Orta Risk'    },
  { icon: '📅', value: '12.05.2025', label: 'Son Test', small: true },
];

const FEATURES = [
  { icon: '📖', title: 'Okuma Analizi',  desc: '6 farklı metrik ile kapsamlı değerlendirme'    },
  { icon: '📈', title: 'Anlık Rapor',    desc: 'Test sonrası detaylı analiz ve görselleştirme' },
  { icon: '👨‍👩‍👧', title: 'Ebeveyn Dostu', desc: 'Anlaşılır sonuçlar ve uygulanabilir öneriler'  },
];

const INFO_CHIPS = [
  { icon: '🔬', text: '6 Bilimsel Metrik' },
  { icon: '🎯', text: '3 Risk Seviyesi'   },
  { icon: '⚡', text: 'Anlık Raporlama'   },
  { icon: '🆓', text: 'Ücretsiz Demo'     },
];

function NavLogo({ isMobile }) {
  return (
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
  );
}

function HistoryItem({ item }) {
  const navigate = useNavigate();
  const [hover, setHover] = useState(false);

  return (
    <div
      onClick={() => navigate('/report/' + item.id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        borderRadius: '10px',
        cursor: 'pointer',
        marginBottom: '4px',
        background: hover ? '#F0F7FF' : 'transparent',
        transition: 'background 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '14px' }}>📅</span>
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#1F2937' }}>{item.date}</span>
      </div>
      <RiskBadge riskLevel={item.riskLevel} label={item.label} />
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [isMobile]                        = useState(() => window.innerWidth < 768);
  const [logoutHover, setLogoutHover]     = useState(false);
  const [startHover1, setStartHover1]     = useState(false);
  const [startHover2, setStartHover2]     = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/login', { replace: true });
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
        <NavLogo isMobile={isMobile} />

        <button
          onClick={handleLogout}
          onMouseEnter={() => setLogoutHover(true)}
          onMouseLeave={() => setLogoutHover(false)}
          style={{
            border: `2px solid ${logoutHover ? '#DC2626' : '#E5E7EB'}`,
            background: '#ffffff',
            color: logoutHover ? '#DC2626' : '#6B7280',
            borderRadius: '8px',
            padding: '8px 20px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s',
            fontFamily: "'Nunito', system-ui, sans-serif",
          }}
        >
          Çıkış Yap
        </button>
      </nav>

      {/* ── BİLGİ ŞERİDİ ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1E3A5F 0%, #2E86C1 100%)',
          padding: isMobile ? '10px 16px' : '10px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '24px', flexWrap: 'wrap' }}>
          {INFO_CHIPS.map((c) => (
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
            background: 'rgba(255,255,255,0.15)',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: 700,
            padding: '4px 12px',
            borderRadius: '9999px',
            whiteSpace: 'nowrap',
          }}
        >
          Beta Sürüm
        </div>
      </div>

      {/* ── ANA İÇERİK ── */}
      <div
        style={{
          padding: isMobile ? '24px 16px' : '40px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Karşılama bölümü */}
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: '20px',
            marginBottom: '32px',
          }}
        >
          <div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
                color: '#1E3A5F',
                borderRadius: '9999px',
                padding: '6px 16px',
                fontSize: '13px',
                fontWeight: 700,
                marginBottom: '12px',
              }}
            >
              👋 Hoş Geldiniz!
            </span>
            <h1
              style={{
                fontSize: 'clamp(24px, 3vw, 36px)',
                fontWeight: 900,
                color: '#1E3A5F',
                lineHeight: 1.25,
                margin: 0,
              }}
            >
              Çocuğunuzun Okuma<br />Performansını Takip Edin
            </h1>
            <p style={{ color: '#6B7280', fontSize: '16px', marginTop: '8px', marginBottom: 0 }}>
              Bilimsel temelli analizlerle çocuğunuzun gelişimini destekleyin.
            </p>
          </div>

          <button
            onClick={() => navigate('/test')}
            onMouseEnter={() => setStartHover1(true)}
            onMouseLeave={() => setStartHover1(false)}
            style={{
              background: 'linear-gradient(135deg, #1E3A5F, #2E86C1)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              padding: '16px 36px',
              fontSize: '16px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: startHover1
                ? '0 12px 32px rgba(30,58,95,0.4)'
                : '0 8px 24px rgba(30,58,95,0.25)',
              transform: startHover1 ? 'translateY(-2px)' : 'translateY(0)',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              fontFamily: "'Nunito', system-ui, sans-serif",
            }}
          >
            🚀 Yeni Test Başlat
          </button>
        </div>

        {/* İstatistik kartları */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          {STATS.map((s) => (
            <div
              key={s.label}
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '20px 24px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 2px 8px rgba(30,58,95,0.05)',
              }}
            >
              <div
                style={{
                  background: '#EFF6FF',
                  borderRadius: '10px',
                  padding: '8px',
                  display: 'inline-flex',
                  marginBottom: '10px',
                  fontSize: '20px',
                }}
              >
                {s.icon}
              </div>
              <div
                style={{
                  fontSize: s.small ? '16px' : '28px',
                  fontWeight: 900,
                  color: '#1E3A5F',
                  lineHeight: 1.1,
                  marginBottom: '4px',
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: '13px', color: '#6B7280' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Alt bölüm */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 320px',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          {/* Sol alan */}
          <div>
            {/* Büyük aksiyon kartı */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                padding: '40px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 4px 16px rgba(30,58,95,0.08)',
                textAlign: 'center',
                marginBottom: '24px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Dekoratif daire */}
              <div
                style={{
                  position: 'absolute',
                  right: '-30px',
                  top: '-30px',
                  width: '120px',
                  height: '120px',
                  borderRadius: '9999px',
                  background: 'rgba(46,134,193,0.06)',
                  pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
                  borderRadius: '20px',
                  margin: '0 auto 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '40px',
                }}
              >
                📝
              </div>
              <h2 style={{ color: '#1E3A5F', fontSize: '22px', fontWeight: 800, margin: '0 0 12px' }}>
                Yeni Değerlendirme Başlat
              </h2>
              <p
                style={{
                  color: '#6B7280',
                  fontSize: '15px',
                  lineHeight: 1.6,
                  margin: '0 auto 24px',
                  maxWidth: '400px',
                }}
              >
                Çocuğunuzun okuma hızı, doğruluk oranı ve diğer kritik metrikleri birkaç dakikada değerlendirin.
              </p>
              <button
                onClick={() => navigate('/test')}
                onMouseEnter={() => setStartHover2(true)}
                onMouseLeave={() => setStartHover2(false)}
                style={{
                  background: 'linear-gradient(135deg, #1E3A5F, #2E86C1)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 40px',
                  fontSize: '16px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: startHover2
                    ? '0 12px 32px rgba(30,58,95,0.4)'
                    : '0 6px 20px rgba(30,58,95,0.25)',
                  transform: startHover2 ? 'translateY(-2px)' : 'translateY(0)',
                  transition: 'all 0.2s',
                  fontFamily: "'Nunito', system-ui, sans-serif",
                }}
              >
                🚀 Testi Başlat
              </button>
            </div>

            {/* Özellik kartları */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)',
                gap: '16px',
              }}
            >
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    padding: '20px',
                    border: '1px solid #E5E7EB',
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(30,58,95,0.04)',
                  }}
                >
                  <div style={{ fontSize: '28px', marginBottom: '10px' }}>{f.icon}</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#1E3A5F', marginBottom: '6px' }}>
                    {f.title}
                  </div>
                  <div style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.5 }}>
                    {f.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sağ panel — Geçmiş Testler */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 4px 16px rgba(30,58,95,0.08)',
              overflow: 'hidden',
              position: isMobile ? 'static' : 'sticky',
              top: '80px',
            }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #1E3A5F, #2E86C1)',
                padding: '20px 24px',
              }}
            >
              <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: 800 }}>
                📊 Geçmiş Testler
              </div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginTop: '2px' }}>
                Son 3 test gösteriliyor
              </div>
            </div>

            <div style={{ padding: '8px' }}>
              {mockHistory.length === 0 ? (
                <div
                  style={{
                    padding: '32px 16px',
                    textAlign: 'center',
                    color: '#6B7280',
                    fontSize: '14px',
                  }}
                >
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>📋</div>
                  Henüz test yapılmamış.
                </div>
              ) : (
                mockHistory.map((item) => (
                  <HistoryItem key={item.id} item={item} />
                ))
              )}
            </div>

            {/* Alt bağlantı */}
            <div
              style={{
                borderTop: '1px solid #E5E7EB',
                padding: '12px 16px',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                📖 Raporlara tıklayarak detaylı inceleme yapabilirsiniz
              </span>
            </div>
          </div>
        </div>

        {/* Alt bilgi çubuğu */}
        <div
          style={{
            marginTop: '40px',
            background: '#ffffff',
            borderRadius: '16px',
            padding: '20px 28px',
            border: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
                borderRadius: '10px',
                padding: '8px',
                fontSize: '20px',
              }}
            >
              🏥
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1E3A5F' }}>
                Türkiye'nin Disleksi Destek Platformu
              </div>
              <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
                © 2025 LexiLocal — Tüm hakları saklıdır
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            {['🔒 SSL Güvenli', '✅ KVKK Uyumlu', '🏥 Uzman Onaylı'].map((b) => (
              <span key={b} style={{ fontSize: '12px', color: '#6B7280' }}>{b}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
