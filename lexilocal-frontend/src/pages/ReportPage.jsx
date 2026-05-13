import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import RiskBadge from '../components/RiskBadge';
import { mockReports } from '../data/mockReports';

const KNOWN_IDS = new Set(['r001', 'r002', 'r003']);

const RISK_BORDER = {
  low:    '#16A34A',
  medium: '#D97706',
  high:   '#DC2626',
};

const METRIC_STRIP = {
  low:    '#DC2626',
  normal: '#16A34A',
  high:   '#D97706',
};

function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #F0F7FF 0%, #EFF6FF 100%)',
        fontFamily: "'Nunito', system-ui, sans-serif",
        gap: '0',
      }}
    >
      <style>{`
        @keyframes rp-spin { to { transform: rotate(360deg); } }
        .rp-spinner {
          width: 48px; height: 48px;
          border: 4px solid #E5E7EB;
          border-top-color: #2E86C1;
          border-radius: 9999px;
          animation: rp-spin 0.8s linear infinite;
        }
      `}</style>
      <div className="rp-spinner" />
      <p style={{ fontSize: '18px', color: '#6B7280', fontWeight: 600, margin: 0, marginTop: '16px' }}>
        📊 Rapor hazırlanıyor...
      </p>
    </div>
  );
}

function EmptyScreen({ onBack }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        background: 'linear-gradient(135deg, #F0F7FF 0%, #EFF6FF 100%)',
        fontFamily: "'Nunito', system-ui, sans-serif",
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '64px' }}>🔍</div>
      <h2 style={{ margin: 0, color: '#1E3A5F', fontSize: '24px', fontWeight: 800 }}>
        Rapor bulunamadı
      </h2>
      <button
        onClick={onBack}
        style={{
          marginTop: '8px',
          background: '#ffffff',
          border: '2px solid #E5E7EB',
          borderRadius: '10px',
          padding: '10px 20px',
          fontSize: '14px',
          fontWeight: 600,
          color: '#6B7280',
          cursor: 'pointer',
          fontFamily: "'Nunito', system-ui, sans-serif",
        }}
      >
        Dashboard'a Dön
      </button>
    </div>
  );
}

function Divider() {
  return (
    <hr
      style={{
        border: 'none',
        borderTop: '2px dashed #E5E7EB',
        margin: '48px 0',
      }}
    />
  );
}

function InlineMetricCard({ metric }) {
  const { metricName, measuredValue, label, labelText, description, impact, suggestions, source } = metric;
  const stripColor = METRIC_STRIP[label] ?? '#9CA3AF';

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 2px 8px rgba(30,58,95,0.05)',
        overflow: 'hidden',
      }}
    >
      {/* Üst renkli şerit */}
      <div style={{ height: '4px', background: stripColor }} />

      {/* İçerik */}
      <div style={{ padding: '24px' }}>

        {/* Üst satır */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            gap: '12px',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#1E3A5F' }}>
            {metricName}
          </h3>
          <RiskBadge riskLevel={label} label={labelText} />
        </div>

        {/* Ölçülen değer kutusu */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'baseline',
            gap: '6px',
            background: 'linear-gradient(135deg, #F0F7FF, #EFF6FF)',
            borderRadius: '12px',
            padding: '12px 20px',
            marginBottom: '16px',
          }}
        >
          <span style={{ fontSize: '12px', color: '#6B7280', marginRight: '8px' }}>Ölçülen Değer:</span>
          <span style={{ fontSize: '36px', fontWeight: 900, color: '#1E3A5F', lineHeight: 1 }}>
            {measuredValue}
          </span>
        </div>

        {/* Separator */}
        <div style={{ borderTop: '1px solid #F3F4F6', margin: '16px 0' }} />

        {/* Açıklama */}
        <div
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#9CA3AF',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '6px',
          }}
        >
          AÇIKLAMA
        </div>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6, margin: '0 0 16px 0' }}>
          {description}
        </p>

        {/* Önem kutusu */}
        <div
          style={{
            background: '#FFFBEB',
            borderLeft: '3px solid #D97706',
            borderRadius: '0 10px 10px 0',
            padding: '12px 16px',
            marginBottom: '16px',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#D97706', marginBottom: '4px' }}>
            ⚠️ Disleksi Açısından Önemi
          </div>
          <p style={{ fontSize: '13px', color: '#92400E', lineHeight: 1.5, margin: 0 }}>
            {impact}
          </p>
        </div>

        {/* Öneriler */}
        <div
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#9CA3AF',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '8px',
          }}
        >
          💡 ÖNERİLER
        </div>
        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          {suggestions.map((s, i) => (
            <li
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                fontSize: '13px',
                color: '#374151',
                lineHeight: 1.5,
              }}
            >
              <span style={{ flexShrink: 0, marginTop: '1px' }}>✅</span>
              {s}
            </li>
          ))}
        </ul>

        {/* Kaynak */}
        <p
          style={{
            fontSize: '11px',
            color: '#9CA3AF',
            fontStyle: 'italic',
            margin: 0,
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid #F3F4F6',
          }}
        >
          📚 Kaynak: {source}
        </p>
      </div>
    </div>
  );
}

export default function ReportPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [uiState, setUiState] = useState('loading');
  const [report, setReport]   = useState(null);
  const [isMobile]            = useState(() => window.innerWidth < 768);
  const [backHover, setBackHover]   = useState(false);
  const [printHover, setPrintHover] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      let resolved = null;

      if (KNOWN_IDS.has(id)) {
        resolved = mockReports[id];
      } else {
        const fallbackId = sessionStorage.getItem('activeReportId');
        if (fallbackId && mockReports[fallbackId]) {
          resolved = mockReports[fallbackId];
        }
      }

      setReport(resolved ?? null);
      setUiState(resolved ? 'success' : 'empty');
    }, 1000);

    return () => clearTimeout(timer);
  }, [id]);

  if (uiState === 'loading') return <LoadingScreen />;
  if (uiState === 'empty')   return <EmptyScreen onBack={() => navigate('/dashboard')} />;

  const { generalAssessment, metrics, generalSuggestions, references, date } = report;
  const { riskLevel, riskLabel, overallScore, summary } = generalAssessment;
  const cardBorderColor = RISK_BORDER[riskLevel] ?? '#6B7280';

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
            Analiz Raporu
          </div>
        )}

        {/* Sağ: tarih + yazdır */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {!isMobile && (
            <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: 500 }}>
              📅 {date}
            </span>
          )}
          <button
            onClick={() => window.print()}
            onMouseEnter={() => setPrintHover(true)}
            onMouseLeave={() => setPrintHover(false)}
            style={{
              border: `2px solid ${printHover ? '#1E3A5F' : '#E5E7EB'}`,
              background: '#ffffff',
              color: printHover ? '#1E3A5F' : '#6B7280',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
              fontFamily: "'Nunito', system-ui, sans-serif",
            }}
          >
            🖨️ Yazdır
          </button>
        </div>
      </nav>

      {/* ── ANA İÇERİK ── */}
      <div
        style={{
          maxWidth: '860px',
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
            marginBottom: '32px',
            transition: 'all 0.15s',
            fontFamily: "'Nunito', system-ui, sans-serif",
          }}
        >
          ← Dashboard'a Dön
        </button>

        {/* ── BÖLÜM 1: Genel Değerlendirme ── */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '32px',
            border: '1px solid #E5E7EB',
            borderLeft: `4px solid ${cardBorderColor}`,
            boxShadow: '0 4px 16px rgba(30,58,95,0.08)',
            marginBottom: '48px',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Dekoratif daire */}
          <div
            style={{
              position: 'absolute',
              right: '-40px',
              top: '-40px',
              width: '160px',
              height: '160px',
              borderRadius: '9999px',
              background: 'rgba(30,58,95,0.04)',
              pointerEvents: 'none',
            }}
          />

          {/* Başlık satırı */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #1E3A5F, #2E86C1)',
                borderRadius: '12px',
                padding: '10px',
                fontSize: '24px',
                lineHeight: 1,
                display: 'inline-flex',
              }}
            >
              🎯
            </div>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#1E3A5F' }}>
              Genel Değerlendirme
            </h2>
          </div>

          {/* Risk + skor satırı */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              marginBottom: '20px',
              flexWrap: 'wrap',
            }}
          >
            <RiskBadge
              riskLevel={riskLevel}
              label={riskLabel}
              style={{ fontSize: '15px', padding: '8px 24px', fontWeight: 700 }}
            />
            <div
              style={{
                width: '2px',
                height: '32px',
                background: '#E5E7EB',
                flexShrink: 0,
              }}
            />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ color: '#6B7280', fontSize: '16px' }}>Genel Skor:</span>
              <span style={{ fontSize: '40px', fontWeight: 900, color: '#1E3A5F', lineHeight: 1 }}>
                {overallScore}
              </span>
              <span style={{ color: '#6B7280', fontSize: '18px' }}>/100</span>
            </div>
          </div>

          {/* Özet */}
          <div
            style={{
              fontSize: '15px',
              color: '#374151',
              lineHeight: 1.7,
              background: '#F8FAFF',
              borderRadius: '12px',
              padding: '16px 20px',
              borderLeft: '4px solid #2E86C1',
            }}
          >
            {summary}
          </div>
        </div>

        {/* ── BÖLÜM 2: Metrik Bazlı Analizler ── */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                background: '#EFF6FF',
                borderRadius: '10px',
                padding: '8px',
                fontSize: '20px',
                lineHeight: 1,
                display: 'inline-flex',
              }}
            >
              📊
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#1E3A5F' }}>
              Metrik Bazlı Analizler
            </h2>
            <span
              style={{
                marginLeft: 'auto',
                background: '#EFF6FF',
                color: '#2E86C1',
                fontSize: '12px',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: '9999px',
              }}
            >
              6 Metrik
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {metrics.map((metric) => (
              <InlineMetricCard key={metric.metricName} metric={metric} />
            ))}
          </div>
        </div>

        <Divider />

        {/* ── BÖLÜM 3: Genel Öneriler ── */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '32px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 4px 16px rgba(30,58,95,0.08)',
            marginBottom: '48px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                background: '#FFFBEB',
                borderRadius: '10px',
                padding: '8px',
                fontSize: '20px',
                lineHeight: 1,
                display: 'inline-flex',
              }}
            >
              💡
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#1E3A5F' }}>
              Genel Öneriler
            </h2>
          </div>

          <ul
            style={{
              margin: '20px 0 0 0',
              padding: 0,
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {generalSuggestions.map((s, i) => (
              <li
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  background: '#F8FAFF',
                  borderRadius: '12px',
                  padding: '16px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    minWidth: '32px',
                    background: 'linear-gradient(135deg, #1E3A5F, #2E86C1)',
                    borderRadius: '9999px',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </div>
                <span style={{ fontSize: '15px', color: '#374151', lineHeight: 1.6 }}>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <Divider />

        {/* ── BÖLÜM 4: Kaynaklar ── */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '32px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 4px 16px rgba(30,58,95,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                background: '#EFF6FF',
                borderRadius: '10px',
                padding: '8px',
                fontSize: '20px',
                lineHeight: 1,
                display: 'inline-flex',
              }}
            >
              📚
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#1E3A5F' }}>
              Kaynaklar
            </h2>
          </div>

          <ol
            style={{
              margin: '20px 0 0 0',
              padding: 0,
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {references.map((ref, i) => (
              <li
                key={i}
                style={{
                  display: 'flex',
                  gap: '12px',
                  fontSize: '13px',
                  color: '#6B7280',
                  lineHeight: 1.6,
                }}
              >
                <span style={{ color: '#2E86C1', fontWeight: 700, minWidth: '20px' }}>
                  {i + 1}.
                </span>
                <span>{ref}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
