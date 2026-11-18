import mongoose from 'mongoose';
import validator from 'validator'; 

const ContactSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Please provide your name.'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please provide an email.'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email.'],
    },
    subject: {
        type: String,
        required: true,
        trim : true,
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },

    // ---------- ADMIN STATUS FIELD ----------
    status: {
        type: String,
        enum: ["Pending", "Complete"],
        default: "Pending",
    },
}, 
{ timestamps: true }
);

const Contact = mongoose.model("Contact", ContactSchema);
export default Contact;
