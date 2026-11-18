import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import "./firebaseAdmin.js";

import cloudinary from "cloudinary";
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { setStaticFileHeaders } from './config/caching.js';

// --- Import All Your Routes ---
import UserauthRouter from "./routes/Userauth.js";
import UserRouter from "./routes/User.js";
import profileRoutes from './routes/userProfile.js'
import dashboardRoutes from './routes/userDashbord.js'
import VendorProfile from './routes/VendorProfile.js';
import vendorDashboardRoutes from "./routes/VendorDashboard.js";
import categoryRoutes from './routes/category.routes.js';
import reviewRoutes from './routes/review.routes.js';
import bookingRoutes from './routes/booking.js';
import EnquiryRoute from './routes/enquiry.js';
import portfolioRoute from './routes/portfolio.js';
import adminVendorRoutes from "./routes/Admin/adminVendorRoutes.js";
import productRoutes from './routes/productRoutes.js';
import ContactRoutes from './routes/Contact.js';
// import notificationRoutes from "./routes/notification.js";
import notificationRoutes from "./routes/notificationRoutes.js";


const app = express();
const port = process.env.PORT || 5000;

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- GLOBAL MIDDLEWARES (ORDER IS CRITICAL) ---
app.use(compression());

// (Moved Rate Limiter down for CORS support)

// 🟢 Optimization 2: Add Caching for static uploads
app.use('/uploads', express.static(path.join(path.resolve(), 'uploads'), {
    maxAge: 31536000000,
    setHeaders: setStaticFileHeaders
}));


// --- SECURITY AND CORS SETUP ---
app.use(helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));

const allowedOrigins = [
    'http://localhost:4173',
    'http://localhost:5173',
    'https://mangalmilan.in',
    'https://www.mangalmilan.in'
];

// 1. CORS Middleware (Handle authentication cookies)
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));


app.use(express.json({ limit: '300mb' }));
app.use(express.urlencoded({ extended: true, limit: '300mb' }));

app.use(cookieParser());

// 🛡️ Security: Restore Rate Limiting (Safe Config)
// Placed AFTER CORS so 429 errors are visible to frontend
import rateLimit from 'express-rate-limit';
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // Limit each IP to 300 requests per windowMs (Production Safe)
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}


// --- Route Definitions ---
app.use("/api/auth", UserauthRouter);
app.use("/api/user", UserRouter);
app.use('/api/profile', profileRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use("/api/admin", adminVendorRoutes);
app.use("/api/vendor/profile", VendorProfile)
app.use('/api/categories', categoryRoutes);
app.use("/api/vendor/dashboard", vendorDashboardRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/enquiry', EnquiryRoute);
app.use('/api/portfolio', portfolioRoute);
app.use('/api/v1', productRoutes);
app.use('/api', ContactRoutes);
// app.use("/api/notification", notificationRoutes);
app.use("/api/notification", notificationRoutes);
app.get("/", (req, res) => {
    res.status(200).json({ message: "Server is healthy and running!" });
});


// --- FINAL ERROR HANDLERS ---

app.use((req, res, next) => {
    res.status(404).json({ message: "API endpoint not found" });
});

// 2. Global Error Handler (Handles ApiError and 500 errors)
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || err.status || 500;

    // 🔴 Optimization 4: Production Error Messages
    let message = err.message || 'An internal server error occurred.';

    if (process.env.NODE_ENV === 'production' && statusCode === 500) {
        message = 'Server Error. Please try again later.';
    }

    if (statusCode >= 500 && process.env.NODE_ENV !== 'production') {
        console.error("Critical Backend Error:", err.stack);
    }

    res.status(statusCode).json({ message });
});


// --- START SERVER AND DB CONNECTION ---
const startServer = async () => {
    try {
        await connectDB();
        console.log("MongoDB connected successfully.");

        const server = app.listen(port, () => {
            console.log(`Server is listening on port: ${port}`);
        });

        server.setTimeout(600000);
        server.keepAliveTimeout = 600000;
        server.headersTimeout = 600000;

    } catch (error) {
        console.error("Failed to connect to the database. Server is not starting.", error);
        process.exit(1);
    }
};

startServer();
