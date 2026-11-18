import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/auth.jsx";

function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp, resendOtp } = useAuth();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  const email = location.state?.email;

  // redirect if no email
  useEffect(() => {
    if (!email) navigate("/signup");
  }, [email, navigate]);

  // Countdown effect with localStorage expiry
  useEffect(() => {
    const startCountdown = () => {
      let expiry = localStorage.getItem("otpExpiry");
      if (!expiry) return setTimer(0);

      const interval = setInterval(() => {
        const remaining = Math.floor((expiry - Date.now()) / 1000);
        if (remaining <= 0) {
          setTimer(0);
          clearInterval(interval);
        } else {
          setTimer(remaining);
        }
      }, 1000);

      return interval;
    };

    const interval = startCountdown();
    return () => clearInterval(interval);
  }, []);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    // verifyOtp now returns the full data object (containing token) OR false
    const data = await verifyOtp(email, otp);

    if (data && data.token) {
      localStorage.removeItem("otpExpiry"); // OTP verified, remove timer

      // ⚡ FCM Token Sync Logic (Borrowed from Login)
      try {
        const jwtToken = data.token;
        // Import these dynamically if not at top, or ensure they are imported
        const { getFcmToken } = await import("../utils/requestForToken");
        const { saveTokenToBackend } = await import("../utils/saveTokenToBackend");
        const { attachUserToken } = await import("../utils/attachUserId");

        const token = await getFcmToken();
        if (token) {
          await saveTokenToBackend("user");
          await attachUserToken(jwtToken, "user");
        }
      } catch (err) {
        console.error("FCM Sync error on verify:", err);
      }

      // Authorization already set in auth.jsx, just navigate
      navigate("/create-profile");
    }
    setLoading(false);
  };

  const handleResendOtp = () => {
    if (!email) return;
    resendOtp(email);
    const expiry = Date.now() + 5 * 60 * 1000; // 5 min from now
    localStorage.setItem("otpExpiry", expiry);
    setTimer(5 * 60);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-yellow-50 flex flex-col">
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
            Verify OTP
          </h2>
          <p className="text-gray-500 text-center mb-6 text-sm">
            We sent an OTP to <span className="font-semibold">{email || "your email"}</span>
          </p>

          <form className="flex flex-col gap-4" onSubmit={handleVerifyOtp}>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400 text-center tracking-[6px] font-semibold text-lg"
              required
              maxLength={6}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-400 via-pink-500 to-pink-600 text-white py-3 rounded-lg font-semibold hover:scale-105 transition transform shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>

          <p className="mt-6 text-gray-500 text-sm text-center">
            Didn’t receive OTP?{" "}
            {timer === 0 ? (
              <span
                className="text-pink-500 font-semibold cursor-pointer hover:underline"
                onClick={handleResendOtp}
              >
                Resend
              </span>
            ) : (
              <span className="text-gray-400 font-medium">{formatTime(timer)}</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default VerifyOtp;
