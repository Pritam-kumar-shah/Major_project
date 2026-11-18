import User from "../models/User.js";
import Profile from "../models/UserProfile.js";

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const profileExists = await Profile.exists({ user: user._id });

    return res.status(200).json({
      status: "success",
      data: {
        ...user.toObject(),
        hasProfile: !!profileExists
      }
    });
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};
