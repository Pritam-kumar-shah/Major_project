import { messaging } from "../firebase-config";
import { onMessage } from "firebase/messaging";

export const listenForegroundNotifications = () => {
  onMessage(messaging, (payload) => {
    console.log("📩 FG Notification:", payload);

    new Notification(payload.notification.title, {
      body: payload.notification.body,
      data: payload.data
    });
  });
};
