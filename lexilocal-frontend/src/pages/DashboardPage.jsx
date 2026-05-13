import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const STATS = [
  { icon: '📊', value: '1200', label: 'Toplam Sentetik Veri' },
  { icon: '🔴', value: '240',  label: 'Yüksek Risk Verisi' },
  { icon: '🟡', value: '360',  label: 'Orta Risk Verisi' },
  { icon: '🟢', value: '600',  label: 'Normal Veri' },
];

const FEATURES = [
  { icon: '📖', title: 'Okuma Analizi',  desc: '6 farklı metrik ile kapsamlı değerlendirme'    },
  { icon: '📈', title: 'Anlık Rapor',    desc: 'Test sonrası detaylı analiz ve görselleştirme' },
];

function NavLogo({ isMobile }) {
  return (
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
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [isMobile]                        = useState(() => window.innerWidth < 768);
  const [logoutHover, setLogoutHover]     = useState(false);
  const [startHover2, setStartHover2]     = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/login', { replace: true });
  };

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #F5F7FA 0%, #EEF2F7 100%)',
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
        <NavLogo isMobile={isMobile} />

        <button
          onClick={handleLogout}
          onMouseEnter={() => setLogoutHover(true)}
          onMouseLeave={() => setLogoutHover(false)}
          style={{
            border: `2px solid ${logoutHover ? '#ffffff' : 'rgba(255,255,255,0.3)'}`,
            background: logoutHover ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: '#ffffff',
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

      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="88%" cy="8%" r="160" fill="#2E86C1" fillOpacity="0.13"/>
        <circle cx="88%" cy="8%" r="110" fill="#2E86C1" fillOpacity="0.09"/>
        <circle cx="88%" cy="8%" r="60" fill="#2E86C1" fillOpacity="0.06"/>
        <circle cx="12%" cy="92%" r="130" fill="#1E3A5F" fillOpacity="0.10"/>
        <circle cx="12%" cy="92%" r="80" fill="#1E3A5F" fillOpacity="0.07"/>
        <circle cx="12%" cy="92%" r="40" fill="#1E3A5F" fillOpacity="0.05"/>
      </svg>

      {/* ── ANA İÇERİK ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
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
              Disleksi Risk Analizi Demo Sistemi
            </h1>
            <p style={{ color: '#6B7280', fontSize: '16px', marginTop: '8px', marginBottom: 0 }}>
              Sentetik veri üzerinde çalışan RAG tabanlı karar destek prototipi.
            </p>
          </div>
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
                  fontSize: '28px',
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

          {/* Sağ panel — Disleksi bilgisi */}
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
                📖 Disleksi Nedir?
              </div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginTop: '2px' }}>
                Sistem tarafından değerlendirilen 6 metrik
              </div>
              <div style={{
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.08)',
                borderBottom: '1px solid rgba(255,255,255,0.12)',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.85)',
                lineHeight: 1.6,
              }}
              >
                Disleksi; zeka düzeyinden bağımsız olarak okuma, yazma ve
                heceleme süreçlerinde yaşanan nörolojik temelli bir öğrenme
                güçlüğüdür. Bu sistem, aşağıdaki 6 temel metriği analiz ederek
                disleksi risk profilini belirler.
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 0,
              background: 'linear-gradient(135deg, #1E3A5F 0%, #2E86C1 100%)',
            }}
            >

              <div style={{ borderRight: '1px solid rgba(255,255,255,0.12)' }}>
                {[
                  { icon: '🏃', name: 'Okuma Hızı', desc: 'Dakikada doğru okunan kelime sayısı. Akıcı okuma gelişiminin temel göstergesidir.' },
                  { icon: '✅', name: 'Okuma Doğruluğu', desc: 'Okunan metindeki doğru tanınan kelimelerin oranı. Sözcük tanıma becerisini yansıtır.' },
                  { icon: '🔊', name: 'Fonolojik Farkındalık', desc: 'Sesleri ayırt etme, hece bölme ve kafiye kurma becerisi. Okuma ve yazım için kritiktir.' },
                ].map((m, i, arr) => (
                  <div key={m.name} style={{
                    padding: '10px 12px',
                    borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.12)' : 'none',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-start',
                  }}
                  >
                    <span style={{ fontSize: '18px', flexShrink: 0 }}>{m.icon}</span>
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', margin: 0 }}>{m.name}</p>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.4 }}>{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                {[
                  { icon: '🔤', name: 'Harf-Sembol Tanıma', desc: 'Harf ve sembolleri doğru tanıma ve ayırt etme kapasitesi. Kelime çözümlemenin temelidir.' },
                  { icon: '🔁', name: 'Yeniden Okuma Oranı', desc: 'Okuma sırasında aynı bölümü tekrar okuma sıklığı. Yüksek oran akıcılık güçlüğüne işaret eder.' },
                  { icon: '🧠', name: 'Çalışma Belleği', desc: 'Bilgiyi işlerken geçici olarak bellekte tutma kapasitesi. Okuma anlama ve sıralama için gereklidir.' },
                ].map((m, i, arr) => (
                  <div key={m.name} style={{
                    padding: '10px 12px',
                    borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.12)' : 'none',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-start',
                  }}
                  >
                    <span style={{ fontSize: '18px', flexShrink: 0 }}>{m.icon}</span>
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', margin: 0 }}>{m.name}</p>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.4 }}>{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
