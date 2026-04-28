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
        cursor: 'pointer',
        background: hover ? '#F3F4F6' : 'transparent',
        borderRadius: '6px',
        listStyle: 'none',
        transition: 'background 0.15s',
      }}
    >
      <span style={{ fontSize: '14px', color: '#1F2937', whiteSpace: 'nowrap' }}>
        {item.date}
      </span>
      <RiskBadge riskLevel={item.riskLevel} label={item.label} />
    </li>
  );
}

export default function HistoryPanel({ history = [] }) {
  return (
    <section style={{ padding: '24px 0' }}>
      <h2
        style={{
          fontSize: '16px',
          fontWeight: 700,
          color: '#1E3A5F',
          padding: '0 16px 12px',
          margin: 0,
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        Geçmiş Testler
      </h2>

      {history.length === 0 ? (
        <p
          style={{
            padding: '16px',
            fontSize: '14px',
            color: '#6B7280',
            margin: 0,
          }}
        >
          Henüz test yapılmamış.
        </p>
      ) : (
        <ul style={{ margin: 0, padding: '8px' }}>
          {history.map((item) => (
            <HistoryItem key={item.id} item={item} />
          ))}
        </ul>
      )}
    </section>
  );
}
