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
    FaFlagCheckered,
    FaKey,
    FaArrowRight,
    FaTrash,
    FaAngleDown,
    FaAngleUp,
    FaInfoCircle,
    FaSearch,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// ✅ STATUS BADGE COMPONENT (No Change)
const StatusBadge = ({ status }) => {
    const styles = {
        PENDING: "bg-yellow-100 text-yellow-700 border border-yellow-300",
        CONFIRMED: "bg-blue-100 text-blue-700 border border-blue-300",
        REJECTED: "bg-red-100 text-red-700 border border-red-300",
        CANCELLED: "bg-gray-100 text-gray-700 border border-gray-300",
        COMPLETED: "bg-green-100 text-green-700 border border-green-300",
    };
    return (
        <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[status]}`}
        >
            {status}
        </span>
    );
};

// ✅ COMPLETION FORM COMPONENT (No Change)
const CompletionForm = ({
    booking,
    handleCompletion,
    completionState,
    handleCodeChange,
    setCompletionState,
}) => {
    const onSubmit = (e) => {
        e.preventDefault();
        handleCompletion(booking);
    };

    return (
        <motion.form
            onSubmit={onSubmit}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-3 bg-gray-50 p-4 rounded-xl mt-3 border border-gray-200 shadow-sm"
        >
            <div className="flex items-center gap-2">
                <FaKey className="text-gray-400" />
                <input
                    type="text"
                    placeholder="Enter customer's 6-digit code"
                    className="border p-2 rounded-lg flex-grow focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-sm sm:text-base"
                    value={completionState.code}
                    onChange={handleCodeChange}
                    maxLength={6}
                    autoFocus
                />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <button
                    type="submit"
                    className="flex items-center justify-center gap-2 py-2 px-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all font-semibold w-full sm:w-auto"
                >
                    <FaCheckCircle /> Verify & Complete
                </button>
                <button
                    type="button"
                    onClick={() => setCompletionState({ bookingId: null, code: "" })}
                    className="py-2 px-4 text-gray-600 hover:text-gray-900 border rounded-lg w-full sm:w-auto"
                >
                    Cancel
                </button>
            </div>
        </motion.form>
    );
};

// ✅ BOOKING DETAILS MODAL (NEW/UPDATED Component for Full Details)
const BookingDetailsModal = ({ booking, onClose, loading }) => {
    if (!booking) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-pink-600 flex items-center gap-2">
                        <FaInfoCircle /> Booking Details
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-900 text-2xl font-bold">&times;</button>
                </div>

                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Fetching details...</div>
                    ) : (
                        <div className="space-y-4 text-gray-700">
                            <p className="text-lg font-bold border-b pb-2">{booking.serviceInfo.name || "Custom Service"}</p>
                            
                            <div className="flex justify-between items-center">
                                <StatusBadge status={booking.status} />
                                <div className="text-2xl font-bold text-green-600">
                                    ₹{booking.amount?.toLocaleString("en-IN") || 'N/A'}
                                </div>
                            </div>

                            <p className="flex items-center gap-2 text-base text-purple-600 font-semibold">
                                <FaCalendarAlt /> Event Date/Time: {new Date(booking.bookingDateTime).toLocaleString()}
                            </p>
                            <p className="flex items-center gap-2 text-sm text-gray-500">
                                Booked On: {new Date(booking.createdAt).toLocaleDateString()}
                            </p>
                            
                            <h3 className="text-md font-semibold pt-4 border-t mt-4">Customer:</h3>
                            <p className="flex items-center gap-2"><FaUser /> {booking.customerInfo.name}</p>
                            <p className="flex items-center gap-2"><FaPhone /> {booking.customerInfo.phone}</p>
                            
                            {booking.notes && (
                                <p className="text-sm text-gray-500 border-t pt-2">Notes: <span className="italic">{booking.notes}</span></p>
                            )}

                            {booking.status === "REJECTED" && booking.cancellationDetails?.reason && (
                                <p className="text-sm text-red-600 mt-2">
                                    Rejection Reason: <span className="font-medium">{booking.cancellationDetails.reason}</span>
                                </p>
                            )}
                            {/* Add more fields (e.g., Address, Payment ID, etc.) here */}
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


// ✅ MAIN VENDOR BOOKINGS PAGE
export default function VendorBookingsPage() {
    const { user } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [completionState, setCompletionState] = useState({
        bookingId: null,
        code: "",
    });

    // ⭐ NEW STATE for Details Modal
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedBookingDetails, setSelectedBookingDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [historySearchTerm, setHistorySearchTerm] = useState('');


    // ✅ FETCH BOOKINGS
    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            // Assuming this endpoint returns ALL bookings (pending, confirmed, completed, etc.)
            const { data } = await apiClient.get("/api/bookings/vendor");
            const sorted = data.sort(
                (a, b) => new Date(b.bookingDateTime) - new Date(a.bookingDateTime)
            );
            setBookings(sorted);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load bookings");
        } finally {
            setLoading(false);
        }
    }, []);

    // ✅ FETCH SINGLE BOOKING DETAILS (Simulated or Real API call)
    const fetchBookingDetails = async (bookingId) => {
        // ⭐ NOTE: Replace this with your actual API call if you have one.
        // Example: const { data } = await apiClient.get(`/api/bookings/${bookingId}`);

        setLoadingDetails(true);
        setShowDetailsModal(true);
        setSelectedBookingDetails(null); 
        
        try {
            // For now, find details from the current state (bookings array)
            const fullDetails = bookings.find(b => b._id === bookingId);
            
            // ⭐ If you had a separate API for full details, call it here:
            // const { data } = await apiClient.get(`/api/bookings/${bookingId}`);
            // setSelectedBookingDetails(data);

            if (fullDetails) {
                setSelectedBookingDetails(fullDetails);
            } else {
                toast.error("Booking details not found locally. Please implement API fetch.");
            }

        } catch (err) {
            toast.error("Failed to fetch booking details.");
        } finally {
            setLoadingDetails(false);
        }
    };


    useEffect(() => {
        if (user) fetchBookings();
    }, [fetchBookings, user]);

    // ✅ UPDATE STATUS HANDLER (No Change)
    const handleUpdateStatus = async (bookingId, status) => {
        try {
            const { data } = await apiClient.patch(
                `/api/bookings/vendor/${bookingId}/status`,
                { status }
            );
            setBookings((prev) =>
                prev.map((b) => (b._id === bookingId ? data.booking : b))
            );
            toast.success(data.message || `Booking ${status}`);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update status");
        }
    };

    // ✅ COMPLETE BOOKING HANDLER (No Change)
    const handleCompletion = async (booking) => {
        try {
            const { data } = await apiClient.patch(
                `/api/bookings/vendor/${booking._id}/complete`,
                { bookingCode: completionState.code.trim() }
            );
            toast.success(data.message);
            setBookings((prev) =>
                prev.map((b) => (b._id === booking._id ? data.booking : b))
            );
            setCompletionState({ bookingId: null, code: "" });
        } catch (err) {
            toast.error(err.response?.data?.message || "Invalid booking code");
            setCompletionState((prev) => ({ ...prev, code: "" }));
        }
    };

    const handleCodeChange = (e) => {
        setCompletionState((prev) => ({ ...prev, code: e.target.value.toUpperCase().slice(0, 6) }));
    };

    if (loading)
        return (
            <div className="pt-32 text-center text-gray-500 font-semibold">
                Loading your bookings...
            </div>
        );

    // ✅ FILTER BOOKINGS
    const pending = bookings.filter((b) => b.status === "PENDING");
    const confirmed = bookings.filter((b) => b.status === "CONFIRMED");
    const cancelled = bookings.filter((b) => b.status === "CANCELLED");
    
    // History includes COMPLETED and REJECTED
    const history = bookings.filter((b) =>
        ["REJECTED", "COMPLETED"].includes(b.status)
    );
    
    // Filtered History for the table
    const filteredHistory = history.filter(b => 
        b.customerInfo.name.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
        b.serviceInfo.name.toLowerCase().includes(historySearchTerm.toLowerCase())
    );


    // ✅ REUSABLE BOOKING CARD (No Change)
    const BookingCard = ({ b, isConfirmed = false, isCancelled = false }) => (
        <motion.div
            key={b._id}
            layout
            className={`bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition border-l-4 flex flex-col justify-between ${
                isConfirmed
                    ? "border-blue-500"
                    : isCancelled
                    ? "border-red-500 opacity-80"
                    : "border-yellow-500"
            }`}
        >
            <div className="space-y-3">
                <div className="flex justify-between items-start flex-wrap gap-2">
                    <h3 className="font-bold text-lg sm:text-xl text-gray-800 leading-snug">
                        {b.serviceInfo.name || "Custom Service"}
                    </h3>
                    <StatusBadge status={b.status} />
                </div>

                <div className="mt-2 text-sm text-gray-600 space-y-1.5">
                    <p className="flex items-center gap-2 text-base text-purple-600 font-semibold">
                        <FaCalendarAlt /> Event: {new Date(b.bookingDateTime).toLocaleString()}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-gray-500">
                        <FaCalendarAlt className="text-xs" /> Booked on:{" "}
                        {new Date(b.createdAt).toLocaleDateString()}
                    </p>
                    <p className="flex items-center gap-2 pt-2">
                        <FaUser /> <strong>{b.customerInfo.name}</strong>
                    </p>
                    <p className="flex items-center gap-2">
                        <FaPhone /> {b.customerInfo.phone}
                    </p>
                    {b.notes && (
                        <p className="text-xs text-gray-500 border-t pt-2">Notes: {b.notes}</p>
                    )}

                    {/* Show cancellation reason */}
                    {isCancelled && b.cancellationDetails?.reason && (
                        <p className="text-xs text-red-600 mt-1 italic">
                            Reason: {b.cancellationDetails.reason}
                        </p>
                    )}
                </div>

                <div className="text-xl font-bold text-green-600 border-t pt-3">
                    ₹{b.amount?.toLocaleString("en-IN") || 'N/A'}
                </div>
            </div>

            {/* --- ACTIONS --- */}
            <div className="mt-5 pt-3 border-t border-gray-100">
                {b.status === "PENDING" && (
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                        <button
                            onClick={() => handleUpdateStatus(b._id, "CONFIRMED")}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition text-sm sm:text-base"
                        >
                            <FaCheckCircle /> Accept
                        </button>
                        <button
                            onClick={() => handleUpdateStatus(b._id, "REJECTED")}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition text-sm sm:text-base"
                        >
                            <FaTimesCircle /> Reject
                        </button>
                    </div>
                )}

                {b.status === "CONFIRMED" && (
                    <AnimatePresence mode="wait">
                        {completionState.bookingId === b._id ? (
                            <CompletionForm
                                booking={b}
                                handleCompletion={handleCompletion}
                                completionState={completionState}
                                handleCodeChange={handleCodeChange}
                                setCompletionState={setCompletionState}
                            />
                        ) : (
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onClick={() =>
                                    setCompletionState({ bookingId: b._id, code: "" })
                                }
                                className="flex items-center justify-center gap-2 w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
                            >
                                <FaFlagCheckered /> Mark as Completed
                            </motion.button>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </motion.div>
    );

    // ✅ MAIN UI
    return (
        <div className="min-h-screen bg-gray-50 pt-24 sm:pt-28 px-3 sm:px-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
                <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 text-center sm:text-left">
                    Manage Your Bookings ({bookings.length})
                </h1>
                <Link
                    to="/vendor/calendar"
                    className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-3 bg-pink-600 text-white font-semibold rounded-lg shadow-lg hover:bg-pink-700 transition text-sm sm:text-base"
                >
                    <FaCalendarAlt className="text-base sm:text-lg" />
                    View Booking Calendar
                    <FaArrowRight className="text-xs" />
                </Link>
            </div>

            {/* --- PENDING --- */}
            <section className="mb-10">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <FaCalendarAlt className="text-yellow-500" /> Pending Requests ({pending.length})
                </h2>
                {pending.length ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {pending.map((b) => (
                            <BookingCard key={b._id} b={b} />
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm sm:text-base p-4 border rounded-lg bg-white">No new pending bookings.</p>
                )}
            </section>

            {/* --- CONFIRMED --- */}
            <section className="mb-10">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <FaCheckCircle className="text-blue-500" /> Confirmed Bookings ({confirmed.length})
                </h2>
                {confirmed.length ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {confirmed.map((b) => (
                            <BookingCard key={b._id} b={b} isConfirmed />
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm sm:text-base p-4 border rounded-lg bg-white">No confirmed bookings yet.</p>
                )}
            </section>

            {/* --- CANCELLED --- */}
            <section className="mb-10">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <FaTrash className="text-red-600" /> Cancelled Bookings ({cancelled.length})
                </h2>
                {cancelled.length ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {cancelled.map((b) => (
                            <BookingCard key={b._id} b={b} isCancelled />
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm sm:text-base p-4 border rounded-lg bg-white">No cancelled bookings.</p>
                )}
            </section>

            {/* ⭐ --- HISTORY (TABLE VIEW) --- ⭐ */}
            <section className="mb-10 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 flex items-center gap-2">
                        <FaCalendarAlt className="text-gray-500" /> Booking History ({history.length})
                    </h2>
                    {/* History Collapse/Expand button - Optional, but good for long pages */}
                    {/* <button className="text-pink-600 hover:text-pink-800 flex items-center gap-2 font-medium">
                        <FaAngleUp /> Hide
                    </button> */}
                </div>
                
                {history.length > 0 && (
                    <div className="relative mb-6">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                        <input
                            type="text"
                            placeholder="Search History by Customer or Service Name..."
                            value={historySearchTerm}
                            onChange={(e) => setHistorySearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                        />
                    </div>
                )}


                {history.length === 0 ? (
                    <p className="text-gray-500 text-sm sm:text-base p-4 border rounded-lg bg-white">No past bookings available.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredHistory.map((b) => (
                                    <tr key={b._id} className="hover:bg-gray-50 transition duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {b.serviceInfo.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {b.customerInfo.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={b.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-green-600">
                                            ₹{b.amount?.toLocaleString("en-IN") || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(b.bookingDateTime).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button 
                                                onClick={() => fetchBookingDetails(b._id)}
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

            {/* 5. Booking Details Modal */}
            {showDetailsModal && (
                <BookingDetailsModal 
                    booking={selectedBookingDetails} 
                    onClose={() => { 
                        setShowDetailsModal(false); 
                        setSelectedBookingDetails(null); 
                    }} 
                    loading={loadingDetails}
                />
            )}
        </div>
    );
}