import { useState, useEffect } from 'react'
import { MyComposeChart, MyBarChart, TimeSlider } from '../../class/charts'
import { Fetches } from '../../models/fetchData';
import { globalDiv, chartDiv } from '../../models/styles';

import '../../App.css'



function Table() {
  const {fetchTemp, fetchWatt} = Fetches()
  
  const [temp, setTemp] = useState([]);
  const [watt, setWatt] = useState([]);

  const WIN = 7; // ±6 points de chaque côté
  const [tempCenter, setTempCenter] = useState(WIN);

  const Now = new Date().toLocaleString('fr-BE', { hour: '2-digit', timeZone: 'Europe/Brussels' });
  useEffect(() => {
    fetchTemp(data => {
      setTemp(data);
      const idxNow = data.findIndex(d => d.time.startsWith(Now.slice(0, 2)));
      setTempCenter(idxNow !== -1 ? idxNow : Math.floor(data.length / 2));
    });
    fetchWatt(data => {setWatt(data)});
  }, []);

  const tempSlice = temp.slice(
    Math.max(0, tempCenter - WIN),
    Math.min(temp.length, tempCenter + WIN + 1)
  );

  const newWatt = temp.map(hour => {
    let wa = 0;
    let count = 0;
    const hourTm = parseInt(hour.time, 10)
    // console.log("hour", hourTm)
    for (const val of watt)
    {
      const tm = parseInt(val.time, 10)
      if (tm === hourTm)
      {
        wa += val.watt;
        count ++;
      }
      else if (tm > hourTm)
        break;
    }
    if (count === 0) count = 1;
    return {time : hour.time, watt: Math.round(wa / count), sun : hour.sun};
  })

  const wattSlice = newWatt.slice(
    Math.max(0, tempCenter - WIN),
    Math.min(watt.length, tempCenter + WIN + 1)
  );

  const c = "#fbbf24"
  const chartData = {
        //title       data     valx      valy              unit
    w : {t : "Meteo", d: tempSlice, x:"time", y: "temperature", u:'°'},
    e : {t : "Electricite des panneaux", d: watt, x:"time", y: "watt", u:'w', tt: watt.total},
    r : {t : "Prévision solaire", d: tempSlice, x:"time", y: "sun", u:'w'}
  }

  return (
    <div style={globalDiv}>
      <h1 style={{color:'white'}}>Bienvenue sur l'espace Tableaux</h1>

      <TimeSlider
        data={temp} center={tempCenter}
        onCenterChange={setTempCenter} windowSize={WIN}
        label="Météo & Rayonnement"
      />
      
        <MyBarChart  title={chartData.w.t} data={chartData.w.d} valx={chartData.w.x} valy={chartData.w.y} unit={chartData.w.u} color={c} sep={true}/>
        <div style={chartDiv}>
          <MyComposeChart
          title={"Prévision / Rendement"}
          data={wattSlice}
          valx={"time"}
          valy={{one : "sun", two : "watt"}}
          sep={true}
          />
        </div>
      
      {/* <div style={chartDiv}>
        <MyBarChart  title={chartData.w.t} data={chartData.w.d} valx={chartData.w.x} valy={chartData.w.y} unit={chartData.w.u} color={c} sep={true}/>
        <MyBarChart title={chartData.r.t} data={chartData.r.d} valx={chartData.r.x} valy={chartData.r.y} unit={chartData.r.u} color={c} sep={true}/>
      </div> */}

      {/* <div style={chartDiv}>
        <MyLineChart title={chartData.e.t} data={chartData.e.d} valx={chartData.e.x} valy={chartData.e.y} unit={chartData.e.u} color={c} total={chartData.e.tt}/>
        <MyBarChart title={chartData.r.t} data={chartData.r.d} valx={chartData.r.x} valy={chartData.r.y} unit={chartData.r.u} color={c} sep={true}/>
      </div> */}
      
      {/* <TimeSlider
        data={watt} center={wattCenter}
        onCenterChange={setWattCenter} windowSize={WIN}
        label="Électricité panneaux"
      /> */}
    </div>
  );
}




export default Table
