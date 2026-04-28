const INPUT_BASE = {
  minHeight: '44px',
  width: '100%',
  boxSizing: 'border-box',
};

const ERROR_BORDER = { border: '2px solid #DC2626' };

export default function MetricInput({
  label,
  name,
  value,
  onChange,
  min,
  max,
  error,
  inputType = 'number',
}) {
  const handleChange = (e) => onChange(Number(e.target.value));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
      <label htmlFor={name} style={{ fontWeight: 500, fontSize: '14px', color: 'var(--color-text-main)' }}>
        {label}
      </label>

      {inputType === 'slider' ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
          <input
            type="range"
            id={name}
            name={name}
            value={value}
            min={min}
            max={max}
            step={1}
            onChange={handleChange}
            style={{
              flex: 1,
              minHeight: '44px',
              cursor: 'pointer',
              accentColor: 'var(--color-accent)',
              ...(error ? ERROR_BORDER : {}),
            }}
          />
          <input
            type="number"
            aria-label={`${label} sayısal değer`}
            value={value}
            min={min}
            max={max}
            step={1}
            onChange={handleChange}
            style={{
              ...INPUT_BASE,
              width: '72px',
              flex: 'none',
              padding: '0 8px',
              borderRadius: '6px',
              border: error ? '2px solid #DC2626' : '1px solid var(--color-border)',
              fontSize: '14px',
            }}
          />
        </div>
      ) : (
        <input
          type="number"
          id={name}
          name={name}
          value={value}
          min={min}
          max={max}
          step={1}
          onChange={handleChange}
          style={{
            ...INPUT_BASE,
            padding: '0 12px',
            borderRadius: '6px',
            border: error ? '2px solid #DC2626' : '1px solid var(--color-border)',
            fontSize: '14px',
          }}
        />
      )}

      {error && (
        <span style={{ fontSize: '12px', color: '#DC2626' }}>{error}</span>
      )}
    </div>
  );
}
