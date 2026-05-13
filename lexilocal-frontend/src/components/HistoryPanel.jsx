import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RiskBadge from './RiskBadge';

function HistoryItem({ item }) {
  const navigate = useNavigate();
  const [hover, setHover] = useState(false);

  return (
    <li
      onClick={() => navigate('/report/' + item.id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: '10px',
        cursor: 'pointer',
        background: hover ? '#F0F7FF' : 'transparent',
        listStyle: 'none',
        transition: 'background 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '16px' }}>📅</span>
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#1F2937', whiteSpace: 'nowrap' }}>
          {item.date}
        </span>
      </div>
      <RiskBadge riskLevel={item.riskLevel} label={item.label} />
    </li>
  );
}

export default function HistoryPanel({ history = [] }) {
  return (
    <section style={{ padding: '20px' }}>
      <h2
        style={{
          fontSize: '16px',
          fontWeight: 700,
          color: '#1E3A5F',
          margin: '0 0 12px',
          paddingBottom: '12px',
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        📊 Geçmiş Testler
      </h2>

      {history.length === 0 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px 16px',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '28px' }}>📋</span>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: 0, textAlign: 'center' }}>
            Henüz test yapılmamış.
          </p>
        </div>
      ) : (
        <ul style={{ margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {history.map((item) => (
            <HistoryItem key={item.id} item={item} />
          ))}
        </ul>
      )}
    </section>
  );
}
