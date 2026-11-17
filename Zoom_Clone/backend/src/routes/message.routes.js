import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";

import {
  sendMessage,
  getConversation,
  markAsSeen,
  getRecentChats,
} from "../controller/message.controller.js";

const router = express.Router();

// Send Message
router.post("/send", authMiddleware, sendMessage);

// Get Conversation Between Current User & Another User
router.get("/conversation/:userId", authMiddleware, getConversation);

// Get Recent Chats
router.get("/recent", authMiddleware, getRecentChats);

// Mark Message As Seen
router.put("/seen/:messageId", authMiddleware, markAsSeen);

export default router;
