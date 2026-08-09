

/*
F: "False"
addr: "192.168.0.205"
comfort: "False"
eco: "False"
error: "0"
fan: "102"
frost: "False"
id: "31885837213310"
indoor: "18.0"
mode: "1"
model: "Air conditioner"
name: "AirCo"
online: "True"
outdoor: "33.5"
purify: "False"
running: "True"
sleep: "False"
ssid: "net_ac_CE89"
target: "22.0"
version: "3"

*/

import { useState } from 'react';
import { Fetches } from '../models/fetchData';


export function ClimPannel ({data = {}, setClim, clim})
{
	const {fetchClim} = Fetches();
	const [futurTemp, setFuturTemp] = useState('20')
	const mode = {
		"1" : "Auto",
		"2" : "Cooling", //(froid)
		"3" : "Drying",
		"4" : "Heating", //(chaud)
		"5" : "Fan only",
	};

	const Turn = async (on) => {
		const token = localStorage.getItem('token');
		const response = await fetch("/api/clim/set", {
			method: 'PUT',
      		body: JSON.stringify({running : on}),
      		headers: {
        		'Authorization': `Bearer ${token}`,
        		'Content-Type': 'application/json',
      		}
		})
		refreshClimInfo()
	}
	const TurnOn = async () => {await Turn(true)}
	const TurnOff = async () => {await Turn(false)}

	const refreshClimInfo = async () => {
		await fetchClim(setClim);
		setFuturTemp(data.target);
		// console.log("futu", futurTemp)
  	};

	// console.log("DD", data)
	const sendT = async () => {
		const token = localStorage.getItem('token');
		await fetch('/api/clim/set', {
			method : "PUT",
			body : JSON.stringify({temperature : futurTemp}),
			headers: {
        		'Authorization': `Bearer ${token}`,
        		'Content-Type': 'application/json',
      		}
		})
		refreshClimInfo()
	}
	

	const setT = (up) => {
		let val = Number(futurTemp);
		if (up) val++;
		else	val--;
		setFuturTemp(val.toString())
	}
	const addT = () => {setT(true)}
	const lowT = () => {setT(false)}

	return (
		<div style={pannel}>
			<div style={{...row, border: '1px solid #222'}}>
				<p style={ps}>Nom :</p>
				<p style={ps}>AirCo</p>
			</div>
			{(data?.running === undefined) ? (
			<div style={row}>
				<div style={col}>
					<p style={ps}>Status :</p>
					<p style={ps}>data loading</p>
				</div>
			</div>
			) : (<>
			<div style={row}>
				<div style={{...col, width:'15%', gap:'0.7rem'}}>
					<div>
					<p style={ps}>Status:</p>
					{data?.running === "True" ? 
						(<button style={{backgroundColor:'#1eb111ff', ...button}}>
							On</button>): 
						(<button style={{backgroundColor:'red', ...button}}>
							Off</button>)
					}
					</div>
					<div>
						<p style={ps}>Mode:</p>
						<p style={ps}>{mode[data?.mode]}</p>
					</div>
				</div>
				<div style={{...col, width:'42%'}}>
						<p style={ps}>T° interieure : </p>
						<p style={ps}> {data?.indoor}</p>
						<p style={ps}>T° extérieure : </p>
						<p style={ps}> {data?.outdoor}</p>
						<p style={ps}>T° Programmée :</p>
						<p style={ps}>{data?.target}</p>
				</div>
				<div style={{...col, width:'33%', border: '1px solid #222', backgroundColor : '#000000ff'}}>
						<p style={{...ps, alignSelf:'center'}}>Régler sur : </p>
						<p style={{...ps, alignSelf:'center', fontSize :'1rem'}}>{futurTemp}°</p>
				
					<div style={{...row, gap:'0.7rem'}}>
						<button onClick={lowT} style={pmbut}>-</button>
						<button onClick={addT} style={pmbut}>+</button>
					</div>
					<button onClick={sendT}>CONFIRMER</button>
				</div>
			</div>
			<div style={{...row, border: '1px solid #222'}}>
				<button onClick={TurnOn}>ALLUMER</button>
				<button onClick={TurnOff}>ETEINDRE</button>
			</div>
			</>)}
		</div>
	);
}

const pannel = {
	display: 'flex',
  	flexDirection: 'column',
	alignSelf: 'stretch',
	width : '100%',
	border: '1px solid #333',
	borderRadius: '8px',
	overflow: 'hidden',
	backgroundColor : '#20482aff'
}

const ps = {
	color : 'white',
	fontSize : '1rem'
}

const button = {
  color: 'black',
  padding: '10px',
  border: 'none',
  borderRadius: '5px',
  
};

const pmbut = {
	alignSelf : 'center', 
	width : '50%',
	height : '35px',
	backgroundColor : '#484343ff',
	color: 'white'

}

const col = {
	display: 'flex',
  	flexDirection: 'column',
	alignContent: 'space-evenly',
	height : '100%',
	maxHeight: '100%',
	// width : '31%'
}

const row = {
	display: 'flex',
  	flexDirection: 'row',
	justifyContent: 'space-between',
	alignItems: 'center',
	padding: '8px 16px',
	// border: '1px solid #222',
}