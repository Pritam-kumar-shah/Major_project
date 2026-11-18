// src/context/auth.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import { toast } from 'react-toastify';
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from '../utils/firebase.js';

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [vendorProfile, setVendorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // --- HELPER: Fetch Vendor Profile ---
  const fetchVendorProfile = useCallback(async (userId) => {
    if (!userId) {
      setVendorProfile(null);
      return;
    }
    try {
      const response = await apiClient.get("/api/vendor/profile/me/profile");
      setVendorProfile(response.data || null);
    } catch (error) {
      console.error("Failed to fetch VendorProfile:", error.response?.data?.message || error.message);
      setVendorProfile(null);
    }
  }, []);

  // --- INITIAL VERIFICATION (on App Load) ---
  useEffect(() => {
    const verifyUser = async () => {
      try {
        const token = localStorage.getItem("token"); // ⬅️ JWT LO

        const response = await apiClient.get(
          "/api/user/getCurrentUser",
          {
            headers: {
              Authorization: `Bearer ${token}`, // ⬅️ JWT SEND KARO
            },
            withCredentials: true, // optional — cookie based auth ke liye
          }
        );

        const fetchedUser = response.data.data;
        setUser(fetchedUser);

        // ✅ Fetch profile if user is a vendor
        if (fetchedUser?.role === 'vendor' && fetchedUser?._id) {
          await fetchVendorProfile(fetchedUser._id);
        } else {
          setVendorProfile(null);
        }

      } catch (error) {
        // Silent fail for non-logged in users check
        setUser(null);
        setVendorProfile(null);

      } finally {
        setLoading(false); // ⬅️ LOADER AB HAT JAYEGA
      }
    };

    verifyUser();
  }, [fetchVendorProfile]);


  // --- USER SIGNUP ---
  const signup = async (name, email, password) => {
    try {
      await apiClient.post("/api/auth/signup", { name, email, password }, { withCredentials: true });
      toast.success("A verification OTP has been sent to your email.");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed!");
      return false;
    }
  };

  // --- VENDOR SIGNUP ---
  const vendorSignup = async ({ name, email, mobile, password }) => {
    try {
      await apiClient.post("/api/auth/vendor/signup",
        { name, email, mobile, password },
        { withCredentials: true }
      );
      toast.success("Vendor account created! OTP sent.");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Vendor signup failed!");
      return false;
    }
  };

  // --- VENDOR LOGIN ---
  const vendorLogin = async (email, password) => {
    try {
      const response = await apiClient.post("/api/auth/vendor/login", { email, password }, { withCredentials: true });
      const loggedInUser = response.data.vendor;
      setUser(loggedInUser);

      // ✅ CRITICAL FIX: Fetch profile immediately after successful vendor login
      if (loggedInUser?._id) {
        await fetchVendorProfile(loggedInUser._id);
      }

      toast.success("Vendor login successful!");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Vendor login failed!");
      return false;
    }
  };

  // --- OTP VERIFICATION ---
  const verifyOtp = async (email, otp) => {
    try {
      // API call to the backend endpoint
      const response = await apiClient.post("/api/auth/verifyotp", { email, otp }, { withCredentials: true });

      const verifiedUser = response.data.user || response.data.vendor;
      const token = response.data.token;

      // 1. Update User State
      setUser(verifiedUser);

      // 💾 Save Token & Role to LocalStorage (Essential for FCM Sync)
      if (token) localStorage.setItem("token", token);
      if (verifiedUser?.role) localStorage.setItem("role", verifiedUser.role);
      if (verifiedUser?._id) {
        if (verifiedUser.role === 'vendor') localStorage.setItem("vendorId", verifiedUser._id);
        else localStorage.setItem("userId", verifiedUser._id);
      }

      // 2. Fetch Vendor Profile (Existing Logic)
      if (verifiedUser?.role === 'vendor' && verifiedUser?._id) {
        await fetchVendorProfile(verifiedUser._id);
      }

      toast.success("Email verified! You are now logged in.");

      // 3. --- REDIRECTION LOGIC ---
      if (verifiedUser?.role === 'user') {
        navigate('/create-profile');
      } else if (verifiedUser?.role === 'vendor') {
        navigate('/vendor/create-profile');
      } else {
        navigate('/');
      }
      // -----------------------------

      return response.data; // Return full data INCLUDING TOKEN
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP or network error!");
      return false;
    }
  };

  // --- FORGET & RESET PASSWORD ---
  const forgetPassword = async (email) => {
    try {
      const res = await apiClient.post("/api/auth/forget-password", { email }, { withCredentials: true });
      toast.success(res.data.message);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP.");
      return false;
    }
  };
  const resetPassword = async (email, otp, newPassword) => {
    try {
      const res = await apiClient.post("/api/auth/reset-password", { email, otp, newPassword }, { withCredentials: true });
      toast.success(res.data.message);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset password failed.");
      return false;
    }
  };

  // --- USER LOGIN ---
  const login = async (email, password) => {
    try {
      const response = await apiClient.post("/api/auth/login", { email, password }, { withCredentials: true });
      const loggedInUser = response.data.user;
      setUser(loggedInUser);

      // ✅ Check and fetch profile if user has vendor role
      if (loggedInUser?.role === 'vendor' && loggedInUser?._id) {
        await fetchVendorProfile(loggedInUser._id);
      } else {
        setVendorProfile(null);
      }

      toast.success("Login successful!");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed!");
      return null;
    }
  };

  // --- GOOGLE LOGIN ---
  const googleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const response = await apiClient.post("/api/auth/googleLogin", {
        name: firebaseUser.displayName,
        email: firebaseUser.email,
      }, { withCredentials: true });

      const loggedInUser = response.data.user || response.data;
      setUser(loggedInUser);

      // ✅ Check and fetch profile if user has vendor role
      if (loggedInUser?.role === 'vendor' && loggedInUser?._id) {
        await fetchVendorProfile(loggedInUser._id);
      } else {
        setVendorProfile(null);
      }

      toast.success("Google login successful!");
      return response.data; // Return full data so Login Page can sync FCM
    } catch (error) {
      toast.error("Google login failed. Please try again.");
      return false;
    }
  };

  // --- LOGOUT ---
  const logout = async () => {
    try {
      await apiClient.post("/api/auth/logout", {}, { withCredentials: true });
      setUser(null);
      setVendorProfile(null);
      // Clear storage
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      localStorage.removeItem("vendorId");

      navigate("/login");
      toast.success("Logout successful!");
    } catch (error) {
      toast.error("Logout failed.");
    }
  };

  // --- RESEND OTP ---
  const resendOtp = async (email) => {
    try {
      await apiClient.post("/api/auth/resendotp", { email }, { withCredentials: true });
      toast.success("New OTP sent successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP.");
    }
  };

  const value = {
    user,
    vendorProfile,
    loading,
    isAuthenticated: !!user,
    signup,
    vendorSignup,
    verifyOtp,
    login,
    vendorLogin,
    googleLogin,
    forgetPassword,
    resetPassword,
    logout,
    resendOtp,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;