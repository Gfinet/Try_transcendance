import { useState, useEffect } from 'react'
import { MyLineChart, MyBarChart, TimeSlider } from '../../class/charts'
import { AppNavigation } from '../../models/navigation';
import { Fetches } from '../../models/fetchData';
import { globalDiv, buttonDiv, chartDiv, blueButton, greyButton } from '../../models/styles';

import '../../App.css'



function Table() {
  const {goToDash, goToSchedule, Logout} = AppNavigation();
  const {fetchTemp, fetchWatt} = Fetches()
  
  const [temp, setTemp] = useState([]);
  const [watt, setWatt] = useState([]);

  const WINDOW = 4; // ±6 points de chaque côté
  const [tempCenter, setTempCenter] = useState(WINDOW);
  const [wattCenter, setWattCenter] = useState(WINDOW);

  const Now = new Date().toLocaleString('fr-BE', { hour: '2-digit', timeZone: 'Europe/Brussels' });
  useEffect(() => {
    fetchTemp(data => {
      setTemp(data);
      const idxNow = data.findIndex(d => d.time.startsWith(Now.slice(0, 2)));
      setTempCenter(idxNow !== -1 ? idxNow : Math.floor(data.length / 2));
    });
    fetchWatt(data => {
      setWatt(data);
      const idxNow = data.findIndex(d => d.time.startsWith(Now.slice(0, 2)));
      setWattCenter(idxNow !== -1 ? idxNow : Math.floor(data.length / 2));
    });
  }, []);

  const tempSlice = temp.slice(
    Math.max(0, tempCenter - WINDOW),
    Math.min(temp.length, tempCenter + WINDOW + 1)
  );
  const wattSlice = watt.slice(
    Math.max(0, wattCenter - WINDOW * 12),
    Math.min(watt.length, wattCenter + WINDOW * 12 + 1)
  );

  const c = "#fbbf24"
  const chartData = {
        //title       data     valx      valy              unit
    w : {t : "Meteo", d: tempSlice, x:"time", y: "temperature", u:'°'},
    e : {t : "Electricite des panneaux", d: wattSlice, x:"time", y: "watt", u:'w', tt: watt.total},
    r : {t : "Prévision solaire", d: tempSlice, x:"time", y: "sun", u:'w'}
  }

  return (
    <div style={globalDiv}>
      <h1 style={{color:'white'}}>Bienvenue sur l'espace Tableaux</h1>

      <TimeSlider
        data={temp} center={tempCenter}
        onCenterChange={setTempCenter} windowSize={WINDOW}
        label="Météo & Rayonnement"
      />
      
      <div style={chartDiv}>
        <MyBarChart  title={chartData.w.t} data={chartData.w.d} valx={chartData.w.x} valy={chartData.w.y} unit={chartData.w.u} color={c} sep={true}/>
        <MyBarChart title={chartData.r.t} data={chartData.r.d} valx={chartData.r.x} valy={chartData.r.y} unit={chartData.r.u} color={c} sep={true}/>
        
      </div>

      <div style={chartDiv}>
        <MyLineChart title={chartData.e.t} data={chartData.e.d} valx={chartData.e.x} valy={chartData.e.y} unit={chartData.e.u} color={c} total={chartData.e.tt}/>
        <MyBarChart title={chartData.r.t} data={chartData.r.d} valx={chartData.r.x} valy={chartData.r.y} unit={chartData.r.u} color={c} sep={true}/>
      </div>
      
      <TimeSlider
        data={watt} center={wattCenter}
        onCenterChange={setWattCenter} windowSize={WINDOW}
        label="Électricité panneaux"
      />
    </div>
  );
}




export default Table
