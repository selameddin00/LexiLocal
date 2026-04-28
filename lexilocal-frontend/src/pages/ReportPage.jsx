import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MetricCard from '../components/MetricCard';
import RiskBadge from '../components/RiskBadge';
import { mockReports } from '../data/mockReports';

const KNOWN_IDS = new Set(['r001', 'r002', 'r003']);

const SECTION_BG = {
  low:    '#F0FDF4',
  medium: '#FFFBEB',
  high:   '#FFF1F2',
};

const SECTION_BORDER = {
  low:    '#BBF7D0',
  medium: '#FDE68A',
  high:   '#FECDD3',
};

function Spinner({ label = 'Yükleniyor...' }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        color: '#1E3A5F',
        fontSize: '15px',
        fontWeight: 500,
      }}
    >
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        style={{ animation: 'spin 0.8s linear infinite' }}
      >
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <circle cx="18" cy="18" r="14" stroke="#CBD5E1" strokeWidth="3" />
        <path d="M18 4a14 14 0 0 1 14 14" stroke="#1E3A5F" strokeWidth="3" strokeLinecap="round" />
      </svg>
      {label}
    </div>
  );
}

function SecondaryButton({ onClick, children, style }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '8px 18px',
        background: hover ? '#F3F4F6' : '#ffffff',
        color: '#1E3A5F',
        border: '1px solid #E5E7EB',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'background 0.15s',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function SectionDivider() {
  return (
    <hr
      style={{
        border: 'none',
        borderTop: '1px solid #E5E7EB',
        margin: '48px 0',
      }}
    />
  );
}

export default function ReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [uiState, setUiState] = useState('loading');
  const [report, setReport]   = useState(null);

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

      if (resolved) {
        setReport(resolved);
        setUiState('success');
      } else {
        setUiState('empty');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [id]);

  if (uiState === 'loading') return <Spinner label="Rapor hazırlanıyor..." />;

  if (uiState === 'empty') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          background: '#F9FAFB',
        }}
      >
        <p style={{ fontSize: '18px', color: '#1F2937', fontWeight: 600 }}>
          Rapor bulunamadı.
        </p>
        <SecondaryButton onClick={() => navigate('/dashboard')}>
          Dashboard'a Dön
        </SecondaryButton>
      </div>
    );
  }

  const { generalAssessment, metrics, generalSuggestions, references, date } = report;
  const { riskLevel, riskLabel, overallScore, summary } = generalAssessment;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F9FAFB',
        padding: '40px clamp(16px, 4vw, 32px) 64px',
        overflowX: 'hidden',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* Üst araç çubuğu */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '32px',
          }}
        >
          <SecondaryButton onClick={() => navigate('/dashboard')}>
            ← Dashboard'a Dön
          </SecondaryButton>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '15px', color: '#6B7280' }}>
              Analiz Raporu — {date}
            </span>
            <SecondaryButton onClick={() => window.print()}>
              Yazdır
            </SecondaryButton>
          </div>
        </div>

        {/* Bölüm 1 — Genel Değerlendirme */}
        <section
          style={{
            background: SECTION_BG[riskLevel] ?? '#F9FAFB',
            border: `1px solid ${SECTION_BORDER[riskLevel] ?? '#E5E7EB'}`,
            borderRadius: '10px',
            padding: '28px',
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1E3A5F', marginBottom: '16px' }}>
            Genel Değerlendirme
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <RiskBadge riskLevel={riskLevel} label={riskLabel} />
            <span style={{ fontSize: '28px', fontWeight: 700, color: '#1F2937' }}>
              {overallScore}
              <span style={{ fontSize: '14px', fontWeight: 400, color: '#6B7280', marginLeft: '4px' }}>
                / 100
              </span>
            </span>
          </div>

          <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7', margin: 0 }}>
            {summary}
          </p>
        </section>

        <SectionDivider />

        {/* Bölüm 2 — Metrik Bazlı Analizler */}
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1E3A5F', marginBottom: '24px' }}>
            Metrik Bazlı Analizler
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {metrics.map((metric) => (
              <MetricCard key={metric.metricName} metric={metric} />
            ))}
          </div>
        </section>

        <SectionDivider />

        {/* Bölüm 3 — Öneriler */}
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1E3A5F', marginBottom: '16px' }}>
            Öneriler
          </h2>
          <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {generalSuggestions.map((s, i) => (
              <li key={i} style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7' }}>
                {s}
              </li>
            ))}
          </ul>
        </section>

        <SectionDivider />

        {/* Bölüm 4 — Kaynaklar */}
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1E3A5F', marginBottom: '16px' }}>
            Kaynaklar
          </h2>
          <ol style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {references.map((ref, i) => (
              <li key={i} style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.6' }}>
                {ref}
              </li>
            ))}
          </ol>
        </section>

      </div>
    </div>
  );
}
