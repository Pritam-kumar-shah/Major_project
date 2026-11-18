import mongoose from 'mongoose';
import validator from 'validator'; 



const userSchema = new mongoose.Schema({
    name: {
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
    mobile: {
        type: String,
        unique: true,
        sparse: true, 
        validate: {
           validator: function (v) {
             if (!v) return true; 
             return /^[6-9]\d{9}$/.test(v); 
            },
          message: "Please provide a valid 10-digit mobile number.",
        },
    },
    password: {
        type: String,
        required: [true, 'Please provide a password.'],
        minlength: 8,
        select: false, 
    },
    role: {
        type: String,
        enum: ['user','vendor' ,'admin'], 
        default: 'user',
    },
    otp: {
        type: String,
        select: false, 
    },
    otpExpires: {
        type: Date,
        select: false,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
   isAdminApproved: { type: Boolean, default: function() { return this.role === 'vendor' ? false : undefined; } },
   resetOtp: { type: String },
   resetOtpExpires: { type: Date },
    
}, {
    timestamps: true,
});

userSchema.index({ email: 1 });

const User = mongoose.model("User", userSchema);

export default User;