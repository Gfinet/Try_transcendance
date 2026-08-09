import { useState, useEffect } from 'react'
import { MyLineChart, MyBarChart, TimeSlider } from '../../class/charts'
import { Fetches } from '../../models/fetchData';
// import { WashTable } from '../../models/washTable';
import { globalDiv, chartDiv } from '../../models/styles';


function FastMachine ()
{
	const {fetchTemp, fetchWatt} = Fetches()
	const [temp, setTemp] = useState([]);
  	const [watt, setWatt] = useState([]);

	const WIN = 4; // ±4 points de chaque côté
	const [center, setCenter] = useState(WIN);

	
	useEffect(() => {
		fetchTemp(data => {
			setTemp(data);
			const nowHour = new Date()
				.toLocaleString('fr-BE', { hour: '2-digit', timeZone: 'Europe/Brussels' })
				.slice(0, 2)
				.trim();
			const idx = data.findIndex(d => d.time.trim().startsWith(nowHour));
      		setCenter(idx !== -1 ? idx : Math.floor(data.length / 2));
		});
		fetchWatt(data => setWatt(data));
	}, []);

	// watt a ~12 points par heure, temp a 1 point par heure
	const RATIO = Math.round(watt.length / temp.length) || 12;
	const wattCenterIdx = center * RATIO;
	const wattSlice = watt.slice(
		Math.max(0, wattCenterIdx - WIN * RATIO),
		Math.min(watt.length, wattCenterIdx + WIN * RATIO + 1)
	);

	const tempSlice = temp.slice(
		Math.max(0, center - WIN),
		Math.min(temp.length, center + WIN + 1)
	);

	const Now = new Date().getHours();
	const sunStart = temp.findIndex(x => x.sun >= 200);
	const sunEnd   = temp.findLastIndex(x => x.sun >= 200);
	const hourSlice = sunStart !== -1 && sunEnd !== -1 ? 
		temp.slice(sunStart, sunEnd + 1) : [];

  
	const c = "#fbbf24"
	const chartData = {
        //title       data     valx      valy              unit
    w : {t : "Meteo", d: tempSlice, x:"time", y: "temperature", u:'°'},
    e : {t : "Electricite des panneaux instantanné", d: wattSlice, x:"time", y: "watt", u:'w'},
    r : {t : "Rayonnement solaire moyen", d: tempSlice, x:"time", y: "sun", u:'w'}
  	}

	// console.log("W", temp, hourSlice.at(-1), hourSlice)

	return (
		<div style={globalDiv}>
			<h1 style={{color:'white'}}>Préparer une machine rapidement</h1>

			<TimeSlider
				data={temp} center={center}
				onCenterChange={setCenter} windowSize={WIN}
				label="Électricité panneaux"
			/>
			
			<div style={chartDiv}>
				<MyBarChart  title={chartData.r.t} data={chartData.r.d} valx={chartData.r.x} valy={chartData.r.y} unit={chartData.r.u} color={c} sep={true} />
				<MyLineChart title={chartData.e.t} data={chartData.e.d} valx={chartData.e.x} valy={chartData.e.y} unit={chartData.e.u} color={c}/>
			</div>
			{hourSlice.length > 0 ? 
			(<><h2>Le rayonnement sera suffisant de {hourSlice.at(0).time} à {hourSlice.at(-1).time}</h2>
				{(Now > parseInt(hourSlice.at(-1).time, 10)) ? 
				(<h2>L'heure ideale est dans x heure</h2>) :
				(<h2>L'heure est passee, voyons demain</h2>)
				}
			</>) : 
			(<h2>le rayonnement ne sera pas suffisant aujourd'hui</h2>)
			}
			{/* {hourSlice.length > 0 ? 
			(<h2>coucou</h2>) :
			(<>bug</>)
			} */}
    	</div>
)}

export default FastMachine