// backend/controller/Admin/adminVendorController.js
import VendorProfile from "../../models/VendorProfile.js";
import User from "../../models/User.js";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";

// ===========================================
// 1. Core Functions (Existing)
// ===========================================

// Get all pending vendors
export const getPendingVendors = asyncHandler(async (req, res) => {
    const pendingVendors = await VendorProfile.find({ status: "pending" }).populate("user");
    res.status(200).json(pendingVendors);
});

// Approve vendor
export const approveVendor = asyncHandler(async (req, res) => {
    const vendor = await VendorProfile.findById(req.params.id);
    if (!vendor) throw new ApiError(404, "Vendor not found");

    // Update profile: status + isFeatured
    vendor.status = "approved";
    vendor.isFeatured = true; 
    await vendor.save();

    // Update corresponding user
    const user = await User.findById(vendor.user);
    if (user) {
        user.isAdminApproved = true;
        user.isVerified = true; 
        await user.save();
    }

    res.status(200).json({ message: "Vendor approved successfully", vendor });
});

// Reject vendor
export const rejectVendor = asyncHandler(async (req, res) => {
    const vendor = await VendorProfile.findById(req.params.id);
    if (!vendor) throw new ApiError(404, "Vendor not found");

    // Update profile: status
    vendor.status = "rejected";
    vendor.isFeatured = false;
    await vendor.save();

    // Update corresponding user
    const user = await User.findById(vendor.user);
    if (user) {
        user.isAdminApproved = false;
        await user.save();
    }

    res.status(200).json({ message: "Vendor rejected successfully", vendor });
});

// ===========================================
// 2. New History & Details Functions
// ===========================================



export const getVendorHistory = asyncHandler(async (req, res) => {
    // status 'approved' या 'rejected' वाले वेंडरों को फ़ेच करें
    const historyVendors = await VendorProfile.find({ 
        status: { $in: ['approved', 'rejected'] } 
    })
    // केवल आवश्यक फ़ील्ड्स चुनें (Performance optimization के लिए)
    .select('_id businessName status location updatedAt profileImage user') 
    // user details को जोड़ें
    .populate('user', 'name email') 
    // हाल के वेंडरों को पहले दिखाने के लिए sort करें
    .sort({ updatedAt: -1 }); 

    if (historyVendors.length === 0) {
        return res.status(200).json([]);
    }

    res.status(200).json(historyVendors);
});


export const getVendorDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const vendor = await VendorProfile.findById(id)
        .populate('user', 'name email phone'); 

    if (!vendor) {
        throw new ApiError(404, "Vendor details not found for this ID.");
    }

    res.status(200).json(vendor);
});

// ===========================================
// 3. Export
// ===========================================

export default { 
    getPendingVendors, 
    approveVendor, 
    rejectVendor, 
    getVendorHistory,
    getVendorDetails  
};