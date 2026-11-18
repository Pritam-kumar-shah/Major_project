import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth.jsx";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { FaSpinner } from "react-icons/fa";
import { getFcmToken } from "../../utils/requestForToken";
import { saveTokenToBackend } from "../../utils/saveTokenToBackend";
import { attachUserToken } from "../../utils/attachUserId.js"; // <-- ye add karo

function VendorLogin() {
  const navigate = useNavigate();
   const { vendorLogin } = useAuth(); 

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return alert("Please fill in all fields.");
    setLoading(true);
    const success = await vendorLogin(email, password); // role check
    console.log("🔎 Vendor Login Response:", success);
    if (success) {
      const jwtToken = success.token;

    // 1️⃣ FCM token generate
    const token = await getFcmToken();

    if (token) {
      // 2️⃣ Token save as visitor if not saved
      await saveTokenToBackend("vendor");

      // 3️⃣ Link token → vendorId in DB
      await attachUserToken(jwtToken,"vendor");
    }
      navigate("/vendor/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col justify-center min-h-screen w-full bg-gradient-to-br from-yellow-50 via-rose-50 to-pink-50 p-4 pt-16">
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl px-8 py-10 space-y-4 mt-6">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-500 via-red-500 to-pink-500 text-transparent bg-clip-text tracking-tight">
            Vendor Login
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Login to your business account
          </p>
        </div>

        {/* Form */}
        <form className="space-y-3" onSubmit={handleLogin} noValidate>
          {/* Email */}
          <div className="relative">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-4 pr-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-4 pr-12 py-2.5 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-yellow-600"
            >
              {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
            </span>
          </div>
          <div className="text-right">
            <span
             onClick={() => navigate("/forget-password")}
             className="text-yellow-600 cursor-pointer text-sm hover:underline font-medium"
            >
             Forgot Password?
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 mt-2 rounded-lg font-semibold text-white flex items-center justify-center transition-all duration-300 shadow-lg ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-yellow-500 via-red-500 to-pink-500 hover:opacity-90 active:scale-95"}`}
          >
            {loading ? <FaSpinner className="animate-spin" /> : "Login"}
          </button>
        </form>

        {/* Signup Link */}
        <p className="text-gray-600 text-sm text-center mt-3">
          Don't have a business account?{" "}
          <span
            onClick={() => navigate("/vendor/signup")}
            className="text-yellow-600 cursor-pointer hover:underline font-semibold"
          >
            Register Here
          </span>
        </p>

      </div>
    </div>
  );
}

export default VendorLogin;
