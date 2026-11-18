import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth.jsx";
import google from "../assets/google.png";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { FaSpinner } from "react-icons/fa";
import { getFcmToken } from "../utils/requestForToken";
import { saveTokenToBackend } from "../utils/saveTokenToBackend";
import { attachUserToken } from "../utils/attachUserId.js";

function LoginPage() {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return alert("Please fill in all fields.");
    setLoading(true);
    const success = await login(email, password);
    console.log("🔍 FULL LOGIN RESPONSE:", success);
    if (success) {
      const jwtToken = success.token;

      // ⚡ STEP-1: FCM token request + store local
      try {
        console.log("🟢 Starting FCM Token flow...");
        const token = await getFcmToken();

        if (token) {
          // ⚡ STEP-2: Save token as visitor (agar pahle nahi ho paya)
          await saveTokenToBackend("user");

          // ⚡ STEP-3: Link DB: token → userId
          await attachUserToken(jwtToken);
        }
      } catch (fcmError) {
        console.error("⚠️ FCM Token Logic Failed (logging in anyway):", fcmError);
      }

      navigate("/dashboard");
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const success = await googleLogin();
    if (success) {
      const jwtToken = success.token;

      const token = await getFcmToken();
      if (token) {
        await saveTokenToBackend("user");
        await attachUserToken(jwtToken, "user");
      }

      navigate("/dashboard");
    }
    setGoogleLoading(false);
  };

  return (
    <div className="flex flex-col justify-center min-h-screen w-full bg-gradient-to-br from-pink-50 via-rose-50 to-yellow-50 p-4 pt-16">
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl px-8 py-10 space-y-4 mt-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-red-500 to-yellow-400 text-transparent bg-clip-text tracking-tight">
            Welcome Back!
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Login to your account to continue
          </p>
        </div>

        {/* Login Form */}
        <form className="space-y-3" onSubmit={handleLogin} noValidate>
          {/* Email */}
          <div className="relative">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-4 pr-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
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
              className="w-full pl-4 pr-12 py-2.5 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-pink-600"
            >
              {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
            </span>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <span
              onClick={() => navigate("/forget-password")}
              className="text-pink-600 cursor-pointer text-sm hover:underline font-medium"
            >
              Forgot Password?
            </span>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 mt-2 rounded-lg font-semibold text-white flex items-center justify-center transition-all duration-300 shadow-lg ${loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:opacity-90 active:scale-95"
              }`}
          >
            {loading ? <FaSpinner className="animate-spin" /> : "Login"}
          </button>
        </form>

        {/* OR Separator */}
        <div className="flex items-center py-1">
          <hr className="flex-grow border-gray-200" />
          <span className="mx-4 text-xs font-semibold text-gray-400">OR</span>
          <hr className="flex-grow border-gray-200" />
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full py-2.5 bg-white border border-gray-300 rounded-lg flex items-center justify-center gap-3 cursor-pointer hover:bg-gray-100 transition-all duration-300 active:scale-95 text-gray-700 font-medium disabled:bg-gray-200"
        >
          <img src={google} alt="Google Logo" className="w-5 h-5" />
          {googleLoading ? "Redirecting..." : "Login with Google"}
        </button>

        {/* Signup Link */}
        <p className="text-gray-600 text-sm text-center mt-3">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-pink-600 cursor-pointer hover:underline font-semibold"
          >
            Sign Up
          </span>
        </p>
        <p className="text-gray-600 text-sm text-center mt-1">
          Already have a business account?
          <span
            onClick={() => navigate("/vendor/login")}
            className="text-pink-600 cursor-pointer hover:underline font-semibold"
          >
            Login Here
          </span>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
