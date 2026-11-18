import mongoose from "mongoose";

const VendorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    businessName: { type: String, required: true, trim: true, index: true },
    profileImage: { type: String, required: true },
    about: { type: String, trim: true, maxlength: 2000 },
    contactPhone: {
      type: String,
      required: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"],
    },

    location: {
      address: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true, index: true },
      state: { type: String, required: true, trim: true },
      pincode: { type: String, required: true, trim: true },
      mapLink: { type: String },
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    details: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: {},
    },
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],

    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    tncAccepted: {
      type: Boolean,
      required: true, 
      default: false,
    },
    tncAcceptanceDate: {
      type: Date,
    },
    tncVersion: {
      type: String, 
    },
    
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    isFeatured: { type: Boolean, default: false },
    
  },
  { timestamps: true }
);

export default mongoose.model("VendorProfile", VendorProfileSchema);
