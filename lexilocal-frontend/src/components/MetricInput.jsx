export default function MetricInput({
  label,
  name,
  value,
  onChange,
  min,
  max,
  error,
  inputType = 'number',
  description,
  disabled = false,
}) {
  const handleChange = (e) => onChange(Number(e.target.value));

  const baseInputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: `2px solid ${error ? '#DC2626' : '#E5E7EB'}`,
    borderRadius: '10px',
    fontSize: '16px',
    fontFamily: "'Nunito', system-ui, sans-serif",
    outline: 'none',
    boxSizing: 'border-box',
    background: disabled ? '#F9FAFB' : '#ffffff',
    cursor: disabled ? 'not-allowed' : 'auto',
  };

  return (
    <div className="card" style={{ marginBottom: 0 }}>
      <label
        htmlFor={name}
        style={{
          display: 'block',
          fontSize: '15px',
          fontWeight: 700,
          color: '#1E3A5F',
          marginBottom: '4px',
        }}
      >
        {label}
      </label>

      {description && (
        <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px' }}>
          {description}
        </p>
      )}

      {inputType === 'slider' ? (
        <div>
          {/* Değer göstergesi */}
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '28px',
                fontWeight: 800,
                color: error ? '#DC2626' : '#2E86C1',
              }}
            >
              {value}
            </span>
          </div>

          {/* Range input */}
          <input
            type="range"
            id={name}
            name={name}
            value={value}
            min={min}
            max={max}
            step={1}
            disabled={disabled}
            onChange={handleChange}
            style={{
              width: '100%',
              accentColor: '#2E86C1',
              height: '6px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              display: 'block',
            }}
          />

          {/* Min / Max etiketleri */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '6px',
            }}
          >
            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{min}</span>
            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{max}</span>
          </div>
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
          disabled={disabled}
          onChange={handleChange}
          style={baseInputStyle}
        />
      )}

      {error && (
        <span style={{ display: 'block', fontSize: '12px', color: '#DC2626', marginTop: '6px' }}>
          {error}
        </span>
      )}
    </div>
  );
}
