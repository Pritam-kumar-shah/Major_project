// importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
// importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js");

// // --- DO NOT hardcode in frontend ---
// // Just firebase config (no secrets here)
// firebase.initializeApp({
//   apiKey: "AIzaSyDpwis8dAuFPq9MK3-ve38PfYHR713lW78",
//   authDomain: "mangalmilan-7231d.firebaseapp.com",
//   projectId: "mangalmilan-7231d",
//   storageBucket: "mangalmilan-7231d.firebaseapp.com",
//   messagingSenderId: "676247893710",
//   appId: "1:676247893710:web:15f993e371e5ba4516c29f"
// });

// const messaging = firebase.messaging();

// // 🔔 Notification in background / browser closed
// messaging.onBackgroundMessage((payload) => {
//   console.log("📩 BG Notification:", payload);

//   const title = payload.notification?.title ?? "MangalMilan";
//   const body = payload.notification?.body ?? "";
//   const data = payload.data ?? {};

//   self.registration.showNotification(title, {
//     body,
//     icon: "/logo192.png",     // <-- app icon
//     badge: "/logo192.png",    // <-- small icon option
//     data                      // <-- bookingId/enquiryId here
//   });
// });

// // 🧭 Notification click → open page
// self.addEventListener("notificationclick", function (event) {
//   event.notification.close();

//   const urlToOpen = event.notification.data?.redirectUrl || "/";

//   event.waitUntil(
//     clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
//       for (const client of clientList) {
//         if ("focus" in client) return client.focus();
//       }
//       if (clients.openWindow) return clients.openWindow(urlToOpen);
//     })
//   );
// });



importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDpwis8dAuFPq9MK3-ve38PfYHR713lW78",
  authDomain: "mangalmilan-7231d.firebaseapp.com",
  projectId: "mangalmilan-7231d",
  storageBucket: "mangalmilan-7231d.firebasestorage.app",
  messagingSenderId: "676247893710",
  appId: "1:676247893710:web:15f993e371e5ba4516c29f"
});

const messaging = firebase.messaging();

/* -------------------------------------------------------
   📩 BACKGROUND NOTIFICATION DISPLAY
------------------------------------------------------- */
messaging.onBackgroundMessage((payload) => {
  console.log("📩 BG Notification:", payload);

  const title = payload.notification?.title ?? "MangalMilan";
  const body = payload.notification?.body ?? "";
  const data = payload.data ?? {};

  // 🔥 ensure redirectUrl is passed to click handler
  self.registration.showNotification(title, {
    body,
    icon: "/logo1.png",
    badge: "/logo1.png",
    data, // <-- IMPORTANT for click redirect
    vibrate: [200, 100, 200], // small vibration (optional)
    requireInteraction: false // auto-dismiss (true = user must close)
  });
});

/* -------------------------------------------------------
   🧭 CLICK HANDLER — OPEN SPECIFIC PAGE
------------------------------------------------------- */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const redirectUrl = event.notification?.data?.redirectUrl || "/";
  console.log("👉 Redirect to:", redirectUrl);

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If window already open → focus that tab
        for (const client of clientList) {
          if (client.url.includes(redirectUrl) && "focus" in client) {
            return client.focus();
          }
        }
        // Otherwise → open new tab
        if (clients.openWindow) {
          return clients.openWindow(redirectUrl);
        }
      })
  );
});

/* -------------------------------------------------------
   🚫 OPTIONAL: Prevent duplicate SW loads warning
------------------------------------------------------- */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

