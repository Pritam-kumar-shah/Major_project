import Profile from "../models/UserProfile.js";
import WeddingPlan from "../models/WeddingPlan.js";

const findOrCreateWeddingPlan = async (userId) => {
  let plan = await WeddingPlan.findOne({ user: userId });

  if (!plan) {
    plan = new WeddingPlan({
      user: userId,
      checklist: [
        { text: "Finalize Guest List", completed: false },
        { text: "Book Venue", completed: false },
        { text: "Hire Photographer", completed: false },
      ],
    });
    await plan.save();
  }
  return plan;
};

export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id })
      // .populate("vendors.vendorId", "name category");

    if (!profile) {
      return res.status(404).json({ message: "Profile not found for this user" });
    }

    const plan = await findOrCreateWeddingPlan(req.user._id);
    res.json({ profile, plan });

  } catch (error) {
    console.error("getProfile error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const createOrUpdateProfile = async (req, res) => {
  try {
    const { weddingDate, location, guestCount, budget, details } = req.body;

    const totalBudget = Number(budget?.total ?? budget ?? 0);
    const spentBudget = Number(budget?.spent ?? 0);

    if (spentBudget > totalBudget) {
      return res.status(400).json({
        message: "Spent amount cannot exceed total budget."
      });
    }

    const weddingDateObj = weddingDate ? new Date(weddingDate) : undefined;

    const profileFields = {
      user: req.user._id,
      weddingDate: weddingDateObj,
      location,
      guestCount: Number(guestCount) || 0,
      details,
      budget: {
        total: totalBudget,
        spent: spentBudget,
      },
    };

    const profile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      { $set: profileFields },
      { new: true, upsert: true, runValidators: true }
    );

    const plan = await findOrCreateWeddingPlan(req.user._id);
    plan.budgetDetails.total = totalBudget;
    plan.budgetDetails.spent = spentBudget;
    await plan.save();

    res.status(200).json({ profile, plan });

  } catch (error) {
    console.error("createOrUpdateProfile error:", error.message);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server Error" });
  }
};



// =================================================================
// ✅ NAYA FUNCTION: VENDOR KO FAVORITE/UNFAVORITE KARNE KE LIYE
// =================================================================

export const toggleFavoriteVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const userId = req.user._id;

    // User ka profile dhoondho
    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ message: "User profile not found. Please create one first." });
    }

    // Check karo ki vendor pehle se favorite hai ya nahi
    const isFavorite = profile.favorites.includes(vendorId);

    if (isFavorite) {
      // Agar hai, to use array se nikal do (pull)
      await profile.updateOne({ $pull: { favorites: vendorId } });
      res.status(200).json({ message: "Vendor removed from your shortlist." });
    } else {
      // Agar nahi hai, to use array me daal do (addToSet duplicates ko rokta hai)
      await profile.updateOne({ $addToSet: { favorites: vendorId } });
      res.status(200).json({ message: "Vendor added to your shortlist." });
    }
  } catch (error) {
    console.error("Toggle Favorite Error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// =================================================================
// ✅ NAYA FUNCTION: USER KE SAARE FAVORITE VENDORS LAANE KE LIYE
// =================================================================

export const getFavoriteVendors = async (req, res) => {
  try {
    const userId = req.user._id;

    const profile = await Profile.findOne({ user: userId })
      // 'populate' ka istemaal karke favorites me save ID se vendor ki poori details laao
      .populate({
        path: 'favorites',
        model: 'VendorProfile',
        select: 'businessName profileImage category averageRating location', // Jo details chahiye
        populate: {
            path: 'category',
            model: 'Category',
            select: 'name'
        }
      });

    if (!profile) {
      return res.status(404).json({ message: "User profile not found." });
    }

    res.status(200).json(profile.favorites);
  } catch (error) {
    console.error("Get Favorites Error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};
