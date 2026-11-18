import express from "express";
import { 
  createEnquiry, 
  getUserEnquiries, 
  getVendorEnquiries, 
  updateEnquiryStatus 
} from "../controller/enquiryController.js";
import authMiddleware from "../middleware/isAuth.js";

const router = express.Router();

router.post("/", authMiddleware, createEnquiry);

router.get("/me", authMiddleware, getUserEnquiries);

router.get("/vendor/:vendorId", authMiddleware, getVendorEnquiries);

router.patch("/:enquiryId", authMiddleware, updateEnquiryStatus);

export default router;
