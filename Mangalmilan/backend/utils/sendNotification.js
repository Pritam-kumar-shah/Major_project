// import admin from "firebase-admin";
// import NotificationToken from "../models/NotificationToken.js";
// import mongoose from "mongoose";

// /**
//  * INTERNAL HELPER — DO NOT EXPORT DIRECTLY
//  * -----------------------------------------------------------
//  */
// const sendMulticastNotification = async (query, title, body, extraData = {}) => {
//   try {
//     console.log("\n-------------------- 📢 NOTIFICATION DEBUG START --------------------");
//     console.log("🔍 Query used:", query);

//     // Find tokens of user/vendor
//     const tokenDocs = await NotificationToken.find(query).select(
//       "fcmToken ownerId role lastSeenAt"
//     );

//     console.log(`📌 Tokens Found: ${tokenDocs.length}`);

//     if (!tokenDocs.length) {
//       console.log("❌ No tokens found with this query!");
//       console.log("--------------------- 📢 NOTIFICATION DEBUG END ---------------------\n");
//       return { success: false, message: "No tokens found" };
//     }

//     const tokens = tokenDocs.map((t) => t.fcmToken);

//     console.log("🎯 Target Tokens:");
//     tokenDocs.forEach((doc, idx) => {
//       console.log(`   ${idx + 1}. ownerId: ${doc.ownerId} (${doc.role}) => token: ${doc.fcmToken}`);
//     });

//     const message = {
//   notification: { title, body },
//   data: Object.fromEntries(
//     Object.entries(extraData).map(([k, v]) => [k, String(v)])
//   ),
//   tokens,
//   android: { notification: { channelId: "default" }},
//   webpush: { headers: { Urgency: "high" }},
// };

//     console.log("📨 Sending Payload:");
//     console.log(JSON.stringify(message, null, 2));

//     const response = await admin.messaging().sendEachForMulticast(message);

//     console.log("\n📊 FCM Response Summary:");
//     console.log(`   ✔️ Success: ${response.successCount}`);
//     console.log(`   ❌ Failed : ${response.failureCount}`);

//     // Remove invalid tokens
//     if (response.failureCount > 0) {
//       const invalidTokens = [];

//       response.responses.forEach((resp, idx) => {
//         if (!resp.success) {
//           console.log(`⚠️ Invalid Token Detected: ${tokens[idx]} — Reason: ${resp.error?.message}`);
//           invalidTokens.push(tokens[idx]);
//         }
//       });

//       if (invalidTokens.length) {
//         await NotificationToken.deleteMany({ fcmToken: { $in: invalidTokens } });
//         console.log(`🗑 Removed invalid tokens: ${invalidTokens.length}`);
//       }
//     }

//     console.log("--------------------- 📢 NOTIFICATION DEBUG END ---------------------\n");

//     return { success: true, sentCount: response.successCount };

//   } catch (error) {
//     console.error("🔥 FCM Sending Error:", error);
//     console.log("--------------------- 📢 NOTIFICATION DEBUG END ---------------------\n");
//     return { success: false, error: error.message };
//   }
// };


// /**
//  * -----------------------------------------------------------
//  * PUBLIC EXPORTS — CALL THESE IN CONTROLLERS
//  * -----------------------------------------------------------
//  */

// // ⭐ Vendor ko notification — ID hamesha "User._id"
// export const sendToVendor = async (vendorUserId, title, body, extraData = {}) => {
//   const formattedId = new mongoose.Types.ObjectId(vendorUserId);
//   console.log(`\n🚚 sendToVendor() called for Vendor USER ID: ${formattedId}`);

//   return await sendMulticastNotification(
//     { ownerId: formattedId, role: "vendor" },
//     title,
//     body,
//     extraData
//   );
// };

// // ⭐ User ko notification
// export const sendToUser = async (userId, title, body, extraData = {}) => {
//   const formattedId = new mongoose.Types.ObjectId(userId);
//   console.log(`\n👤 sendToUser() called for USER ID: ${formattedId}`);

//   return await sendMulticastNotification(
//     { ownerId: formattedId, role: "user" },
//     title,
//     body,
//     extraData
//   );
// };

// // ⭐ Broadcast by role
// export const sendToRole = async (role, title, body, extraData = {}) => {
//   console.log(`\n🌍 sendToRole() called for ROLE: ${role}`);
//   return await sendMulticastNotification(
//     { role },
//     title,
//     body,
//     extraData
//   );
// };




// utils/sendNotification.js
//------------------------------------------------------
// Firebase Notification System (Vendor + User)
// Handles: send, debug logs, invalid token cleanup
//------------------------------------------------------

import admin from "firebase-admin";
import NotificationToken from "../models/NotificationToken.js";
import mongoose from "mongoose";

//------------------------------------------------------
// INTERNAL MAIN FUNCTION — NOT EXPORTED
//------------------------------------------------------
const sendMulticastNotification = async (query, title, body, extraData = {}) => {
  console.log("\n==================== 📢 NOTIFICATION DEBUG START ====================\n");

  try {
    console.log("🔍 Query:", query);

    // STEP-1: find tokens
    const tokenDocs = await NotificationToken.find(query).select(
      "fcmToken ownerId role lastSeenAt"
    );

    console.log(`📌 Tokens Found: ${tokenDocs.length}`);

    if (!tokenDocs.length) {
      console.log("❌ No tokens found for this query.\n");
      console.log("===================== 📢 NOTIFICATION DEBUG END =====================\n");
      return { success: false, message: "No tokens found" };
    }

    const tokens = tokenDocs.map((t) => t.fcmToken);

    console.log("\n🎯 Target Tokens:");
    tokenDocs.forEach((doc, idx) => {
      console.log(
        `   ${idx + 1}. ownerId=${doc.ownerId} | role=${doc.role} | token=${doc.fcmToken}`
      );
    });

    // STEP-2: payload
    // 💡 CHANGE: Send "Data Message" only. This forces the Service Worker to handle the display
    // manually preventing the browser from swallowing it or showing a default duplicate.
    const message = {
      // notification: { title, body }, // ❌ Commented out to force SW handling
      data: {
        title,
        body,
        ...Object.fromEntries(Object.entries(extraData).map(([k, v]) => [k, String(v)]))
      },
      tokens,
      android: { priority: "high" },
      webpush: {
        headers: { Urgency: "high" },
        fcmOptions: { link: "/" }
      },
    };

    console.log("\n📨 Sending Payload:\n", JSON.stringify(message, null, 2));

    // STEP-3: send
    const response = await admin.messaging().sendEachForMulticast(message);

    console.log("\n📊 FCM Response Summary:");
    console.log(`   ✔️ Success: ${response.successCount}`);
    console.log(`   ❌ Failed : ${response.failureCount}`);

    // STEP-4: remove invalid tokens
    if (response.failureCount > 0) {
      const invalidTokens = [];

      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const reason = resp.error?.message;
          console.log(`   ⚠️ Failed Token: ${tokens[idx]}`);
          console.log(`      └─ Reason: ${reason}`);

          // Real invalid reason check
          if (
            reason.includes("Requested entity was not found") ||
            reason.includes("invalid") ||
            reason.includes("mismatch")
          ) {
            invalidTokens.push(tokens[idx]);
          }
        }
      });

      if (invalidTokens.length > 0) {
        await NotificationToken.deleteMany({ fcmToken: { $in: invalidTokens } });
        console.log(`\n🧹 Cleaned invalid tokens from DB: ${invalidTokens.length}`);
      }
    }

    console.log("\n===================== 📢 NOTIFICATION DEBUG END =====================\n");

    return { success: response.successCount > 0, sent: response.successCount };

  } catch (err) {
    console.log("🔥 FCM Sending Error:", err.message);
    console.log("\n===================== 📢 NOTIFICATION DEBUG END =====================\n");
    return { success: false, error: err.message };
  }
};

//------------------------------------------------------
// PUBLIC EXPORTS — USE THESE IN CONTROLLERS
//------------------------------------------------------

// ⭐ Vendor ko notification (ID = USER._id)
export const sendToVendor = async (vendorUserId, title, body, extraData = {}) => {
  const formattedId = new mongoose.Types.ObjectId(vendorUserId);
  console.log(`\n🚚 sendToVendor() called for vendorUserId = ${formattedId}`);
  return await sendMulticastNotification(
    { ownerId: formattedId, role: "vendor" },
    title,
    body,
    extraData
  );
};

// ⭐ User ko notification
export const sendToUser = async (userId, title, body, extraData = {}) => {
  const formattedId = new mongoose.Types.ObjectId(userId);
  console.log(`\n👤 sendToUser() called for userId = ${formattedId}`);
  return await sendMulticastNotification(
    { ownerId: formattedId, role: "user" },
    title,
    body,
    extraData
  );
};

// ⭐ Broadcast by role
export const sendToRole = async (role, title, body, extraData = {}) => {
  console.log(`\n🌍 sendToRole() called for role = ${role}`);
  return await sendMulticastNotification(
    { role },
    title,
    body,
    extraData
  );
};
