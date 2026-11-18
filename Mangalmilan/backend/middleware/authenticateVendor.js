import isAuth from "./isAuth.js"; 
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";


const authenticateVendor = asyncHandler(async (req, res, next) => {
    
    if (!req.user) {
        throw new ApiError(401, "Authentication failed. User data missing.");
    }

    // 1. Role Check
    if (req.user.role !== 'vendor') {
        throw new ApiError(403, "Access denied. Sirf vendors ko hi portfolio upload ki anumati hai.");
    }

    next();
});

export const isVendor = [
    isAuth,             
    authenticateVendor  
];
