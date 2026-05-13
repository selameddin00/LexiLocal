import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  {
    icon: '🔬',
    title: 'Bilimsel Analiz',
    desc: '6 farklı metrik ile kapsamlı değerlendirme',
  },
  {
    icon: '📊',
    title: 'Anlık Raporlama',
    desc: 'Test sonrası detaylı analiz ve görselleştirme',
  },
  {
    icon: '👨‍👩‍👧',
    title: 'Ebeveyn Odaklı',
    desc: 'Anlaşılır sonuçlar ve uygulanabilir öneriler',
  },
];

const STATS = [
  { icon: '📊', value: '6',    label: 'Farklı Metrik' },
  { icon: '🎯', value: '3',    label: 'Risk Seviyesi' },
  { icon: '🆓', value: '100%', label: 'Ücretsiz Demo' },
];

const STEPS = [
  { num: '1', title: 'Formu Doldurun',    desc: '6 metrik için ölçüm değerlerini girin'              },
  { num: '2', title: 'Analiz Başlatın',   desc: 'Sistem verileri işler ve rapor oluşturur'            },
  { num: '3', title: 'Raporu İnceleyin',  desc: 'Detaylı sonuçları ve önerileri görüntüleyin'         },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername]         = useState('');
  const [password, setPassword]         = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const [btnHover, setBtnHover]         = useState(false);
  const [isMobile]                      = useState(() => window.innerWidth < 768);

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('auth_token', 'mock_token_xyz');
    navigate('/dashboard', { replace: true });
  };

  const inputStyle = (name) => ({
    width: '100%',
    padding: '14px 16px 14px 56px',
    border: `2px solid ${focusedField === name ? '#2E86C1' : '#E5E7EB'}`,
    borderRadius: '10px',
    fontSize: '15px',
    fontFamily: "'Nunito', system-ui, sans-serif",
    color: '#1F2937',
    background: focusedField === name ? '#ffffff' : '#FAFAFA',
    outline: 'none',
    boxShadow: focusedField === name ? '0 0 0 4px rgba(46,134,193,0.1)' : 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        minHeight: '100vh',
        fontFamily: "'Nunito', system-ui, sans-serif",
      }}
    >
      {/* ── SOL PANEL ── */}
      {!isMobile && (
        <div
          style={{
            flex: 1.2,
            minHeight: '100vh',
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(145deg, #0F2445 0%, #1E3A5F 40%, #2E86C1 100%)',
          }}
        >
          {/* Dekoratif daireler */}
          {[
            { width: 400, height: 400, top: -100, right: -100 },
            { width: 250, height: 250, bottom: 50, left: -80 },
            { width: 150, height: 150, top: '40%', right: 60 },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                borderRadius: '9999px',
                opacity: 0.08,
                background: '#ffffff',
                width: s.width,
                height: s.height,
                top: s.top,
                right: s.right,
                bottom: s.bottom,
                left: s.left,
              }}
            />
          ))}

          {/* İçerik */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              padding: '40px 56px',
              position: 'relative',
              zIndex: 1,
              minHeight: '100vh',
            }}
          >
            {/* Logo alanı */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {/* SVG kitap ikonu */}
              <svg width="68" height="68" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="52" height="52" rx="12" fill="white"/>
                {/* Sol sayfa */}
                <rect x="8" y="13" width="16" height="26" rx="2" fill="#2E86C1" transform="rotate(-3 8 13)"/>
                {/* Sağ sayfa */}
                <rect x="28" y="13" width="16" height="26" rx="2" fill="#1E3A5F" transform="rotate(3 44 13)"/>
                {/* Orta dikey çizgi / cilt */}
                <rect x="25" y="11" width="2" height="30" rx="1" fill="white" opacity="0.9"/>
                {/* Sol sayfa çizgileri */}
                <rect x="11" y="20" width="10" height="1.5" rx="0.75" fill="white" opacity="0.5"/>
                <rect x="11" y="24" width="8" height="1.5" rx="0.75" fill="white" opacity="0.5"/>
                <rect x="11" y="28" width="10" height="1.5" rx="0.75" fill="white" opacity="0.5"/>
                {/* Sağ sayfa çizgileri */}
                <rect x="31" y="20" width="10" height="1.5" rx="0.75" fill="white" opacity="0.5"/>
                <rect x="31" y="24" width="8" height="1.5" rx="0.75" fill="white" opacity="0.5"/>
                <rect x="31" y="28" width="10" height="1.5" rx="0.75" fill="white" opacity="0.5"/>
              </svg>
              {/* Metin */}
              <div>
                <div style={{ lineHeight: 1 }}>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 900, color: '#ffffff', letterSpacing: '-1px' }}>Lexi</span>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 900, color: '#7DD3FC', letterSpacing: '-1px' }}>Local</span>
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.55)',
                    fontWeight: 400,
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    marginTop: '8px',
                  }}
                >
                  📖 Okuma &amp; Disleksi Destek Platformu
                </div>
              </div>
            </div>

            {/* Orta alan — flex: 1 ile istatistikler alta sabit kalır */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', paddingTop: '48px' }}>

            {/* Ana başlık */}
            <h1
              style={{
                color: '#ffffff',
                fontSize: 'clamp(28px, 3vw, 42px)',
                fontWeight: 900,
                lineHeight: 1.25,
                marginBottom: '20px',
              }}
            >
              Çocuğunuzun<br />Okuma Yolculuğu<br />Bizimle Güvende
            </h1>

            {/* Alt açıklama */}
            <p
              style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: '16px',
                lineHeight: 1.7,
                maxWidth: '420px',
                marginBottom: '32px',
              }}
            >
              Bilimsel temelli analiz sistemi ile çocuğunuzun okuma performansını
              değerlendirin, kişiselleştirilmiş öneriler alın.
            </p>

            {/* Özellik kartları */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '480px' }}>
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: '14px',
                    padding: '14px 20px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      borderRadius: '10px',
                      padding: '10px',
                      fontSize: '22px',
                      lineHeight: 1,
                      flexShrink: 0,
                    }}
                  >
                    {f.icon}
                  </div>
                  <div>
                    <div style={{ color: '#ffffff', fontSize: '15px', fontWeight: 700 }}>{f.title}</div>
                    <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', marginTop: '2px' }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Nasıl Çalışır? — dikey adım listesi */}
            <div style={{ marginTop: '28px', width: '100%', maxWidth: '480px' }}>
              <div
                style={{
                  color: 'rgba(255,255,255,0.45)',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  marginBottom: '20px',
                }}
              >
                NASIL ÇALIŞIR?
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {STEPS.map((step, i) => (
                  <div
                    key={step.num}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '16px',
                      paddingBottom: '24px',
                      position: 'relative',
                    }}
                  >
                    {/* Sol: numara + bağlantı çizgisi */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          minWidth: '40px',
                          borderRadius: '9999px',
                          background: 'rgba(255,255,255,0.12)',
                          border: '2px solid rgba(255,255,255,0.25)',
                          color: '#ffffff',
                          fontSize: '16px',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {step.num}
                      </div>
                      {i < STEPS.length - 1 && (
                        <div
                          style={{
                            position: 'absolute',
                            left: '19px',
                            top: '40px',
                            width: '2px',
                            height: 'calc(100% + 0px)',
                            background: 'rgba(255,255,255,0.12)',
                          }}
                        />
                      )}
                    </div>
                    {/* Sağ: metin */}
                    <div style={{ paddingTop: '8px' }}>
                      <div style={{ color: '#ffffff', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>
                        {step.title}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', lineHeight: 1.5 }}>
                        {step.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            </div>{/* /Orta alan */}

            {/* İstatistik satırı */}
            <div
              style={{
                display: 'flex',
                gap: '40px',
                marginTop: '48px',
                paddingTop: '32px',
                borderTop: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              {STATS.map((s) => (
                <div key={s.label}>
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>{s.icon}</div>
                  <div style={{ color: '#ffffff', fontSize: '32px', fontWeight: 900, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: '4px' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SAĞ PANEL ── */}
      <div
        style={{
          width: isMobile ? '100%' : '520px',
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #F0F7FF 0%, #FFFFFF 50%, #F0F7FF 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? '24px 16px' : '40px 32px',
          flexShrink: 0,
        }}
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>

          {/* Dekoratif banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1E3A5F, #2E86C1)',
              color: '#ffffff',
              borderRadius: '12px',
              padding: '14px 20px',
              marginBottom: '24px',
              width: '100%',
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: 700,
              boxSizing: 'border-box',
            }}
          >
            🏆 Türkiye'nin Disleksi Destek Platformu
          </div>

          {/* Form kartı */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '48px 44px',
              boxShadow: '0 20px 60px rgba(30,58,95,0.15)',
              width: '100%',
            }}
          >
            {/* Karşılama rozeti */}
            <div style={{ marginBottom: '28px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
                  color: '#1E3A5F',
                  borderRadius: '9999px',
                  padding: '8px 18px',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                👋 Tekrar Hoş Geldiniz
              </span>
            </div>

            {/* Başlık */}
            <h1
              style={{
                color: '#1E3A5F',
                fontSize: '32px',
                fontWeight: 900,
                marginBottom: '8px',
                lineHeight: 1.2,
              }}
            >
              Giriş Yapın
            </h1>

            {/* Alt açıklama */}
            <p style={{ color: '#6B7280', fontSize: '15px', marginBottom: '36px' }}>
              Devam etmek için bilgilerinizi girin
            </p>

            <form onSubmit={handleSubmit} noValidate>

              {/* Kullanıcı Adı */}
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#374151',
                    marginBottom: '8px',
                  }}
                >
                  Kullanıcı Adı
                </label>
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#EFF6FF',
                      borderRadius: '10px 0 0 10px',
                      fontSize: '18px',
                      color: '#2E86C1',
                      fontWeight: 700,
                      pointerEvents: 'none',
                    }}
                  >
                    ✉
                  </div>
                  <input
                    type="text"
                    autoComplete="username"
                    placeholder="örn. ogretmen@okul.com"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                    style={inputStyle('username')}
                  />
                </div>
              </div>

              {/* Şifre */}
              <div style={{ marginBottom: '8px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#374151',
                    marginBottom: '8px',
                  }}
                >
                  Şifre
                </label>
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#EFF6FF',
                      borderRadius: '10px 0 0 10px',
                      fontSize: '18px',
                      color: '#2E86C1',
                      fontWeight: 700,
                      pointerEvents: 'none',
                    }}
                  >
                    ★
                  </div>
                  <input
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    style={inputStyle('password')}
                  />
                </div>
              </div>

              {/* Giriş butonu */}
              <button
                type="submit"
                onMouseEnter={() => setBtnHover(true)}
                onMouseLeave={() => setBtnHover(false)}
                style={{
                  width: '100%',
                  marginTop: '24px',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #1E3A5F 0%, #2E86C1 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '17px',
                  fontWeight: 800,
                  fontFamily: "'Nunito', system-ui, sans-serif",
                  cursor: 'pointer',
                  letterSpacing: '0.3px',
                  boxShadow: btnHover
                    ? '0 12px 32px rgba(30,58,95,0.4)'
                    : '0 8px 24px rgba(30,58,95,0.3)',
                  transform: btnHover ? 'translateY(-2px)' : 'translateY(0)',
                  transition: 'all 0.2s',
                }}
              >
                Giriş Yap →
              </button>

              {/* Şifremi Unuttum */}
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  marginTop: '12px',
                  color: '#2E86C1',
                  fontSize: '13px',
                  cursor: 'pointer',
                  textDecoration: 'none',
                }}
              >
                Şifremi Unuttum
              </a>
            </form>

            {/* Demo notu */}
            <p style={{ fontSize: '12px', color: '#9CA3AF', textAlign: 'center', marginTop: '16px', padding: 0 }}>
              🔒 Demo — herhangi bir bilgi ile giriş yapabilirsiniz
            </p>
          </div>

          {/* Güven rozetleri */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
              marginTop: '24px',
              flexWrap: 'wrap',
            }}
          >
            {['🔒 SSL Güvenli', '✅ KVKK Uyumlu', '🏥 Uzman Onaylı'].map((badge) => (
              <div
                key={badge}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  color: '#6B7280',
                }}
              >
                {badge}
              </div>
            ))}
          </div>

          {/* Footer */}
          <p
            style={{
              fontSize: '11px',
              color: '#9CA3AF',
              textAlign: 'center',
              marginTop: '32px',
            }}
          >
            © 2025 LexiLocal — Tüm hakları saklıdır
          </p>
        </div>
      </div>
    </div>
  );
}
