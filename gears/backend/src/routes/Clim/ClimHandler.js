export default async function clim(server) {
	server.get('/status',
	{ preHandler: [server.auth] },
	async (request, reply) => {
			server.writeLogs(["Request", "Server"], request.user.name, "GET /clim/status")
			try {
				const status = await server.clim.getStatus();
				return { success: true, data: status };
			} catch (error) {
				server.writeLogs(["Error"], 'Clim status error:', error.message);
				return reply.status(503).send({ success: false, message: error.message });
			}
		}
	);

	server.put('/set',
	{ preHandler: [server.auth] },
	async (request, reply) => {
			
		try {
			const { temperature, mode, running } = request.body;
			server.writeLogs(["Request", "Server"], request.user.name, "PUT /clim/set", ...[temperature, mode, running].filter(Boolean))
				if (temperature !== undefined) await server.clim.setTemp(temperature);
				if (mode !== undefined)        await server.clim.setMode(mode);
				if (running !== undefined)     running ? await server.clim.setOn() : await server.clim.setOff();
				return { success: true };
			} catch (error) {
				server.writeLogs(["Error"], 'Clim set error:', error.message);
				return reply.status(503).send({ success: false, message: error.message });
			}
		
		}
	);
}
