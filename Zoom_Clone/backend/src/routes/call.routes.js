import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";

import {
  saveCall,
  getCallHistory,
  getCallById,
} from "../controller/call.controller.js";

const router = express.Router();

// Save Call
router.post("/save", authMiddleware, saveCall);

// Get Call History
router.get("/history", authMiddleware, getCallHistory);

// Get Single Call
router.get("/:id", authMiddleware, getCallById);

export default router;
