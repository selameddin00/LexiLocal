import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HistoryPanel from '../components/HistoryPanel';
import { mockHistory } from '../data/mockHistory';

const BREAKPOINT = 768;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < BREAKPOINT);

  useState(() => {
    const mq = window.matchMedia(`(max-width: ${BREAKPOINT - 1}px)`);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  });

  return isMobile;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [startHover, setStartHover] = useState(false);
  const [logoutHover, setLogoutHover] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/login', { replace: true });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        minHeight: '100vh',
        background: '#F9FAFB',
      }}
    >
      {/* Sol / Merkez Alan */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
          position: 'relative',
        }}
      >
        {/* Çıkış Yap — sağ üst köşe */}
        <button
          onClick={handleLogout}
          onMouseEnter={() => setLogoutHover(true)}
          onMouseLeave={() => setLogoutHover(false)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '24px',
            padding: '8px 18px',
            background: logoutHover ? '#F3F4F6' : '#ffffff',
            color: '#1E3A5F',
            border: '1px solid #E5E7EB',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
        >
          Çıkış Yap
        </button>

        <h1
          style={{
            color: '#1E3A5F',
            fontSize: isMobile ? '22px' : '28px',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '16px',
            lineHeight: '1.3',
          }}
        >
          Disleksi Karar Destek Sistemine Hoş Geldiniz
        </h1>

        <p
          style={{
            textAlign: 'center',
            color: '#6B7280',
            fontSize: '16px',
            marginBottom: '32px',
          }}
        >
          Analiz başlatmak için aşağıdaki butona tıklayın.
        </p>

        <button
          onClick={() => navigate('/test')}
          onMouseEnter={() => setStartHover(true)}
          onMouseLeave={() => setStartHover(false)}
          style={{
            padding: '16px 48px',
            background: '#1E3A5F',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            opacity: startHover ? 0.9 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          Testi Başlat
        </button>
      </main>

      {/* Sağ Panel */}
      <aside
        style={{
          width: isMobile ? '100%' : '280px',
          flexShrink: 0,
          borderLeft: isMobile ? 'none' : '1px solid #E5E7EB',
          borderTop: isMobile ? '1px solid #E5E7EB' : 'none',
          background: '#ffffff',
          position: isMobile ? 'static' : 'sticky',
          top: 0,
          height: isMobile ? 'auto' : '100vh',
          overflowY: 'auto',
        }}
      >
        <HistoryPanel history={mockHistory} />
      </aside>
    </div>
  );
}
