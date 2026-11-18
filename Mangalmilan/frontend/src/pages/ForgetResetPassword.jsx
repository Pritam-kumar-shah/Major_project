import React, { useState, useEffect } from "react";
import { useAuth } from "../context/auth.jsx";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ForgetResetPassword = () => {
  const { forgetPassword, resetPassword } = useAuth(); 
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0); 

  // Format timer mm:ss
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
  };

  // Countdown effect
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Email is required.");
    try {
      setLoading(true);
      await forgetPassword(email);
      toast.success("OTP sent to your email!");
      setStep(2);

      // Start countdown from 5 minutes
      setTimer(300);
      localStorage.setItem("otpExpiry_" + email, Date.now() + 300 * 1000);

    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) return toast.error("All fields are required.");
    try {
      setLoading(true);
      await resetPassword(email, otp, newPassword);
      toast.success("Password reset successful! Redirecting to login...");

      // Reset everything
      setStep(1);
      setEmail("");
      setOtp("");
      setNewPassword("");
      setTimer(0);
      localStorage.removeItem("otpExpiry_" + email);

      setTimeout(() => navigate("/login"), 1000);

    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;
    try {
      setLoading(true);
      await forgetPassword(email);
      toast.success("OTP resent successfully!");
      setTimer(300);
      localStorage.setItem("otpExpiry_" + email, Date.now() + 300 * 1000);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Page load: restore timer if OTP was already sent
  useEffect(() => {
    if (!email) return;
    const expiry = localStorage.getItem("otpExpiry_" + email);
    if (expiry) {
      const remaining = Math.floor((expiry - Date.now()) / 1000);
      if (remaining > 0) setTimer(remaining);
    }
  }, [email]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50 p-6">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-xl border border-pink-200">

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <h2 className="text-2xl font-bold text-pink-700 text-center">Forgot Password</h2>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className={`w-full p-3 rounded-lg text-white font-semibold transition ${loading ? 'bg-pink-400 cursor-not-allowed' : 'bg-pink-600 hover:bg-pink-700'}`}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <h2 className="text-2xl font-bold text-pink-700 text-center">Reset Password</h2>
            <input
              type="text"
              placeholder="Enter OTP"
              className="w-full p-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={loading}
            />
            <input
              type="password"
              placeholder="New Password"
              className="w-full p-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className={`w-full p-3 rounded-lg text-white font-semibold transition ${loading ? 'bg-pink-400 cursor-not-allowed' : 'bg-pink-600 hover:bg-pink-700'}`}
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            {/* Countdown & Resend */}
            <p className="mt-4 text-gray-500 text-sm text-center">
              {timer === 0 ? (
                <span
                  className="text-pink-500 font-semibold cursor-pointer hover:underline"
                  onClick={handleResendOtp}
                >
                  Resend OTP
                </span>
              ) : (
                <span className="text-gray-400 font-medium">
                  OTP expires in {formatTime(timer)}
                </span>
              )}
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgetResetPassword;
