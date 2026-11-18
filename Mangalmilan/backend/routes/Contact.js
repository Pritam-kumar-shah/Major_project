import express from "express";
import {
  createEnquiry,
  getAllEnquiries,
  getEnquiryById,
  updateEnquiryStatus,
} from "../controller/Contact.js";
import isAuth from "../middleware/isAuth.js"
import isAdmin from "../middleware/isAdmin.js"

const router = express.Router();

/* -------------------------
   PUBLIC ROUTE
-------------------------- */
// Create new enquiry/contact
router.post("/contact", createEnquiry);

/* -------------------------
   ADMIN ROUTES
-------------------------- */
// Get all enquiries
router.get("/contact/all",isAuth,isAdmin, getAllEnquiries);

// Get single enquiry by ID
router.get("/contact/:id",isAuth,isAdmin, getEnquiryById);

// Update enquiry status (Pending → Complete)
router.put("/contact/status/:id",isAuth,isAdmin, updateEnquiryStatus);

export default router;
