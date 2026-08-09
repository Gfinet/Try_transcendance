import fp from "fastify-plugin"

async function getValidMieleToken(userId, server) {
	// 1. Chercher le token en BDD
	const tokenRecord = await server.prisma.miele_Token.findUnique({
		where: { userId: userId }
	});

	if (!tokenRecord) {
		throw new Error("Aucun compte Miele associé");
	}

	const today = new Date();
	if (tokenRecord.expiresAt > new Date(today.getTime() + 60000)) {
		return tokenRecord.accessToken;
	};
	
	try {
		const response = await fetch('https://api.mcs3.miele.com/thirdparty/token', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				client_id: process.env.MIELE_ID,
				client_secret: process.env.MIELE_SECRET,
				refresh_token: tokenRecord.refreshToken,
				grant_type: 'refresh_token'
			})
		});
		const data = await response.json();

		if (data.error) {
			throw new Error(`Error Miele Refresh: ${data.message}`);
		}
		const nouvelExpiracy = new Date();
		nouvelExpiracy.setSeconds(nouvelExpiracy.getSeconds() + data.expires_in);

		const updatedRecord = await server.prisma.miele_Token.update({
			where: { userId: userId },
			data: {
				accessToken: data.access_token,
				refreshToken: data.refresh_token || tokenRecord.refreshToken, // Parfois Miele ne renvoie pas de nouveau refresh token, on garde l'ancien au cas où
				expiresAt: nouvelExpiracy
			}
		});

		return updatedRecord.accessToken;

	} catch (error) {
		throw new Error("Session Miele expirée, veuillez vous reconnecter.");
	}
}

const programs = {
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

async function savePrgmDb(server, userId, request)
{
	const body = request.body;
	const deviceId = request.params
	server.writeLogs(["Test"], "SAVE", userId, body, deviceId)
	if (!body) return;
	const prgm = programs[body.programId].name;
	const date = new Date(new Date().getTime() - (60000)) //1 minutes less
	const del = (body.startTime[0] * 60 + body.startTime[1] - 1) * 60 * 1000
	const start = new Date(new Date().getTime() + del)
	const endPrgm = [request.body.startTime[0], request.body.startTime[1] + request.body.duration]
	date.setSeconds(50) // but set a 50 sec to be launched when cron turn
	start.setSeconds(50)

	const newPrgm = await server.prisma.washing_Program.create({
		data: {
			name: prgm, 
			type: body.programId,
			createdAt: date, 
			startAt : start,
			finished : "En attente", 
			authorId : userId,
			deviceId : body.deviceId
		}})
	server.sendNotif(1); //saved
	server.createNotif(3, endPrgm, newPrgm.id); //theoric end of Prgm
	server.hasPendingPrgm = true;
	//TODO NOTIF at body.startTime[0]*60 + body.startTime[1] + temps du prgm
}

export default fp(async (server)=>{
	
	server.decorate('hasPendingPrgm', true);
    server.decorate('miele', {
		getToken: async (userId, server) => getValidMieleToken(userId, server), 
		saveDb: async (server, userId, body) => savePrgmDb(server, userId, body),
	})
})