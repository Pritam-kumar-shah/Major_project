import express from "express";
import { saveFcmToken, updateTokenWithUser } from "../controller/NotificationController.js";
import { sendToRole } from "../utils/sendNotification.js";
import isAuth from "../middleware/isAuth.js";
import isAdmin from "../middleware/isAdmin.js"; // 🔥 ADD THIS (ensure only admin can broadcast)

const router = express.Router();

// 1️⃣ Device Token Save (login required nahi)
router.post("/save-token", saveFcmToken);

// 2️⃣ Login ke baad token ko user/vendor se link karo
router.put("/attach-user", isAuth, updateTokenWithUser);


// ---------------------------------------------------------------
// ⭐ ADMIN BROADCAST — Offers, Announcements, Alerts
// ---------------------------------------------------------------

// Broadcast only to Users
router.post("/offer/users", isAuth, isAdmin, async (req, res) => {
  try {
    const result = await sendToRole("user", req.body.title, req.body.body);
    return res.json({ success: true, sent: result.sentCount });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Broadcast only to Vendors
router.post("/offer/vendors", isAuth, isAdmin, async (req, res) => {
  try {
    const result = await sendToRole("vendor", req.body.title, req.body.body);
    return res.json({ success: true, sent: result.sentCount });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 🔥 TEST ROUTE (Remove in production)
router.post("/test-trigger", async (req, res) => {
  console.log("🧪 Test Notification Triggered");
  const { role, title, body } = req.body;
  const result = await sendToRole(role || "user", title || "Test Notification", body || "This is a test message from backend.");
  res.json(result);
});

export default router;
