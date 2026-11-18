
import express from 'express';
import { getVendors, getVendorDetails } from '../controller/productController.js'; 

const router = express.Router();

router.route('/profile').get(getVendors);

router.route('/profile/:id').get(getVendorDetails);

export default router;