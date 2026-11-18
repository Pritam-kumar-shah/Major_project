import VendorProfile from "../models/VendorProfile.js";
import Category from "../models/Category.js";
import Service from "../models/Service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { uploadToCloudinary, deleteFileFromCloudinary } from "../utils/cloudinary.js";
import mongoose from 'mongoose';
import DailyAnalytics from '../models/Analytics.js';
import { CURRENT_TNC_VERSION } from '../config/constants.js'; 

// --- Helper Function: Record Profile View ---
const recordProfileView = async (vendorId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(vendorId)) return;
        
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0); 

        await DailyAnalytics.findOneAndUpdate(
            { 
                vendor: new mongoose.Types.ObjectId(vendorId), 
                date: today 
            },
            { 
                $inc: { viewCount: 1 } 
            },
            { 
                upsert: true, 
                new: true 
            }
        );
    } catch (error) {
        // ट्रैकिंग फ़ेलियर को शांत तरीक़े से हैंडल करें
        console.error("Profile view tracking failed:", error);
    }
};
export const recordView = asyncHandler(async (req, res) => {
    const vendorId = req.params.id;
    // req.user._id is available because isAuth middleware runs before this.
    const visitorId = req.user?._id; 
    
    if (!visitorId || !mongoose.Types.ObjectId.isValid(visitorId)) {
        // यह सुनिश्चित करता है कि केवल वैध लॉगिन यूज़र ही ट्रैक हो
        return res.status(401).json({ message: "Authentication required to record unique view." });
    }

    // recordProfileView को यूज़र ID के साथ कॉल करें
    await recordProfileView(vendorId, visitorId);
    
    res.status(200).json({ message: "Unique view recorded successfully." });
});


export const getVendorProfileByUserId = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid User ID.");
    }

    try {
        // User ID का उपयोग करके VendorProfile को ढूँढें
        const profile = await VendorProfile.findOne({ user: userId })
            .populate('category', 'name')
            .lean();

        if (!profile) {
            // 404 भेजें - यह वह प्रतिक्रिया है जिसकी AuthContext को आवश्यकता है
            throw new ApiError(404, "Vendor Profile record not found.");
        }

        res.status(200).json({ success: true, profile });

    } catch (error) {
        console.error("Error fetching vendor profile by user ID:", error);
        res.status(500).json({ success: false, message: 'Internal server error while fetching profile.' });
    }
});


export const createVendorProfile = asyncHandler(async (req, res) => {

  const userId = req.user?._id;
  if (!userId) throw new ApiError(401, "User not found. Please log in again.");

  const { businessName, category: categoryId, about, contactPhone, services: servicesData,tncAccepted } = req.body;

  if (!tncAccepted) {
    throw new ApiError(400, "Agreement to the Terms and Conditions and Privacy Policy is mandatory.");
  }
  if (!businessName || !categoryId || !contactPhone || !req.body.location) {
    throw new ApiError(400, "fill the all data");
  }

  let location, details;
  try {
    location = JSON.parse(req.body.location);
    details = req.body.details ? JSON.parse(req.body.details) : {};
  } catch {
    throw new ApiError(400, "Location ya details ka format galat hai.");
  }

  if (!req.file) throw new ApiError(400, "Profile image zaroori hai.");

  const uploadedImage = await uploadToCloudinary(req.file.path);

  let serviceIds = [];
  if (servicesData) {
    let servicesArray;
    try {
      servicesArray = JSON.parse(servicesData);
    } catch {
      throw new ApiError(400, "Services ka format galat hai.");
    }

    serviceIds = await Promise.all(
      servicesArray.map(async (s) => {
        const priceNum = Number(s.price);
        if (!s.name || isNaN(priceNum)) {
          throw new ApiError(400, "Har service ka name aur price valid hona chahiye.");
        }

        const service = await Service.create({
          name: s.name,
          basePrice: priceNum,
          vendor: userId,
        });

        return service._id;
      })
    );
  }

  const newProfile = await VendorProfile.create({
    user: userId,
    businessName,
    profileImage: uploadedImage.url,
    profileImageId: uploadedImage.public_id,
    category: categoryId,
    about,
    location,
    contactPhone,
    details,
    services: serviceIds,
    tncAccepted: true, 
    tncAcceptanceDate: new Date(), 
    tncVersion: CURRENT_TNC_VERSION,
  });

  res.status(201).json(newProfile);
});


export const updateMyProfile = asyncHandler(async (req, res) => {
// ... unchanged logic
  const profile = await VendorProfile.findOne({ user: req.user._id });
  if (!profile) throw new ApiError(404, "Vendor profile not found.");

  const updateData = { ...req.body };

  if (updateData.location) updateData.location = JSON.parse(updateData.location);
  if (updateData.details) updateData.details = JSON.parse(updateData.details);

  // Handle services
  if (updateData.services) {
    let servicesArray;
    try {
      servicesArray = JSON.parse(updateData.services);
    } catch {
      throw new ApiError(400, "Services ka format galat hai.");
    }

    // Delete old services
    if (profile.services?.length > 0) {
      await Service.deleteMany({ _id: { $in: profile.services } });
    }

    // Save new services
    const serviceIds = await Promise.all(
      servicesArray.map(async (s) => {
        const priceNum = Number(s.price);
        if (!s.name || isNaN(priceNum)) {
          throw new ApiError(400, "Har service ka name aur price valid hona chahiye.");
        }

        const service = await Service.create({
          name: s.name,
          basePrice: priceNum,
          vendor: req.user._id,
        });

        return service._id;
      })
    );

    updateData.services = serviceIds;
  }

  // Handle profile image
  if (req.file) {
    if (profile.profileImageId) await deleteFileFromCloudinary(profile.profileImageId);

    const uploadedImage = await uploadToCloudinary(req.file.path);
    updateData.profileImage = uploadedImage.url;
    updateData.profileImageId = uploadedImage.public_id;
  }

  const updatedProfile = await VendorProfile.findByIdAndUpdate(
    profile._id,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  res.status(200).json(updatedProfile);
});


export const getMyProfile = asyncHandler(async (req, res) => {
  if (!req.user?._id) throw new ApiError(401, "Authentication failed.");

  const profile = await VendorProfile.findOne({ user: req.user._id })
    .populate('category', 'name applicableFields')
    .populate('services');

  if (!profile) return res.status(404).json({ message: "Vendor profile not found." });

  res.status(200).json(profile);
});


export const getVendorById = asyncHandler(async (req, res) => {
  const profile = await VendorProfile.findById(req.params.id)
    .populate('category', 'name')
    .populate('services');

  if (!profile || profile.status !== 'approved') {
    throw new ApiError(404, "Vendor not found or is not approved yet.");
  }

  // 🔑 CRITICAL FIX: Record the view asynchronously for public access
  // यह हर पेज लोड को गिनेगा (यूनिक विज़िटर नहीं)
  recordProfileView(req.params.id); 

  res.status(200).json(profile);
});


export const getAllVendors = asyncHandler(async (req, res) => {
// ... unchanged logic
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const skip = (page - 1) * limit;

  const query = { status: 'approved' };
  if (req.query.category) query.category = req.query.category;
  if (req.query.city) query['location.city'] = { $regex: req.query.city, $options: 'i' };

  const vendors = await VendorProfile.find(query)
    .populate('category', 'name')
    .populate('services')
    .sort({ isFeatured: -1, averageRating: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await VendorProfile.countDocuments(query);

  res.status(200).json({
    vendors,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalVendors: total
  });
});


export const deleteMyProfile = asyncHandler(async (req, res) => {
// ... unchanged logic
  const profile = await VendorProfile.findOne({ user: req.user._id });
  if (!profile) throw new ApiError(404, "Profile not found.");

  if (profile.profileImageId) await deleteFileFromCloudinary(profile.profileImageId);

  if (profile.services?.length > 0) {
    await Service.deleteMany({ _id: { $in: profile.services } });
  }

  await profile.deleteOne();

  res.status(200).json({ message: "Profile deleted successfully." });
});
