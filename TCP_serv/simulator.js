import { setServers } from 'dns'
import Modbus from 'jsmodbus'
import net from 'net'

const netServer = new net.Server()

// VERSION CORRIGÉE : Utilisation de Modbus.server.TCP
const server = new Modbus.server.TCP(netServer, {
  _options : {
    input :Buffer.alloc(70000),
    holding : Buffer.alloc(70000)
  }
})

setInterval(() => {
  // Simulation de la puissance entre 2000 et 5000 W
  const watts = Math.floor(Math.random() * (5000 - 2000 + 1) + 2000)
  
  // Registre SMA 100 -> Offset octet = 100 * 2
  const registerSMA = 100
  const offset = registerSMA * 2

  // console.log(server)
  server._options.input.writeUInt32BE(watts, offset)
  
  console.log(`[Simulateur] Production : ${watts} W à l'offset ${offset}`)
}, 2000)

// Écoute sur le port 5020
netServer.listen(5020, '0.0.0.0', () => {
  console.log('✅ Simulateur SMA prêt sur le port 5020')
})

// Gestion des erreurs pour éviter que le simulateur crash
netServer.on('error', (err) => {
  console.error('Erreur Serveur TCP:', err)
})

netServer.on('connection', (socket) => {console.log("connexion from", socket.remoteAddress)})