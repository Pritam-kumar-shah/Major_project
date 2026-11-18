import React, { useEffect, useState, useContext, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import { 
    FaStar, FaMapMarkerAlt, FaPaperPlane, FaCalendarCheck, FaUser, FaConciergeBell, 
    FaRupeeSign, FaThumbsUp, FaCamera, FaSpinner, FaHeart, FaRegHeart, FaTimes, 
    FaPlayCircle, FaImages, FaVideo, FaCommentDots, FaGlobe, FaPauseCircle, 
    FaInfoCircle, FaDollarSign, FaTag, FaRulerCombined, FaChevronDown, FaChevronUp, FaExternalLinkAlt, FaPhoneAlt
} from "react-icons/fa";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/auth.jsx";
import imageCompression from "browser-image-compression";

const PORTFOLIO_API_BASE_URL = '/api/portfolio/vendor'; 
const REVIEWS_API_BASE_URL = '/api/reviews/vendor'; 
const MAX_VISIBLE_ITEMS = 4;
const REVIEWS_INCREMENT_STEP = 3; 
const ABOUT_TRUNCATE_LENGTH = 250;

// ===================================================================
// 0. HELPER COMPONENTS & UTILS
// ===================================================================

const getPricingDetails = (vendor) => {
    const categoryName = vendor.category?.name;
    const details = vendor.details || {};
    
    let prices = [];
    let secondaryDetailLabel = '';
    let secondaryDetail = '';

    // FIX: Only format price if it's a number > 0, otherwise return 'N/A'
    const formatPrice = (value) => {
        if (typeof value === 'number' && value > 0) return `₹${value.toLocaleString('en-IN')}`;
        return 'N/A';
    };

    switch (categoryName) {
        case 'Venue':
            prices.push({ label: 'Rental Price', value: formatPrice(details.rentalPrice) });
            prices.push({ label: 'Veg Plate Price', value: formatPrice(details.perPlateVeg) });
            prices.push({ label: 'Non-Veg Plate Price', value: formatPrice(details.perPlateNonVeg) });
            secondaryDetailLabel = 'Max Capacity';
            secondaryDetail = details.capacity ? `${details.capacity} guests` : 'N/A';
            break;
        case 'Caterer':
            prices.push({ label: 'Veg Plate Price', value: formatPrice(details.perPlateVeg) });
            prices.push({ label: 'Non-Veg Plate Price', value: formatPrice(details.perPlateNonVeg) });
            secondaryDetailLabel = 'Min Guests';
            secondaryDetail = details.minGuests || 'N/A';
            break;
        default:
            prices.push({ label: 'Starting Package', value: formatPrice(details.startingPackagePrice) });
            prices.push({ label: 'Price Per Day/Event', value: formatPrice(details.pricePerDay || details.pricePerEvent) });
            if (categoryName === 'Makeup Artist') {
                secondaryDetailLabel = 'Travel Included?';
                secondaryDetail = details.travelsToVenue === true ? 'Yes' : (details.travelsToVenue === false ? 'No' : 'N/A');
            }
            break;
    }
    
    // Filter out items that explicitly have an 'N/A' value (i.e., prices not set)
    const filteredPrices = prices.filter(p => !p.value.includes('N/A'));
    
    // ✅ CORE FIX: If no valid prices are found, show "Request on Call"
    if (filteredPrices.length === 0) {
        return {
            prices: [{ label: 'Pricing Information', value: 'Request on Call' }],
            secondaryDetailLabel,
            secondaryDetail
        };
    }

    return { prices: filteredPrices, secondaryDetailLabel, secondaryDetail };
};

// --- Service Detail Card Component ---
const ServiceDetailCard = ({ services }) => {
    const [showAll, setShowAll] = useState(false);
    const servicesToDisplay = showAll ? services : services.slice(0, MAX_VISIBLE_ITEMS);

    return (
        <div className="space-y-3">
            {servicesToDisplay.map((service, index) => (
                <div key={service._id || index} className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm flex justify-between items-center">
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-800 text-sm flex items-center gap-2">
                            <FaTag className="text-purple-600 flex-shrink-0"/>
                            {service.name || 'Custom Service'}
                        </span>
                        <p className="text-xs text-gray-600 mt-1 ml-6">{service.description || 'No description.'}</p>
                    </div>
                    <span className="font-extrabold text-green-600 text-sm flex-shrink-0">
                        ₹{service.basePrice ? service.basePrice.toLocaleString('en-IN') : 'Negotiable'}
                    </span>
                </div>
            ))}
            
            {services.length > MAX_VISIBLE_ITEMS && (
                <button 
                    onClick={() => setShowAll(!showAll)}
                    className="w-full text-center text-pink-600 font-semibold mt-4 py-2 hover:bg-pink-50 rounded-lg transition border border-pink-200 text-sm"
                >
                    {showAll ? 'Show Less' : `Show All ${services.length} Services`}
                </button>
            )}
        </div>
    );
};

// Asset Card Component
const AssetCard = ({ asset, handleLike, user, onMediaClick }) => {
    const isImage = asset.resourceType?.toLowerCase() === 'image';
    const isLikesArray = Array.isArray(asset.likes);
    const userHasLiked = user && isLikesArray && asset.likes.includes(user._id);

    // Click handler is simplified to always open the media view within the section
    const handleClick = (e) => {
        e.stopPropagation();
        onMediaClick(asset);
    };

    return (
        <div
            className="rounded-xl overflow-hidden shadow-lg transition duration-300 bg-white relative cursor-pointer group hover:shadow-2xl"
            onClick={handleClick}
            onDoubleClick={() => handleLike(asset._id)} // Double click to like/unlike
        >
            <div className="relative w-full h-40 sm:h-48 bg-gray-200"> {/* Reduced height for mobile compactness */}
                {/* Use image for both photo and video thumbnail */}
                <img src={asset.assetUrl} alt="Portfolio Asset" className="w-full h-full object-cover transition duration-300 group-hover:scale-105"/>
                
                {/* Play Icon for Videos */}
                {!isImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <FaPlayCircle className="text-white text-5xl opacity-80" />
                    </div>
                )}
            </div>
            
            {/* Like Button (Now functional) */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-end p-2 bg-gradient-to-b from-black/30 to-transparent">
                 <button 
                    onClick={(e) => { e.stopPropagation(); handleLike(asset._id); }} 
                    className={`flex items-center gap-1.5 font-bold px-2 py-0.5 rounded-full text-xs transition ${userHasLiked ? 'bg-red-600 text-white shadow-xl' : 'bg-white/80 text-gray-800 hover:bg-white/90'}`}
                >
                    {userHasLiked ? <FaHeart className="text-red-300"/> : <FaRegHeart size={10}/>} 
                    <span className="text-shadow">{isLikesArray ? asset.likes.length : 0}</span>
                </button>
            </div>
        </div>
    );
};

// --- Portfolio Section ---
function PortfolioSection({ vendorId, user, vendorOwnerId }) { // Added vendorOwnerId prop
    const [portfolioAssets, setPortfolioAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeMediaType, setActiveMediaType] = useState('images'); 
    const [selectedAsset, setSelectedAsset] = useState(null); // State to hold the asset for large view
    const [showAll, setShowAll] = useState(false);

    const fetchPortfolio = useCallback(async () => { 
        if (!vendorId) return;
        setLoading(true);
        try {
            const res = await apiClient.get(`${PORTFOLIO_API_BASE_URL}/${vendorId}`);
            setPortfolioAssets(res.data.data || []); 
        } catch (error) {
            setPortfolioAssets([]);
        } finally {
            setLoading(false);
        }
    }, [vendorId]);

    const handleLike = async (assetId) => {
        if (!user) {
            toast.error("Please log in to like this item.");
            return;
        }

        // Prevent vendor owner from liking their own assets
        if (user._id === vendorOwnerId) {
            toast.warn("आप अपनी पोर्टफोलियो संपत्ति को लाइक नहीं कर सकते हैं।");
            return;
        }

        // 1. Optimistic Update
        const assetIndex = portfolioAssets.findIndex(asset => asset._id === assetId);
        if (assetIndex === -1) return;

        const asset = portfolioAssets[assetIndex];
        const currentLikes = Array.isArray(asset.likes) ? asset.likes : [];
        const isLiked = currentLikes.includes(user._id);

        const newLikes = isLiked
            ? currentLikes.filter(id => id !== user._id)
            : [...currentLikes, user._id];
        
        const updatedAssets = [...portfolioAssets];
        updatedAssets[assetIndex] = { ...asset, likes: newLikes };
        setPortfolioAssets(updatedAssets);

        // 2. API Call 
        try {
            await apiClient.patch(`/api/portfolio/like/${assetId}`);
            toast.success(isLiked ? "Unliked!" : "Liked! Thank you ❤️");
        } catch (error) {
            // 3. Revert on failure
            setPortfolioAssets(portfolioAssets);
            toast.error(error.response?.data?.message || 'Like/Unlike action failed. Reverting...');
        }
    };
    
    useEffect(() => { fetchPortfolio(); }, [fetchPortfolio]);
    
    const images = portfolioAssets.filter(a => a.resourceType?.toLowerCase() === 'image');
    const videos = portfolioAssets.filter(a => a.resourceType?.toLowerCase() === 'video');
    const allAssets = activeMediaType === 'images' ? images : videos;

    const assetsToDisplay = showAll ? allAssets : allAssets.slice(0, MAX_VISIBLE_ITEMS * 2); // Show more items initially
    
    if (loading) { return <div className="p-8 text-center text-gray-500"><FaSpinner className="animate-spin inline mr-2" /> Loading Portfolio...</div>; }
    
    return (
        <>
            {/* LARGE MEDIA VIEWER (In-Page Pop-up) */}
            {selectedAsset && (
                <div className="bg-gray-900 rounded-xl mb-6 shadow-2xl relative">
                    <button 
                        onClick={() => setSelectedAsset(null)}
                        className="absolute top-3 right-3 text-white z-10 p-2 bg-black/50 rounded-full hover:bg-red-500 transition"
                    >
                        <FaTimes size={16} />
                    </button>
                    <div className="w-full h-80 md:h-[500px] flex items-center justify-center p-4">
                        {selectedAsset.resourceType?.toLowerCase() !== 'image' ? (
                            <video 
                                src={selectedAsset.assetUrl} 
                                controls 
                                autoPlay 
                                // MODIFIED: Added controlsList to remove download option
                                controlsList="nodownload" 
                                className="w-full h-full object-contain rounded-lg"
                            />
                        ) : (
                            <img 
                                src={selectedAsset.assetUrl} 
                                alt="Selected Portfolio Asset" 
                                className="w-full h-full object-contain rounded-lg"
                            />
                        )}
                    </div>
                </div>
            )}


            {/* Photo/Video Tabs */}
            <div className="flex justify-start gap-4 border-b border-gray-200 mb-6 bg-white p-2 rounded-xl shadow-inner text-gray-700 font-semibold">
                 <button
                    onClick={() => { setActiveMediaType('images'); setShowAll(false); setSelectedAsset(null); }}
                    className={`px-4 py-2 rounded-lg transition-colors ${activeMediaType === 'images' ? 'bg-pink-600 text-white shadow-md' : 'hover:bg-gray-100'}`}
                 >
                     Photos ({images.length})
                 </button>
                 <button
                    onClick={() => { setActiveMediaType('videos'); setShowAll(false); setSelectedAsset(null); }}
                    className={`px-4 py-2 rounded-lg transition-colors ${activeMediaType === 'videos' ? 'bg-pink-600 text-white shadow-md' : 'hover:bg-gray-100'}`}
                 >
                     Videos ({videos.length})
                 </button>
            </div>


            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {assetsToDisplay.map(asset => (
                    <AssetCard key={asset._id} asset={asset} handleLike={handleLike} user={user} onMediaClick={setSelectedAsset} />
                ))}
            </div>
            
            {allAssets.length > assetsToDisplay.length && (
                <button 
                    onClick={() => setShowAll(!showAll)}
                    className="w-full text-center text-pink-600 font-semibold mt-6 py-2 hover:bg-pink-50 rounded-xl transition border border-pink-200 text-sm"
                >
                    {showAll ? 'Show Less Photos & Videos' : `Show All ${allAssets.length} Items`}
                </button>
            )}
            
        </>
    );
}

// --- MAIN REVIEWS SECTION (UPDATED with Like/Reply Logic) ---
function ReviewsSection({ vendor, user, isOwner }) { 
    const [reviews, setReviews] = useState([]);
    const [visibleCount, setVisibleCount] = useState(REVIEWS_INCREMENT_STEP); 
    const [replyState, setReplyState] = useState({ reviewId: null, text: '', loading: false }); // Added loading

    const fetchReviews = useCallback(async () => {
        if (!vendor?._id) return;
        try {
            const res = await apiClient.get(`${REVIEWS_API_BASE_URL}/${vendor._id}`);
            setReviews(res.data);
        } catch (err) {
            console.error("Failed to fetch reviews:", err);
            setReviews([]); 
            toast.error("समीक्षाएँ (Reviews) सर्वर से लोड करने में विफल रहीं। कृपया बैकएंड जांचें।"); 
        }
    }, [vendor]);
    
    useEffect(() => { fetchReviews(); }, [fetchReviews]);

    // --- Review Liking Logic (New) ---
    const handleReviewLike = async (reviewId) => {
        if (!user) {
            toast.error("Please log in to react to this review.");
            return;
        }

        // Prevent vendor owner from liking reviews on their own profile
        if (isOwner) {
             toast.warn("आप अपनी प्रोफाइल पर समीक्षाओं को लाइक नहीं कर सकते हैं।");
             return;
        }
        
        // 1. Optimistic Update (Check and toggle like status)
        const reviewIndex = reviews.findIndex(r => r._id === reviewId);
        if (reviewIndex === -1) return;

        const review = reviews[reviewIndex];
        const currentLikes = Array.isArray(review.likes) ? review.likes : [];
        const isLiked = currentLikes.includes(user._id);

        const newLikes = isLiked
            ? currentLikes.filter(id => id !== user._id)
            : [...currentLikes, user._id];
        
        const updatedReviews = [...reviews];
        updatedReviews[reviewIndex] = { ...review, likes: newLikes };
        setReviews(updatedReviews);

        // 2. API Call (Assuming /api/reviews/like/:id endpoint)
        try {
            await apiClient.patch(`/api/reviews/${reviewId}/like`);
            toast.success(isLiked ? "Reaction removed." : "Liked the review! 👍");
        } catch (error) {
            // 3. Revert on failure
            setReviews(reviews);
            toast.error(error.response?.data?.message || 'Reaction failed. Reverting...');
        }
    };

    // --- Vendor Reply Submission (New/Simplified) ---
    const handleReplySubmit = async () => {
        if (!replyState.text.trim()) return toast.error("Reply cannot be empty.");
        if (replyState.loading) return;

        setReplyState(p => ({ ...p, loading: true }));
        try {
            // Assuming the API endpoint for replying is /api/reviews/reply/:reviewId
            const payload = { 
                replyText: replyState.text,
                vendorId: vendor._id // Safety check
            };
            
            await apiClient.post(`/api/reviews/reply/${replyState.reviewId}`, payload);
            
            toast.success("Reply submitted successfully!");
            setReplyState({ reviewId: null, text: '', loading: false }); // Reset form
            fetchReviews(); // Re-fetch reviews to show the new reply
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit reply.');
            setReplyState(p => ({ ...p, loading: false }));
        }
    };

    // --- Show More/Less Logic ---
    const handleShowMoreLess = () => {
        if (visibleCount >= reviews.length) {
            setVisibleCount(REVIEWS_INCREMENT_STEP);
        } else {
            setVisibleCount(prevCount => prevCount + REVIEWS_INCREMENT_STEP);
        }
    };

    const visibleReviews = reviews.slice(0, visibleCount);
    const hasMoreReviews = visibleCount < reviews.length;

    // --- ReviewCard Component (Updated for Like/Reply) ---
    const ReviewCard = ({ review, isOwner, onLikeReview }) => {
        const currentUserLiked = review.likes && user && Array.isArray(review.likes) && review.likes.includes(user._id);
        const hasVendorReply = !!review.vendorReply && !!review.vendorReply.text;
        const isReplying = replyState.reviewId === review._id;

        return (
            <div className="p-4 bg-gray-50 rounded-xl shadow-inner border border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-pink-200 rounded-full flex items-center justify-center text-pink-600 font-bold text-sm flex-shrink-0">
                            {review.user?.name ? review.user.name[0] : 'U'}
                        </div>
                        <div>
                            <p className="font-bold text-gray-800">{review.user?.name || 'Anonymous User'}</p>
                            <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="flex text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                            <FaStar key={i} size={14} className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'}/>
                        ))}
                    </div>
                </div>
                <p className="mt-3 text-gray-700 text-sm">{review.comment}</p>
                
                {review.image && <img src={review.image} alt="Review attachment" className="mt-3 w-20 h-20 object-cover rounded-lg"/>}
                
                {/* Display Vendor Reply */}
                {hasVendorReply && (
                    <div className="mt-3 p-3 bg-white border border-blue-100 rounded-lg text-xs text-blue-700">
                        <span className="font-bold">Vendor Reply:</span> {review.vendorReply.text}
                    </div>
                )}

                {/* --- Actions and Reply Form --- */}
                <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                    {/* Like/Reaction Button */}
                    <button 
                        onClick={() => onLikeReview(review._id)} 
                        disabled={isOwner} 
                        className={`flex items-center gap-1 font-semibold text-sm transition disabled:opacity-50 ${currentUserLiked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                    >
                        <FaThumbsUp className={currentUserLiked ? 'text-blue-600' : 'text-gray-400'}/>
                        {review.likes?.length || 0} Reactions
                    </button>

                    {/* Vendor Reply Action (Owner only) */}
                    {isOwner && !hasVendorReply && !isReplying && (
                         <button 
                            onClick={() => setReplyState({ reviewId: review._id, text: '', loading: false })}
                            className="text-sm text-green-600 font-semibold hover:underline"
                        >
                            <FaCommentDots className="inline mr-1"/> Reply to Review
                        </button>
                    )}
                </div>

                {/* Reply Form (Owner only) */}
                {isOwner && isReplying && (
                    <div className="mt-3 p-3 bg-white border border-green-300 rounded-lg">
                        <textarea 
                            value={replyState.text}
                            onChange={(e) => setReplyState(p => ({ ...p, text: e.target.value }))}
                            placeholder="Type your official reply (max 200 chars)..."
                            className="w-full p-2 border rounded-lg text-sm mb-2 focus:ring-green-500"
                            rows="2"
                            maxLength={200}
                        />
                        <div className="flex justify-end gap-2">
                            <button 
                                onClick={() => setReplyState({ reviewId: null, text: '', loading: false })} 
                                className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleReplySubmit} 
                                disabled={replyState.loading || !replyState.text.trim()}
                                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                            >
                                {replyState.loading ? <FaSpinner className="animate-spin inline mr-1"/> : 'Submit Reply'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };
    // ------------------------------------------------
    
    return (
        <div className="space-y-4">
            {/* Reviews List */}
            {reviews.length === 0 ? (
                <div className="text-center p-6 bg-gray-50 rounded-xl text-gray-500">No reviews yet. Be the first one!</div>
            ) : (
                visibleReviews.map((review) => (
                    <ReviewCard 
                        key={review._id} 
                        review={review} 
                        isOwner={isOwner} 
                        onLikeReview={handleReviewLike} 
                    />
                ))
            )}
            
            {/* Show More/Less Button */}
            {(hasMoreReviews || visibleCount > REVIEWS_INCREMENT_STEP) && (
                <button 
                    onClick={handleShowMoreLess}
                    className="w-full text-center text-pink-600 font-semibold mt-4 py-2 hover:bg-pink-50 rounded-xl transition border border-pink-200 text-sm"
                >
                    {visibleCount >= reviews.length ? (
                        'Show Less Reviews' 
                    ) : (
                        `Show More (${reviews.length - visibleCount} remaining)`
                    )}
                </button>
            )}

            {user && <ReviewForm vendorId={vendor._id} onReviewSubmitted={fetchReviews} />}
        </div>
    );
}

// BookingForm 
function BookingForm({ vendorProfile }) {
    const { user } = useContext(AuthContext);
    const [services] = useState(vendorProfile?.services || []);
    const [formData, setFormData] = useState({
        serviceId: "", serviceName: "", customService: "", bookingDateTime: "",
        amount: "", notes: "", customerName: user?.name || "", customerPhone: user?.phone || ""
    });
    const [bookingDetails, setBookingDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [allServicesOpen, setAllServicesOpen] = useState(false); 

    const getTodayString = () => {
        const today = new Date();
        today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
        return today.toISOString().slice(0, 16);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "serviceId" && value && value !== "custom") {
            const selectedService = services.find(s => s._id === value);
            if (selectedService) {
                setFormData(prev => ({ ...prev, serviceId: value, serviceName: selectedService.name, amount: selectedService.basePrice, customService: "" }));
            }
        } else if (name === "serviceId" && value === "custom") {
            setFormData(prev => ({ ...prev, serviceId: value, serviceName: "", amount: "", customService: "" }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!vendorProfile?._id) return toast.error("Vendor info not loaded yet!");
        const { serviceId, serviceName, customService, bookingDateTime, amount, customerName, customerPhone, notes } = formData;
        
        if ((!serviceId && !customService) || !bookingDateTime || !amount || !customerName || !customerPhone) {
            return toast.error("All required fields must be filled!");
        }
        
        const payload = {
            vendorId: vendorProfile._id,
            serviceId: serviceId && serviceId !== "custom" ? serviceId : null,
            serviceName: serviceId === "custom" ? customService : serviceName,
            bookingDateTime,
            amount: Number(amount),
            customerName,
            customerPhone,
            notes,
        };
        
        setLoading(true);
        try {
            const res = await apiClient.post("/api/bookings", payload);
            setBookingDetails(true);
            toast.success(res.data.message || "Booking request sent successfully! 🎉");

        } catch (error) {
            toast.error(error.response?.data?.message || 'Booking submission failed. Please ensure backend endpoint /api/bookings is working.');
        } finally {
            setLoading(false);
        }
    };

    if (bookingDetails) {
        return (
             <div className="p-6 sm:p-8 text-center bg-green-50 rounded-b-xl border-2 border-green-300">
                 <h3 className="text-3xl font-bold text-green-700">Booking Confirmed!</h3>
                 <p className="mt-3 text-gray-600">The vendor will reach out to finalize the payment.</p>
                 <button onClick={() => setBookingDetails(null)} className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition shadow-lg">Start New Booking</button>
             </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4"> 
            <div className="bg-gray-50 p-4 rounded-lg shadow-inner space-y-3">
                <h4 className="font-semibold text-gray-800 text-lg flex items-center gap-2 text-green-600"><FaUser /> Your Details</h4>
                <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} placeholder="Your Name" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" required />
                <input type="text" name="customerPhone" value={formData.customerPhone} onChange={handleChange} placeholder="Your Mobile Number" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" required/>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg shadow-inner space-y-3">
                <h4 className="font-semibold text-gray-800 text-lg flex items-center gap-2 text-green-600"><FaCalendarCheck /> Booking Details</h4>
                
                {/* Collapsible Service List (Simplified view) */}
                <div className="pt-2">
                    <div className="flex justify-between items-center mb-2">
                             <h5 className="font-semibold text-gray-700">Available Services:</h5>
                             <button type="button" onClick={() => setAllServicesOpen(!allServicesOpen)} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                 {allServicesOpen ? 'Hide All' : 'Show All'}
                                 {allServicesOpen ? <FaChevronUp className="text-xs"/> : <FaChevronDown className="text-xs"/>}
                             </button>
                    </div>
                    
                    {allServicesOpen && services.length > 0 ? services.map(service => (
                        <div key={service._id} className="text-xs p-1 bg-gray-100 rounded-md my-1">
                            {service.name} - ₹{service.basePrice.toLocaleString('en-IN')}
                        </div>
                    )) : !allServicesOpen && services.length > 0 && (
                        <div className="text-xs p-1 bg-gray-100 rounded-md my-1">
                            {services[0].name} - ₹{services[0].basePrice.toLocaleString('en-IN')}
                            {services.length > 1 && ` (+${services.length - 1} more)`}
                        </div>
                    )}
                    {services.length === 0 && <p className="text-sm text-gray-500">No defined services.</p>}
                </div>

                {/* Service Selection for the Form */}
                <select name="serviceId" value={formData.serviceId} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg appearance-none focus:ring-green-500 focus:border-green-500 bg-white" required>
                    <option value="">Select Service for Booking</option>
                    {services.map(s => (<option key={s._id} value={s._id}>{s.name} - ₹{s.basePrice ? s.basePrice.toLocaleString('en-IN') : 'Negotiable'}</option>))}
                    <option value="custom">Other / Custom Service</option>
                </select>

                {formData.serviceId === "custom" && (<input type="text" name="customService" value={formData.customService} onChange={handleChange} placeholder="Custom service name" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" required/>)}
                
                {/* Date Input with Focus Style */}
                <input type="datetime-local" name="bookingDateTime" value={formData.bookingDateTime} onChange={handleChange} placeholder="Booking Date" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" min={getTodayString()} required/>
                
                <input type="number" name="amount" value={formData.amount} onChange={handleChange} placeholder="Final Amount (₹)" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" required/>
                <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Additional Notes (optional)" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" rows="2" />
            </div>

            <button type="submit" disabled={loading} className={`w-full bg-green-600 text-white font-bold py-3 rounded-xl transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 text-lg`}>
                {loading ? <><FaSpinner className="animate-spin inline mr-2" /> Sending Request...</> : "Send Booking Request"}
            </button>
        </form>
    );
}

function ReviewForm({ vendorId, onReviewSubmitted }) { 
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [loading, setLoading] = useState(false);


    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const options = { maxSizeMB: 2, maxWidthOrHeight: 1920, useWebWorker: true };
        try {
            const compressedFile = await imageCompression(file, options);
            setImage(compressedFile);
            setImagePreview(URL.createObjectURL(compressedFile));
        } catch (error) {
            toast.error("Image compression failed.");
            setImage(null);
            setImagePreview('');
        }
    };

    const handleSubmit = async (e) => { 
        e.preventDefault(); 
        if (rating === 0 || !comment.trim()) return toast.error('Please provide a rating and a comment.');
        
        setLoading(true);
        const formData = new FormData();
        formData.append('vendorId', vendorId);
        formData.append('rating', rating);
        formData.append('comment', comment);
        if (image) formData.append('image', image);

        try {
            await apiClient.post('/api/reviews', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success('Thank you for your review! 🙏');
            onReviewSubmitted();
            setRating(0); setComment(''); setImage(null); setImagePreview('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit review.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="mt-8 pt-6 border-t-4 border-gray-200 bg-white p-4 rounded-xl shadow-inner">
            <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2"><FaCommentDots className="text-yellow-600"/> Write Your Review</h3>
             <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <label className="font-bold block mb-2 text-gray-700 text-sm">Your Rating:</label>
                    <StarRating rating={rating} setRating={setRating} />
                </div>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share details about your experience..." className="w-full p-3 border rounded-lg h-24 focus:ring-blue-500" required/>
                
                <div className="flex items-center gap-4">
                    <label htmlFor="review-image-input" className="flex items-center gap-2 px-4 py-2 bg-pink-100 text-pink-600 rounded-full cursor-pointer hover:bg-pink-200 transition font-semibold text-sm">
                        <FaCamera /> <span>{image ? 'Change Photo' : 'Add Photo'}</span>
                        <input id="review-image-input" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                    {imagePreview && (
                        <div className="relative">
                            <img src={imagePreview} alt="Review preview" className="w-16 h-16 rounded-lg object-cover border-2 border-pink-300" />
                            <button type="button" onClick={() => { setImage(null); setImagePreview(''); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600 transition shadow-md">
                                <FaTimes />
                            </button>
                        </div>
                    )}
                </div>

                <button type="submit" disabled={loading} className={`w-full bg-yellow-600 text-white font-bold py-2 rounded-xl text-base shadow-md disabled:opacity-50`}>
                    {loading ? <><FaSpinner className="animate-spin inline mr-2" /> Submitting...</> : 'Submit Review'}
                </button>
             </form>
        </div>
    );
}

const StarRating = ({ rating, setRating }) => (
    <div className="flex items-center gap-1">
        {[...Array(5)].map((_, index) => (
            <FaStar
                key={index + 1}
                size={20}
                className={`cursor-pointer ${index + 1 <= rating ? 'text-amber-500' : 'text-gray-300'}`}
                onClick={() => setRating(index + 1)}
            />
        ))}
    </div>
);


// ===============================================================
// 5. MAIN VENDOR PROFILE PAGE (Full Component)
// ===============================================================
export default function VendorProfilePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [vendor, setVendor] = useState(null);
    const [activeForm, setActiveForm] = useState('enquiry'); 
    const [sending, setSending] = useState(false);
    const [enquiryData, setEnquiryData] = useState({ phone: user?.phone || "", message: "", eventDate: "" });
    const [enquirySent, setEnquirySent] = useState(false);
    const [showFullAbout, setShowFullAbout] = useState(false); 
    // CRITICAL FIX: यह सुनिश्चित करता है कि व्यू रिकॉर्डिंग केवल एक बार हो
    const isViewRecorded = useRef(false); // Ref to track if view has been recorded on this load

    // Handler to scroll to the Enquiry/Booking section
    const scrollToEnquiry = useCallback(() => {
        document.getElementById('enquiry-column')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, []);

    // Initial data fetch
    useEffect(() => {
        const fetchVendor = async () => {
            try {
                const res = await apiClient.get(`/api/vendor/profile/${id}`);
                setVendor(res.data);

                // FIX APPLIED HERE: The path is corrected to match the server-side definition: 
                // /api/vendor/profile/record-view/:id
                if (res.data && user?._id && id && !isViewRecorded.current) {
                    apiClient.post(`/api/vendor/profile/record-view/${id}`) 
                        .then(() => isViewRecorded.current = true)
                        .catch(err => console.log('View recording failed or user not logged in.', err.message));
                }

            } catch (err) {
                toast.error("Failed to fetch vendor data");
            }
        };
        if(id) fetchVendor();
    }, [id, user?._id]); 

    const handleEnquiryChange = (e) => {
        setEnquiryData({ ...enquiryData, [e.target.name]: e.target.value });
    };

    const sendEnquiry = async (e) => {
        e.preventDefault();
        if (!user) return navigate("/login");
        
        const { phone, message, eventDate } = enquiryData;
        if (!phone.trim() || !message.trim() || !eventDate) {
            return toast.error("Mobile number, message, and event date are required");
        }
        
        setSending(true);
        try {
            // Assuming the API endpoint expects { vendor: vendorId, phone, message, eventDate }
            const payload = { vendor: vendor._id, phone, message, eventDate };
            const res = await apiClient.post("/api/enquiry", payload);
            
            setEnquirySent(true);
            toast.success(res.data.message || "✅ Enquiry sent successfully! Vendor will reach out soon.");

        } catch (error) {
            toast.error(error.response?.data?.message || 'Enquiry submission failed. Please ensure backend endpoint /api/enquiry is working.');
        } finally {
            setSending(false);
        }
    };

    if (!vendor) return <div className="w-full min-h-screen flex items-center justify-center text-gray-500 text-lg bg-gray-100">
        <FaSpinner className="animate-spin mr-2" /> Loading Vendor Profile...
    </div>;

    const isOwner = user && vendor && user._id === vendor.user;
    const profileImageUrl = vendor.profileImage || "/placeholder.jpg"; 
    const { prices, secondaryDetailLabel, secondaryDetail } = getPricingDetails(vendor);
    
    const address = vendor.location?.address || 'N/A';
    const city = vendor.location?.city || 'N/A';
    const state = vendor.location?.state || 'N/A';
    const contactPhone = vendor.contactPhone || 'N/A';

    const fullAddress = `${address}, ${city}, ${state}`;
    // ✅ FIX APPLIED: Correct Google Maps URL construction
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
    const avgRating = vendor.averageRating?.toFixed(1) || "0.0";
    
    const fullAboutText = vendor.about || "This vendor has not provided a detailed description yet.";
    const truncatedAboutText = fullAboutText.substring(0, ABOUT_TRUNCATE_LENGTH) + (fullAboutText.length > ABOUT_TRUNCATE_LENGTH ? '...' : '');

    return (
        <div className="w-full bg-gray-100 min-h-screen pt-12 sm:pt-16"> 
            <div className="container mx-auto p-4 sm:p-6 lg:p-8"> 
                
                {/* VENDOR HEADER CARD (Main Image and Name) */}
                <div className="bg-white shadow-2xl rounded-2xl overflow-hidden mb-8">
                    <div className="relative">
                        <img 
                            src={profileImageUrl} 
                            alt={vendor.businessName} 
                            className="w-full h-72 md:h-96 object-cover bg-gray-100" 
                        />
                        {/* Title and Ratings Overlay */}
                        <div className="absolute inset-0 bg-black/30 flex items-end p-6 md:p-10">
                            <div>
                                <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight drop-shadow-md">
                                    {vendor.businessName}
                                </h1>
                                <p className="flex items-center gap-2 text-white text-md mt-2 font-medium drop-shadow-md">
                                    <FaMapMarkerAlt className="text-red-400" /> **{city}**, {state} | {vendor.category?.name}
                                </p>
                                <div className="flex items-center gap-2 mt-2 bg-yellow-600 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg w-fit">
                                    <FaStar /> {avgRating} ({vendor.reviewCount || 0} Reviews)
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* MAIN CONTENT GRID (2-Column Desktop, 1-Column Mobile) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    
                    {/* LEFT COLUMN: Main Sections */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* 1. PRICING & CORE DETAILS SECTION */}
                        <div className="p-6 sm:p-8 bg-white shadow-xl rounded-xl border-l-4 border-purple-600" id="pricing-section">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="text-purple-600">₹</span> Core Pricing & Features
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                
                                {/* Pricing List */}
                                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                    <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">Rate Card Details</h3>
                                    {prices.map((item, index) => {
                                        // Update color for "Request on Call"
                                        const priceColor = item.value.includes('Request on Call') ? 'text-blue-600' : 
                                                           item.value.includes('N/A') ? 'text-red-500' : 'text-green-600';

                                        return (
                                            <div key={index} className="flex justify-between py-1.5 border-b border-gray-100 last:border-b-0">
                                                <span className="text-gray-700 text-sm font-semibold">{item.label}:</span> 
                                                <span className={`font-bold text-sm ${priceColor}`}>{item.value}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Secondary Details & Address */}
                                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4">
                                    <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">Location Details</h3>
                                    
                                    {secondaryDetailLabel && (
                                        <div className="flex justify-between border-b border-gray-100 pb-2">
                                            <span className="text-gray-700 text-sm font-semibold flex items-center gap-1"><FaRulerCombined/> {secondaryDetailLabel}:</span> 
                                            <span className="text-blue-600 text-sm font-bold">{secondaryDetail}</span>
                                        </div>
                                    )}
                                    {vendor.details?.roomCount > 0 && (
                                        <div className="flex justify-between border-b border-gray-100 pb-2">
                                            <span className="text-gray-700 text-sm font-semibold flex items-center gap-1">Rooms Available:</span> 
                                            <span className="text-blue-600 text-sm font-bold">{vendor.details.roomCount}</span>
                                        </div>
                                    )}

                                    <div className="border-t pt-2 mt-2">
                                        <h4 className="font-bold text-gray-800 text-sm mb-1">Full Address:</h4>
                                        <p className="text-gray-600 text-sm">{address}, {city}, {state}</p>
                                        <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs font-semibold hover:underline flex items-center mt-1">
                                            <FaExternalLinkAlt className="mr-1 text-xs"/> View Exact Location on Map
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* 2. ABOUT SECTION (Read More Logic Applied) */}
                        <div className="p-6 sm:p-8 bg-white shadow-xl rounded-xl border-l-4 border-pink-600" id="about-section">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <FaInfoCircle className="text-pink-600"/> About {vendor.businessName}
                            </h2>
                            <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
                                {showFullAbout ? fullAboutText : truncatedAboutText}
                            </p>
                            {fullAboutText.length > ABOUT_TRUNCATE_LENGTH && (
                                <button 
                                    onClick={() => setShowFullAbout(!showFullAbout)}
                                    className="text-pink-600 font-semibold mt-2 text-sm hover:underline"
                                >
                                    {showFullAbout ? 'Show Less' : 'Read More...'}
                                </button>
                            )}
                        </div>

                        {/* 3. SERVICES LIST SECTION */}
                        <div className="p-6 sm:p-8 bg-white shadow-xl rounded-xl border-l-4 border-green-600" id="services-section">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <FaConciergeBell className="text-green-600"/> Detailed Services ({vendor.services?.length || 0})
                            </h2>
                            {vendor.services?.length > 0 ? (
                                <ServiceDetailCard services={vendor.services} />
                            ) : (
                                <p className="text-gray-500">No detailed service list provided by the vendor.</p>
                            )}
                        </div>
                        
                        {/* 4. PORTFOLIO SECTION */}
                        <div className="p-6 sm:p-8 bg-white shadow-xl rounded-xl border-l-4 border-orange-600" id="portfolio-section">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <FaImages className="text-orange-600"/> Portfolio
                            </h2>
                            {/* Passing vendor.user (owner ID) to PortfolioSection for self-liking check */}
                            <PortfolioSection vendorId={vendor._id} user={user} vendorOwnerId={vendor.user} /> 
                        </div>

                        {/* 5. REVIEWS SECTION */}
                        <div className="p-6 sm:p-8 bg-white shadow-xl rounded-xl border-l-4 border-yellow-600 mb-8" id="reviews-section">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <FaCommentDots className="text-yellow-600"/> Customer Reviews ({vendor.reviewCount || 0})
                            </h2>
                            <ReviewsSection vendor={vendor} user={user} isOwner={isOwner} />
                        </div>
                    </div>
                    
                    {/* RIGHT COLUMN: Booking & Enquiry Form (Sticky) */}
                    <div className="lg:col-span-1 lg:sticky lg:top-24 h-fit" id="enquiry-column">
                        
                        {/* Booking & Enquiry Form */}
                        <div className="bg-white shadow-2xl rounded-xl">
                            
                            {/* Form Switcher */}
                            <div className="flex border-b border-gray-200">
                                <button 
                                    onClick={() => setActiveForm('enquiry')}
                                    className={`flex-1 py-3 font-bold text-sm transition-colors ${activeForm === 'enquiry' ? 'bg-blue-600 text-white rounded-tl-xl' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    <FaPaperPlane className="inline mr-1"/> Enquiry
                                </button>
                                <button 
                                    onClick={() => setActiveForm('booking')}
                                    className={`flex-1 py-3 font-bold text-sm transition-colors ${activeForm === 'booking' ? 'bg-green-600 text-white rounded-tr-xl' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    <FaCalendarCheck className="inline mr-1"/> Booking
                                </button>
                            </div>
                            
                            {/* Form Content */}
                            <div className="p-6">
                                {activeForm === 'enquiry' ? (
                                    <form onSubmit={sendEnquiry} className="space-y-4">
                                        <h3 className="text-lg font-bold text-blue-600 mb-2">General Inquiry</h3>
                                        {enquirySent ? (
                                            <div className="text-center p-4 bg-green-50 rounded-xl">Request Sent!</div>
                                        ) : (
                                            <>
                                                <input 
                                                    type="text" 
                                                    name="phone" 
                                                    className="w-full p-3 border rounded-lg focus:ring-blue-500" 
                                                    placeholder="Your mobile number" 
                                                    value={enquiryData.phone} 
                                                    onChange={handleEnquiryChange} 
                                                    required
                                                />
                                                
                                                {/* --- MODIFIED EVENT DATE SECTION START --- */}
                                                <div className="flex flex-col items-start w-full">
                                                    <label htmlFor="eventDate" className="text-sm font-semibold text-gray-700 mb-1">Event Date</label>
                                                    <input 
                                                        id="eventDate" // Label ke liye ID
                                                        type="date" 
                                                        name="eventDate" 
                                                        className="w-full p-3 border rounded-lg focus:border-pink-500 focus:ring-1                                                 focus:ring-pink-500 transition" // UI improved with pink focus
                                                        value={enquiryData.eventDate} 
                                                        onChange={handleEnquiryChange} 
                                                        required
                                                    />
                                                </div>
                                                {/* --- MODIFIED EVENT DATE SECTION END --- */}
                                                
                                                <textarea 
                                                    name="message" 
                                                    className="w-full p-3 border rounded-lg h-24 focus:ring-blue-500" 
                                                    placeholder="Event Details: Is it a Birthday, Anniversary, Wedding, or something else? (required)                                                " 
                                                    value={enquiryData.message} 
                                                    onChange={handleEnquiryChange} 
                                                    required
                                                />
                                                <button 
                                                    type="submit" 
                                                    disabled={sending} 
                                                    className={`w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition                                                 disabled:opacity-50 text-lg shadow-lg`}
                                                >
                                                    {sending ? <><FaSpinner className="animate-spin inline mr-2" /> Sending...</> : "Send Enquiry"}
                                                </button></>
                                        )}
                                    </form>
                                ) : (
                                    /* Booking Form */
                                    <BookingForm vendorProfile={vendor} />
                                )}
                            </div>
                        </div>
                        
                        
                        
                        
                    </div>
                </div>
            </div>
            
            {/* FIXED MOBILE CTA BAR (Bottom of Screen) */}
            <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-gray-300 shadow-2xl p-3 z-40">
                <button 
                    onClick={scrollToEnquiry} 
                    className="flex items-center justify-center w-full gap-2 bg-pink-600 text-white px-4 py-3 rounded-xl font-bold text-lg shadow-xl hover:bg-pink-700 transition"
                >
                    <FaPaperPlane /> Enquire Now
                </button>
            </div>
        </div>
    );
}