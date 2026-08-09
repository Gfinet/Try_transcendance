

export function NumberStepper({ value, onChange, min = 0, max = 59, step, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0px', color:'black' }}>
      <button onClick={() => onChange(Math.max(min, value - step))}
        style={stepBtn}>-</button>
      <span style={{ minWidth: '32px', textAlign: 'center', fontSize: '1.1rem', color:'black' }}>
        {String(value).padStart(2, '0')}
      </span>
      <span style={{ fontSize: '1.1rem', color:'black' }}>{label}</span>
      <button
        onClick={() => onChange(Math.min(max, value + step))}
        style={stepBtn}>+</button>
    </div>
  );
}

const stepBtn = {
  width: '36px', height: '36px',
  fontSize: '1.2rem', fontWeight: 'bold',
  border: '1px solid #ccc', borderRadius: '6px',
  background: '#f0f0f0', cursor: 'pointer', color:'black'
};