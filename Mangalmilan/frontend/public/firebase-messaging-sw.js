importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// 1. Initialize Firebase in Support Worker
const firebaseConfig = {
    apiKey: "YOUR_API_KEY", // Note: It is safe to expose this in SW as it's public
    authDomain: "mangalmilan-69315.firebaseapp.com",
    projectId: "mangalmilan-69315",
    storageBucket: "mangalmilan-69315.firebasestorage.app",
    messagingSenderId: "565007321588",
    appId: "1:565007321588:web:75704192667d020d5c0746",
    measurementId: "G-K95XM3D161"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// 2. Background Message Handler (Browser Closed/Minimized)
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification?.title || payload.data?.title || 'New Notification';
    const notificationOptions = {
        body: payload.notification?.body || payload.data?.body || 'You have a new message!',
        icon: payload.notification?.image || '/logo1.png',
        data: payload.data?.url || '/', // Click action URL
        requireInteraction: true, // Key property: Keeps it visible until clicked
        actions: [
            { action: 'open_url', title: 'View Now' }
        ]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);

    // ⚡ Send data to open client windows (optional double guarantee)
    self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({
            type: 'SHOW_TOAST',
            payload: {
                title: notificationTitle,
                body: notificationOptions.body,
                image: notificationOptions.icon
            }
        }));
    });
});

// 3. Notification Click Handler
self.addEventListener('notificationclick', function (event) {
    console.log('[SW] Notification click received.');

    event.notification.close();

    // Open URL
    const urlToOpen = event.notification.data || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            // Check if tab is already open
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, open new tab
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
