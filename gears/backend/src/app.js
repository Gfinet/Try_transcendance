import serverOn from './server.js'
import fs from 'fs';


const closeLogs = (server) => {
	try {
		for (const [nomFichier, fd] of Object.entries(server.logFd)) {
			fs.closeSync(fd)
			server.logFd[nomFichier] = 0;
		}
	} catch (err) {
		console.error("Erreur lors de la fermeture des FDs:", err);
	}
}

// Connexion à la DB au démarrage du serveur
const start = async () => {
    let server;
    try 
    {
        server = await serverOn();
        let stopping = false
		async function exitWhenStopped()
        {
			if (!stopping) 
            {
				stopping = true
				server.log.info('Stopping Solar\'s_Cam platform')
				await server.close()
				server.log.info('Solar\'s_Cam platform stopped')
				closeLogs(server);
				// eslint-disable-next-line n/no-process-exit
				process.exit(0)
			}
		}

		process.on('SIGINT', exitWhenStopped)
		process.on('SIGTERM', exitWhenStopped)
		process.on('SIGHUP', exitWhenStopped)
		process.on('SIGUSR2', exitWhenStopped) // for nodemon restart
		process.on('SIGBREAK', exitWhenStopped)
		process.on('message', function (m) { if (m === 'shutdown') exitWhenStopped()})
        
        await server.listen({ port: 3000, host: '0.0.0.0' })
		// await server.listen(5000, () => console.log('Serveur Push démarré sur le port 5000'));
    } 
    catch (err) 
    {
        console.log(err)
        process.exit(1)
    }
}

start()