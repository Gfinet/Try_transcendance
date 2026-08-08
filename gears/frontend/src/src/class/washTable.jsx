import { NumberStepper } from "./numberStepper";
import { useState, useRef} from 'react'
import { greenButton, redButton } from "../models/styles";
import { useEffect } from "react";

export function WashInfo({devInfo, selectedDevice, onRefresh})
{

	return (<>
		{(selectedDevice !== "/" && devInfo?.state !== null) ? 
		(<div style={Table}>
			<div style={Row}>
			<h2 style={txt}>Infos:</h2></div>
			<div style={Row}>
			<h2 style={txt}>Status:</h2>
			{(devInfo?.state?.status && devInfo?.state?.remoteEnable?.mobileStart) ? 
			( <h2 style={txt}>{devInfo.state.status.value_localized}</h2> ) :
			( <h2 style={txt}>Option mobile inactive et/ou appuyer sur start</h2> )
			}
			</div> 
			<WashTable devInfo={devInfo} onAction={onRefresh} />

		</div>) 
		: 
		(<>
			<div style={{...Row, alignSelf:'center'}}>
			<h2 style={{color: 'white'}}>No machine picked</h2>
			</div>
		</>)}
	</>)
}


export function WashTable({devInfo, onAction})
{
	// console.log(devInfo, "\n", onAction)
	const state = devInfo?.state
	const status = state?.status
	const machineMode = status?.value_raw;
	const programs = devInfo?.programs
	const devId = devInfo?.ident?.deviceIdentLabel?.fabNumber
	// const startTime = state?.startTime[0] * 60 + state?.startTime[1]
	
	const [delaiH, setDelaiH] = useState(0)
  	const [delaiMin, setDelaiMin] = useState(0)
	const [endH, setEndH] = useState(0)
  	const [endMin, setEndMin] = useState(0)

	const [selectedProgram, setSelectedProgram] = useState('/');
	const changeProgram = (e) => {setSelectedProgram(e.target.value)}


	const fenetreRef = useRef(null);
	const showMiniWindow  = () => { fenetreRef.current.showModal() };
    const closeMiniWindow = () => { fenetreRef.current.close() };
	const PutPause = () =>{ sendAction({"stop": true}); closeMiniWindow()}

	const sendAction= async (body) => {
		const token = localStorage.getItem('token');
		const response = await fetch(`/api/miele/devices/${devId}/actions`, {
			method: 'PUT',
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json',
      		},
			body : JSON.stringify(body)
    	})
		console.log("Resp", response)
		onAction();
	}

	const turnOn = () => {sendAction({"powerOn": true})}
	const turnOff = () => {sendAction({"powerOff": true})}
	const setProgram = async () => {
		if (selectedProgram == "/") {console.log("No prog");return;}
		const prgmId = parseInt(selectedProgram,10)
		let delH = delaiH;
		let delMin = delaiMin;
		if (!timeMode)
		{
			const minT = computeEndTime();
			// console.log(minT[0], endH, "-", minT[1], endMin)
			if (minT[0] * 60 + minT[1] > endH * 60 + endMin) {console.log("impossible time");return;}
			minT[1] = endMin - minT[1];
			if (minT[1] < 0)
			{
				minT[0]++;
				minT[1] += 60;
			}
			minT[0] = endH - minT[0];

			delH = minT[0];
			delMin = minT[1];
		}
		console.log("prgm", selectedProgram, "in", delH, "h", delMin)
		const token = localStorage.getItem('token');
		const response = await fetch(`/api/miele/devices/${devId}/programs`, {
			method: 'PUT',
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body : JSON.stringify({
				"programId" : prgmId, 
				"startTime": [delH,delMin],
				"deviceId" : devId,
				"duration" : Programs[prgmId].duration
			})
    	})
		if (response) console.log("RESP", await response.json())
		onAction();
	}

	const [timeMode, setTimeMode] = useState(true)
	// const switchTime = () => {setTimeMode(!timeMode); setTime()}
	const switchTime = (e) => {setTimeMode(e.target.value === 'true');};

	useEffect(() => {
		if (selectedProgram === "/") {
			setDelaiH(0);
			setDelaiMin(0);
			return;
    	}
		setTime()
	}, [selectedProgram, timeMode]);

	const setTime = () =>
	{
		// console.log(timeMode)
		if (!timeMode)
		{
			const del = computeEndTime()
			console.log("del", Programs[selectedProgram].duration)
			setEndH(del[0])
			setEndMin(del[1])
		}
	}

	const computeEndTime = () => {
		const Now = new Date();
		let minTime = Programs[selectedProgram].duration;
		let minutes = Now.getMinutes();
		let hour = Now.getHours();

		hour = Now.getHours() + Math.trunc(minTime / 60);
		minTime -= Math.trunc(minTime / 60) * 60;

		if (minutes % 5 > 0) 
			minutes += 5 - (Now.getMinutes() % 5)
		minutes += minTime //- (minTime % 60)
		if (minutes >= 60) 
		{	
			hour += Math.trunc(minutes / 60) ; 
			minutes %= 60
		}
		return [hour, minutes];
	}


	switch (machineMode) {
		case 1:// Off/Arret
			return (<>
				<h2 style={txt}>Machine Eteinte</h2>
				<button style={{...greenButton, height:'10%', width:'100%'}} onClick={turnOn}>Allumer</button>
				<button style={{...redButton, height:'10%', width:'100%'}} onClick={turnOff}>Eteindre</button>
			</>);
		case 2://On
			return (<>
				<div style={Row}>
					<h2 style={txt}>Choisir un programme:</h2>
					<select id="program-select" value={selectedProgram} onChange={changeProgram} style={selectStyle}>
						<option value="/">Programme</option>
						{programs.map((program) => (
						<option key={program.program} value={program.programId}> 
							{program.program}
						</option>
						))}
					</select>
				</div>
				<div style={Row}>
					<select id="id-timeMode" onChange={switchTime} value={timeMode} style={{...selectStyle, fontSize:'0.7rem'}}>
						<option value="true">Temps avant lancement :</option>
						<option value="false">Heure de fin:</option>
					</select>
					{/* <h2 style={txt}>Temps avant lancement :</h2> */}
					{timeMode ? 
					(<>
						<NumberStepper value={delaiH}   onChange={setDelaiH}   max={23} step={1} label="H"   />
						<NumberStepper value={delaiMin} onChange={setDelaiMin} max={60} step={5} label="min" />
					</>) : 
					(<>
						<NumberStepper value={endH}   onChange={setEndH}   max={23} step={1} label="H"   />
						<NumberStepper value={endMin} onChange={setEndMin} max={60} step={5} label="min" />
					</>)}
				</div>
				<div style={{justifySelf :'center'}}>
					<button style={{...greenButton, height:'10%', width:'100%'}} 
					onClick={setProgram}
					>Confirmer</button>
				</div>
			</>);
		case 4: //Waiting to start
			return (
				<div style={Row}>
					<h2 style={txt}>Temps avant lancement:</h2>
					<h2 style={txt}>{state.startTime[0]}h{state.startTime[1]}</h2>
				</div>
			);
		case 5: //Running
			return (<>
				<div style={Row}>
                  <h2 style={txt}>Programme en cours:</h2>
                  <h2 style={txt}>{state?.ProgramID?.value_localized
}</h2>
                </div>
				<div style={Row}>
                  <h2 style={txt}>Etape:</h2>
                  <h2 style={txt}>{state?.programPhase?.value_localized}</h2>
                </div>
				<div style={Row}>
                  <h2 style={txt}>Temps total restant:</h2>
                  <h2 style={txt}>{state.remainingTime[0]}h
					{state.remainingTime[1] > 10 ? state.remainingTime[1] : "0" + state.remainingTime[1]}</h2>
                </div>
				<div style={{...Row, justifyContent:'center'}}>
					<button style={greenButton} onClick={showMiniWindow}>Pause</button>
					<dialog style={dialogStyle} ref={fenetreRef}>
						<p style={{fontSize: '150%', textAlign: 'center'}}>Mettre en pause?</p>
						<div style={dialogButtonDiv}>
							<button style={openButton} onClick={PutPause}>oui</button>
							<button style={noButton}   onClick={closeMiniWindow}>non</button>
						</div>
					</dialog>
				</div>
			</>);
		// case X:
		// 	return ();
		default:
			return (
				<div style={{...Row, alignSelf:'center'}}>
					<button style={{width:'100%'}} onClick={onAction}>Recharger</button>
				</div>
			);
	}
}

const Table = {
  width: '100%',
  backgroundColor:'grey',
  justifyContent: 'space-between',
  borderRadius: '5px',
}

const Row ={
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  width : '100%',
  height : 'auto'

}

const txt = {
  color:'black',
  fontSize: '15px'
}

const selectStyle = { 
  padding: '8px',
  width: '100%',
}

const dialogStyle = {
    width: '300px',
    height: '150px',
};

const dialogButtonDiv = {
	width: '100%',
	display: 'flex',
	flexDirection: 'row',
	justifyContent: 'space-between',
};

const openButton = { ...greenButton, width: '120px', fontSize: '150%', height: '100px' };
const noButton   = { ...redButton,   width: '120px', fontSize: '150%', height: '100px' };

const Programs = {
	"/": { name: "None", duration : 0},
	1:   { name: 'Coton', duration: 135 },
	3:   { name: 'Synthétique', duration: 105 },
	4:   { name: 'Fin', duration: 50 },
	8:   { name: 'Laine', duration: 40 },
	9:   { name: 'Soie', duration: 35 },
	21:  { name: 'Vidange / essorage', duration: 15 },
	22:  { name: 'Voilages', duration: 55 },
	23:  { name: 'Chemises', duration: 65 },
	27:  { name: 'Imperméabilisation', duration: 80 },
	29:  { name: 'Textiles sport', duration: 70 },
	31:  { name: 'Automatic plus', duration: 90 },
	37:  { name: 'Textiles outdoor', duration: 75 },
	39:  { name: 'Oreillers', duration: 120 },
	52:  { name: 'Rinçage/amidonnage', duration: 20 },
	53:  { name: 'Vêtements neufs', duration: 50 },
	69:  { name: 'Coton hygiène', duration: 165 },
	91:  { name: 'Nettoyage machine', duration: 105 },
	95:  { name: 'Couette plumes', duration: 120 },
	122: { name: 'Express 20', duration: 20 },
	123: { name: 'Foncés / Jeans', duration: 85 },
	129: { name: 'Textiles matelassés', duration: 110 },
	146: { name: 'QuickPowerWash', duration: 49 },
	190: { name: 'ECO 40-60', duration: 210 },
};

/*
Miele washing machine status
1	Off / Arrêt
2	On / Marche
3	Program selected / Programme sélectionné	
4	Waiting for start / En attente de démarrage	
5	Running / En cours
6	Pause / Pause	
7	End / Fin	
8	Failure / Erreur
9	Programme interrupted / Interrompu
10	Idle / Inactif


ID Programme MieleDescription
1 Cotons (Cottons)Le programme standard pour le linge de lit, serviettes, t-shirts.
2 Synthétique / Froissage minimal (Minimum iron)Pour les fibres synthétiques ou mélangées.
3 Délicat (Delicates)Pour les jupes, chemisiers, textiles fragiles.
4 Laine (Woollens)Cycle très doux pour éviter le feutrage de la laine (lavable en machine).
6 Soie (Silks)Pour les textiles très fragiles contenant de la soie.
7 Express 20 Un cycle ultra-rapide (20 min) pour rafraîchir du linge peu sale.
8 Chemises (Shirts)Réduit le froissage pour faciliter le repassage.
9 Foncé / Jeans (Dark garments / Denim)Protège la couleur des jeans et vêtements sombres.
10 Eco 40-60 Le programme réglementaire européen, optimisé pour l'énergie.
21 Couettes (Down duvets)Pour les grands articles ou duvets en plumes.
23 Imperméabilisation (Proofing)Traitement thermique pour réactiver l'effet déperlant (vêtements de sport).
*/