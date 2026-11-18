import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'
import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging/sw';

// 1. Precache Logic (Vite PWA)
cleanupOutdatedCaches()
// self.__WB_MANIFEST is injected by vite-plugin-pwa
precacheAndRoute(self.__WB_MANIFEST)

self.skipWaiting()
clientsClaim()

// 2. Firebase Logic (Shared Config)
const firebaseConfig = {
  apiKey: "AIzaSyDpwis8dAuFPq9MK3-ve38PfYHR713lW78",
  authDomain: "mangalmilan-7231d.firebaseapp.com",
  projectId: "mangalmilan-7231d",
  storageBucket: "mangalmilan-7231d.firebasestorage.app",
  messagingSenderId: "676247893710",
  appId: "1:676247893710:web:15f993e371e5ba4516c29f"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// 3. 🚨 RAW PUSH LISTENER (Bypasses Firebase "Foreground" Logic)
// This ensures we ALWAYS show a notification, even if the user has the tab open.
self.addEventListener('push', (event) => {
  console.log("⚡ RAW PUSH EVENT RECEIVED (Bypassing Firebase Handler)");

  if (!event.data) {
    console.log("⚠️ Push event has no data");
    return;
  }

  let payload;
  try {
    payload = event.data.json();
  } catch (e) {
    console.error("❌ Failed to parse push data", e);
    return;
  }

  console.log("📦 Parsed Payload:", payload);

  // Extract content (Data Message structure)
  // Note: key mapping depends on how backend sends it. 
  // We send { data: { title, body } } from backend.
  const title = payload.data?.title || payload.notification?.title || "MangalMilan";
  const body = payload.data?.body || payload.notification?.body || "New Notification";
  const origin = self.location.origin;
  const image = payload.data?.image || `${origin}/logo1.png`;
  const redirectUrl = payload.data?.redirectUrl || "/";

  console.log(`🔔 Forced Display: ${title}`);

  const notificationPromise = self.registration.showNotification(title, {
    body: body,
    icon: image,
    badge: image, // Add badge for Android/Desktop consistency
    data: { redirectUrl },
    vibrate: [200, 100, 200],
    requireInteraction: true,
    tag: `notification-${Date.now()}`,
    renotify: true,
    silent: false,
    timestamp: Date.now()
  })
    .then(() => {
      console.log("✅ SYSTEM NOTIFICATION SENT TO OS");
      // ⚡ FORCE FRONTEND TOAST (Double Guarantee)
      return clients.matchAll({ type: 'window', includeUncontrolled: true });
    })
    .then((clientList) => {
      clientList.forEach(client => {
        console.log("📡 Sending message to client:", client.url);
        client.postMessage({
          type: 'SHOW_TOAST',
          payload: { title, body, image }
        });
      });
    })
    .catch(err => console.error("❌ Notification Error:", err));

  event.waitUntil(notificationPromise);
});

// 4. Click Handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const redirectUrl = event.notification.data?.redirectUrl || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(redirectUrl) && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(redirectUrl);
        }
      })
  );
});
