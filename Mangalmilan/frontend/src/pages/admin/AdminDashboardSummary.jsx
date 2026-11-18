import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { toast } from 'react-toastify';
import {
    FaUsers, FaChartLine, FaClipboardList, FaStore, FaClock,
    FaCalendarAlt, FaDollarSign, FaBolt, FaCheckCircle, FaTimesCircle, FaEnvelope
} from 'react-icons/fa';

// --- MOCK ANALYTICS DATA (Replace with API calls later) ---
const MOCK_ANALYTICS_DATA = {
    totalUsers: 4520,
    newSignupsLast30Days: 125,
    avgSessionDuration: '4:15 min',
    totalBookings: 89,
    cancellationRate: '12%',
    totalRevenue: '₹2.5 lakh', // Dummy large figure
};

// --- Helper Components ---

// Dashboard Card Component
const DashboardCard = ({ title, value, icon, subtext, color }) => (
    <div className={`bg-white p-5 rounded-xl shadow-lg border-l-4 ${color} transition-shadow hover:shadow-xl w-full`}>
        <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500 uppercase">{title}</h3>
            <span className={`text-3xl ${color.replace('border-', 'text-')}`}>{icon}</span>
        </div>
        <p className="text-4xl font-extrabold text-gray-900 mt-2">{value}</p>
        <p className="text-xs text-gray-400 mt-1">{subtext}</p>
    </div>
);

// --- Main Component ---

export default function AdminDashboard() {
    const navigate = useNavigate();
    // 1. Analytics & Booking Stats (Using Mock Data)
    const [analytics, setAnalytics] = useState(MOCK_ANALYTICS_DATA);

    // 2. Vendor Counts (Fetched from API)
    const [vendorCounts, setVendorCounts] = useState({
        total: MOCK_ANALYTICS_DATA.totalUsers, // Start with mock user count
        pending: 0,
        approved: 0, // Placeholder
        rejected: 0, // Placeholder
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch PENDING vendors (available API)
        fetchVendorCounts();
    }, []);

    const fetchVendorCounts = async () => {
        setLoading(true);
        try {
            // 🚨 Available route: Fetches only status="pending" vendors
            const res = await apiClient.get("/api/admin/vendors/pending");
            const pendingCount = (res.data || []).length;

            // Note: Approved/Rejected counts need separate APIs, using placeholder 
            // and combining with total users for a sensible (though fake) 'Total'

            setVendorCounts(prev => ({
                ...prev,
                pending: pendingCount,
                // Assuming all users are potential vendors/customers for total count
                total: prev.total + pendingCount
            }));

        } catch (err) {
            console.error("Error fetching vendor counts:", err);
            toast.error("Error: Vendor API check failed. Using mock counts.");
            // Keep counts at 0 if API fails, rely on mock total users
            setVendorCounts(prev => ({ ...prev, pending: 0, total: MOCK_ANALYTICS_DATA.totalUsers }));
        } finally {
            setLoading(false);
        }
    };

    // 💡 Placeholder for a function to handle viewing detailed lists
    const handleViewList = (status) => {
        if (status === 'pending') {
            // Navigate to the Pending Vendors Management page
            // (Assumes a route like /admin/pending-vendors exists)
            // You might need to use useNavigate() hook here
            toast.info("Navigating to Pending Vendor Management...");
        } else {
            toast.info(`Fetching detailed list for ${status}... (API needed)`);
        }
    };


    return (
        <div className="p-4 sm:p-8 pt-24 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Platform Analytics Dashboard</h1>

            {/* --- SECTION 1: WEBSITE TRAFFIC & USER GROWTH --- */}
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Website & User Growth</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

                <DashboardCard
                    title="Total Registered Users"
                    value={loading ? '...' : analytics.totalUsers}
                    subtext="Customers & Vendors combined"
                    icon={<FaUsers />}
                    color="border-indigo-500"
                />
                <DashboardCard
                    title="New Signups (30 Days)"
                    value={loading ? '...' : analytics.newSignupsLast30Days}
                    subtext="User/Vendor Accounts Created"
                    icon={<FaChartLine />}
                    color="border-purple-500"
                />
                <DashboardCard
                    title="Avg. Session Duration"
                    value={loading ? '...' : analytics.avgSessionDuration}
                    subtext="How long users stay on site"
                    icon={<FaClock />}
                    color="border-teal-500"
                />
                <DashboardCard
                    title="Current Platform Health"
                    value="EXCELLENT"
                    subtext="All systems operational"
                    icon={<FaBolt />}
                    color="border-pink-500"
                />
            </div>

            {/* --- SECTION 2: VENDOR MANAGEMENT STATUS --- */}
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Vendor Management Status</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

                {/* Total Vendors (Placeholder count) */}
                <DashboardCard
                    title="Total Vendor Profiles"
                    value={loading ? '...' : vendorCounts.total}
                    subtext="Total profiles in the system"
                    icon={<FaStore />}
                    color="border-blue-500"
                />

                {/* Pending Approval (Actual Count) */}
                <DashboardCard
                    title="Approval Pending"
                    value={loading ? '...' : vendorCounts.pending}
                    subtext="Profiles requiring immediate review"
                    icon={<FaClock />}
                    color="border-yellow-500"
                />

                {/* Approved (Placeholder Count) */}
                <DashboardCard
                    title="Approved & Live"
                    value={loading ? '...' : vendorCounts.approved}
                    subtext="Vendors listed on site"
                    icon={<FaCheckCircle />}
                    color="border-green-500"
                />

                {/* Rejected (Placeholder Count) */}
                <DashboardCard
                    title="Rejected"
                    value={loading ? '...' : vendorCounts.rejected}
                    subtext="Profiles not meeting criteria"
                    icon={<FaTimesCircle />}
                    color="border-red-500"
                />
            </div>

            {/* --- SECTION 3: BOOKING & FINANCE METRICS --- */}
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Booking & Finance</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                <DashboardCard
                    title="Total Booking Value"
                    value={loading ? '...' : analytics.totalRevenue}
                    subtext="All bookings to date"
                    icon={<FaDollarSign />}
                    color="border-indigo-500"
                />
                <DashboardCard
                    title="Total Bookings (Confirmed)"
                    value={loading ? '...' : analytics.totalBookings}
                    subtext="Since launch"
                    icon={<FaCalendarAlt />}
                    color="border-cyan-500"
                />
                <DashboardCard
                    title="Cancellation Rate"
                    value={loading ? '...' : analytics.cancellationRate}
                    subtext="Percentage of cancelled bookings"
                    icon={<FaTimesCircle />}
                    color="border-red-500"
                />
            </div>

            {/* --- SECTION 4: CONTROL PANEL SHORTCUTS --- */}
            <h2 className="text-2xl font-bold text-gray-800 mb-4 mt-8">Quick Control Panel</h2>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-wrap gap-4">
                <button
                    onClick={() => handleViewList('pending')}
                    className="bg-yellow-500 text-white px-5 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition shadow-md flex items-center gap-2"
                >
                    <FaClock /> Review Pending Vendors ({vendorCounts.pending})
                </button>
                <button
                    onClick={() => handleViewList('history')}
                    className="bg-pink-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-pink-700 transition shadow-md flex items-center gap-2"
                >
                    <FaCalendarAlt /> View Approval History
                </button>
                <button
                    onClick={() => navigate('/admin/enquiries')}
                    className="bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md flex items-center gap-2"
                >
                    <FaEnvelope /> View User Enquiries
                </button>
                <button
                    onClick={() => handleViewList('users')}
                    className="bg-gray-700 text-white px-5 py-3 rounded-lg font-semibold hover:bg-gray-800 transition shadow-md flex items-center gap-2"
                >
                    <FaUsers /> Manage All Users
                </button>
            </div>
        </div>
    );
}