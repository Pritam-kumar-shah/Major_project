import React from 'react';
import { Link } from 'react-router-dom';
import ShareButton from './ShareButton'; 

const ProductCard = ({ product }) => {
    const productUrl = `${window.location.origin}/product/${product._id}`; 
    
    return (
        <div className="product-card">
            <h3>{product.name}</h3>
            <p>Price: ${product.price}</p>
            
            <Link to={`/product/${product._id}`}>View Details</Link>

            <ShareButton 
                title={product.name} 
                text={`Great deal on ${product.name} at only $${product.price}!`}
                url={productUrl}
            />
        </div>
    );
};

export default ProductCard;