export default async function clim(server) {
  server.get('/clim/status',
    { preHandler: [server.auth] },
    async (request) => {
		server.writeLogs(["Request", "Server"], request.user.name, "GET /clim/status")
		try {
			const status = await server.clim.getStatus();
			return { success: true, data: status };
		} catch (error) {
			server.writeLog(server.logFd["Error"], 'Clim status error:', err.message);
			return reply.status(503).send({ success: false, message: err.message });
		}
	}
  );

  server.put('/clim/set',
    { preHandler: [server.auth] },
    async (request, reply) => {
		
		server.writeLogs(["Request", "Server"], request.user.name, "PUT /clim/set")
		try {
			const { temperature, mode, running } = request.body;
			console.log("PUT", temperature, mode, running)
			if (temperature !== undefined) await server.clim.setTemp(temperature);
			if (mode !== undefined)        await server.clim.setMode(mode);
			if (running !== undefined)     running ? await server.clim.setOn() : await server.clim.setOff();
			return { success: true };
		} catch (error) {
			server.writeLog(server.logFd["Error"], 'Clim set error:', error.message);
			return reply.status(503).send({ success: false, message: error.message });
		}
      
    }
  );
}
