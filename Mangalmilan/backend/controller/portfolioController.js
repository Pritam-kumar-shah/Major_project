import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinaryV.js";
import Portfolio from "../models/PortfolioAlbum.js";
import VendorProfile from "../models/VendorProfile.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import fs from "fs/promises";
import mongoose from "mongoose";

const MAX_IMAGE_COUNT = 10;
const MAX_VIDEO_COUNT = 5;

// ===================================================================
// 🛠️ HELPER FUNCTIONS (Unchanged)
// ===================================================================

const getAuthUserId = (req) => {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
        throw new ApiError(401, "User ID not found in JWT payload. Please log in.");
    }
    return userId;
};

const getVendorProfileId = async (req) => {
    const authUserId = getAuthUserId(req);
    const vendorProfile = await VendorProfile.findOne({ user: authUserId }).select("_id");

    if (!vendorProfile) {
        throw new ApiError(404, "Vendor profile not found for this user.");
    }
    return vendorProfile._id;
};


// ===================================================================
// 📚 BASE GET PORTFOLIO LOGIC (Internal Function - Unchanged)
// ===================================================================
const fetchPortfolioByVendorId = async (vendorId) => {
    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
        return { success: false, message: "Invalid Vendor ID format.", data: [] };
    }

    const portfolio = await Portfolio.findOne({ vendorId }).select('assets imageCount videoCount');

    if (!portfolio) {
        return { success: true, count: 0, data: [], imageCount: 0, videoCount: 0 };
    }

    return {
        success: true,
        count: portfolio.assets.length,
        data: portfolio.assets,
        imageCount: portfolio.imageCount || 0,
        videoCount: portfolio.videoCount || 0
    };
}


// ===================================================================
// 1. UPLOAD ASSETS (POST /)
// ✅ FIX APPLIED: Local files are unlinked immediately after processing.
// ===================================================================
const uploadMultiplePortfolioAssets = asyncHandler(async (req, res) => {
    const localFiles = req.files || [];
    
    const successfulAssets = [];
    let newImages = 0;
    let newVideos = 0;
    
    const vendorId = await getVendorProfileId(req);
    
    if (localFiles.length === 0) {
        throw new ApiError(400, "No files uploaded.");
    }

    const portfolio = await Portfolio.findOne({ vendorId });
    let currentImages = portfolio ? portfolio.imageCount : 0;
    let currentVideos = portfolio ? portfolio.videoCount : 0;

    for (const file of localFiles) {
        const isImage = file.mimetype.startsWith("image");
        const isVideo = file.mimetype.startsWith("video");
        
        try {
            if ((isImage && currentImages + newImages >= MAX_IMAGE_COUNT) || 
                (isVideo && currentVideos + newVideos >= MAX_VIDEO_COUNT)) 
            {
                console.log(`🚫 Limit exceeded for: ${file.originalname}`);
                continue; 
            }

            const result = await uploadOnCloudinary(file.path, `vendor-portfolios/${vendorId}`);

            if (result) {
                successfulAssets.push({
                    assetUrl: result.secure_url,
                    cloudinaryPublicId: result.public_id,
                    resourceType: result.resource_type,
                    caption: req.body.caption || "",
                });
                if (isImage) newImages++;
                if (isVideo) newVideos++;
                console.log(`✅ Uploaded: ${result.secure_url}`);
            } else {
                 console.error(`❌ Cloudinary upload failed for: ${file.originalname} (Result was null)`);
            }
        } catch (uploadError) {
            console.error(`❌ Cloudinary API error for ${file.originalname}:`, uploadError.message);
        } finally {
            await fs.unlink(file.path).catch(err => console.error(`Failed to unlink local file ${file.path}: ${err.message}`));
        }
    } // End of for loop

    if (successfulAssets.length === 0 && localFiles.length > 0) {
        throw new ApiError(500, "All file uploads failed. Check Cloudinary connection.");
    } else if (successfulAssets.length === 0) {
        return res.status(400).json({ success: false, message: "No assets uploaded. Max limits reached or file format unsupported." });
    }

    const updatedPortfolio = await Portfolio.findOneAndUpdate(
        { vendorId },
        {
            $push: { assets: { $each: successfulAssets } },
            $inc: { imageCount: newImages, videoCount: newVideos },
        },
        { new: true, upsert: true }
    );

    res.status(201).json({
        success: true,
        message: `${successfulAssets.length} assets uploaded successfully.`,
        data: updatedPortfolio.assets,
        imageCount: updatedPortfolio.imageCount,
        videoCount: updatedPortfolio.videoCount,
    });
});


// ------------------------------------------------------------------
// 2-4. GET, DELETE (Logic remains the same)
// ------------------------------------------------------------------
const getVendorPortfolioPrivate = asyncHandler(async (req, res) => {
    const vendorId = await getVendorProfileId(req);
    const result = await fetchPortfolioByVendorId(vendorId);
    return res.status(200).json(result);
});

const getVendorPortfolioPublic = asyncHandler(async (req, res) => {
    const { vendorId } = req.params;
    if (!vendorId) { throw new ApiError(400, "Vendor ID is required in URL parameters for public view."); }
    const result = await fetchPortfolioByVendorId(vendorId);
    if (!result.success && result.message === "Invalid Vendor ID format.") { return res.status(400).json(result); }
    return res.status(200).json(result);
});

const deletePortfolioAsset = asyncHandler(async (req, res) => {
    const { assetId } = req.params;
    const vendorId = await getVendorProfileId(req); 
    const portfolio = await Portfolio.findOne({ vendorId });
    if (!portfolio) { throw new ApiError(404, "Portfolio not found."); }
    const asset = portfolio.assets.id(assetId);
    if (!asset) { throw new ApiError(404, "Asset not found in portfolio."); }
    const cloudResult = await deleteFromCloudinary(asset.cloudinaryPublicId, asset.resourceType);
    await Portfolio.updateOne(
        { vendorId },
        {
            $pull: { assets: { _id: assetId } },
            $inc: { [asset.resourceType === "image" ? "imageCount" : "videoCount"]: -1 },
        }
    );
    res.status(200).json({ success: true, message: "Asset deleted successfully." });
});


// ------------------------------------------------------------------
// 5. LIKE ASSET (PATCH /like/:assetId) - TOGGLE
// (Logic retained with safe type conversion)
// ------------------------------------------------------------------
const likePortfolioAsset = asyncHandler(async (req, res) => {
    const { assetId } = req.params;
    const userId = getAuthUserId(req); 
    const assetObjectId = new mongoose.Types.ObjectId(assetId);

    // --- STEP 1: Runtime Cleanup / Type Correction (Prevents the 'int' error) ---
    await Portfolio.updateOne(
        { 
            "assets._id": assetObjectId, 
            "assets.likes": { $not: { $type: 4 } } // BSON type 4 is Array
        },
        { 
            $set: { "assets.$.likes": [] } 
        }
    ).catch(err => {
        console.warn(`[CLEANUP WARNING] Failed to convert 'likes' field for asset ${assetId}. Proceeding with update.`, err.message);
    });

    // --- STEP 2: Toggle Like/Unlike Operation ---
    const portfolio = await Portfolio.findOne({ "assets._id": assetObjectId });

    if (!portfolio) { throw new ApiError(404, 'Portfolio asset not found.'); }

    const asset = portfolio.assets.id(assetId);

    const currentLikes = Array.isArray(asset.likes) ? asset.likes : [];
    const userHasLiked = currentLikes.includes(userId);

    let updateOperation;
    let message;

    if (userHasLiked) {
        updateOperation = { $pull: { "assets.$.likes": userId } };
        message = 'Asset unliked successfully.';
    } else {
        updateOperation = { $push: { "assets.$.likes": userId } };
        message = 'Asset liked successfully.';
    }

    const updatedPortfolio = await Portfolio.findOneAndUpdate(
        { "assets._id": assetObjectId },
        updateOperation,
        { new: true }
    );
    
    const updatedAsset = updatedPortfolio.assets.id(assetId);

    res.status(200).json({
        success: true,
        message,
        likes: Array.isArray(updatedAsset.likes) ? updatedAsset.likes : [], 
        assetId: updatedAsset._id
    });
});


// ===================================================================
// FINAL EXPORTS 
// ===================================================================
export {
    uploadMultiplePortfolioAssets,
    getVendorPortfolioPrivate, 
    getVendorPortfolioPublic,  
    deletePortfolioAsset,
    likePortfolioAsset
};