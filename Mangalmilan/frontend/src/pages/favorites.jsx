import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaHeart, FaTrash } from 'react-icons/fa';

// --- Skeleton Loader for a smooth loading experience ---
const CardSkeleton = () => (
    <div className="bg-white rounded-lg shadow-md animate-pulse">
        <div className="h-48 bg-gray-200 rounded-t-lg"></div>
        <div className="p-4 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
    </div>
);

export default function MyFavoritesPage() {
    const [favoriteVendors, setFavoriteVendors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const { data } = await apiClient.get('/api/profile/favorites');
                setFavoriteVendors(data);
            } catch (err) {
                toast.error("Could not load your favorite vendors.");
            } finally {
                setLoading(false);
            }
        };
        fetchFavorites();
    }, []);

    // ✅ NAYA FUNCTION: FAVORITE LIST SE VENDOR KO HATANE KE LIYE
    const handleRemoveFavorite = async (e, vendorId) => {
        // e.stopPropagation() aur e.preventDefault() zaroori hain
        // taaki heart par click karne se page navigate na ho.
        e.stopPropagation();
        e.preventDefault();

        try {
            await apiClient.patch(`/api/profile/favorites/${vendorId}`);
            
            setFavoriteVendors(prev => prev.filter(vendor => vendor._id !== vendorId));

            toast.success("Removed from shortlist!");
        } catch (err) {
            toast.error("Failed to remove from shortlist.");
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-4 pt-24">
                <h1 className="text-3xl font-bold mb-8">My Shortlist</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 pt-24 min-h-screen">
            <h1 className="text-3xl font-bold mb-8">My Shortlisted Vendors</h1>
            {favoriteVendors.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg shadow-md">
                    <FaHeart className="mx-auto text-5xl text-gray-300" />
                    <p className="text-gray-600 text-xl mt-4 font-semibold">Your shortlist is empty.</p>
                    <p className="text-gray-500 mt-2">Click the heart icon on any vendor to add them here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoriteVendors.map(vendor => (
                        <Link to={`/vendor/${vendor._id}`} key={vendor._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow group relative">
                            <div className="overflow-hidden h-48">
                                <img 
                                    src={vendor.profileImage} 
                                    alt={vendor.businessName} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                />
                            </div>

                            <button 
                                onClick={(e) => handleRemoveFavorite(e, vendor._id)}
                                className="absolute top-3 right-3 bg-white p-2 rounded-full text-rose-500 shadow-md hover:scale-110 transition-transform"
                                title="Remove from Shortlist"
                            >
                                <FaTrash />
                            </button>

                            <div className="p-4">
                                <h2 className="font-bold text-xl truncate">{vendor.businessName}</h2>
                                <p className="text-sm text-gray-500">{vendor.category?.name}</p>
                                <div className="flex justify-between items-center mt-3">
                                    <span className="flex items-center gap-1 text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-semibold">
                                        <FaStar /> {vendor.averageRating?.toFixed(1) || '0.0'}
                                    </span>
                                    <span className="flex items-center gap-1 text-sm text-gray-600">
                                        <FaMapMarkerAlt /> {vendor.location?.city}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}