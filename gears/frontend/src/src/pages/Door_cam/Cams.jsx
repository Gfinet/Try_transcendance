import { useRef } from 'react'
import { MyCam } from '../../class/myCam';
import { AppNavigation } from '../../models/navigation';
import { blueButton, greenButton, redButton } from '../../models/styles';

import '../../App.css'


function Cams()
{
    const streamGarage  = "/go2rtc/webrtc.html?src=garage&mode=ws";
    const streamSonette = "/go2rtc/webrtc.html?src=sonette&mode=ws";
    const {goToDash} = AppNavigation();

    const fenetreRef = useRef(null);
    const showMiniWindow  = () => { fenetreRef.current.showModal() };
    const closeMiniWindow = () => { fenetreRef.current.close() };
    const OpenDoor        = () => { console.log("Porte ouverte"); closeMiniWindow() };

    return (
        <div style={globalDiv}>
            <div style={camDiv}>
                <MyCam source={streamGarage} title={"🔴 Garage"}/>
                <MyCam source={streamSonette} title={"🔴 Sonette"}/>
            </div>
            <div style={actionDiv}>
                <button style={greenButton} onClick={showMiniWindow}>Ouvrir la porte</button>
                <dialog style={dialogStyle} ref={fenetreRef}>
                    <p style={{fontSize: '150%', textAlign: 'center'}}>Ouvrir la porte?</p>
                    <div style={dialogButtonDiv}>
                        <button style={openButton} onClick={OpenDoor}>oui</button>
                        <button style={noButton}   onClick={closeMiniWindow}>non</button>
                    </div>
                </dialog>
                <button style={blueButton} onClick={goToDash}>Revenir à l'acceuil</button>
            </div>
        </div>
    );
}

// Spécifiques à Cams
const globalDiv = {
    width: '100%',
    maxWidth: '800px',
    margin: '20px auto',
    gap: '1rem',
    display: 'flex',
    flexDirection: 'column',
};

const camDiv = {
    display: 'flex',
    flexDirection: 'row',
}

const actionDiv = {
    display: 'flex',
    flexDirection: 'row',
    gap: '1rem',
    justifyContent: 'center',
    alignItems: 'center',
};

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

export default Cams
