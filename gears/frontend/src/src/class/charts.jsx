// src/Chart.jsx
import { LabelList, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export function MyBarChart({title, data, valx, valy, unit, sep})
{
  return (
    <div style={styles.chart}>
      <h2 style={{color:'white'}}>{title}<br /></h2>
      <ResponsiveContainer height={250}>
        <BarChart data = {data} margin={{ top: 0, right: 0, left: -25, bottom: 25 }}>
          <XAxis dataKey={valx} interval={1} tick={{ fontSize: "13px" }} />
          <YAxis dataKey={valy} tick={{ fontSize: "10px" }}/>{/* 3. La bulle qui apparaît au survol */}
          <Tooltip />{/* 4. La ligne de données */}
          <Bar type="monotone" dataKey={valy} stroke="#8884d8" strokeWidth={2} dot={false} >
            {/* <LabelList 
              dataKey={valy} 
              position="top"   // Place la valeur au-dessus de la barre
              offset={10}      // Petit espace entre la barre et le texte
              style={{ fontSize: '7px', fill: '#666', fontWeight: 'bold' }}
              formatter={(value) => `${value}${unit}`} 
            /> */}
            </Bar>
          {sep ? <ReferenceLine 
            x="00 h" 
            stroke="red" 
            strokeDasharray="3 3" 
            label={{ value: 'Demain', position: 'top', fill: 'red' }} 
          /> : (<></>)}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function MyLineChart ({title, data, valx, valy, total})
{
  return (
    <div style={styles.chart}>
      <h2  style={{color:'white', fontSize:'0.7rem'}}>{title}{ total ? (<><br />- total : {total}wh</>) : (<></>)}</h2>
      <ResponsiveContainer height={250}>
        <LineChart data = {data} margin={{ top: 0, right: 0, left: -25, bottom: 25 }}>
          <XAxis dataKey={valx} interval={12} tick={{ fontSize: "15px" }} />
          <YAxis dataKey={valy} tick={{ fontSize: "10px" }}/>{/* 3. La bulle qui apparaît au survol */}
          <Tooltip />{/* 4. La ligne de données */}
          <Line type="monotone" dataKey={valy} stroke="#8884d8" strokeWidth={1} dot={false} >
            {/* <LabelList 
              dataKey={valy} 
              position="top"   // Place la valeur au-dessus de la barre
              offset={10}      // Petit espace entre la barre et le texte
              style={{ fontSize: '10px', fill: '#666', fontWeight: 'bold' }}
              formatter={(value) => `${value}°`} 
            /> */}
            </Line>
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function TimeSlider({ data, center, onCenterChange, windowSize, label }) {
  if (!data || data.length === 0) return null;
  return (
    <div style={sliderContainer}>
      <span style={sliderLabel}>{label}</span>
      <div style={sliderRow}>
        <span style={sliderBound}>{data[0]?.time}</span>
        <input
          type="range"
          min={windowSize}
          max={data.length - (windowSize + 1)}
          value={center}
          onChange={e => onCenterChange(Number(e.target.value))}
          style={sliderInput}
        />
        <span style={sliderBound}>{data[data.length - 1]?.time}</span>
      </div>
      <span style={sliderCurrent}>
        Centré sur {data[center]?.time} · ±{windowSize}h
      </span>
    </div>
  );
}

const sliderContainer = {
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  padding: '0.5rem 1rem', margin: '0.5rem 0',
  backgroundColor: '#8c8c8cff', borderRadius: '8px',
  width: '90%', alignSelf: 'center',
};
const sliderRow = {
  display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
};
const sliderInput = {
  flex: 1, accentColor: '#007bff',
  height: '6px', cursor: 'pointer',
};
const sliderLabel  = { fontWeight: 'bold', color: '#000000ff', marginBottom: '4px' };
const sliderBound  = { fontSize: '0.8rem', color: '#000000ff', whiteSpace: 'nowrap' };
const sliderCurrent = { fontSize: '0.85rem', color: '#000000ff', marginTop: '4px' };


const styles = {
  chart: { width: "98%" }
};

