import React, { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { toast } from 'react-toastify';
import { FaCheck, FaSpinner, FaEnvelope, FaTag, FaClock, FaChevronDown, FaChevronUp, FaHistory, FaCheckCircle } from 'react-icons/fa';

export default function AdminEnquiries() {
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusLoading, setStatusLoading] = useState(null);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        fetchEnquiries();
    }, []);

    const fetchEnquiries = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/api/contact/all');
            setEnquiries(res.data.data || []);
        } catch (err) {
            console.error("Fetch error:", err);
            toast.error("Failed to load enquiries.");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id) => {
        setStatusLoading(id);
        try {
            await apiClient.put(`/api/contact/status/${id}`, { status: 'Complete' });
            toast.success("Enquiry marked as Complete!");
            setEnquiries(prev => prev.map(enq =>
                enq._id === id ? { ...enq, status: 'Complete' } : enq
            ));
        } catch (err) {
            console.error("Update error:", err);
            toast.error("Failed to update status.");
        } finally {
            setStatusLoading(null);
        }
    };

    const pendingEnquiries = enquiries.filter(e => e.status !== 'Complete');
    const completedEnquiries = enquiries.filter(e => e.status === 'Complete');

    return (
        <div style={{ paddingTop: '180px' }} className="relative z-0 p-4 sm:p-8 min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50 font-sans">

            {/* Header */}
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-end mb-8 border-b border-gray-200 pb-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">User Enquiries</h1>
                        <p className="text-gray-500 mt-2 text-base">Manage support requests and feedback efficiently.</p>
                    </div>
                    <div className="flex gap-4 mt-4 sm:mt-0">
                        <div className="text-center px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
                            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Pending</span>
                            <span className="text-2xl font-bold text-pink-600">{pendingEnquiries.length}</span>
                        </div>
                        <div className="text-center px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
                            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Completed</span>
                            <span className="text-xl font-bold text-green-600">{completedEnquiries.length}</span>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-60">
                        <FaSpinner className="animate-spin text-4xl text-pink-500" />
                    </div>
                ) : (
                    <div className="space-y-10">

                        {/* --- PENDING SECTION --- */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <span className="w-2 h-8 bg-pink-500 rounded-full"></span>
                                Pending Action
                            </h2>

                            {pendingEnquiries.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {pendingEnquiries.map(enq => (
                                        <EnquiryCard
                                            key={enq._id}
                                            enq={enq}
                                            onComplete={() => handleStatusUpdate(enq._id)}
                                            loadingId={statusLoading}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 bg-white/60 backdrop-blur-sm rounded-3xl border border-dashed border-gray-300 text-center">
                                    <div className="bg-green-100 p-4 rounded-full mb-4 animate-bounce">
                                        <FaCheckCircle className="text-4xl text-green-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800">All Caught Up!</h3>
                                    <p className="text-gray-500">No pending enquiries at the moment.</p>
                                </div>
                            )}
                        </section>

                        {/* --- HISTORY SECTION --- */}
                        <section className="border-t border-gray-200 pt-8">
                            <button
                                onClick={() => setShowHistory(!showHistory)}
                                className="group flex items-center gap-3 text-gray-500 font-semibold hover:text-gray-800 transition-colors mb-6 focus:outline-none"
                            >
                                <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition">
                                    <FaHistory />
                                </div>
                                <span className="text-lg">Response History</span>
                                <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">
                                    {completedEnquiries.length}
                                </span>
                                {showHistory ? <FaChevronUp className="text-xs ml-auto sm:ml-0" /> : <FaChevronDown className="text-xs ml-auto sm:ml-0" />}
                            </button>

                            {showHistory && (
                                <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100">
                                    {completedEnquiries.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {completedEnquiries.map(enq => (
                                                <EnquiryCard key={enq._id} enq={enq} isHistory />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-400 text-center py-8 italic">No completed enquiries found.</p>
                                    )}
                                </div>
                            )}
                        </section>

                    </div>
                )}
            </div>
        </div>
    );
}

// ⭐ Premium Compact Card Component
const EnquiryCard = ({ enq, onComplete, loadingId, isHistory = false }) => (
    <div className={`group relative bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col justify-between h-full ${isHistory ? 'opacity-70 hover:opacity-100' : ''}`}>

        {/* Status Indicator Bar */}
        {!isHistory && (
            <div className="absolute top-4 right-4 animate-pulse">
                <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
                </span>
            </div>
        )}

        <div className="mb-4">
            {/* Header: Avatar + Name */}
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm ${isHistory ? 'bg-gray-200 text-gray-500' : 'bg-gradient-to-br from-pink-500 to-rose-500 text-white'}`}>
                    {enq.fullName?.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h4 className="font-bold text-gray-800 text-base leading-tight group-hover:text-pink-600 transition-colors">
                        {enq.fullName}
                    </h4>
                    <a href={`mailto:${enq.email}`} className="text-xs text-gray-400 hover:text-gray-700 truncate block max-w-[150px] font-medium">
                        {enq.email}
                    </a>
                </div>
            </div>

            {/* Content Box */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mb-3 group-hover:bg-white group-hover:border-pink-50 transition-colors">
                <p className="font-bold text-xs text-gray-700 mb-1 flex items-center gap-1 uppercase tracking-wide opacity-80">
                    <FaTag className="text-[10px]" /> {enq.subject}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 hover:line-clamp-none transition-all cursor-default" title={enq.message}>
                    {enq.message}
                </p>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
                <FaClock />
                {new Date(enq.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                {new Date(enq.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
        </div>

        {/* Action Button */}
        {!isHistory && (
            <button
                onClick={onComplete}
                disabled={loadingId === enq._id}
                className="w-full mt-auto flex items-center justify-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 hover:from-green-500 hover:to-emerald-600 hover:text-white py-2.5 rounded-xl text-sm font-bold transition-all duration-300 shadow-sm hover:shadow-lg disabled:opacity-50 disabled:shadow-none"
            >
                {loadingId === enq._id ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                Mark as Complete
            </button>
        )}

        {isHistory && (
            <div className="w-full mt-auto text-center py-2 bg-gray-50 rounded-xl text-xs font-bold text-green-600 border border-green-100/50 flex items-center justify-center gap-1">
                <FaCheckCircle /> Completed
            </div>
        )}
    </div>
);
