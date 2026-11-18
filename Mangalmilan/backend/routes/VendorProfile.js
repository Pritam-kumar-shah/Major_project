import express from "express";
import * as vendorController from "../controller/VendorProfile.js";
import isAuth from "../middleware/isAuth.js"; 
import isVendor from "../middleware/isVendor.js"; 
import upload from "../middleware/upload.middleware.js"; 

const router = express.Router();


router.post("/", isAuth, upload.single("profileImage"), vendorController.createVendorProfile);

router.get("/me/profile", isAuth, isVendor, vendorController.getMyProfile);
router.put("/update", isAuth, isVendor, upload.single("profileImage"), vendorController.updateMyProfile);
router.delete("/delete", isAuth, isVendor, vendorController.deleteMyProfile);

// --- PUBLIC ROUTES ---
router.get("/", vendorController.getAllVendors);
router.post("/record-view/:id", isAuth, vendorController.recordView); 
router.get("/:id", vendorController.getVendorById);

export default router;