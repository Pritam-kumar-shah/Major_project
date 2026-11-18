import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, 
    },

    weddingDate: {
      type: Date,
      validate: {
        validator: function (value) {
          if (!value) return true; 
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return value >= today; 
        },
        message: "Wedding date must be today or in the future",
      },
    },

    location: {
      type: String,
      trim: true,
      required: [true, "Location is required"],
      index: true, // fast search/filter
    },

    guestCount: {
      type: Number,
      min: [1, "Guest count must be at least 1"],
      max: [10000, "Guest count seems too high"],
    },

    budget: {
      total: {
        type: Number,
        required: [true, "Total budget daalna zaroori hai."],
        min: [0, "Budget negative nahi ho sakta."],
      },
      spent: {
        type: Number,
        default: 0,
        min: [0, "Spent amount negative nahi ho sakta."],
      },
    },

    details: {
      type: String,
      trim: true,
      maxlength: [1000, "Details cannot exceed 1000characters"],
    },
    favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VendorProfile', 
  }],
  },
  { timestamps: true, strict: true }
);

/* ---------- INDEXES ---------- */
ProfileSchema.index({ guestCount: 1 });
ProfileSchema.index({ "budget.total": 1 });

/* ---------- VALIDATION HOOKS ---------- */

ProfileSchema.pre("save", function (next) {
  if (this.budget.spent > this.budget.total) {
    return next(
      new Error("Spent amount total budget se zyada nahi ho sakta.")
    );
  }
  next();
});

ProfileSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();

  if (update?.budget?.spent !== undefined || update?.budget?.total !== undefined) {
    const spent = update?.budget?.spent;
    const total = update?.budget?.total;

    if (spent !== undefined && total !== undefined && spent > total) {
      return next(
        new Error("Spent amount total budget se zyada nahi ho sakta.")
      );
    }

    if (spent !== undefined && total === undefined) {
      this.model.findOne(this.getQuery()).then((doc) => {
        if (doc && spent > doc.budget.total) {
          return next(
            new Error("Spent amount total budget se zyada nahi ho sakta.")
          );
        }
        next();
      });
      return; 
    }
  }

  next();
});

const Profile = mongoose.model("Profile", ProfileSchema);
export default Profile;
