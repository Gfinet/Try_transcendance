const PUBLIC_VAPID_KEY = "BHP88KlExr4tQ5JpM2oAslQ4VezcEkE9vdyFyDwCxgsaZqxxCfNFZt2v1plv4aqgYkp8tkpnwJVmgAd_jOe3vcg"

function urlBase64ToUint8Array(base64String) {
	const padding = '='.repeat((4 - base64String.length % 4) % 4);
	const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);
	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

export async function subscribeUserToPush() {
	if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
		throw new Error('Push non supporté sur ce navigateur.');
	}

	// 1. Enregistrement du Service Worker
	const register = await navigator.serviceWorker.register('/serviceWorker.js', { scope: '/' });

	// 2. Demande de la permission
	const permission = await Notification.requestPermission();
	if (permission !== 'granted') {
		throw new Error('Permission refusée pour les notifications.');
	}

	// 3. Récupération du jeton d'abonnement du navigateur
	const subscription = await register.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
	});
	console.log("sub", subscription)
	const token = localStorage.getItem('token');

	// 4. Envoi de l'abonnement à Fastify
	await fetch('/api/subscribe', {
		method: 'POST',
		headers: { 
			'Content-Type': 'application/json', 
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify(subscription)
	});

	return true;
}