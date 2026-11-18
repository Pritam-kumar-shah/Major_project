import mongoose from "mongoose";

const WeddingPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  checklist: [
    {
      text: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
      },
      completed: {
        type: Boolean,
        default: false,
      },
    },
  ],
  budgetDetails: {
    total: {
      type: Number,
      default: 0,
      min: 0,
    },
    spent: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  bookedVendors: [
    {
      vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'VendorProfile' },
      price: { type: Number, required: true, min: 0 },
      status: { type: String, enum: ['PENDING', 'CONFIRMED'], default: 'PENDING' },
      visibleToUser: { type: Boolean, default: false },
    },
  ],
}, { timestamps: true });

const WeddingPlan = mongoose.model('WeddingPlan', WeddingPlanSchema);
export default WeddingPlan;