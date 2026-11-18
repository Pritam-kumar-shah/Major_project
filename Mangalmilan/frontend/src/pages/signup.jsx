import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Link added for Logo navigation
import { useAuth } from "../context/auth";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { FiMail, FiLock, FiUser } from "react-icons/fi";
import { FaSpinner } from "react-icons/fa";
import logo from "../assets/logo1.png";
import google from "../assets/google.png";
import { getFcmToken } from "../utils/requestForToken";
import { saveTokenToBackend } from "../utils/saveTokenToBackend";
import { attachUserToken } from "../utils/attachUserId";



function Signup() {
    const navigate = useNavigate();
    const { signup, googleLogin, verifyOtp } = useAuth(); // Assuming useAuth provides these functions
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState(""); // API से आने वाली त्रुटियों के लिए

    // --- Form Validation ---
    const validateForm = () => {
        const newErrors = {};
        if (!name.trim()) newErrors.name = "Full Name is required.";

        if (!email.trim()) {
            newErrors.email = "Email is required.";
        } else if (
            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)
        ) {
            newErrors.email = "Please enter a valid email address.";
        }

        if (!password) {
            newErrors.password = "Password is required.";
        } else if (password.length < 8) {
            newErrors.password = "Password must be at least 8 characters long.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // --- Email/Password Signup Handler ---
    const handleSignup = async (e) => {
        e.preventDefault();
        setApiError(""); // पुरानी API त्रुटि हटाएँ

        if (!validateForm()) return;
        setLoading(true);

        // Assumption: `signup` function returns a boolean (success) or an object with error info.
        const result = await signup(name, email, password);

        if (result === true) {
            localStorage.setItem("role", "user");
            localStorage.setItem("userId", result.user?._id || result._id);
            localStorage.setItem("token", result.token);

            // 2. Notification Sync karein
            try {
                const fcmToken = await getFcmToken();
                if (fcmToken) {
                    // Pehle token save karein phir link karein
                    await saveTokenToBackend("user");
                    await attachUserToken(result.token, "user");
                }
            } catch (err) {
                console.log("Notification sync error during signup:", err);
            }
            // Success: OTP verification page पर भेजें
            navigate("/verifyotp", { state: { email: email } });
        } else if (result && result.error) {

            setApiError(result.error);
        }

        setLoading(false);
    };



    // --- Google Signup Handler ---
    const handleGoogleSignup = async () => {
        setGoogleLoading(true);
        setApiError("");

        // Assumption: googleLogin handles the popup/redirect and returns true/false
        const success = await googleLogin();

        if (success) {
            await requestForToken();
            navigate("/create-profile");
        } else {
            setApiError("Google Sign-up failed. Please try again.");
        }
        setGoogleLoading(false);
    };

    return (
        <div className="flex flex-col justify-center min-h-screen w-full bg-gradient-to-br from-pink-50 via-rose-50 to-yellow-50 p-4 pt-10">
            <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl px-8 py-10 space-y-4 mt-6">

                {/* Header */}
                <div className="text-center">
                    <Link to="/" className="flex justify-center items-center gap-3 cursor-pointer">
                        <img src={logo} alt="Mangalmilan Logo" className="w-10 h-10" />
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-transparent bg-clip-text tracking-tight">
                            Mangalmilan
                        </h1>
                    </Link>
                    <p className="text-xl font-semibold text-gray-700 mt-2">Create Your Account</p>
                </div>

                {/* Form */}
                <form className="space-y-3" onSubmit={handleSignup} noValidate>

                    {/* Name */}
                    <div className="relative">
                        <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`w-full pl-12 pr-4 py-2.5 bg-gray-50 rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-pink-500 transition`}
                            required
                        />
                    </div>

                    {/* Email */}
                    <div className="relative">
                        <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full pl-12 pr-4 py-2.5 bg-gray-50 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-pink-500 transition`}
                            required
                        />
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full pl-12 pr-12 py-2.5 bg-gray-50 rounded-lg border ${errors.password ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-pink-500 transition`}
                            required
                        />
                        <span onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-pink-600">
                            {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                        </span>
                    </div>

                    {/* Error Display */}
                    {(Object.values(errors).length > 0 || apiError) && (
                        <div className="text-red-500 text-xs text-center !mt-2">
                            {apiError || Object.values(errors)[0]}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2.5 mt-2 rounded-lg font-semibold text-white flex items-center justify-center transition-all duration-300 shadow-lg ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:opacity-90 active:scale-95"}`}
                    >
                        {loading ? <FaSpinner className="animate-spin" /> : "Sign Up"}
                    </button>
                </form>

                {/* OR */}
                <div className="flex items-center py-1">
                    <hr className="flex-grow border-gray-200" />
                    <span className="mx-4 text-xs font-semibold text-gray-400">OR</span>
                    <hr className="flex-grow border-gray-200" />
                </div>

                {/* Google */}
                <button
                    onClick={handleGoogleSignup}
                    disabled={googleLoading}
                    className="w-full py-2.5 bg-white border border-gray-300 rounded-lg flex items-center justify-center gap-3 cursor-pointer hover:bg-gray-100 transition-all duration-300 active:scale-95 text-gray-700 font-medium disabled:bg-gray-200"
                >
                    <img src={google} alt="Google Logo" className="w-5 h-5" />
                    {googleLoading ? <FaSpinner className="animate-spin" /> : "Sign up with Google"}
                </button>

                {/* Footer Links */}
                <p className="text-gray-600 text-sm text-center">
                    Already have an account? <span onClick={() => navigate("/login")} className="text-pink-600 cursor-pointer hover:underline font-semibold">Login</span>
                </p>
                <p className="text-gray-600 text-sm text-center mt-2">
                    Want to register your business?
                    <span onClick={() => navigate("/vendor/signup")} className="text-pink-600 cursor-pointer hover:underline font-semibold">
                        Register Here
                    </span>
                </p>
            </div>
        </div>
    );
}

export default Signup;