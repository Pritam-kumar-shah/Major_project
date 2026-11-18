import axios from "axios";
import { getFcmToken } from "./requestForToken.js";

export const saveTokenToBackend = async () => {
  const fcmToken = await getFcmToken();
  if (!fcmToken) return;

  await axios.post(
    `${import.meta.env.VITE_API_URL}/api/notification/save-token`,
    { fcmToken, role: "visitor" }
  );

  console.log("📡 Token synced as visitor");
};
