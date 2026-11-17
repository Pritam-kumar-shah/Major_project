import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";

import {
  createMeeting,
  joinMeeting,
  getMeeting,
  endMeeting,
} from "../controller/meeting.js";

const router = express.Router();

router.post("/create", authMiddleware, createMeeting);

router.post("/join", authMiddleware, joinMeeting);

router.get("/:meetingId", authMiddleware, getMeeting);

router.put("/end/:meetingId", authMiddleware, endMeeting);

export default router;
