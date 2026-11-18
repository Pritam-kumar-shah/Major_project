
import VendorProfile from '../models/VendorProfile.js'; 
import { APIFeatures } from '../utils/APIFeatures.js'; 

export const getVendors = async (req, res, next) => {
    try {
        let baseQuery = VendorProfile.find({ status: "approved" });
        
        
        const sanitizedQuery = { ...req.query };

        if (sanitizedQuery.category === "") {
            delete sanitizedQuery.category;
        }

        // Apply features on sanitized query
        const features = new APIFeatures(baseQuery, sanitizedQuery)
            .search()
            .filter()
            .sort()
            .paginate();
        
        const vendors = await features.query
            .populate('category', 'name'); 

        const totalVendors = await VendorProfile.countDocuments({ status: "approved" }); 

        res.status(200).json({
            success: true,
            totalVendors,
            count: vendors.length,
            vendors,
        });
    } catch (error) {
        console.error("Critical Backend Error (500):", error);
        res.status(500).json({ success: false, message: 'Server Error. Data query failed.' });
    }
};


export const getVendorDetails = async (req, res, next) => {
    try {
        const vendor = await VendorProfile.findById(req.params.id)
            .populate('category', 'name'); 

        if (!vendor || vendor.status !== 'approved') {
            return res.status(404).json({ success: false, message: 'Vendor not found or not approved yet' });
        }

        res.status(200).json({ success: true, vendor });
    } catch (error) {
        console.error("Error fetching vendor details:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


