const STYLES = {
  low:    { background: '#DCFCE7', color: '#16A34A' },
  medium: { background: '#FEF3C7', color: '#D97706' },
  high:   { background: '#FEE2E2', color: '#DC2626' },
};

const LABELS = {
  low:    'Düşük Risk',
  medium: 'Orta Risk',
  high:   'Yüksek Risk',
};

export default function RiskBadge({ riskLevel, label }) {
  const style = STYLES[riskLevel] ?? STYLES.medium;
  const text  = label ?? LABELS[riskLevel] ?? riskLevel;

  return (
    <span
      style={{
        ...style,
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '9999px',
        fontWeight: 600,
        fontSize: '13px',
      }}
    >
      {text}
    </span>
  );
}
