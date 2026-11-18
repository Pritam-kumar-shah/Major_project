import mongoose from 'mongoose';
import Review from '../models/Review.js';
import VendorProfile from '../models/VendorProfile.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

// =================================================================
// HELPER FUNCTION: Update Vendor's Average Rating
// =================================================================

async function updateVendorRating(vendorId) {
  const stats = await Review.aggregate([
    {
      $match: { vendor: new mongoose.Types.ObjectId(vendorId) },
    },
    {
      $group: {
        _id: '$vendor',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await VendorProfile.findByIdAndUpdate(vendorId, {
      averageRating: stats[0].averageRating,
      reviewCount: stats[0].reviewCount,
    });
  } else {
    await VendorProfile.findByIdAndUpdate(vendorId, {
      averageRating: 0,
      reviewCount: 0,
    });
  }
}

// =================================================================
// 1. CREATE A NEW REVIEW
// =================================================================

export const createReview = asyncHandler(async (req, res) => {
  const { vendorId, rating, comment } = req.body;
  const userId = req.user._id;
  if (!vendorId || !rating || !comment) {
    throw new ApiError(400, 'Vendor, rating, and comment are required.');
  }

  

  let uploadedImage = null;
  if (req.file) {
    uploadedImage = await uploadToCloudinary(req.file.path);
  }

  const review = await Review.create({
    vendor: vendorId,
    user: userId,
    rating: Number(rating),
    comment,
    image: uploadedImage?.url,
    imageId: uploadedImage?.public_id,
  });

  await updateVendorRating(vendorId);

  res.status(201).json({ message: 'Review submitted successfully!', review });
});

// =================================================================
// 2. GET ALL REVIEWS FOR A VENDOR
// =================================================================

export const getReviewsForVendor = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const reviews = await Review.find({ vendor: vendorId })
    .populate('user', 'name') 
    .sort({ createdAt: -1 }); 

  res.status(200).json(reviews);
});

// =================================================================
// 3. LIKE / UNLIKE A REVIEW
// =================================================================

export const toggleLikeReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user._id;

  const review = await Review.findById(reviewId);
  if (!review) {
    throw new ApiError(404, 'Review not found.');
  }

  const isLiked = review.likes.includes(userId);

  if (isLiked) {
    review.likes.pull(userId);
  } else {
    review.likes.push(userId);
  }

  await review.save();
  res.status(200).json(review);
});

// =================================================================
// 4. ADD A VENDOR REPLY TO A REVIEW
// =================================================================

export const addVendorReply = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { text } = req.body;
  const userId = req.user._id; 

  if (!text || !text.trim()) {
    throw new ApiError(400, 'Reply text is required.');
  }

  const review = await Review.findById(reviewId);
  if (!review) {
    throw new ApiError(404, 'Review not found.');
  }
  
  // Security Check: Is the user replying actually the owner of this review's vendor profile?
  const vendorProfile = await VendorProfile.findOne({ user: userId });
  if (!vendorProfile || vendorProfile._id.toString() !== review.vendor.toString()) {
      throw new ApiError(403, "You are not authorized to reply to this review.");
  }

  if (review.vendorReply) {
    throw new ApiError(400, 'You have already replied to this review.');
  }

  review.vendorReply = { text };
  await review.save();

  res.status(200).json(review);
});