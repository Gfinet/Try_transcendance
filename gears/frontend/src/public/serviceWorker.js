// 1. Réception du Push et affichage de la notification
self.addEventListener('push', function(event) {
    let payload;
    if (event.data) {
        try {
            // Essaie de décoder en JSON
            payload = event.data.json();
        } catch (e) {
            // Si ce n'est pas du JSON (texte brut), on l'utilise directement comme corps du message
            payload = { 
                title: 'Notification', 
                body: event.data.text() 
            };
        }
    }

    const options = {
        body: payload.body || 'Nouvelle notification !',
        icon: payload.icon || '/favicon.png',
        vibrate: [100, 50, 100],
        data: {
            url: payload.url || '/' // On passe l'URL cible dans l'objet data
        }
    };

    event.waitUntil(
        self.registration.showNotification(payload.title || 'Notification', options)
    );
});

// 2. Gestion du CLIC sur la notification
self.addEventListener('notificationclick', function(event) {
    // Ferme la bannière de notification
    event.notification.close();

    // Récupère l'URL transmise dans les options lors du push (par défaut '/')
    const targetUrl = event.notification.data?.url || '/';

    // Ouvre le site ou remet l'onglet au premier plan
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Si un onglet de l'application est déjà ouvert, on bascule dessus
            for (let client of windowClients) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            // Sinon, on ouvre une nouvelle fenêtre avec l'URL cible
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/serviceWorker.js', { scope: '/' })
    .then((reg) => {
      console.log('Service Worker enregistré avec succès sur Ecosia:', reg);
    })
    .catch((err) => {
      console.error('Erreur enregistrement SW sur Ecosia:', err);
    });
}