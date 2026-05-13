import RiskBadge from './RiskBadge';

export default function MetricCard({ metric }) {
  const { metricName, measuredValue, label, labelText, description, impact, suggestions, source } = metric;

  return (
    <article className="card" style={{ padding: '24px' }}>

      {/* Üst satır */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#1E3A5F' }}>
          {metricName}
        </h3>
        <RiskBadge riskLevel={label} label={labelText} />
      </div>

      {/* Ölçülen değer kutusu */}
      <div
        style={{
          background: '#F0F7FF',
          borderRadius: '10px',
          padding: '12px 16px',
          marginBottom: '16px',
        }}
      >
        <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '2px' }}>Ölçülen Değer:</div>
        <div style={{ fontSize: '32px', fontWeight: 800, color: '#1E3A5F', lineHeight: 1.1 }}>
          {measuredValue}
        </div>
      </div>

      {/* Separator */}
      <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '16px 0' }} />

      {/* Açıklama */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#6B7280', marginBottom: '6px' }}>
          📋 Açıklama
        </div>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6, margin: 0 }}>
          {description}
        </p>
      </div>

      {/* Impact kutusu */}
      <div
        style={{
          background: '#FFFBEB',
          borderLeft: '3px solid #D97706',
          padding: '10px 14px',
          borderRadius: '0 8px 8px 0',
          margin: '12px 0',
        }}
      >
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#D97706', marginBottom: '4px' }}>
          ⚠️ Disleksi Açısından Önemi
        </div>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6, margin: 0 }}>
          {impact}
        </p>
      </div>

      {/* Öneriler */}
      <div style={{ marginTop: '12px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#6B7280', marginBottom: '8px' }}>
          💡 Öneriler
        </div>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {suggestions.map((s, i) => (
            <li
              key={i}
              style={{
                fontSize: '14px',
                color: '#374151',
                lineHeight: 1.8,
                paddingLeft: '4px',
              }}
            >
              ✅ {s}
            </li>
          ))}
        </ul>
      </div>

      {/* Kaynak */}
      <p
        style={{
          fontSize: '12px',
          color: '#9CA3AF',
          fontStyle: 'italic',
          marginTop: '12px',
          marginBottom: 0,
          lineHeight: 1.5,
        }}
      >
        📚 Kaynak: {source}
      </p>
    </article>
  );
}
