import mongoose from 'mongoose';

const VendorReplySchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ReviewSchema = new mongoose.Schema(
  {
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    image: { type: String },
    imageId: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'VendorProfile', required: true },

    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    vendorReply: VendorReplySchema, 
  },
  { timestamps: true }
);


export default mongoose.model('Review', ReviewSchema);