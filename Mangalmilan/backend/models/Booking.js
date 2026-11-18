import mongoose from "mongoose";
import crypto from "crypto";
import WeddingPlan from "./WeddingPlan.js";
import Profile from "./UserProfile.js";
import { sendBookingConfirmation } from "../utils/email.js";
const BookingSchema = new mongoose.Schema(
  {
    bookingCode: {
      type: String,
      unique: true,
      sparse: true, 
      uppercase: true
    },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "REJECTED"],
      default: "PENDING",
      index: true
    },
    amount: { type: Number, required: true, min: 0 },
    bookingDateTime: { type: Date, required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "VendorProfile", required: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    serviceInfo: {
      serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
      name: { type: String, required: true },
      price: { type: Number }
    },
    customerInfo: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String }
    },
    paymentInfo: {
      paymentId: { type: String, index: true },
      status: { type: String, enum: ["PENDING", "COMPLETED", "FAILED"], default: "PENDING" },
      method: { type: String }
    },
    notes: { type: String, trim: true, maxlength: 1000 },
    cancellationDetails: {
      isCancelled: { type: Boolean, default: false },
      cancelledBy: { type: String, enum: ["VENDOR", "CUSTOMER"] },
      reason: { type: String, trim: true, maxlength: 500 },
      cancellationDate: { type: Date }
    }
  },
  { timestamps: true }
);

// Virtual
BookingSchema.virtual("isActive").get(function () {
  return this.status === "CONFIRMED" && this.bookingDateTime > new Date();
});

// Methods

BookingSchema.methods.confirmBooking = async function () {
  if (this.status !== "PENDING")
    throw new Error("Only pending bookings can be confirmed.");

  try {
    if (!this.bookingCode) {
      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      let isUnique = false;

      while (!isUnique) {
        const code =
          letters[Math.floor(Math.random() * 26)] +
          letters[Math.floor(Math.random() * 26)] +
          Math.floor(Math.random() * 9000 + 1000);

        const exists = await this.constructor.findOne({ bookingCode: code });

        if (!exists) {
          this.bookingCode = code;
          isUnique = true;
        }
      }
    }

    this.status = "CONFIRMED";
    await this.save();

    if (this.customerInfo?.email) {
      await sendBookingConfirmation(this.customerInfo.email, this);
    }

    return this;

  } catch (error) {
    console.error("❌ confirmBooking() ERROR:", error.message);
    throw error;
  }
};



BookingSchema.methods.cancelBooking = async function (cancelledBy, reason) {
  if (["COMPLETED", "CANCELLED"].includes(this.status))
    throw new Error("Booking is already completed or cancelled.");

  this.status = "CANCELLED";
  this.cancellationDetails = {
    isCancelled: true,
    cancelledBy,
    reason,
    cancellationDate: new Date()
  };

  return this.save();
};

export default mongoose.model("Booking", BookingSchema);
