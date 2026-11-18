import React, { useEffect, useState, useContext, useMemo, useCallback } from "react";
import apiClient from "../api/apiClient";
import {
    FaStar, FaHeart, FaMapMarkerAlt, FaSearch, FaFilter, FaTimes,
    FaRupeeSign, FaCertificate, FaAngleDown, FaBolt, FaChevronLeft, FaCheck, FaShareAlt,
    FaWhatsapp, FaFacebookF, FaTwitter, FaCopy
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { AuthContext } from "../context/auth.jsx";
import SEO from "../components/SEO.jsx";

// --- START: HELPER COMPONENTS DEFINITIONS ---

const CardSkeleton = () => (
    <div className="bg-white rounded-xl w-full h-[350px] shadow-lg animate-pulse overflow-hidden sm:rounded-2xl sm:h-[380px]">
        <div className="h-40 bg-gray-200 sm:h-44"></div>
        <div className="p-4 space-y-3">
            <div className="h-4 bg-pink-100 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
        </div>
    </div>
);

// 🔑 MODIFIED COMPONENT: PriceDisplay (Highlighted without extra box)
const PriceDisplay = ({ details }) => {
    const formatPrice = (price) => price ? price.toLocaleString('en-IN') : 'N/A';

    // --- Starting Package/Rental Price ---
    if (!details || (!details.perPlateVeg && !details.perPlateNonVeg)) {
        const price = details?.rentalPrice || details?.startingPackagePrice;
        if (price) {
            return (
                <div className="text-sm font-extrabold flex items-center text-pink-700 mt-2">
                    <FaRupeeSign size={12} className="mr-1" />{formatPrice(price)}
                    <span className="text-gray-500 font-medium ml-1 text-xs"> (Starting Package)</span>
                </div>
            );
        }

        // Highlight for 'Price on Request'
        return <p className="text-pink-600 text-sm font-bold mt-2">Price on Request</p>;
    }

    // --- Per Plate Prices (Veg/Non-Veg) ---
    return (
        <div className="flex justify-start gap-5 mt-2">
            {details.perPlateVeg && (
                <div className="flex flex-col">
                    <p className="text-xs text-gray-500 font-medium">Veg</p>
                    <p className="text-lg font-extrabold flex items-center text-green-700"> {/* Highlighted style */}
                        <FaRupeeSign size={11} className="mr-0.5" />
                        {formatPrice(details.perPlateVeg)}
                        <span className="text-gray-500 font-normal ml-1 text-xs">/ plate</span>
                    </p>
                </div>
            )}
            {details.perPlateNonVeg && (
                <div className="flex flex-col">
                    <p className="text-xs text-gray-500 font-medium">Non veg</p>
                    <p className="text-lg font-extrabold flex items-center text-red-700"> {/* Highlighted style */}
                        <FaRupeeSign size={11} className="mr-0.5" />
                        {formatPrice(details.perPlateNonVeg)}
                        <span className="text-gray-500 font-normal ml-1 text-xs">/ plate</span>
                    </p>
                </div>
            )}
        </div>
    );
};

const ActiveFilterChip = ({ label, onOpenModal }) => (
    <div className="flex items-center bg-pink-100 text-pink-700 text-xs font-medium px-2 py-0.5 rounded-full border border-pink-300 shadow-sm sm:text-sm sm:px-3 sm:py-1 cursor-pointer" onClick={onOpenModal}>
        {label}
    </div>
);

const HeroBanner = ({ currentCategory, city }) => (
    <div
        className="relative w-full h-40 bg-cover bg-center rounded-xl shadow-lg mb-6 flex items-center justify-center p-4 sm:h-56 md:h-64 sm:rounded-2xl sm:mb-8"
        style={{ backgroundImage: 'url(https://picsum.photos/1200/400)' }}
    >
        <div className="absolute inset-0 bg-pink-900/60 rounded-xl sm:rounded-2xl backdrop-blur-sm"></div>
        <div className="relative text-center text-white">
            <p className="text-sm font-semibold mb-1 flex items-center justify-center gap-1 sm:text-lg">
                <FaBolt className="text-yellow-400" /> TOP {currentCategory} IN
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight drop-shadow-lg sm:text-4xl md:text-5xl">
                {city || 'All Cities'}
            </h1>
            <p className="mt-1 text-xs font-medium text-pink-200 sm:mt-2 sm:text-sm">
                Browse verified profiles, check prices, and shortlist your favorites!
            </p>
        </div>
    </div>
);

const RadioFilterGroup = ({ label, options, selectedValue, onChange }) => (
    <div className="flex flex-col items-start gap-2 p-3 bg-white rounded-lg shadow-inner border border-gray-100">
        <label className="text-sm font-bold text-gray-800">{label}</label>
        <div className="flex flex-wrap gap-2 w-full">
            {options.map(option => (
                <button
                    key={option.value}
                    onClick={() => onChange(option.value)}
                    className={`
                        px-4 py-2 text-sm rounded-full font-medium transition-all duration-200 flex-1 min-w-[70px]
                        ${selectedValue === option.value
                            ? 'bg-pink-600 text-white shadow-md ring-2 ring-pink-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-pink-50'
                        }
                    `}
                >
                    {option.label}
                </button>
            ))}
        </div>
    </div>
);

const FilterModal = ({
    filterParams, setFilterParams, setShowModal,
    defaultFilterParams, vendorPrices,
    vendorRatings, vendorRoomCounts, setTriggerFetch
}) => {

    const [tempFilters, setTempFilters] = useState(filterParams);
    // 🔑 NEW ID: Venue category check
    const isVenueCategory = tempFilters.category === "68f321b1baae4ac8b0550d22";
    const VENDOR_CITY = filterParams.city; // Bhopal

    const handleTempFilterChange = (key, value) => {
        const sanitizedValue = (key.includes('[gte]') && value === 0) ? "0" : value;
        setTempFilters(prev => ({ ...prev, [key]: sanitizedValue }));
    };

    const applyFilters = () => {
        setFilterParams({ ...tempFilters, city: VENDOR_CITY });
        setTriggerFetch(prev => prev + 1);
        setShowModal(false);
    };

    const resetFilters = () => {
        const category = tempFilters.category;
        setTempFilters(prev => ({
            ...defaultFilterParams,
            category: category,
            q: '',
            city: VENDOR_CITY
        }));
    };

    const isAnyFilterApplied = Object.keys(tempFilters).some(key => {
        if (key === 'category' || key === 'sort' || key === 'q' || key === 'city') return false;
        return tempFilters[key] !== defaultFilterParams[key];
    });

    return (
        <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white p-4 border-b shadow-sm flex items-center justify-between">
                <button onClick={() => setShowModal(false)} className="text-pink-600 hover:text-pink-800 flex items-center font-medium">
                    <FaChevronLeft size={16} className="mr-2" /> Back
                </button>
                <h2 className="text-xl font-bold text-gray-900">All Filters</h2>
                <button
                    onClick={applyFilters}
                    className="bg-pink-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-1 hover:bg-pink-700 transition"
                >
                    <FaCheck size={14} /> Apply
                </button>
            </div>

            {/* Filters Body */}
            <div className="p-4 sm:p-6 flex-1 max-w-4xl mx-auto w-full">

                {/* City Display (Fixed to Bhopal) */}
                <div className="mb-6 p-4 bg-pink-50 border border-pink-300 rounded-xl shadow-lg flex items-center gap-3">
                    <FaMapMarkerAlt className="text-pink-600" size={16} />
                    <span className="text-lg font-bold text-pink-700">Location: {VENDOR_CITY} (Fixed)</span>
                </div>

                {/* Other Filters Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Max Price Filter */}
                    <div className="p-4 bg-white rounded-xl shadow-lg border border-gray-100">
                        <label className="text-lg font-bold text-pink-600 mb-2 block">1. Max Budget</label>
                        <div className="relative">
                            <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={14} />
                            <select
                                value={tempFilters["price[lte]"]}
                                onChange={(e) => handleTempFilterChange('price[lte]', e.target.value)}
                                className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl appearance-none bg-white font-medium text-gray-700 text-base focus:border-pink-500"
                            >
                                {vendorPrices.map(price => (<option key={price.value} value={price.value}>{price.label}</option>))}
                            </select>
                            <FaAngleDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-pink-500 pointer-events-none" size={12} />
                        </div>
                    </div>

                    {/* Min Rating Filter (Radio) */}
                    <RadioFilterGroup
                        label="2. Minimum Rating"
                        options={vendorRatings}
                        selectedValue={tempFilters["averageRating[gte]"]}
                        onChange={(value) => handleTempFilterChange('averageRating[gte]', value)}
                    />

                    {/* Min Rooms Filter (Radio - Conditional) */}
                    {isVenueCategory && (
                        <RadioFilterGroup
                            label="3. Required Rooms"
                            options={vendorRoomCounts}
                            selectedValue={tempFilters["roomCount[gte]"]}
                            onChange={(value) => handleTempFilterChange('roomCount[gte]', value)}
                        />
                    )}

                    {/* Sort Filter (Dropdown in Modal) */}
                    <div className="p-4 bg-white rounded-xl shadow-lg border border-gray-100">
                        <label className="text-lg font-bold text-pink-600 mb-2 block">Sort Results</label>
                        <div className="relative">
                            <select
                                value={tempFilters.sort}
                                onChange={(e) => handleTempFilterChange('sort', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl appearance-none bg-white font-medium text-gray-700 text-base focus:border-pink-500"
                            >
                                <option value="-averageRating">⭐ Top Rated</option>
                                <option value="-createdAt">✨ Newest</option>
                                <option value="price">💸 Price: Low to High</option>
                                <option value="-price">💰 Price: High to Low</option>
                            </select>
                            <FaAngleDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-pink-500 pointer-events-none" size={12} />
                        </div>
                    </div>

                </div>
            </div>

            {/* Footer / Apply Button Area */}
            <div className="sticky bottom-0 bg-white p-4 border-t shadow-2xl flex justify-between items-center w-full">
                <button
                    onClick={resetFilters}
                    className={`text-red-500 text-sm font-semibold p-2 rounded-lg ${isAnyFilterApplied ? 'hover:bg-red-50' : 'opacity-50 cursor-not-allowed'}`}
                    disabled={!isAnyFilterApplied}
                >
                    <FaTimes size={14} className="inline mr-1" /> Clear All Filters
                </button>
                <button
                    onClick={applyFilters}
                    className="bg-pink-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-pink-700 transition shadow-lg shadow-pink-300/50"
                >
                    Show Results
                </button>
            </div>
        </div>
    );
};

// --- Share Button Component ---
const ShareButtonInCard = ({ vendorId, vendorName }) => {
    const [showModal, setShowModal] = useState(false);
    const shareUrl = `${window.location.origin}/vendor/${vendorId}`;
    const shareText = `Check out ${vendorName} for your event planning needs: ${shareUrl}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl)
            .then(() => {
                toast.info("Link copied to clipboard!");
                setShowModal(false);
            })
            .catch(() => toast.error('Failed to copy link.'));
    };

    const DummyShareModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setShowModal(false)}>
            <div className="bg-white rounded-xl p-6 shadow-2xl w-11/12 max-w-sm" onClick={e => e.stopPropagation()}>
                <h3 className="font-bold text-lg mb-4 border-b pb-2">Share {vendorName}</h3>
                <div className="flex justify-around gap-2 my-4">

                    {/* WhatsApp */}
                    <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white shadow-md transition">
                        <FaWhatsapp size={20} />
                    </a>

                    {/* Facebook */}
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white shadow-md transition">
                        <FaFacebookF size={20} />
                    </a>

                    {/* Twitter */}
                    <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-gray-800 hover:bg-black rounded-full flex items-center justify-center text-white shadow-md transition">
                        <FaTwitter size={20} />
                    </a>

                </div>
                <button
                    onClick={copyToClipboard}
                    className="w-full bg-pink-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-pink-700 transition flex items-center justify-center gap-2 mt-4"
                >
                    <FaCopy className="inline mr-1" /> Copy Link
                </button>
            </div>
        </div>
    );

    return (
        <>
            <button
                onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
                className="absolute top-3 right-3 sm:right-4 bg-white/70 p-1.5 rounded-full shadow-md text-gray-600 z-10 transition-all hover:bg-white"
            >
                <FaShareAlt size={12} />
            </button>
            {showModal && <DummyShareModal />}
        </>
    );
};

export default function VendorList() {
    const VENDOR_CITY = "Bhopal"; // Fixed location

    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const [showFilterModal, setShowFilterModal] = useState(false);

    // --- MOCK DATA: NEW PRODUCTION IDs APPLIED ---
    const vendorCategories = useMemo(() => [
        // IDs are now correctly mapped for filtering
        { name: "Venue", value: "68f321b1baae4ac8b0550d22", icon: '🏰' },
        { name: "Caterer", value: "68f32210baae4ac8b0550d2c", icon: '🍽️' },
        { name: "Photographer", value: "68f32235baae4ac8b0550d31", icon: '📸' },
        { name: "Makeup Artist", value: "68f32274baae4ac8b0550d36", icon: '💄' },
        { name: "DJ and Music", value: "68f321d8baae4ac8b0550d27", icon: '🎧' },
    ], []);

    // Default filter state
    const defaultFilterParams = useMemo(() => ({
        q: "",
        category: "",
        city: VENDOR_CITY,
        sort: "-averageRating",
        "averageRating[gte]": "0",
        "price[lte]": "",
        "capacity[gte]": "0",
        page: 1,
        "roomCount[gte]": "0",
        "rentalPrice[lte]": "",
        "venueType": "",
    }), [VENDOR_CITY]);

    const [filterParams, setFilterParams] = useState(defaultFilterParams);
    const [triggerFetch, setTriggerFetch] = useState(0);

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Filter Options 
    const vendorPrices = [{ label: 'All Budgets', value: "" }, { label: '₹1L', value: "100000" }, { label: '₹5L', value: "500000" }, { label: '₹10L', value: "1000000" },];
    const vendorRatings = [{ label: 'Any', value: "0" }, { label: '4.5 ★+', value: "4.5" }, { label: '4.0 ★+', value: "4.0" },];
    const vendorRoomCounts = [{ label: 'Any', value: "0" }, { label: '20+', value: "20" }, { label: '50+', value: "50" }, { label: '100+', value: "100" },];

    // --- CORE LOGIC: Clean Filters for API ---
    const getCleanFilters = useCallback(() => {
        const cleaned = {};
        for (const key in filterParams) {
            const value = filterParams[key];
            if (value === "" && key !== 'category' && key !== 'sort' && key !== 'q') continue;
            if (key.includes('[gte]') && value === "0") continue;
            // Always include city since it's fixed
            if (key === 'city' && value === VENDOR_CITY) {
                cleaned[key] = value;
                continue;
            }
            cleaned[key] = value;
        }
        return cleaned;
    }, [filterParams, VENDOR_CITY]);


    useEffect(() => {
        const fetchVendors = async () => {
            setLoading(true);
            try {
                const cleanFilters = getCleanFilters();
                const params = new URLSearchParams(cleanFilters);
                const query = params.toString();

                const vendorRes = await apiClient.get(`/api/v1/profile?${query}`);
                setVendors(vendorRes.data.vendors || []);

            } catch (err) {
                console.error("Vendor List Error (Check Backend 500 error logs):", err);
                toast.error("Data loading failed. Please restart the server and check MongoDB connection.");
            } finally {
                setLoading(false);
            }
        };
        fetchVendors();
    }, [triggerFetch, getCleanFilters]);

    useEffect(() => {
        const fetchFavorites = async () => {
            if (!user) {
                setFavorites([]);
                return;
            }
            try {
                const favoritesRes = await apiClient.get('/api/profile/favorites');
                setFavorites(favoritesRes.data.map(fav => fav.vendor?._id || fav._id) || []);
            } catch (err) {
                console.error("Favorites Error:", err);
            }
        };
        fetchFavorites();
    }, [user]);

    const handleSearchClick = () => {
        setFilterParams(prev => ({ ...prev, q: searchInput, page: 1 }));
        setTriggerFetch(prev => prev + 1);
    };

    const handleCategorySelect = (value) => {
        setSearchInput("");
        setFilterParams(prev => ({
            ...defaultFilterParams,
            category: value, // NEW value (ID)
            q: "",
            page: 1
        }));
        setTriggerFetch(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleToggleFavorite = async (vendorId, isCurrentlyFavorite) => {
        if (!user) return toast.error("Please login to add to your shortlist.");
        setFavorites(prev => isCurrentlyFavorite ? prev.filter(id => id !== vendorId) : [...prev, vendorId]);

        try {
            await apiClient.patch(`/api/profile/favorites/${vendorId}`);
            toast.success(isCurrentlyFavorite ? "Removed from Shortlist!" : "Added to Shortlist!");
        } catch (err) {
            setFavorites(prev => isCurrentlyFavorite ? [...prev, vendorId] : prev.filter(id => id !== vendorId));
            toast.error("Failed to update shortlist.");
        }
    };


    const currentCategory = vendorCategories.find(c => c.value === filterParams.category)?.name || 'All Vendors';
    const currentCity = VENDOR_CITY; // Always Bhopal

    const getActiveFilters = useCallback(() => {
        const active = [];
        const isDefault = (key, value) => value === defaultFilterParams[key];
        let filterCount = 0;

        if (filterParams.q) { active.push({ key: 'q', label: `Search: "${filterParams.q}"` }); filterCount++; }
        if (filterParams["price[lte]"] && !isDefault("price[lte]", filterParams["price[lte]"])) { active.push({ key: 'price[lte]', label: vendorPrices.find(p => p.value === filterParams["price[lte]"])?.label || 'Max Price' }); filterCount++; }
        if (filterParams["roomCount[gte]"] !== "0" && filterParams.category === "68f321b1baae4ac8b0550d22") { active.push({ key: 'roomCount[gte]', label: `Rooms: ${filterParams["roomCount[gte]"]}+` }); filterCount++; }
        if (filterParams["averageRating[gte]"] !== "0" && !isDefault("averageRating[gte]", filterParams["averageRating[gte]"])) { active.push({ key: 'averageRating[gte]', label: `Rating: ${filterParams["averageRating[gte]"]}★+` }); filterCount++; }

        // Agar koi category filter hai (lekin default nahi) toh usko bhi dikhayein
        if (filterParams.category && filterParams.category !== defaultFilterParams.category) {
            active.push({ key: 'category', label: `${currentCategory}` });
            filterCount++;
        }

        return { list: active, count: filterCount };
    }, [filterParams, defaultFilterParams, currentCategory]);

    const { list: activeFilters, count: activeFilterCount } = getActiveFilters();


    if (loading) {
        return (
            <div className="w-full min-h-screen bg-gray-50 p-4 sm:p-8 pt-20">
                <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
                </div>
            </div>
        );
    }

    // Determine the empty state message
    let notFoundMessage;
    if (filterParams.q || activeFilterCount > 0) {
        notFoundMessage = `No results found matching your criteria.`;
    } else {
        notFoundMessage = `No ${currentCategory} listings available in ${currentCity} yet.`;
    }

    return (
        <>
            <SEO
                title="Best Wedding Venues & Vendors in Bhopal"
                description="Find top rated wedding venues, photographers, makeup artists, and caterers in Bhopal. Compare prices, check reviews and book your dream wedding services on Mangalmilan."
                keywords="wedding venues bhopal, marriage halls bhopal, wedding photographers bhopal, bridal makeup bhopal, wedding planners bhopal, best caterers bhopal"
            />
            {/* 1. Filter Modal Render */}
            {showFilterModal && (
                <FilterModal
                    filterParams={filterParams}
                    setFilterParams={setFilterParams}
                    setShowModal={setShowFilterModal}
                    defaultFilterParams={defaultFilterParams}
                    vendorPrices={vendorPrices}
                    vendorRatings={vendorRatings}
                    vendorRoomCounts={vendorRoomCounts}
                    setTriggerFetch={setTriggerFetch}
                />
            )}

            <div className="w-full min-h-screen bg-gray-50 pt-20 pb-8 sm:pb-12">
                <div className="container mx-auto px-2 sm:px-4 md:px-8">

                    {/* HERO BANNER */}
                    <HeroBanner currentCategory={currentCategory} city={currentCity} />

                    {/* 2. Primary Action Bar (Search + Filter Button) */}
                    <div className="bg-white p-3 rounded-xl shadow-lg mb-6 border border-gray-100 sticky top-[70px] z-10 sm:p-4">
                        <div className="flex items-center gap-3">

                            {/* Search Input and Button */}
                            <div className="relative flex-1 flex">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-500" size={14} />
                                <input
                                    type="text"
                                    placeholder={`Search ${currentCategory} in ${currentCity}...`}
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-l-xl focus:border-pink-500 transition text-sm sm:text-base sm:pl-12 sm:py-3"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSearchClick();
                                    }}
                                />
                                <button
                                    onClick={handleSearchClick}
                                    className="bg-pink-600 text-white px-4 py-2 rounded-r-xl text-sm font-semibold hover:bg-pink-700 transition"
                                >
                                    Search
                                </button>
                            </div>

                            {/* Filter Button */}
                            <button
                                onClick={() => setShowFilterModal(true)}
                                className="bg-pink-500 text-white px-3 py-2 rounded-xl text-sm font-semibold hover:bg-pink-600 transition flex items-center gap-1.5 shadow-lg sm:px-4 sm:py-3"
                            >
                                <FaFilter size={14} className="text-white" />
                                Filter
                                {activeFilterCount > 0 && (
                                    <span className="bg-white text-pink-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center -mr-1">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>


                    {/* 3. Active Filters Chips & Result Count */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 my-6 sm:my-8">

                        <div className="text-base font-bold text-gray-800 sm:text-xl">
                            Showing <span className="text-pink-600">{vendors.length}</span> {currentCategory} Results
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {/* Active Filter Chips: Click opens Modal for editing */}
                            {activeFilters.map(filter => (
                                <ActiveFilterChip
                                    key={filter.key}
                                    label={filter.label}
                                    onOpenModal={() => setShowFilterModal(true)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* 4. Vendor Grid: The results (Optimized for 3-4 cards per row) */}
                    {vendors.length === 0 ? (
                        <div className="w-full flex flex-col items-center justify-center text-gray-500 text-lg py-16 bg-white rounded-xl shadow-lg border border-gray-100 sm:text-xl sm:py-24 sm:rounded-2xl">
                            <FaSearch size={30} className="mb-4 text-pink-400 sm:size-40" />
                            <p className="font-semibold text-gray-800 text-center px-4">{notFoundMessage}</p>
                            <p className="text-sm mt-2 text-gray-500 text-center px-4">Adjust filters or check spelling.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                            {vendors.map(vendor => {
                                const isFavorited = favorites.includes(vendor._id);
                                const category = vendorCategories.find(c => c.value === vendor.category);

                                return (
                                    <div
                                        // onClick={(e) => { e.stopPropagation(); navigate(`/vendor/${vendor._id}`); }} 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                        
                                            if (window.gtag) {
                                              window.gtag("event", "vendor_card_click", {
                                                vendor_id: vendor._id,
                                                vendor_name: vendor.businessName,
                                                vendor_category: category?.name || "unknown",
                                                page: "home_vendor_list"
                                              });
                                            }
                                        
                                            navigate(`/vendor/${vendor._id}`);
                                          }}
                                        key={vendor._id}
                                        className="relative bg-white rounded-xl shadow-lg overflow-hidden group transition-all duration-500 hover:shadow-xl hover:shadow-pink-300/50 transform hover:-translate-y-0.5 sm:rounded-2xl sm:hover:shadow-2xl sm:hover:translate-y-[-4px]"
                                    >
                                        <div className="relative w-full h-40 cursor-pointer sm:h-44">
                                            <img
                                                src={vendor.profileImage || 'https://via.placeholder.com/600x400?text=Vendor+Image'}
                                                alt={vendor.businessName}
                                                className="w-full h-full object-cover"
                                            />

                                            {/* Handpicked Badge (Top Left) */}
                                            {vendor.isFeatured && (
                                                <div className="absolute top-3 left-3 bg-pink-600 text-white px-3 py-1 text-xs font-bold flex items-center gap-1 rounded-full shadow-md">
                                                    <span className="text-lg">👑</span> Handpicked
                                                </div>
                                            )}

                                            {/* Share Button Integration */}
                                            <ShareButtonInCard vendorId={vendor._id} vendorName={vendor.businessName} />

                                        </div>

                                        {/* Info Section */}
                                        <div className="p-3 flex flex-col sm:p-4">

                                            {/* Title and Rating Row */}
                                            <div className="flex justify-between items-start mb-1">
                                               <h3
                                                    className="text-lg font-bold text-gray-900 truncate pr-2 cursor-pointer hover:text-pink-600"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                  
                                                      if (window.gtag) {
                                                        window.gtag("event", "vendor_title_click", {
                                                          vendor_id: vendor._id,
                                                          vendor_name: vendor.businessName
                                                        });
                                                      }
                                                  
                                                      navigate(`/vendor/${vendor._id}`);
                                                    }}
                                                >

                                                    {vendor.businessName}
                                                </h3>

                                                {/* Rating Block (Top Right) */}
                                                <div className="flex items-center text-sm font-bold text-gray-800 flex-shrink-0">
                                                    <FaStar size={12} className="text-pink-600 mr-1" />
                                                    <span>{vendor.averageRating?.toFixed(1) || "N/A"}</span>
                                                </div>
                                            </div>

                                            {/* Location and Category Icons */}
                                            <div className="flex items-center text-xs text-gray-500 mb-1">
                                                <FaMapMarkerAlt size={9} className="text-gray-500 mr-1" />
                                                <span className="mr-3">{VENDOR_CITY}</span>

                                                <span className="flex items-center text-xs font-medium text-gray-700">
                                                    {category?.icon ? <span className="mr-1 text-base">{category?.icon}</span> : <FaCertificate size={10} className="mr-1" />}
                                                    {category?.name || 'Service'}
                                                </span>
                                            </div>

                                            {/* Price Display (Highlighted) */}
                                            <PriceDisplay details={vendor.details} />

                                            {/* Capacity and Rooms (Bottom Chips) */}
                                            <div className="flex flex-wrap gap-1.5 text-xs font-medium mt-3 pt-2 border-t border-gray-100">
                                                {vendor.details?.capacity > 0 && (
                                                    <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full">
                                                        {vendor.details?.capacity}pax
                                                    </span>
                                                )}

                                                {vendor.details?.roomCount > 0 && (
                                                    <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full">
                                                        {vendor.details.roomCount} Rooms
                                                    </span>
                                                )}

                                                {/* '...more' TEXT CHIP */}
                                                <button
                                                    // onClick={(e) => { e.stopPropagation(); navigate(`/vendor/${vendor._id}`); }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();

                                                        // ✅ GA4: Vendor card click
                                                        if (window.gtag) {
                                                          window.gtag("event", "vendor_card_click", {
                                                            vendor_id: vendor._id,
                                                            vendor_name: vendor.businessName,
                                                            vendor_category: category?.name || "unknown",
                                                            page: "home_vendor_list"
                                                          });
                                                        }
                                                      
                                                        navigate(`/vendor/${vendor._id}`);
                                                    }}

                                                    className="text-pink-600 hover:text-pink-800 font-semibold cursor-pointer px-2.5 py-0.5 text-xs"
                                                >
                                                    ...more
                                                </button>
                                            </div>

                                            {/* Favorite/Shortlist Button Row */}
                                            <button
                                                onClick={() => handleToggleFavorite(vendor._id, isFavorited)}
                                                className={`w-full mt-3 text-white py-2 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:mt-4 sm:py-2.5 sm:rounded-xl 
                                                    ${isFavorited
                                                        ? "bg-rose-500 hover:bg-rose-600"
                                                        : "bg-pink-600 hover:bg-pink-700"
                                                    } shadow-md`}
                                            >
                                                <FaHeart className="inline" size={14} />
                                                {isFavorited ? "Shortlisted" : "Add to Shortlist"}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* 5. Category Grid (Full Width, 5 items) */}
                    <div className="mt-12 mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center sm:text-2xl">Browse by Category</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 md:gap-6 w-full mx-auto">
                            {vendorCategories.map(cat => (
                                <div
                                    key={cat.value}
                                    onClick={() => handleCategorySelect(cat.value)}
                                    className={`
                                        flex flex-col items-center justify-center p-4 rounded-xl shadow-lg cursor-pointer transition-all duration-300 border-2 
                                        ${filterParams.category === cat.value
                                            ? 'bg-pink-50 border-pink-600 text-pink-700 scale-[1.03]'
                                            : 'bg-white border-gray-100 text-gray-800 hover:shadow-xl hover:border-pink-300'
                                        }
                                    `}
                                >
                                    <span className="text-3xl mb-2 sm:text-4xl">{cat.icon || '📦'}</span>
                                    <p className="font-semibold text-xs text-center sm:text-sm">{cat.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
