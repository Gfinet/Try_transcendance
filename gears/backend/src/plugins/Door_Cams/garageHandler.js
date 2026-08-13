import { MyQ } from 'myq-api';


export default async function garageHandler(server) {
    
    const account = new MyQ();
    
    try {
        // Connexion avec vos identifiants myQ
        await account.login(process.env.MYQ_USR, process.env.MYQ_PSWD);
        
        // Récupération des appareils
        const devices = await account.getDevices();
        console.log("devices", devices)
        const garageDoor = devices.find(d => d.device_type === 'GaragedoorOpener');
        
        if (garageDoor) {
            // Ouvrir ou Fermer : 'open' ou 'close'
            await account.setDoorState(garageDoor.serial_number, 'open');
        }
    } catch (error) {
        console.error('Erreur myQ:', error);
    }
}