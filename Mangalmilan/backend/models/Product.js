
import mongoose from 'mongoose'; 

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter product name'],
        trim: true,
    },
    price: {
        type: Number,
        required: [true, 'Please enter product price'],
    },
    category: {
        type: String,
        required: [true, 'Please select category for this product'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Product = mongoose.model('Product', productSchema);

export default Product;