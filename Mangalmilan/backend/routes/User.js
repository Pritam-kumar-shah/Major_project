import express from 'express';
import rateLimit from 'express-rate-limit'; // 
import isAuth from '../middleware/isAuth.js';
import { getCurrentUser } from '../controller/user.js';

let router = express.Router();

const apiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, 
    max: 50, 
    standardHeaders: true,
    legacyHeaders: false,
});

router.get("/getCurrentUser", apiLimiter, isAuth, getCurrentUser);

export default router;