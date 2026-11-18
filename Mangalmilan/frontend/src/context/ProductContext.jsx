import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// 1. Context Export
export const ProductContext = createContext();

// 2. Custom Hook: Debouncing logic (Optional, but good for search)
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

// 3. Provider Component
export const ProductProvider = ({ children }) => {
    // State for filtering and searching
    const [queryParams, setQueryParams] = useState({
        q: '',        // Search query
        category: '', // Filter
        sort: '-createdAt', // Sort
        page: 1,      // Pagination
        limit: 10,
    });
    
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Debounce the search query to prevent excessive API calls
    const debouncedQueryParams = useDebounce(queryParams, 500);

    // 4. API Fetching Logic (Filtering/Searching)
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Build Query String from state
            const params = new URLSearchParams();
            Object.keys(debouncedQueryParams).forEach(key => {
                if (debouncedQueryParams[key]) {
                    params.append(key, debouncedQueryParams[key]);
                }
            });
            
            const url = `/api/v1/products?${params.toString()}`;
            const response = await axios.get(url);
            
            setProducts(response.data.products);
            // setTotalPages(response.data.totalPages); // Assuming backend provides this
        } catch (err) {
            setError("Failed to load products. Try again.");
            console.error("API Error:", err);
        } finally {
            setLoading(false);
        }
    }, [debouncedQueryParams]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // 5. Context Value (Exposing state and updater functions)
    const contextValue = {
        products,
        loading,
        error,
        queryParams,
        setQueryParams, // Allows components to update search/filter/sort
        fetchProducts // Allows manual refetch if needed
    };

    return (
        <ProductContext.Provider value={contextValue}>
            {children}
        </ProductContext.Provider>
    );
};

// 6. Custom Hook for easy use
export const useProducts = () => {
    return useContext(ProductContext);
};

// Note: Components जो Individual product details चाहिए, वो सीधे Page Component में Fetch कर सकते हैं।