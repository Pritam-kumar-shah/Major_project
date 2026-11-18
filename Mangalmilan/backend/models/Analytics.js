import mongoose from 'mongoose';

const DailyAnalyticsSchema = new mongoose.Schema({
    vendor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'VendorProfile', 
        required: true 
    },
    date: { 
        type: Date, 
        required: true,
        default: () => {
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);
            return today;
        }
    },
    viewCount: { 
        type: Number, 
        default: 0,
        min: 0
    },
}, { 
    timestamps: true 
});

DailyAnalyticsSchema.index({ vendor: 1, date: 1 }, { unique: true });

const DailyAnalytics = mongoose.model('DailyAnalytics', DailyAnalyticsSchema);
export default DailyAnalytics;