import React, { useContext } from 'react';
import { ProductContext } from '../context/ProductContext'; // ⬅️ Context Import
import ProductCard from '../components/ProductCard'; // Assuming a reusable component for display
import ShareButton from '../components/ShareButton'; // Assuming ShareButton component

const ProductListPage = () => {
    // 1. Context से state और updater functions प्राप्त करें
    const { 
        products, 
        loading, 
        error, 
        queryParams, 
        setQueryParams 
    } = useContext(ProductContext);

    // 2. Search Input Handler
    const handleSearchChange = (e) => {
        // Search बदलने पर page को 1 पर reset करें
        setQueryParams(prev => ({ 
            ...prev, 
            q: e.target.value, 
            page: 1 
        }));
    };

    // 3. Filter/Sort Handlers
    const handleFilterChange = (key, value) => {
        setQueryParams(prev => ({
            ...prev,
            [key]: value,
            page: 1 // Always reset page on filter change
        }));
    };
    
    // 4. Pagination Handler
    const handlePageChange = (newPage) => {
        setQueryParams(prev => ({ ...prev, page: newPage }));
    };

    return (
        <div className="product-list-page">
            <h1>All Products</h1>

            {/* A. Search & Filter Bar */}
            <div className="filter-bar">
                <input 
                    type="text" 
                    value={queryParams.q} 
                    onChange={handleSearchChange} 
                    placeholder="Search by name..."
                />
                
                <select 
                    value={queryParams.category} 
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                    <option value="">All Categories</option>
                    <option value="electronics">Electronics</option>
                    {/* ... other options */}
                </select>

                <select 
                    value={queryParams.sort} 
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                >
                    <option value="-createdAt">Newest</option>
                    <option value="price">Price: Low to High</option>
                    <option value="-price">Price: High to Low</option>
                </select>
                
                {/* 5. Share Functionality for the CURRENT FILTERED URL */}
                {/* Note: यह पूरे page का URL share करेगा, जिसमें query params भी शामिल होंगे */}
                <ShareButton 
                    title="Product List Filtered" 
                    text="Check out these items!"
                    url={window.location.href} 
                />
            </div>

            {/* B. Display Results */}
            {loading && <div>Loading products...</div>}
            {error && <div className="error-message">{error}</div>}
            
            <div className="product-grid">
                {products.length > 0 ? (
                    products.map(product => (
                        // 6. ProductCard component का उपयोग करें
                        <ProductCard key={product._id} product={product} /> 
                    ))
                ) : (
                    !loading && <p>No products found matching your criteria.</p>
                )}
            </div>

            {/* C. Pagination (Example) */}
            <button 
                onClick={() => handlePageChange(queryParams.page - 1)} 
                disabled={queryParams.page <= 1}
            >
                Previous
            </button>
            <span> Page {queryParams.page} </span>
            <button 
                onClick={() => handlePageChange(queryParams.page + 1)}
                // Production-level में totalPages state से check करें
            >
                Next
            </button>
        </div>
    );
};

// Component को Default Export करें
export default ProductListPage;