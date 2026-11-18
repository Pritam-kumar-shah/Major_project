// import { messaging } from "./firebase-config.js";
// import { getToken } from "firebase/messaging";

// export const getFcmToken = async (forceRefresh = false) => {
//   try {
//     let storedToken = localStorage.getItem("fcmToken");
//     if (storedToken) return storedToken; // 🔥 already exists

//     const permission = await Notification.requestPermission();
//     if (permission !== "granted") return null;

//     const token = await getToken(messaging, {
//       vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
//     });

//     if (!token) return null;

//     console.log("🔑 FCM Token:", token);
//     localStorage.setItem("fcmToken", token);
//     return token;
//   } catch (err) {
//     console.log("FCM Error:", err);
//     return null;
//   }
// };






import { messaging } from "./firebase-config.js";
import { getToken } from "firebase/messaging";

// export const getFcmToken = async () => {
//   try {
//     let storedToken = localStorage.getItem("fcmToken");
//     if (storedToken) return storedToken; // 🔥 return existing

//     const permission = await Notification.requestPermission();
//     if (permission !== "granted") return null;

//     const token = await getToken(messaging, {
//       vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
//     });

//     if (token) localStorage.setItem("fcmToken", token);

//     return token;
//   } catch (err) {
//     console.log("FCM Error:", err.message);
//     return null;
//   }
// };

export const getFcmToken = async () => {
  try {
    console.log("🚀 Requesting FCM Token...");

    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission !== "granted") {
      console.log("🚫 Notification permission denied");
      return null;
    }

    console.log("⏳ Waiting for Service Worker to be ready...");
    const swRegistration = await navigator.serviceWorker.ready;
    console.log("✅ Service Worker is ready:", swRegistration);

    if (!import.meta.env.VITE_FIREBASE_VAPID_KEY) {
      console.error("❌ Missing VITE_FIREBASE_VAPID_KEY in .env");
      return null;
    }

    console.log("🔄 Calling getToken...");
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: swRegistration
    });

    if (token) {
      console.log("🔑 FCM Token Generated:", token);
      localStorage.setItem("fcmToken", token);
      return token;
    } else {
      console.log("⚠️ No registration token available. Request permission to generate one.");
      return null;
    }

  } catch (err) {
    console.error("❌ FCM Token Error Details:", err);
    return null;
  }
};







