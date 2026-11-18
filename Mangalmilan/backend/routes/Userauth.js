// routes/Userauth.js

import express from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from "../controller/Userauth.js";
import isAuth from '../middleware/isAuth.js'; // ✅ isAuth middleware ko import karein

const router = express.Router();

// --- Rate Limiters ---
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: 'Too many requests, please try again after 15 minutes',
});

const strictLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, 
    max: 10, 
    message: 'Too many login attempts or OTP requests. Please try again later.',
});

router.get("/me", isAuth, (req, res) => {
    res.status(200).json({ success: true, user: req.user });
});

// --- Signup Routes ---
router.post("/signup", authLimiter, authController.signup);
router.post("/vendor/signup", authLimiter, authController.vendorSignup);

// --- OTP Routes ---
router.post("/verifyotp", authLimiter, authController.verifyOtp);
router.post("/resendotp", strictLimiter, authController.resendOtp);

// --- Login Routes ---
router.post("/login", strictLimiter, authController.userLogin);
router.post("/vendor/login", strictLimiter, authController.vendorLogin);

// --- Google Login ---
router.post("/googleLogin", authLimiter, authController.googleLogin);

// --- Logout ---
router.post("/logout",isAuth, authController.logout);

// --- Forget / Reset Password Routes ---
router.post("/forget-password", strictLimiter, authController.forgetPassword); 
router.post("/reset-password", strictLimiter, authController.resetPassword); 

export default router;