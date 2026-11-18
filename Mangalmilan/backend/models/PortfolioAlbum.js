
import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema({
    assetUrl: {
        type: String,
        required: true,
    },
    cloudinaryPublicId: {
        type: String,
        required: true,
    },
    resourceType: {
        type: String,
        enum: ['image', 'video', 'raw'],
        required: true,
    },
    likes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User', 
        default: [], 
    },
    caption: {
        type: String,
        default: '',
        trim: true,
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
    }
});

const portfolioSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'VendorProfile',
        unique: true, 
    },
    imageCount: { type: Number, default: 0 },
    videoCount: { type: Number, default: 0 },
    
    assets: [assetSchema], 
}, { timestamps: true });

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

export default Portfolio;