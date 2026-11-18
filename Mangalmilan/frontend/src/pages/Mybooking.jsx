import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/apiClient";
import { toast } from "react-toastify";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaKey,
  FaRupeeSign,
  FaTags,
  FaSpinner,
  FaRegListAlt,
  FaClock,
  FaStore,
  FaExclamationTriangle,
} from "react-icons/fa";

// --- Status Badge ---
const StatusBadge = ({ status }) => {
  const styles = {
    PENDING: "bg-yellow-100 text-yellow-800 border border-yellow-300",
    CONFIRMED: "bg-blue-100 text-blue-800 border border-blue-300",
    REJECTED: "bg-red-100 text-red-800 border border-red-300",
    CANCELLED: "bg-gray-100 text-gray-800 border border-gray-300",
    COMPLETED: "bg-green-100 text-green-800 border border-green-300",
  };
  return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{status}</span>;
};

// --- Cancellation Form (Small Fixed Panel) ---
const CancellationForm = ({ booking, onCancel, onClose }) => {
  const MIN_LENGTH = 50;
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (reason.trim().length < MIN_LENGTH) {
      return toast.error(`Minimum ${MIN_LENGTH} characters required.`);
    }
    setSubmitting(true);
    await onCancel(booking._id, reason);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed top-24 right-4 w-80 p-4 bg-white border rounded shadow-lg z-50">
      <h4 className="text-red-700 font-bold mb-2 flex items-center gap-2">
        <FaExclamationTriangle /> Cancel Booking
      </h4>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder={`Minimum ${MIN_LENGTH} characters...`}
        rows="4"
        className="w-full p-2 border border-red-300 rounded-lg resize-none text-sm"
      />
      <p className={`text-xs mt-1 ${reason.length < MIN_LENGTH ? "text-red-500" : "text-green-600"}`}>
        Characters: {reason.length} / {MIN_LENGTH}
      </p>
      <div className="flex justify-end gap-2 mt-3">
        <button
          onClick={onClose}
          className="px-3 py-1 text-gray-600 border rounded text-sm hover:text-gray-900"
        >
          Close
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting || reason.length < MIN_LENGTH}
          className={`px-3 py-1 text-white rounded text-sm ${
            submitting || reason.length < MIN_LENGTH ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {submitting ? "Cancelling..." : "Submit"}
        </button>
      </div>
    </div>
  );
};

// --- Main Component ---
export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelBookingId, setCancelBookingId] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await apiClient.get("/api/bookings/my-bookings");
        setBookings(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId, reason) => {
    try {
      const { data } = await apiClient.patch(`/api/bookings/${bookingId}/cancel`, { reason });
      setBookings((prev) => prev.map((b) => (b._id === bookingId ? data.booking : b)));
      toast.success("Booking cancelled successfully.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel booking.");
    }
  };

  if (loading)
    return (
      <div className="pt-32 text-center text-gray-500 font-semibold">
        <FaSpinner className="animate-spin mx-auto text-3xl mb-4" />
        Loading your booking history...
      </div>
    );

  const pendingBookings = bookings.filter((b) => b.status === "PENDING");
  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED");
  const historyBookings = bookings.filter((b) => ["REJECTED", "CANCELLED", "COMPLETED"].includes(b.status));

  // --- Small Compact Booking Card ---
  const BookingCard = ({ b, canCancel = false }) => (
    <div className="relative p-3 mb-2 bg-white rounded-md shadow-sm border-l-4 border-gray-300 hover:shadow-md text-sm">
      <div className="flex justify-between items-start mb-1">
        <Link
          to={`/vendor/${b.vendor._id}`}
          className="font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
        >
          <FaStore className="text-pink-500" /> {b.vendor?.businessName || "Unknown Vendor"}
        </Link>
        <StatusBadge status={b.status} />
      </div>

      <div className="grid gap-1">
        <p className="flex items-center gap-1 text-xs"><FaTags /> {b.serviceInfo.name}</p>
        <p className="flex items-center gap-1 text-xs"><FaRupeeSign /> ₹{b.amount.toLocaleString("en-IN")}</p>
        {b.description && <p className="text-gray-600 italic text-xs">Note: {b.description}</p>}
        <p className="flex items-center gap-1 text-xs"><FaCalendarAlt /> {new Date(b.bookingDateTime).toLocaleDateString()}</p>
        <p className="flex items-center gap-1 text-xs"><FaClock /> {new Date(b.createdAt).toLocaleDateString()}</p>
        {b.bookingCode && (
          <p className="flex items-center gap-1 font-mono text-xs bg-blue-50 text-blue-700 p-1 rounded w-fit">
            <FaKey /> {b.bookingCode}
          </p>
        )}
      </div>

      {canCancel && (
        <div className="mt-2">
          <button
            onClick={() => setCancelBookingId(b._id)}
            className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-red-600 rounded hover:bg-red-700"
          >
            <FaTimesCircle /> Cancel
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-4 pt-24 min-h-screen bg-gray-50 relative">
      <h1 className="text-xl font-bold text-gray-800 mb-4">My Booking History</h1>

      {/* CONFIRMED */}
      <section className="mb-4">
        <h2 className="font-semibold text-gray-700 mb-1 flex items-center gap-1 text-sm">
          <FaCheckCircle className="text-green-600" /> Confirmed ({confirmedBookings.length})
        </h2>
        {confirmedBookings.length ? confirmedBookings.map((b) => <BookingCard key={b._id} b={b} canCancel />) : <p className="text-gray-500 text-xs">No confirmed bookings.</p>}
      </section>

      {/* PENDING */}
      <section className="mb-4">
        <h2 className="font-semibold text-gray-700 mb-1 flex items-center gap-1 text-sm">
          <FaClock className="text-yellow-600" /> Pending ({pendingBookings.length})
        </h2>
        {pendingBookings.length ? pendingBookings.map((b) => <BookingCard key={b._id} b={b} canCancel />) : <p className="text-gray-500 text-xs">No pending bookings.</p>}
      </section>

      {/* HISTORY */}
      <section className="mb-4">
        <h2 className="font-semibold text-gray-700 mb-1 flex items-center gap-1 text-sm">
          <FaRegListAlt className="text-gray-500" /> Past ({historyBookings.length})
        </h2>
        {historyBookings.length ? historyBookings.map((b) => <BookingCard key={b._id} b={b} />) : <p className="text-gray-500 text-xs">No past bookings.</p>}
      </section>

      {/* Small Fixed Cancel Panel */}
      {cancelBookingId && (
        <CancellationForm
          booking={bookings.find((b) => b._id === cancelBookingId)}
          onCancel={handleCancelBooking}
          onClose={() => setCancelBookingId(null)}
        />
      )}
    </div>
  );
}
