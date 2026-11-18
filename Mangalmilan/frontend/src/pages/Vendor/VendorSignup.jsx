import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth.jsx";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { FiMail, FiLock, FiUser, FiPhone } from "react-icons/fi";
import { FaSpinner } from "react-icons/fa";
import logo from "../../assets/logo1.png";
import { toast } from "react-toastify";
import { getFcmToken } from "../../utils/requestForToken";
import { saveTokenToBackend } from "../../utils/saveTokenToBackend";

function VendorSignup() {
  const navigate = useNavigate();
  const { vendorSignup, verifyOtp } = useAuth(); // 👈 verify function add hua
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  // Validation
  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Business Name is required.";
    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!mobile.trim()) {
      newErrors.mobile = "Mobile number is required.";
    } else if (!/^[6-9]\d{9}$/.test(mobile)) {
      newErrors.mobile = "Please enter a valid 10-digit mobile number.";
    }
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ------------------- Signup Step (Send OTP) -------------------
  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const success = await vendorSignup({ name, email, mobile, password });

      if (success) {
        setOtpSent(true);
        toast.success("OTP sent successfully! Please check your email.");
      }
    } catch (error) {
      toast.error("Signup failed. Try again.");
    }

    setLoading(false);
  };

  // ------------------- Verify OTP Step -------------------
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error("Please enter OTP");
      return;
    }
    setLoading(true);

    try {
      const data = await verifyOtp({ email, otp });

      if (data && data.token) {
        toast.success("OTP verified successfully!");

        // ⚡ FCM Sync for Vendor
        try {
          const jwtToken = data.token;
          // Dynamic imports to avoid top-level clutter if preferred, or use existing imports
          // We already have saveTokenToBackend imported at top, but need attachUserToken
          const { attachUserToken } = await import("../../utils/attachUserId");
          const { getFcmToken } = await import("../../utils/requestForToken"); // already imported but ok

          const token = await getFcmToken();
          if (token) {
            await saveTokenToBackend("vendor");
            await attachUserToken(jwtToken, "vendor");
          }
        } catch (e) {
          console.error("Vendor FCM sync failed:", e);
        }

        navigate("/vendor/create-profile", { replace: true }); // ✅ redirect after verify
      }
    } catch (error) {
      toast.error("Invalid OTP or expired. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col justify-center min-h-screen w-full bg-gradient-to-br from-pink-50 via-rose-50 to-yellow-50 p-4 pt-10">
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl px-8 py-10 space-y-4 mt-6">
        {/* Header */}
        <div className="text-center">
          <div
            className="flex justify-center items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img src={logo} alt="Mangalmilan Logo" className="w-10 h-10" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-transparent bg-clip-text tracking-tight">
              {otpSent ? "Verify OTP" : "Register Your Business"}
            </h1>
          </div>
        </div>

        {!otpSent ? (
          // ------------------ Signup Form ------------------
          <form className="space-y-3" onSubmit={handleSignup} noValidate>
            <div className="relative">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full pl-12 pr-4 py-2.5 bg-gray-50 rounded-lg border ${errors.name ? "border-red-500" : "border-gray-200"
                  } focus:outline-none focus:ring-2 focus:ring-pink-500 transition`}
                required
              />
            </div>

            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-12 pr-4 py-2.5 bg-gray-50 rounded-lg border ${errors.email ? "border-red-500" : "border-gray-200"
                  } focus:outline-none focus:ring-2 focus:ring-pink-500 transition`}
                required
              />
            </div>

            <div className="relative">
              <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Mobile Number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className={`w-full pl-12 pr-4 py-2.5 bg-gray-50 rounded-lg border ${errors.mobile ? "border-red-500" : "border-gray-200"
                  } focus:outline-none focus:ring-2 focus:ring-pink-500 transition`}
                required
              />
            </div>

            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-12 pr-12 py-2.5 bg-gray-50 rounded-lg border ${errors.password ? "border-red-500" : "border-gray-200"
                  } focus:outline-none focus:ring-2 focus:ring-pink-500 transition`}
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-pink-600"
              >
                {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
              </span>
            </div>

            {Object.values(errors).length > 0 && (
              <div className="text-red-500 text-xs text-center !mt-2">
                {Object.values(errors)[0]}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 mt-2 rounded-lg font-semibold text-white flex items-center justify-center transition-all duration-300 shadow-lg ${loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:opacity-90 active:scale-95"
                }`}
            >
              {loading ? <FaSpinner className="animate-spin" /> : "Send OTP"}
            </button>
          </form>
        ) : (
          // ------------------ OTP Verification ------------------
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full pl-4 pr-4 py-2.5 bg-gray-50 rounded-lg border focus:ring-2 focus:ring-pink-500"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-lg font-semibold text-white flex items-center justify-center transition-all duration-300 shadow-lg ${loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:opacity-90 active:scale-95"
                }`}
            >
              {loading ? <FaSpinner className="animate-spin" /> : "Verify OTP"}
            </button>
          </form>
        )}

        {!otpSent && (
          <p className="text-gray-600 text-sm text-center mt-4">
            Already have a business account?
            <span
              onClick={() => navigate("/vendor/login")}
              className="text-pink-600 cursor-pointer hover:underline font-semibold ml-1"
            >
              Login Here
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

export default VendorSignup;
