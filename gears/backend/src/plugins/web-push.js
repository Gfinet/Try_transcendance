import fp from 'fastify-plugin'
import webpush from 'web-push'

const notifType = {
		1 : {
			title : 'Machine préparée 🧺',
			body : "N'oubliez pas d'activer Tailscale",
			icon : '/favicon.png'
		},
		2 : {
			title : 'Machine lancée 🧺',
			body : "N'oubliez pas d'activer Tailscale",
			icon : '/favicon.png'
		},
		3 : {
		  title: 'Lavage terminé 🧺',
		  body: "N'oubliez pas d'activer Tailscale",
		  icon: '/favicon.png',
		},
	}


export default fp(async (server) => {

	server.decorate('hasPendingNotifs', true);
	webpush.setVapidDetails(
		`mailto:${process.env.MAIL}`, // Votre email de contact
		process.env.PUSH_PUBLIC_KEY,
		process.env.PUSH_PRIVATE_KEY
	);

	server.decorate('webpush', webpush);

	server.decorate('createNotif', async (type, delai, prgmId) => {
		server.hasPendingNotifs = true;
		const Now = new Date();
		let delayInMs = 0
		if (delai) delayInMs = ((delai[0] || 0) * 3600 + (delai[1] || 0) * 60) * 1000;
    	const nextDate = new Date(Now.getTime() + delayInMs);
		await server.prisma.pushNotif.create({
			data : {
				createdAt : Now,
				sendAt : nextDate,
				type : type,
				programId : prgmId,
			}

		})
	})

	// 2. Fonction réutilisable pour envoyer un Push (décorée sur l'instance Fastify)
	server.decorate('sendNotif', async (payloadData) => {
		// console.log("SEND NOTIF", payloadData)
		const payload = JSON.stringify(notifType[payloadData]);
		// console.log("SEND NOTIF", payload)
		const subscriptions = await server.prisma.pushSubscription.findMany();
		// console.log("subs", subs)
		const promises = subscriptions.map(async (subi) => {
            const pushconfig = {
                endpoint: subi.endpoint,
                keys: {
                    p256dh: subi.p256dh,
                    auth: subi.auth
                }
            };

            try {
                await server.webpush.sendNotification(pushconfig, payload);
            } catch (err) {
                if (err.statusCode === 410 || err.statusCode === 404) {
                    console.log(`Abonnement ${subi.id} expiré, suppression...`);
                    await server.prisma.pushSubscription.delete({
                        where: { id: subi.id }
                    });
                } else {
                    server.writeLogs(["Error"], 'Erreur Push:', err);
                }
            }
        });

		await Promise.all(promises);
	});

	
	
//   res.status(200).json({ message: 'Notifications envoyées !' });
})