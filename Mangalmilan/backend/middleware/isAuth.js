import jwt from "jsonwebtoken";
import User from "../models/User.js";

const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decodedPayload.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    req.user = user;
    req.userId = user._id; 
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid or expired token. Please log in again." });
    }
    console.error("Authentication Error:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default isAuth;


