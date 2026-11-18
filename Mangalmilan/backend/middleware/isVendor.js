
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import VendorProfile from '../models/VendorProfile.js'; 

const isVendor = asyncHandler(async (req, res, next) => {
    // 1. Role Check
    if (!req.user || req.user.role !== 'vendor') { 
        throw new ApiError(403, 'Access denied. Only vendors can perform this action.');
    }

    const vendorProfile = await VendorProfile.findOne({ user: req.user._id }); 
    
    if (!vendorProfile) {
        throw new ApiError(403, 'Vendor profile not found or linked. Please complete your profile setup.');
    }

    req.vendorId = vendorProfile._id; 
    
    next();
});

export default isVendor;



