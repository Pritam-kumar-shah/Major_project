import mongoose from "mongoose";

const NotificationTokenSchema = new mongoose.Schema(
  {
    fcmToken: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ["user", "vendor", "visitor"],
      required: true,
      default: "visitor"
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'onModel',
      default: null
    },

    onModel: {
      type: String,
      enum: ['User', 'VendorProfile', null],
      default: null
    },

    deviceType: {
      type: String,
      enum: ["web", "android", "ios"],
      default: "web"
    },

    lastSeenAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// 🔥 Multiple indexing — fast role broadcast + owner targeting
NotificationTokenSchema.index({ role: 1 });
NotificationTokenSchema.index({ ownerId: 1 });
NotificationTokenSchema.index({ ownerId: 1, role: 1 });

// 👇 Multi-device allow, but avoid duplicates
NotificationTokenSchema.index({ fcmToken: 1 }, { unique: true, sparse: true });

export default mongoose.model("NotificationToken", NotificationTokenSchema);
