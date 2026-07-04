// public/firebase-messaging-sw.js
// Service Worker para recibir notificaciones FCM en background
// No necesita Firebase SDK — los eventos push llegan como evento nativo del SW

// Manejar notificaciones en background
self.addEventListener('push', (event) => {
    if (!event.data) return;

    try {
        const payload = event.data.json();
        const { notification, data } = payload;

        if (!notification) return;

        const title = notification.title || 'Horario UDG';
        const options = {
            body: notification.body || '',
            icon: notification.icon || '/icon-192.png',
            badge: notification.badge || '/badge-96.png',
            data: data || {},
            tag: data?.nrc || 'general',
            requireInteraction: true,
            vibrate: [200, 100, 200],
            actions: [
                {
                    action: 'open',
                    title: 'Ver detalle',
                },
                {
                    action: 'close',
                    title: 'Cerrar',
                },
            ],
        };

        event.waitUntil(self.registration.showNotification(title, options));
    } catch (error) {
        console.error('[SW] Error mostrando notificación:', error);
    }
});

// Manejar clic en notificación
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const data = event.notification.data || {};
    const type = data.type || '';
    const nrc = data.nrc || '';
    const profesor = data.profesor || '';
    const scheduleId = data.scheduleId || '';

    // TODOS los tipos: si hay scheduleId vinculado, abrir directamente
    // en la edición del horario en Mis Horarios con el NRC correspondiente.
    let urlToOpen = '/dashboard';

    if (scheduleId) {
        urlToOpen = `/mis-horarios?edit=${scheduleId}${nrc ? `&nrc=${nrc}` : ''}`;
    } else {
        // Fallback por tipo cuando no hay horario vinculado
        switch (type) {
            case 'seat_available':
                urlToOpen = nrc ? `/planear?nrc=${nrc}` : '/planear';
                break;
            case 'schedule_change':
                urlToOpen = nrc ? `/mis-horarios?nrc=${nrc}` : '/mis-horarios';
                break;
            case 'professor_change':
                urlToOpen = profesor ? `/profesores?q=${encodeURIComponent(profesor)}` : '/profesores';
                break;
            case 'test_notification':
                urlToOpen = '/mis-notificaciones';
                break;
            case 'reminder':
                urlToOpen = '/dashboard';
                break;
            default:
                urlToOpen = nrc ? `/planear?nrc=${nrc}` : '/dashboard';
        }
    }

    const action = event.action;
    if (action === 'close') return;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Si ya hay una ventana abierta, enfocarla
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.navigate(urlToOpen);
                    return client.focus();
                }
            }
            // Si no, abrir nueva ventana
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

// Manejar cambios en la suscripción push (ej: cuando expira)
self.addEventListener('pushsubscriptionchange', () => {
    // El frontend detectará que el token cambió y lo re-registrará
    console.log('[SW] Suscripción push cambiada — el frontend generará un nuevo token');
});
