import React, { useEffect, useState, useContext, useCallback } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../api/apiClient";
import { AuthContext } from "../../context/auth.jsx";
import { toast } from "react-toastify";
import {
    FaUser,
    FaPhone,
    FaCalendarAlt,
    FaCheckCircle,
    FaTimesCircle,
    FaInfoCircle,
    FaCommentDots,
    FaSpinner,
    FaEnvelope, // Added Email Icon
    FaMapMarkerAlt, // Added Location Icon
    FaSearch, // Added Search Icon
} from "react-icons/fa";
import dayjs from "dayjs";

// --- Helper Components ---

// ✅ STATUS BADGE COMPONENT (No Change)
const StatusBadge = ({ status }) => {
    const styles = {
        PENDING: "bg-yellow-100 text-yellow-800 border border-yellow-300",
        CONTACTED: "bg-green-100 text-green-800 border border-green-300",
        REJECTED: "bg-red-100 text-red-800 border border-red-300",
    };
    return (
        <span
            className={`px-2 py-0.5 text-[10px] sm:text-xs font-semibold rounded-full ${styles[status]}`}
        >
            {status}
        </span>
    );
};

// ✅ ENQUIRY DETAILS MODAL (UPDATED to show Email and Location)
const EnquiryDetailsModal = ({ enquiry, onClose, loading }) => {
    if (!enquiry) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl transform transition-all">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl sm:text-2xl font-bold text-pink-600 flex items-center gap-2">
                        <FaCommentDots /> Enquiry from {enquiry.user?.name || 'Guest'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-900 text-2xl font-bold">&times;</button>
                </div>

                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500 flex justify-center items-center gap-2">
                            <FaSpinner className="animate-spin" /> Fetching details...
                        </div>
                    ) : (
                        <div className="space-y-5 text-gray-700">
                            {/* Status & Date */}
                            <div className="flex justify-between items-start border-b pb-3">
                                <StatusBadge status={enquiry.status} />
                                <p className="text-xs text-gray-500">
                                    Received: {new Date(enquiry.createdAt).toLocaleString()}
                                </p>
                            </div>

                            {/* Customer Details */}
                            <h3 className="text-lg font-semibold border-b pb-1 text-gray-800 flex items-center gap-2">
                                <FaUser /> Customer Information
                            </h3>
                            <div className="space-y-2 text-sm pl-4">
                                <p className="flex items-center gap-2"><FaUser size={12} className="text-pink-400"/> Name: <span className="font-medium">{enquiry.user?.name || 'Guest'}</span></p>
                                <p className="flex items-center gap-2"><FaPhone size={12} className="text-pink-400"/> Phone: <span className="font-medium">{enquiry.phone || 'N/A'}</span></p>
                                
                                {/* ⭐ NEW: Email field added */}
                                <p className="flex items-center gap-2"><FaEnvelope size={12} className="text-pink-400"/> Email: <span className="font-medium">{enquiry.email || enquiry.user?.email || 'N/A'}</span></p>
                                
                                {/* ⭐ NEW: Location field added */}
                                <p className="flex items-center gap-2"><FaMapMarkerAlt size={12} className="text-pink-400"/> Location: <span className="font-medium">{enquiry.location || 'N/A'}</span></p>
                            </div>
                            
                            {/* Event & Message Details */}
                            <h3 className="text-lg font-semibold pt-4 border-t pb-1 text-gray-800 flex items-center gap-2">
                                <FaCommentDots /> Message & Event
                            </h3>
                            <div className="space-y-2 text-sm pl-4">
                                <p className="flex items-start gap-2">
                                    <FaInfoCircle size={14} className="text-blue-500 mt-1 flex-shrink-0"/> 
                                    <span className="font-semibold text-base">Message:</span> 
                                </p>
                                <p className="p-3 border rounded-lg bg-gray-50 italic text-sm whitespace-pre-wrap">{enquiry.message || 'N/A'}</p>
                                
                                <p className="flex items-center gap-2 pt-2">
                                    <FaCalendarAlt size={14} className="text-purple-600"/> Event Date: <span className="font-medium">{new Date(enquiry.eventDate).toLocaleDateString()}</span>
                                </p>
                            </div>

                        </div>
                    )}
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


// ✅ MAIN VENDOR ENQUIRY PAGE
export default function VendorEnquiryPage() {
    const { user } = useContext(AuthContext);
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);

    // ⭐ NEW STATES for Details Modal and Search
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedEnquiryDetails, setSelectedEnquiryDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [historySearchTerm, setHistorySearchTerm] = useState('');


    // ✅ Status Badge (local copy for use inside map)
    const StatusBadge = ({ status }) => {
        const styles = {
            PENDING: "bg-yellow-100 text-yellow-800 border border-yellow-300",
            CONTACTED: "bg-green-100 text-green-800 border border-green-300",
            REJECTED: "bg-red-100 text-red-800 border border-red-300",
        };
        return (
            <span
                className={`px-2 py-0.5 text-[10px] sm:text-xs font-semibold rounded-full ${styles[status]}`}
            >
                {status}
            </span>
        );
    };


    // ✅ FETCH ALL ENQUIRIES
    const fetchEnquiries = useCallback(async () => {
        setLoading(true);
        try {
            // NOTE: Assuming /api/enquiry/vendor/${user._id} fetches ALL enquiries for this vendor
            const { data } = await apiClient.get(`/api/enquiry/vendor/${user._id}`);
            const sortedData = data.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            setEnquiries(sortedData);
        } catch (err) {
            console.error("Error fetching enquiries:", err);
            toast.error(err.response?.data?.message || "Failed to load enquiries");
        } finally {
            setLoading(false);
        }
    }, [user]);
    
    // ✅ FETCH SINGLE ENQUIRY DETAILS
    const fetchEnquiryDetails = async (enquiryId) => {
        setLoadingDetails(true);
        setShowDetailsModal(true);
        setSelectedEnquiryDetails(null); 
        
        try {
            // ⭐ Data is fetched from the currently loaded 'enquiries' state.
            const fullDetails = enquiries.find(e => e._id === enquiryId);

            if (fullDetails) {
                setSelectedEnquiryDetails(fullDetails);
            } else {
                toast.error("Enquiry details not found locally.");
            }

        } catch (err) {
            toast.error("Failed to fetch enquiry details.");
        } finally {
            setLoadingDetails(false);
        }
    };


    useEffect(() => {
        if (user) fetchEnquiries();
    }, [user, fetchEnquiries]);


    // ✅ UPDATE STATUS HANDLER
    const updateStatus = async (enquiryId, status) => {
        if (
            status === "REJECTED" &&
            !window.confirm("Are you sure you want to reject this enquiry?")
        ) {
            return;
        }

        try {
            const { data } = await apiClient.patch(`/api/enquiry/${enquiryId}`, {
                status,
            });
            // Update the single enquiry in the state array
            setEnquiries((prev) =>
                prev.map((e) => (e._id === enquiryId ? data.enquiry : e))
            );
            toast.success(`Enquiry marked as ${status.toLowerCase()}`);
        } catch (err) {
            console.error("Failed to update status:", err);
            toast.error("Failed to update status");
        }
    };

    if (loading) {
        return (
            <div className="pt-32 text-center text-gray-500 font-semibold flex justify-center items-center gap-2 text-sm sm:text-base">
                <FaSpinner className="animate-spin" /> Loading your enquiries...
            </div>
        );
    }

    const pendingEnquiries = enquiries.filter((e) => e.status === "PENDING");
    const historyEnquiries = enquiries.filter((e) => e.status !== "PENDING");
    
    // History filtering logic (for the table)
    const filteredHistory = historyEnquiries.filter(e => 
        e.user?.name?.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
        e.message.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
        e.phone.includes(historySearchTerm) ||
        e.email?.toLowerCase().includes(historySearchTerm.toLowerCase())
    );


    // --- JSX Render ---
    return (
        <div className="max-w-5xl mx-auto p-3 sm:p-6 space-y-8 pt-28 sm:pt-32 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                    Your Enquiries
                </h1>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">
                    Manage new and past enquiries from customers.
                </p>
            </div>

            {/* Pending Enquiries (Card Style) */}
            <section>
                <h2 className="text-lg sm:text-2xl font-bold text-gray-700 mb-4 flex items-center gap-2 border-b-2 border-yellow-500 pb-2">
                    <FaCommentDots className="text-yellow-500" />
                    Pending Requests ({pendingEnquiries.length})
                </h2>
                {pendingEnquiries.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                        {pendingEnquiries.map((e) => (
                            <div
                                key={e._id}
                                className="p-3 sm:p-5 bg-white rounded-xl shadow-md border-l-4 border-yellow-500 text-[13px] sm:text-sm"
                            >
                                <div className="flex justify-between items-start gap-2">
                                    <p className="text-gray-800 font-semibold text-sm sm:text-base cursor-pointer hover:underline"
                                       onClick={() => fetchEnquiryDetails(e._id)}>
                                        {e.message.substring(0, 80)}...
                                    </p>
                                    <StatusBadge status={e.status} />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 text-gray-600 border-t pt-3 text-xs sm:text-sm">
                                    <p className="flex items-center gap-1">
                                        <FaUser className="text-gray-400" />
                                        <span className="font-medium">
                                            {e.user?.name || "Guest"}
                                        </span>
                                    </p>
                                    <p className="flex items-center gap-1">
                                        <FaPhone className="text-gray-400" />
                                        {e.phone}
                                    </p>
                                    <p className="flex items-center gap-1">
                                        <FaCalendarAlt className="text-gray-400" />
                                        Event: {new Date(e.eventDate).toLocaleDateString()}
                                    </p>
                                    <p className="flex items-center gap-1 col-span-full text-gray-400 text-[11px] italic">
                                        Received: {new Date(e.createdAt).toLocaleString()}
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                                    <button
                                        onClick={() => updateStatus(e._id, "CONTACTED")}
                                        className="flex items-center justify-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition"
                                    >
                                        <FaCheckCircle /> Mark Contacted
                                    </button>
                                    <button
                                        onClick={() => updateStatus(e._id, "REJECTED")}
                                        className="flex items-center justify-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition"
                                    >
                                        <FaTimesCircle /> Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200 text-xs sm:text-sm">
                        <FaInfoCircle className="mx-auto text-3xl text-gray-400" />
                        <p className="mt-2 text-gray-600">
                            You have no new pending enquiries.
                        </p>
                    </div>
                )}
            </section>

            {/* ⭐ History Section (Table View) ⭐ */}
            <section className="bg-white p-3 sm:p-6 rounded-xl shadow-lg border border-gray-100">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-700 mb-5 flex items-center gap-2 border-b-2 border-gray-400 pb-2">
                    <FaCalendarAlt className="text-gray-500" />
                    Enquiry History ({historyEnquiries.length})
                </h2>
                
                {historyEnquiries.length > 0 && (
                    <div className="relative mb-6">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                        <input
                            type="text"
                            placeholder="Search by Customer Name, Email, or Message..."
                            value={historySearchTerm}
                            onChange={(e) => setHistorySearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 text-sm"
                        />
                    </div>
                )}

                {historyEnquiries.length === 0 ? (
                    <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200 text-xs sm:text-sm">
                        <p className="text-gray-500">No past enquiries to show.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Info</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message Preview</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredHistory.map((e) => (
                                    <tr key={e._id} className="hover:bg-gray-50 transition duration-150">
                                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                            <div className="flex items-center gap-1"><FaUser size={10}/> {e.user?.name || 'Guest'}</div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1"><FaEnvelope size={9} /> {e.email || e.user?.email || 'N/A'}</div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1"><FaPhone size={9} /> {e.phone}</div>
                                        </td>
                                        <td className="px-6 py-3 max-w-[200px] overflow-hidden truncate text-sm text-gray-700" title={e.message}>
                                            {e.message.substring(0, 50)}...
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(e.eventDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap">
                                            <StatusBadge status={e.status} />
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium">
                                            <button 
                                                onClick={() => fetchEnquiryDetails(e._id)}
                                                className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                                disabled={loadingDetails}
                                            >
                                                <FaInfoCircle size={12}/> View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* 4. Enquiry Details Modal */}
            {showDetailsModal && (
                <EnquiryDetailsModal 
                    enquiry={selectedEnquiryDetails} 
                    onClose={() => { 
                        setShowDetailsModal(false); 
                        setSelectedEnquiryDetails(null); 
                    }} 
                    loading={loadingDetails}
                />
            )}
        </div>
    );
}