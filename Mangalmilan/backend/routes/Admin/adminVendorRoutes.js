import express from "express";
import adminVendorController from "../../controller/Admin/adminVendorController.js";
import isAuth from "../../middleware/isAuth.js"
import isAdmin from "../../middleware/isAdmin.js"

const router = express.Router();

// ===============================================
// Vendor List & Details Routes (GET)
// ===============================================

router.get("/vendors/pending",isAuth,isAdmin, adminVendorController.getPendingVendors);

router.get("/vendors/history",isAuth,isAdmin, adminVendorController.getVendorHistory); 

router.get("/vendors/:id",isAuth,isAdmin, adminVendorController.getVendorDetails); 


// ===============================================
// Vendor Action Routes (PUT)
// ===============================================

router.put("/vendors/:id/approve",isAuth,isAdmin, adminVendorController.approveVendor);

router.put("/vendors/:id/reject",isAuth,isAdmin, adminVendorController.rejectVendor);

export default router;