import express from 'express';
import {
  getProfile,
  createOrUpdateProfile,
  toggleFavoriteVendor,
  getFavoriteVendors    
} from '../controller/UserProfile.js';
import isAuth from '../middleware/isAuth.js';

const router = express.Router();

// ===============================================
// PROFILE ROUTES
// ===============================================
router.get('/', isAuth, getProfile);

router.post('/', isAuth, createOrUpdateProfile);


// ===============================================
// FAVORITES (SHORTLIST) ROUTES
// ===============================================

router.patch('/favorites/:vendorId', isAuth, toggleFavoriteVendor);

router.get('/favorites', isAuth, getFavoriteVendors);


export default router;