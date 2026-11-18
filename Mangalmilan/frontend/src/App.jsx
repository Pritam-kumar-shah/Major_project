



import React, { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import './App.css';

import Navbar from './components/navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PageNotFound from './pages/PageNotFound.jsx';

import Footer from './components/Footer.jsx';
import TermsAndConditions from './pages/TermsAndConditions.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import ContactUs from './pages/ContactUs.jsx';

// 🔔 FCM functions
import { getFcmToken } from "./utils/requestForToken";
import { saveTokenToBackend } from "./utils/saveTokenToBackend";

// ------------------- Lazy Loading Pages -------------------
const Home = lazy(() => import('./pages/Home.jsx'));
const Blog = lazy(() => import('./pages/Blog.jsx'));
const Signup = lazy(() => import('./pages/signup.jsx'));
const Login = lazy(() => import('./pages/login.jsx'));
const VerifyOtp = lazy(() => import('./pages/VerifyOtp.jsx'));
const ForgetResetPassword = lazy(() => import('./pages/ForgetResetPassword.jsx'));
const VendorSignup = lazy(() => import('./pages/Vendor/VendorSignup.jsx'));
const VendorLogin = lazy(() => import('./pages/Vendor/VendorLogin.jsx'));
const VendorDetailPage = lazy(() => import('./pages/Vendor/VendorDetailsPage.jsx'));

// User Pages
const UserDashboard = lazy(() => import('./pages/Dashboard.jsx'));
const CreateProfile = lazy(() => import('./pages/CreateProfile.jsx'));
const MyFavoritesPage = lazy(() => import('./pages/favorites.jsx'));
const MyBookingsPage = lazy(() => import('./pages/Mybooking.jsx'));

// Vendor Pages
const VendorDashboard = lazy(() => import('./pages/Vendor/VendorDashbord.jsx'));
const VendorProfile = lazy(() => import('./pages/Vendor/CreateVendorProfile.jsx'));
const EditProfile = lazy(() => import("./pages/Vendor/Edit.jsx"));
const Booking = lazy(() => import('./pages/Vendor/Booking.jsx'));
const Enquiry = lazy(() => import('./pages/Vendor/Enquiry.jsx'));
const Profile = lazy(() => import('./pages/Vendor/Profile.jsx'));
const VendorCalendarPage = lazy(() => import('./pages/Vendor/VendorCalendarPage.jsx'));
const VendorPortfolioManager = lazy(() => import('./pages/Vendor/PortfolioGallery.jsx'));
const VendorTermsAndConditions = lazy(() => import('./pages/Vendor/VendorTnC.jsx'));
const VendorPrivacyPolicy = lazy(() => import('./pages/Vendor/vendorPP.jsx'));

// Admin Pages
const CategoryManager = lazy(() => import('./pages/admin/CategoryManager.jsx'));
const AdminPendingVendors = lazy(() => import('./pages/admin/AdminPendingVendors.jsx'));
const AdminDashboardSummary = lazy(() => import('./pages/admin/AdminDashboardSummary.jsx'));
const AdminEnquiries = lazy(() => import('./pages/admin/AdminEnquiries.jsx'));

import { messaging } from "./utils/firebase-config";
import { onMessage } from "firebase/messaging";

import { toast } from 'react-toastify';

// ... (keep other imports)

function App() {
  const location = useLocation();

  const PageFallback = (
    <div className="text-center p-8 text-lg font-semibold">
      Loading Page Content...
    </div>
  );

  // 🔹 SCROLL TO TOP ON ROUTE CHANGE
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // 🔹 STEP 1 — create FCM token ONCE per browser
  useEffect(() => {
    const initializeNotifications = async () => {
      // Case A: Already Granted
      if (Notification.permission === 'granted') {
        await saveTokenToBackend(); // Syncs as 'visitor' or 'user'
      }
      // Case B: First time visit (Default)
      else if (Notification.permission === 'default') {
        const token = await getFcmToken(); // Request Permission

        if (token) {
          await saveTokenToBackend(); // If accepted, sync immediately
        } else {
          // If dismissed/failed, show nudging toast
          toast.info("🔔 Enable notifications to get updates!", {
            autoClose: 5000,
            closeOnClick: true,
            pauseOnHover: true,
            onClick: async () => {
              const t = await getFcmToken();
              if (t) saveTokenToBackend();
            }
          });
        }
      }
    };

    initializeNotifications();
  }, []);

  // 🔹 STEP 2 — save token AFTER login (when role & id exist)
  useEffect(() => {
    const token = localStorage.getItem("fcmToken");
    const role = localStorage.getItem("role");

    if (token && role) {
      saveTokenToBackend(); // map token → user/vendor
    }
  }, [localStorage.getItem("role"), localStorage.getItem("userId"), localStorage.getItem("vendorId")]);

  return (
    <div className="app-container">
      <Navbar />

      <div className="main-content">
        <Suspense fallback={PageFallback}>
          <Routes>

            {/* ---------- Public Routes ---------- */}
            <Route path='/' element={<Home />} />
            <Route path='/blog' element={<Blog />} />
            <Route path='/signup' element={<Signup />} />
            <Route path='/login' element={<Login />} />
            <Route path='/vendor/signup' element={<VendorSignup />} />
            <Route path='/vendor/login' element={<VendorLogin />} />
            <Route path='/verifyotp' element={<VerifyOtp />} />
            <Route path='/forget-password' element={<ForgetResetPassword />} />
            <Route path='/vendor/:id' element={<VendorDetailPage />} />
            <Route path='/terms' element={<TermsAndConditions />} />
            <Route path='/privacy' element={<PrivacyPolicy />} />
            <Route path='/contact' element={<ContactUs />} />

            {/* ---------- User Protected ---------- */}
            <Route element={<ProtectedRoute allowedRoles={['user']} />}>
              <Route path='/dashboard' element={<UserDashboard />} />
              <Route path='/create-profile' element={<CreateProfile />} />
              <Route path='/my-favorites' element={<MyFavoritesPage />} />
              <Route path='/my-bookings' element={<MyBookingsPage />} />
            </Route>

            {/* ---------- Vendor Protected ---------- */}
            <Route element={<ProtectedRoute allowedRoles={['vendor']} />}>
              <Route path='/vendor/dashboard' element={<VendorDashboard />} />
              <Route path='/vendor/create-profile' element={<VendorProfile />} />
              <Route path='/vendor/update-profile' element={<EditProfile />} />
              <Route path='/vendor-bookings' element={<Booking />} />
              <Route path='/vendor-profile' element={<Profile />} />
              <Route path='/vendor/enquiry' element={<Enquiry />} />
              <Route path="/vendor/calendar" element={<VendorCalendarPage />} />
              <Route path="/vendor/portfolio" element={<VendorPortfolioManager />} />
              <Route path="/vendor/v1/terms-and-conditions" element={<VendorTermsAndConditions />} />
              <Route path="/vendor/v1/privacy-policy" element={<VendorPrivacyPolicy />} />
            </Route>

            {/* ---------- Admin Protected ---------- */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path='/admin/categories' element={<CategoryManager />} />
              <Route path="/admin/pending-vendors" element={<AdminPendingVendors />} />
              <Route path="/admin/dashboard" element={<AdminDashboardSummary />} />
              <Route path="/admin/enquiries" element={<AdminEnquiries />} />
            </Route>

            {/* ---------- 404 ---------- */}
            <Route path='*' element={<PageNotFound />} />
          </Routes>
        </Suspense>
      </div>

      <Footer />
    </div>
  );
}

export default App;
