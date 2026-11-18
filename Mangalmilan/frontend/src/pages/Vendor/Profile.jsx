import React, { useEffect, useState, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import { toast } from "react-toastify";
import { FaEdit, FaStar, FaTrash, FaThumbsUp, FaCamera } from "react-icons/fa";
import { AuthContext } from "../../context/auth.jsx"; // AuthContext import karein

// --- Reusable Display Component ---
const DetailItem = ({ label, value }) => (
  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
    <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
    <p className="font-semibold text-gray-900 text-lg">
      {value && String(value).trim() !== "" ? value : "—"}
    </p>
  </div>
);

export default function VendorProfilePage() {
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyState, setReplyState] = useState({ reviewId: null, text: '' }); // Reply ke liye state
  const { user } = useContext(AuthContext); // Logged-in user
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const profileRes = await apiClient.get("/api/vendor/profile/me/profile");
      const profileData = profileRes.data;
      setProfile(profileData);

      // Profile load hone ke baad hi reviews fetch karein
      const reviewsRes = await apiClient.get(`/api/reviews/vendor/${profileData._id}`);
      setReviews(reviewsRes.data || []);
    } catch (err) {
      if (err.response?.status === 404) {
        setProfile(null);
      } else {
        toast.error("Profile data could not be loaded.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // VENDOR REPLY SUBMIT HANDLER
  const handleReplySubmit = async (reviewId) => {
    if (!replyState.text.trim()) return toast.error("Reply cannot be empty.");
    try {
        const { data: updatedReview } = await apiClient.post(`/api/reviews/${reviewId}/reply`, { text: replyState.text });
        // UI me instant update
        setReviews(prev => prev.map(r => r._id === reviewId ? updatedReview : r));
        setReplyState({ reviewId: null, text: '' }); // Form reset
        toast.success("Reply posted successfully!");
    } catch (err) {
        toast.error(err.response?.data?.message || "Failed to post reply.");
    }
  };

  const formatLabel = (key) => key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

  if (loading) return <div className="text-center py-20 text-gray-600 pt-24">Loading Your Profile...</div>;

  if (!profile) {
    return (
      <div className="text-center py-20 pt-24">
        <h2 className="text-2xl font-bold mb-4">No Vendor Profile Found</h2>
        <p className="text-gray-600 mb-6">Create your profile to get started and manage your business.</p>
        <button
          onClick={() => navigate("/vendor/create-profile")}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
        >
          Create Your Profile
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 space-y-8">

        {/* --- Banner Image --- */}
        <div className="relative w-full h-64 md:h-72 rounded-2xl overflow-hidden shadow-lg">
          <img
            src={profile.profileImage || "https://via.placeholder.com/1200x400"}
            alt="Profile Banner"
            className="w-full h-full object-cover"
          />
        </div>

        {/* --- Profile Info Card --- */}
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-8">
          {/* Header */}
          <div className="flex flex-wrap justify-between items-center border-b pb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{profile.businessName}</h1>
              <p className="text-gray-500 mt-1">{profile.category?.name}</p>
            </div>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold shadow-sm">
                <FaStar /> <span>{profile.averageRating?.toFixed(1) || '0.0'} ({profile.reviewCount || 0} reviews)</span>
              </div>
              <button
                onClick={() => navigate("/vendor/update-profile")}
                className="px-6 py-2 bg-white text-gray-800 border rounded-lg font-semibold shadow hover:bg-gray-100 flex items-center gap-2"
              >
                <FaEdit /> Edit Profile
              </button>
            </div>
          </div>
          {/* ... Baaki saari details (Contact, Location, About) yahaan waise hi rahengi ... */}
        </div>

        {/* --- Reviews Section --- */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Customer Reviews</h3>
          {reviews.length === 0 ? (
            <p className="text-center text-gray-500 py-4">You have no reviews yet.</p>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => {
                 const userHasLiked = user && review.likes.includes(user._id); // Assuming you have `user` from AuthContext
                return (
                  <div key={review._id} className="p-5 bg-gray-50 rounded-lg">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 flex-shrink-0">
                        {review.user?.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="w-full">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold">{review.user?.name || 'Anonymous'}</h4>
                          <div className="flex items-center">{[...Array(5)].map((_, i) => <FaStar key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'} />)}</div>
                        </div>
                        <p className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                        <p className="mt-2 text-gray-700">{review.comment}</p>
                        {review.image && <img src={review.image} alt="Review" className="mt-3 rounded-lg max-w-xs cursor-pointer" onClick={() => window.open(review.image, '_blank')} />}
                        
                        {/* Like Button */}
                        <div className="flex items-center gap-4 mt-4 pt-3 border-t">
                          <div className={`flex items-center gap-2 text-sm font-semibold ${userHasLiked ? 'text-blue-600' : 'text-gray-500'}`}>
                            <FaThumbsUp />
                            <span>{review.likes.length} {review.likes.length === 1 ? 'Like' : 'Likes'}</span>
                          </div>
                        </div>

                        {/* Vendor Reply Display */}
                        {review.vendorReply && (
                          <div className="mt-4 ml-8 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-300">
                            <p className="font-bold text-sm text-gray-800">Your Reply</p>
                            <p className="text-gray-600 mt-1">{review.vendorReply.text}</p>
                          </div>
                        )}
                        
                        {/* Vendor Reply Form */}
                        {!review.vendorReply && (
                          <div className="mt-4 ml-8">
                            {replyState.reviewId === review._id ? (
                              <div className="flex items-center gap-2">
                                <textarea 
                                  value={replyState.text}
                                  onChange={(e) => setReplyState({ ...replyState, text: e.target.value })}
                                  placeholder="Write your reply..."
                                  className="w-full p-2 border rounded-lg"
                                />
                                <button onClick={() => handleReplySubmit(review._id)} className="px-4 py-2 text-white bg-blue-600 rounded-lg">Post</button>
                                <button onClick={() => setReplyState({ reviewId: null, text: '' })} className="text-gray-500">Cancel</button>
                              </div>
                            ) : (
                              <button onClick={() => setReplyState({ reviewId: review._id, text: '' })} className="text-sm font-semibold text-blue-600 hover:underline">
                                Reply to this review
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        


        {/* --- Danger Zone --- */}
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
          <h3 className="font-bold text-red-800">Danger Zone</h3>
          <p className="text-red-700 text-sm mt-1">Deleting your profile is a permanent action and cannot be undone.</p>
          <button
            onClick={() => { if(window.confirm('Are you sure you want to delete your profile permanently?')) { /* Call delete function */ } }}
            className="mt-3 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <FaTrash /> Delete My Profile
          </button>
        </div>
      </div>
    </div>
  );
}