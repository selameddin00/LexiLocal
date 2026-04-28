import RiskBadge from './RiskBadge';

export default function MetricCard({ metric }) {
  const { metricName, measuredValue, label, labelText, description, impact, suggestions, source } = metric;

  return (
    <article
      style={{
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        background: '#ffffff',
        padding: '24px',
      }}
    >
      {/* Üst satır */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1E3A5F' }}>
          {metricName}
        </h3>
        <RiskBadge riskLevel={label} label={labelText} />
      </div>

      {/* Separator */}
      <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '16px 0' }} />

      {/* Ölçüm değeri */}
      <p style={{ fontSize: '28px', fontWeight: 700, color: '#1F2937', margin: '0 0 16px' }}>
        {measuredValue}
        <span style={{ fontSize: '14px', fontWeight: 400, color: '#6B7280', marginLeft: '4px' }}>
          puan
        </span>
      </p>

      {/* Açıklama */}
      <p style={{ fontSize: '14px', color: '#1F2937', lineHeight: '1.6', margin: '0 0 16px' }}>
        {description}
      </p>

      {/* Etki */}
      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '13px', fontWeight: 700, color: '#1F2937', margin: '0 0 4px' }}>
          Disleksi Açısından Önemi:
        </p>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: 0 }}>
          {impact}
        </p>
      </div>

      {/* Öneriler */}
      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '13px', fontWeight: 700, color: '#1F2937', margin: '0 0 8px' }}>
          Öneriler:
        </p>
        <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {suggestions.map((s, i) => (
            <li key={i} style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
              {s}
            </li>
          ))}
        </ul>
      </div>

      {/* Kaynak */}
      <p style={{ fontSize: '12px', color: '#6B7280', fontStyle: 'italic', margin: 0, lineHeight: '1.5' }}>
        {source}
      </p>
    </article>
  );
}
