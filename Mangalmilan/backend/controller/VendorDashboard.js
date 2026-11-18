import VendorProfile from '../models/VendorProfile.js';
import Review from '../models/Review.js'; 
import DailyAnalytics from '../models/Analytics.js'; 
import Booking from '../models/Booking.js';
import Enquiry from '../models/Enquiry.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import mongoose from 'mongoose';
import moment from 'moment';

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
        console.error("Profile view tracking failed:", error);
    }
};

const getAggregatedData = async (Model, vendorObjectId, start, end, dateField, sumField) => {
    const format = end.diff(start, 'days') > 60 ? '%Y-%m' : '%Y-%m-%d';
    const isCount = sumField === '1';

    const pipeline = [
        { 
            $match: {
                vendor: new mongoose.Types.ObjectId(vendorObjectId), 
                [dateField]: { $gte: start.toDate(), $lte: end.toDate() }
            }
        },
        { 
            $group: {
                _id: { $dateToString: { format: format, date: `$${dateField}` } },
                count: { $sum: isCount ? 1 : `$${sumField}` }
            }
        },
        { $sort: { _id: 1 } }
    ];

    try {
        return await Model.aggregate(pipeline);
    } catch (error) {
        console.error(`Aggregation failed for model ${Model.modelName}:`, error);
        return []; 
    }
};


// ====================================================================
// 🎯 1. PUBLIC CONTROLLER: Get Vendor Profile (And Record View)
// ====================================================================

export const getVendorById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Vendor ID format.");
    }

    const vendor = await VendorProfile.findById(id).populate('category');

    if (!vendor) {
        throw new ApiError(404, "Vendor profile not found.");
    }
    
    recordProfileView(id); 

    res.status(200).json(vendor);
});


// ====================================================================
// 🎯 2. PRIVATE CONTROLLER: Get Dashboard Analytics
// ====================================================================

export const getDashboardAnalytics = asyncHandler(async (req, res) => {
    
    // यह ID 'isVendor' middleware से आ रही है
    const VENDOR_ID_STRING = req.vendorId; 
    
    if (!VENDOR_ID_STRING) {
        return res.status(403).json({ message: "Authorization failed: Vendor Profile ID missing." });
    }
    
    const vendorObjectId = new mongoose.Types.ObjectId(VENDOR_ID_STRING);

    const { filter, startDate, endDate } = req.query;
    let start, end, prevStart, prevEnd;

    // --- Date Logic ---
    if (filter === 'monthly') {
        end = moment().endOf('day');
        start = moment().subtract(30, 'days').startOf('day');
        prevStart = moment(start).subtract(30, 'days');
        prevEnd = moment(start).subtract(1, 'second');
    } else if (filter === 'yearly') {
        end = moment().endOf('day');
        start = moment().subtract(12, 'months').startOf('day');
        prevStart = moment(start).subtract(12, 'months');
        prevEnd = moment(start).subtract(1, 'second');
    } else if (filter === 'dateRange' && startDate && endDate) {
        start = moment(startDate).startOf('day');
        end = moment(endDate).endOf('day');
        const diff = end.diff(start, 'days');
        prevStart = moment(start).subtract(diff + 1, 'days');
        prevEnd = moment(start).subtract(1, 'day').endOf('day');
    } else {
        return res.status(400).json({ message: "Invalid filter or date range." });
    }
    
    try {
        const [bookingsData, reviewsData, enquiriesData, viewsData] = await Promise.all([
            getAggregatedData(Booking, vendorObjectId, start, end, 'createdAt', '1'), 
            getAggregatedData(Review, vendorObjectId, start, end, 'createdAt', '1'), 
            
            getAggregatedData(Enquiry, vendorObjectId, start, end, 'createdAt', '1'), 
            
            DailyAnalytics.aggregate([
                { $match: { vendor: vendorObjectId, date: { $gte: start.toDate(), $lte: end.toDate() } } },
                { $group: {
                    _id: { $dateToString: { format: end.diff(start, 'days') > 60 ? '%Y-%m' : '%Y-%m-%d', date: "$date" } },
                    count: { $sum: "$viewCount" }
                }},
                { $sort: { _id: 1 } }
            ])
        ]);

        const [prevBookingsSum, prevReviewsSum, prevEnquiriesSum, prevViewsSum] = await Promise.all([
            Booking.countDocuments({ vendor: vendorObjectId, createdAt: { $gte: prevStart.toDate(), $lte: prevEnd.toDate() } }),
            Review.countDocuments({ vendor: vendorObjectId, createdAt: { $gte: prevStart.toDate(), $lte: prevEnd.toDate() } }),
            
            Enquiry.countDocuments({ vendor: vendorObjectId, createdAt: { $gte: prevStart.toDate(), $lte: prevEnd.toDate() } }),
            DailyAnalytics.aggregate([
                { $match: { vendor: vendorObjectId, date: { $gte: prevStart.toDate(), $lte: prevEnd.toDate() } } },
                { $group: { _id: null, total: { $sum: "$viewCount" } } }
            ]).then(res => res[0]?.total || 0)
        ]);

        const mergedGraphData = {};
        [bookingsData, reviewsData, enquiriesData, viewsData].forEach(dataArray => {
             dataArray.forEach(item => {
                 const dateKey = item._id;
                 if (!mergedGraphData[dateKey]) {
                     mergedGraphData[dateKey] = { date: dateKey, bookings: 0, reviews: 0, enquiries: 0, views: 0 };
                 }
                 if (dataArray === bookingsData) mergedGraphData[dateKey].bookings = item.count;
                 else if (dataArray === reviewsData) mergedGraphData[dateKey].reviews = item.count;
                 else if (dataArray === enquiriesData) mergedGraphData[dateKey].enquiries = item.count;
                 else if (dataArray === viewsData) mergedGraphData[dateKey].views = item.count;
             });
        });
        const finalGraphData = Object.values(mergedGraphData).sort((a, b) => a.date.localeCompare(b.date));


        const currentBookingsSum = bookingsData.reduce((acc, item) => acc + item.count, 0);
        const currentReviewsSum = reviewsData.reduce((acc, item) => acc + item.count, 0);
        const currentEnquiriesSum = enquiriesData.reduce((acc, item) => acc + item.count, 0);
        const currentViewsSum = viewsData.reduce((acc, item) => acc + item.count, 0);

        return res.json({
            stats: { bookings: currentBookingsSum, reviews: currentReviewsSum, enquiries: currentEnquiriesSum, views: currentViewsSum },
            previousStats: { bookings: prevBookingsSum, reviews: prevReviewsSum, enquiries: prevEnquiriesSum, views: prevViewsSum },
            graphData: finalGraphData,
        });

    } catch (error) {
        console.error("Dashboard Controller Critical Error:", error);
        return res.status(500).json({ message: "Dashboard data loading failed due to internal server error." });
    }
});

