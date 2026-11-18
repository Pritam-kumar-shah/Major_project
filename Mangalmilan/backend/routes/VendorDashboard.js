import express from 'express';
import isAuth from '../middleware/isAuth.js'; 
import isVendor from '../middleware/isVendor.js'; 
import { getDashboardAnalytics } from '../controller/VendorDashboard.js'; 

const router = express.Router();



router.route('/analytics').get(isAuth, isVendor, getDashboardAnalytics); 

export default router;