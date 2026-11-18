import NotificationToken from "../models/NotificationToken.js";

/**
 * 1️⃣ App open → token save/update
 */
export const saveFcmToken = async (req, res) => {
  try {
    const { fcmToken, role = "visitor" } = req.body;

    if (!fcmToken) {
      return res.status(400).json({ success: false, message: "Token required" });
    }

    const tokenDoc = await NotificationToken.findOneAndUpdate(
      { fcmToken },
      { role, lastSeenAt: new Date() },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Token synced",
      data: tokenDoc
    });

  } catch (err) {
    console.error("save token error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


/**
 * 2️⃣ Login → token ko owner se link kar do
 */
export const updateTokenWithUser = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const authId = req.user._id;  
    console.log("🔥 JWT USER:", req.user);   // 🔥 LOGIN USER का _id

    if (!fcmToken) {
      return res.status(400).json({ success: false, message: "FCM token missing" });
    }

    // 🔍 Role auto detect (backend से)
    let modelType = req.user.role === "vendor" ? "VendorProfile" : "User";

    const tokenDoc = await NotificationToken.findOneAndUpdate(
      { fcmToken },
      {
        ownerId: authId,     // 💾 LOGIN USER का _id save
        role: req.user.role, // "user" या "vendor"
        onModel: modelType,  // reference model
        lastSeenAt: new Date()
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "User/Vendor linked with FCM token",
      data: tokenDoc
    });

  } catch (err) {
    console.log("attach error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

