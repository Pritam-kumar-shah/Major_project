// utils/attachUserId.js
import axios from "axios";
import { getFcmToken } from "./requestForToken";



export const attachUserToken = async (jwtToken, role) => {
  try {
    if (!jwtToken) return console.log("❌ jwtToken missing");
    
    // ⏳ 300ms delay so cookie & service worker get setup
    await new Promise(r => setTimeout(r, 300));

    const fcmToken = await getFcmToken(true);
    if (!fcmToken) return console.log("❌ No FCM token");

    console.log("🔗 attachUserToken running... role:", role);

    let tries = 0;
    let attached = false;

    // 🔄 retry 3 times
    while (!attached && tries < 3) {
      try {
        const res = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/notification/attach-user`,
          { fcmToken, role },
          {
            headers: { Authorization: `Bearer ${jwtToken}` },
            withCredentials: true,
          }
        );
        console.log("✅ Token attached:", res.data);
        attached = true;
      } catch (e) {
        tries++;
        console.log(`⚠️ Retry attach ${tries}/3...`);
        await new Promise(r => setTimeout(r, 400));
      }
    }

    if (!attached) console.log("❌ attach failed after retry");

  } catch (err) {
    console.log("❌ attachUserToken final error:", err);
  }
}

