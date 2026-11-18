import express from 'express';

import { 
    createReview, 
    getReviewsForVendor,
    toggleLikeReview,  
    addVendorReply     
} from '../controller/review.controller.js'; 

import isAuth from '../middleware/isAuth.js';
import isVendor from '../middleware/isVendor.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();

router.get('/vendor/:vendorId', getReviewsForVendor);


// =================================================================
// 👤 USER-ONLY ROUTES (Sirf Login User Hi Access Kar Sakta Hai)
// =================================================================

router.post('/', isAuth, upload.single('image'), createReview);

router.patch('/:reviewId/like', isAuth, toggleLikeReview);


// =================================================================
// 🏪 VENDOR-ONLY ROUTE (Sirf Vendor Hi Access Kar Sakta Hai)
// =================================================================

router.post('/:reviewId/reply', isAuth, isVendor, addVendorReply);


export default router;