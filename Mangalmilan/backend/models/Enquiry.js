import mongoose from 'mongoose';
const EnquirySchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'VendorProfile', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestName: { type: String },
  message: { type: String, required: true },
  phone: { type: String, required: true },
  eventDate: { type: Date, required: true },
  status: { type: String, enum: ['PENDING', 'CONTACTED', 'REJECTED'], default: 'PENDING' },
}, { timestamps: true });

const Enquiry = mongoose.model('Enquiry', EnquirySchema);
export default Enquiry;
