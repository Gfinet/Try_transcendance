import fp from 'fastify-plugin';
import cron from 'node-cron';



export default fp(async (server) => {

	server.post('/subscribe',
	{ preHandler: [server.auth] },
	async (request, reply) => {
		server.writeLogs(["Request"], "POST /subscribe (Push)")
		const subscription = request.body;
		const userId = request.user.id;
		
		// Évite d'ajouter les doublons si l'utilisateur s'abonne plusieurs fois
		const subscriptions = await server.prisma.pushSubscription.findMany({where : {endpoint : subscription.endpoint}})
		
		if (subscriptions.length === 0) {
			await server.prisma.pushSubscription.upsert({
				where : {endpoint: subscription.endpoint},
				update : {
					userId : userId,
					p256dh : subscription.keys.p256dh,
					auth : subscription.keys.auth
				},
				create: {
					userId: userId,
					endpoint: subscription.endpoint,
					p256dh: subscription.keys.p256dh,
					auth: subscription.keys.auth
				}
			})
			// subscriptions.push(subscription);
			// console.log("enregistrement", subscription)
		}

		return reply.code(201).send({ success: true, message: 'Abonné avec succès !' });
	});


	// 3. Route d'exposé HTTP (si vous voulez tester manuellement via Postman/cURL)
	// server.post('/send-notification', async (request, reply) => {
	// 	await server.sendNotif({
	// 		title: 'Nouveau message !',
	// 		body: 'Votre machine Miele a terminé son cycle 🧺',
	// 		icon: '/favicon.png',
	// 	});

	// 	return { success: true, message: 'Notifications envoyées' };
	// });
});

/*

await server.sendNotif({
      title: 'Lavage terminé 🧺',
      body: 'Le cycle QuickPowerWash est terminé !',
      icon: '/favicon.png',
    });

*/
