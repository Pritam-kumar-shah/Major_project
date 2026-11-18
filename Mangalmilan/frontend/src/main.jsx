


import { StrictMode } from "react";
import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from 'react-helmet-async';
import "./index.css";
import App from "./App.jsx";
import AuthProvider from "./context/auth.jsx";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// ⭐ PWA registration — ADD THIS
import { registerSW } from 'virtual:pwa-register'
import { messaging } from "./utils/firebase-config";
import { onMessage } from "firebase/messaging";

// Helper to show Premium Toast
const showPremiumToast = (title, body, image) => {
  toast(
    <div className="flex items-start w-full gap-3 font-sans">
      <div className="flex-shrink-0 pt-0.5">
        <img
          src={image}
          className="w-10 h-10 rounded-full border border-gray-100 shadow-sm object-cover"
          alt="icon"
          onError={(e) => e.target.src = "/logo1.png"}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 leading-tight mb-0.5">
          {title}
        </p>
        <p className="text-xs text-gray-600 leading-relaxed font-medium line-clamp-2">
          {body}
        </p>
      </div>
      <div className="flex-shrink-0 text-[10px] font-bold text-pink-500 uppercase tracking-wide mt-0.5">
        New
      </div>
    </div>,
    {
      position: "top-right",
      autoClose: 6000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      icon: false,
      className: "!bg-white !shadow-2xl !rounded-xl !border-[0.5px] !border-gray-100 !border-l-4 !border-l-pink-500 !p-3 !min-w-[320px]",
      bodyClassName: "!p-0 !m-0",
    }
  );
};

onMessage(messaging, (payload) => {
  console.log("📢 FG Notification Received:", payload);
  const title = payload.notification?.title || payload.data?.title || "New Notification";
  const body = payload.notification?.body || payload.data?.body || "You received a new message.";
  const image = payload.notification?.image || payload.data?.image || "/logo1.png";

  showPremiumToast(title, body, image);
});

// ⚡ Global Listener for SW Messages (Double Guarantee)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    console.log("📨 Message from SW:", event.data);

    if (event.data && event.data.type === 'SHOW_TOAST') {
      const { title, body, image } = event.data.payload;
      showPremiumToast(title, body, image);
    }
  });
}


const updateSW = registerSW({
  onNeedRefresh() {
    console.log("🔁 New version available — Refresh to update!");
  },
  onOfflineReady() {
    console.log("📶 App ready to use offline");
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <HelmetProvider>
        <AuthProvider>
          <App />
          <ToastContainer position="bottom-right" autoClose={3000} />
        </AuthProvider>
      </HelmetProvider>
    </BrowserRouter>
  </StrictMode>
);
