import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },               
  description: { type: String, trim: true },           
  basePrice: { type: Number, required: true },         
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'VendorProfile', required: true }, 
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Service', ServiceSchema);
