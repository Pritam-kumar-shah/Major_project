// src/components/AdminPendingVendors.jsx (Final Version with Live History and Details Modal)

import React, { useEffect, useState, useMemo, useCallback } from "react";
import apiClient from "../../api/apiClient";
import { toast } from "react-toastify";
import { 
    FaCheckCircle, FaTimesCircle, FaClock, FaStore, FaCalendarAlt, FaAngleDown, FaAngleUp,
    FaMapMarkerAlt, FaSearch, FaUserAlt, FaEnvelope, FaPhone, FaBuilding, FaInfoCircle
} from 'react-icons/fa';

// --- Helper Components ---

// 1. Count Card for Summary
const CountCard = ({ title, count, icon, color }) => (
    <div className={`flex flex-col items-start p-6 rounded-xl shadow-lg border-l-4 ${color} bg-white transition-shadow hover:shadow-xl w-full sm:w-1/2 lg:w-[calc(25%-15px)]`}>
        <div className="flex items-center justify-between w-full">
            <h3 className="text-sm font-medium text-gray-500 uppercase">{title}</h3>
            <span className={`text-3xl ${color.replace('border-', 'text-')}`}>{icon}</span>
        </div>
        <p className="text-4xl font-extrabold text-gray-900 mt-2">{count}</p>
    </div>
);

// 2. Status Badge 
const StatusBadge = ({ status }) => {
    const baseClasses = "text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1";
    switch (status) {
        case 'approved':
            return <span className={`${baseClasses} bg-green-100 text-green-700`}><FaCheckCircle size={10} /> Approved</span>;
        case 'rejected':
            return <span className={`${baseClasses} bg-red-100 text-red-700`}><FaTimesCircle size={10} /> Rejected</span>;
        case 'pending':
            return <span className={`${baseClasses} bg-yellow-100 text-yellow-700`}><FaClock size={10} /> Pending</span>;
        default:
            return <span className={`${baseClasses} bg-gray-100 text-gray-700`}>N/A</span>;
    }
};

// 3. Date Formatter
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
};

// 4. Vendor Details Modal (NEW Component)
const VendorDetailsModal = ({ vendor, onClose }) => {
    if (!vendor) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-pink-600 flex items-center gap-2">
                        <FaBuilding /> {vendor.businessName}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-900 text-2xl font-bold">&times;</button>
                </div>

                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {/* Header/Image */}
                    <div className="flex gap-4 mb-6 items-start">
                        <img
                            src={vendor.profileImage || 'https://via.placeholder.com/100?text=Vendor'}
                            alt={vendor.businessName}
                            className="w-24 h-24 object-cover rounded-full border-4 border-gray-100 shadow-md"
                        />
                        <div>
                            <p className="text-lg font-semibold text-gray-700 mb-1 flex items-center gap-2">
                                <FaMapMarkerAlt size={14} className="text-blue-500" /> 
                                Location: {vendor.location?.city || 'N/A'}, {vendor.location?.state || 'N/A'}
                            </p>
                            <StatusBadge status={vendor.status} />
                            <p className="text-sm text-gray-500 mt-1">Last Action: {formatDate(vendor.updatedAt)}</p>
                        </div>
                    </div>

                    {/* Owner Details */}
                    <h3 className="text-xl font-semibold border-b pb-2 mb-4 text-gray-800 flex items-center gap-2">
                        <FaUserAlt size={16} className="text-pink-500"/> Owner Information
                    </h3>
                    <div className="space-y-2 text-gray-700">
                        <p className="flex items-center gap-3"><FaUserAlt size={14} className="text-pink-400"/> Name: <span className="font-medium">{vendor.user.name}</span></p>
                        <p className="flex items-center gap-3"><FaEnvelope size={14} className="text-pink-400"/> Email: <span className="font-medium">{vendor.user.email}</span></p>
                        <p className="flex items-center gap-3"><FaPhone size={14} className="text-pink-400"/> Phone: <span className="font-medium">{vendor.user.phone || 'N/A'}</span></p>
                    </div>

                    {/* Other Details (Add more fields from your VendorProfile model here) */}
                    <h3 className="text-xl font-semibold border-b pb-2 mt-6 mb-4 text-gray-800 flex items-center gap-2">
                        <FaInfoCircle size={16} className="text-pink-500"/> Other Details
                    </h3>
                    <div className="space-y-2 text-gray-700">
                        <p>Description: <span className="font-medium text-sm italic">{vendor.description || 'No description provided.'}</span></p>
                        <p>GSTIN: <span className="font-medium">{vendor.gstin || 'N/A'}</span></p>
                        <p>Bank Account: <span className="font-medium">{vendor.bankAccount || 'N/A'}</span></p>
                        {/* Example of a required field from your model: */}
                        <p>Featured Status: <span className={`font-medium ${vendor.isFeatured ? 'text-green-600' : 'text-red-600'}`}>{vendor.isFeatured ? 'Yes' : 'No'}</span></p>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-b-xl border-t text-right">
                    <button onClick={onClose} className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Main Component ---

export default function AdminPendingVendors() {
    const [pendingVendors, setPendingVendors] = useState([]); 
    const [loadingPending, setLoadingPending] = useState(true);

    const [vendorHistory, setVendorHistory] = useState([]); 
    const [loadingHistory, setLoadingHistory] = useState(true);
    
    const [showHistory, setShowHistory] = useState(false); 
    const [historySearchTerm, setHistorySearchTerm] = useState('');

    // ⭐ NEW STATE for Modal
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedVendorDetails, setSelectedVendorDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    
    // --- Data Calculation for Summary ---
    const { approvedCount, rejectedCount } = useMemo(() => {
        const approved = vendorHistory.filter(v => v.status === 'approved').length;
        const rejected = vendorHistory.filter(v => v.status === 'rejected').length;
        return { approvedCount: approved, rejectedCount: rejected };
    }, [vendorHistory]);

    const [vendorCounts, setVendorCounts] = useState({ 
        approved: 0, 
        rejected: 0, 
        pending: 0, 
        total: 0
    });

    // --- Data Fetching Logic (History List) ---

    const fetchVendorHistory = useCallback(async () => {
        try {
            setLoadingHistory(true);
            // ⭐ API Call for History List
            const res = await apiClient.get("/api/admin/vendors/history"); 
            
            const historyData = (res.data || []).map(v => ({
                ...v,
                user: v.user || { name: 'N/A', email: 'N/A' },
            }));

            setVendorHistory(historyData);
            
            const approved = historyData.filter(v => v.status === 'approved').length;
            const rejected = historyData.filter(v => v.status === 'rejected').length;

            setVendorCounts(prev => ({
                ...prev,
                approved: approved,
                rejected: rejected,
                total: approved + rejected + prev.pending 
            }));
            
        } catch (err) {
            console.error("Error fetching vendor history:", err);
            toast.error("Error fetching VENDOR HISTORY data.");
            setVendorHistory([]);
            setVendorCounts(prev => ({...prev, approved: 0, rejected: 0, total: prev.pending }));
        } finally {
            setLoadingHistory(false);
        }
    }, []);

    // --- Data Fetching Logic (Pending List) ---

    const fetchPendingVendors = useCallback(async () => {
        try {
            setLoadingPending(true);
            const res = await apiClient.get("/api/admin/vendors/pending"); 
            
            const processedVendors = (res.data || []).map(v => ({
                ...v,
                user: v.user || { name: 'N/A', email: 'N/A' },
                status: 'pending' 
            }));
            
            setPendingVendors(processedVendors);
            
            setVendorCounts(prev => ({
                ...prev,
                pending: processedVendors.length,
                total: prev.approved + prev.rejected + processedVendors.length
            }));
            
        } catch (err) {
            console.error("Error fetching pending vendors:", err);
            toast.error("Error fetching PENDING vendor data.");
            setPendingVendors([]);
            setVendorCounts(prev => ({...prev, pending: 0, total: prev.approved + prev.rejected }));
        } finally {
            setLoadingPending(false);
        }
    }, []);
    
    // --- Data Fetching Logic (Single Vendor Details) ---
    const fetchVendorDetails = useCallback(async (vendorId) => {
        try {
            setLoadingDetails(true);
            setShowDetailsModal(true);

            // ⭐ API Call for Single Vendor Details
            const res = await apiClient.get(`/api/admin/vendors/${vendorId}`);
            
            const details = {
                ...res.data,
                user: res.data.user || { name: 'N/A', email: 'N/A', phone: 'N/A' },
                // सुनिश्चित करें कि status भी मौजूद है
                status: res.data.status || 'N/A' 
            };
            
            setSelectedVendorDetails(details);
        } catch (err) {
            console.error("Error fetching vendor details:", err);
            toast.error("Failed to fetch full vendor details.");
            setSelectedVendorDetails(null);
        } finally {
            setLoadingDetails(false);
        }
    }, []);

    // --- Initial Data Load ---
    useEffect(() => {
        fetchVendorHistory();
        fetchPendingVendors(); 
    }, [fetchVendorHistory, fetchPendingVendors]); 

    // --- Action & Utility Logic ---

    const handleAction = async (vendorId, action) => {
        try {
            await apiClient.put(`/api/admin/vendors/${vendorId}/${action}`);
            toast.success(`Vendor ${action}d successfully`);
            
            // Re-fetch both lists for guaranteed data sync 
            // (or use local state update logic if performance is critical)
            fetchPendingVendors();
            fetchVendorHistory();

            // Note: If you want instant UI update without re-fetching everything, 
            // the previous local state logic (removing from pending, adding to history) 
            // was correct and faster. I've switched to re-fetch for simplicity/robustness after action.
            
        } catch (err) {
            console.error(err);
            toast.error("Action failed");
        }
    };
    
    // History filtering logic
    const filteredHistory = useMemo(() => {
        if (!historySearchTerm) return vendorHistory;
        const lowerSearchTerm = historySearchTerm.toLowerCase();
        return vendorHistory.filter(vendor => 
            vendor.businessName.toLowerCase().includes(lowerSearchTerm) ||
            (vendor.user.name && vendor.user.name.toLowerCase().includes(lowerSearchTerm))
        );
    }, [vendorHistory, historySearchTerm]);


    if (loadingPending && loadingHistory) return <div className="p-8 text-center"><p className="text-xl font-semibold text-pink-600">Loading Admin Dashboard...</p></div>;
    
    // --- JSX Render ---
    return (
        <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Vendor Management</h1>

            {/* 1. Summary Cards */}
            <div className="flex flex-wrap gap-4 sm:gap-6 mb-12 justify-start">
                {/* Note: Total count calculation relies on the latest counts from API, which is fine here. */}
                <CountCard 
                    title="Total Vendors" 
                    count={vendorCounts.total} 
                    icon={<FaStore />} 
                    color="border-blue-500" 
                />
                <CountCard 
                    title="Approved Vendors" 
                    count={vendorCounts.approved} 
                    icon={<FaCheckCircle />} 
                    color="border-green-500" 
                />
                <CountCard 
                    title="Pending Approval" 
                    count={vendorCounts.pending} 
                    icon={<FaClock />} 
                    color="border-yellow-500" 
                />
                <CountCard 
                    title="Rejected Vendors" 
                    count={vendorCounts.rejected} 
                    icon={<FaTimesCircle />} 
                    color="border-red-500" 
                />
            </div>
            
            {/* 2. Pending Vendors List (Action View) */}
            <div className="bg-white p-6 rounded-xl shadow-lg mb-12 border border-gray-100">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <FaClock className="text-yellow-500"/> Profiles Requiring Review ({vendorCounts.pending})
                </h2>
                
                {vendorCounts.pending === 0 ? (
                    <p className="text-gray-500 p-4 border border-gray-200 rounded-lg text-center">
                        All clear! No vendors are currently pending approval.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingVendors.map((vendor) => (
                            <div
                                key={vendor._id}
                                className="border border-yellow-300 rounded-xl shadow-sm p-4 bg-white hover:shadow-lg transition duration-200"
                            >
                                <img
                                    src={vendor.profileImage || 'https://via.placeholder.com/250x150?text=No+Image'}
                                    alt={vendor.businessName}
                                    className="w-full h-32 object-cover rounded-lg mb-3"
                                />
                                <h3 className="text-lg font-bold truncate text-pink-600 cursor-pointer hover:underline"
                                    onClick={() => fetchVendorDetails(vendor._id)}>
                                    {vendor.businessName}
                                </h3>
                                <p className="text-sm text-gray-600">Owner: {vendor.user.name}</p>
                                <p className="text-xs text-gray-500 mb-3">Email: {vendor.user.email}</p>
                                
                                <div className="flex gap-3 mt-4">
                                    <button 
                                        onClick={() => handleAction(vendor._id, "approve")} 
                                        className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition"
                                    >
                                        <FaCheckCircle className="inline mr-1" size={12}/> Approve
                                    </button>
                                    <button 
                                        onClick={() => handleAction(vendor._id, "reject")}
                                        className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition"
                                    >
                                        <FaTimesCircle className="inline mr-1" size={12}/> Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 3. History Table (Approved/Rejected) */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                        <FaCalendarAlt className="text-pink-600"/> Approval/Rejection History ({vendorHistory.length})
                    </h2>
                    <button 
                        onClick={() => setShowHistory(!showHistory)} 
                        className="text-pink-600 hover:text-pink-800 flex items-center gap-2 font-medium"
                    >
                        {showHistory ? 'Hide History' : 'Show History'}
                        {showHistory ? <FaAngleUp /> : <FaAngleDown />}
                    </button>
                </div>
                
                {showHistory && (
                    <>
                        {/* Search Input for History */}
                        <div className="relative mb-6">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                type="text"
                                placeholder="Search History by Business Name or Owner..."
                                value={historySearchTerm}
                                onChange={(e) => setHistorySearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                            />
                        </div>

                        {loadingHistory ? (
                            <div className="p-4 text-center text-gray-500">Loading history...</div>
                        ) : vendorHistory.length === 0 ? (
                            <div className="p-4 text-center text-red-500 border border-red-200 bg-red-50 rounded-lg">
                                <p className="font-semibold mb-2">No history records to display.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th> {/* NEW Header */}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredHistory.map((vendor) => (
                                            <tr key={vendor._id} className="hover:bg-gray-50 transition duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{vendor.businessName}</div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1"><FaMapMarkerAlt size={9} /> {vendor.location?.city || 'N/A'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {vendor.user.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <StatusBadge status={vendor.status} />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(vendor.updatedAt)}
                                                </td>
                                                {/* NEW Details Button */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button 
                                                        onClick={() => fetchVendorDetails(vendor._id)}
                                                        className="text-blue-600 hover:text-blue-800 hover:underline"
                                                        disabled={loadingDetails}
                                                    >
                                                        {loadingDetails && selectedVendorDetails?._id === vendor._id ? 'Loading...' : 'View'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* 4. Vendor Details Modal */}
            {showDetailsModal && (
                <VendorDetailsModal 
                    vendor={selectedVendorDetails} 
                    onClose={() => { 
                        setShowDetailsModal(false); 
                        setSelectedVendorDetails(null); 
                    }} 
                />
            )}
        </div>
    );
}