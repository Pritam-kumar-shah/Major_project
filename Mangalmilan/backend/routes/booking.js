import express from "express";

// Controller functions
import {
  createBooking,
  getUserBookings,
  getVendorBookings,
  completeBookingByCode,
  updateBookingStatusByVendorId,
  cancelBooking
} from "../controller/Booking.js";

// Middleware
import isAuth from "../middleware/isAuth.js";
import isVendor from "../middleware/isVendor.js";

const router = express.Router();

// =================================================================
// 👤 USER ROUTES (Customers)
// =================================================================

router.post("/", isAuth, createBooking);

router.get("/my-bookings", isAuth, getUserBookings);

router.patch("/:bookingId/cancel", isAuth, cancelBooking);

// =================================================================
// 🏪 VENDOR ROUTES
// =================================================================

router.get("/vendor", isAuth, isVendor, getVendorBookings);

router.patch("/vendor/:bookingId/status", isAuth, isVendor, updateBookingStatusByVendorId);

router.patch("/vendor/:bookingId/complete", isAuth, isVendor, completeBookingByCode);

export default router;
