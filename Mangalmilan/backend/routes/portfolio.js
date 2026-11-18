// routes/portfolio.routes.js

import express from 'express';
import upload from '../middleware/multer.middlewareV.js';
import isAuth from '../middleware/isAuth.js';
import isVendor from '../middleware/isVendor.js';

import { 
    uploadMultiplePortfolioAssets, 
    getVendorPortfolioPrivate,  
    getVendorPortfolioPublic,   
    deletePortfolioAsset,
    likePortfolioAsset 
} from '../controller/portfolioController.js';

const router = express.Router();

router.post(
    '/',
    isAuth,
    isVendor, 
    upload.array('assets', 15), 
    uploadMultiplePortfolioAssets
);

router.get(
    '/',
    isAuth, 
    getVendorPortfolioPrivate
);

router.get(
    '/vendor/:vendorId', 
    getVendorPortfolioPublic 
);


router.delete(
    '/asset/:assetId',
    isAuth,
    isVendor,
    deletePortfolioAsset
);


router.patch(
    '/like/:assetId',
    isAuth, 
    likePortfolioAsset
);

export default router;