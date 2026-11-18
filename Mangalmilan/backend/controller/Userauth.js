import User from "../models/User.js";
import validator from 'validator';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { genToken } from "../config/token.js";
import fs from 'fs';
import path from 'path';

const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com', 
        port: Number(process.env.EMAIL_PORT) || 465, 
        secure: true, 
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        // Handles "Unexpected socket close" errors
        options: {
            connectionTimeout: 10000, 
            socketTimeout: 10000, 
        }
    });
};

// ---------------- Temporary Storage (IN-MEMORY MAPS) ---------------- //
const tempUsers = new Map();
const tempVendors = new Map();

// ---------------- Helper Functions ---------------- //
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Base function to send an email
const sendEmail = async (email, subject, name, templateName, otp, isVendor = false) => {
    const transporter = createTransporter();
    
    try {
        const templateDir = path.resolve('templates');
        const templatePath = path.resolve(templateDir, templateName);
        
        if (!fs.existsSync(templatePath)) {
            throw new Error(`Email template not found: ${templatePath}`);
        }

        let html = fs.readFileSync(templatePath, 'utf8');
        html = html.replace('{{NAME}}', name).replace('{{OTP}}', otp);

        const attachments = [{ 
            filename: 'logo.png', 
            path: path.resolve('assets', 'logo.png'), 
            cid: 'logo' 
        }];

        await transporter.sendMail({
            from: `"Mangalmilan" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: subject,
            html,
            attachments,
        });

        const logType = isVendor ? 'Vendor' : 'User';
        console.log(`[${logType} OTP] Sent to ${email}: ${otp}`);
    } catch (err) {
        console.error("Error sending OTP email:", err);
        throw new Error("Failed to send OTP email. Please check server logs for SMTP details.");
    }
};

const sendUserOtpEmail = (name, email, otp) => 
    sendEmail(email, `Hi ${name}, your OTP is ${otp}`, name, 'user-otp-template.html', otp, false);

const sendVendorOtpEmail = (name, email, otp) => 
    sendEmail(email, `Mangalmilan Vendor OTP`, name, 'vendor-otp-template.html', otp, true);

const sendResetOtpEmail = (name, email, otp) =>
    sendEmail(email, `Mangalmilan Password Reset OTP`, name, 'reset-otp-template.html', otp, false);

// ---------------- Signup (User) ---------------- //
export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const lowerCaseEmail = email.toLowerCase();
        
        // 1. Validation
        if (!validator.isEmail(lowerCaseEmail)) return res.status(400).json({ message: "Invalid email format." });
        if (!password || password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters long." });

        // 2. Existence Check
        const existAccount = await User.findOne({ email: lowerCaseEmail });
        if (existAccount) return res.status(400).json({ message: "Account already registered." });
        
        // 🛑 CROSS CHECK (Blocks signup if already pending in another Map)
        if (tempVendors.has(lowerCaseEmail)) return res.status(400).json({ message: "This email is pending Vendor verification. Complete verification first." });
        if (tempUsers.has(lowerCaseEmail)) return res.status(400).json({ message: "A pending user signup already exists. Please check your email." });

        // 3. Prepare Data
        const hashPassword = await bcrypt.hash(password, 10);
        const otp = generateOtp();
        const otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

        // 4. Store in Temp Map
        tempUsers.set(lowerCaseEmail, { name, email: lowerCaseEmail, password: hashPassword, otp, otpExpires, role: 'user' });
        console.log(`[USER SIGNUP] Stored in Temp Map: ${lowerCaseEmail}. Size: ${tempUsers.size}`);

        // 5. Send OTP Email
        await sendUserOtpEmail(name, lowerCaseEmail, otp);

        res.status(200).json({ success: true, message: "OTP sent to your email. Verify to complete signup." });
    } catch (err) {
        if (err.message.includes("Failed to send OTP email")) {
            console.error("Signup Email Failure:", err.message);
            tempUsers.delete(req.body.email.toLowerCase()); 
            return res.status(503).json({ message: "Failed to send OTP email. Please check your SMTP configuration." });
        }
        
        console.error("Signup Error:", err);
        res.status(500).json({ message: "Server error during signup." });
    }
};

// ---------------- Vendor Signup ---------------- //
export const vendorSignup = async (req, res) => {
    try {
        const { name, email, password, mobile } = req.body;
        const lowerCaseEmail = email.toLowerCase(); 
        
        if (!validator.isEmail(lowerCaseEmail)) return res.status(400).json({ message: "Invalid email format." });
        if (!password || password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters long." });
        if (!mobile) return res.status(400).json({ message: "Mobile number is required." });

        // 2. Existence Check
        const existAccount = await User.findOne({ email: lowerCaseEmail });
        if (existAccount) return res.status(400).json({ message: `Account already registered as ${existAccount.role}.` });
        
        // 🛑 CROSS CHECK (Blocks signup if already pending in another Map)
        if (tempUsers.has(lowerCaseEmail)) return res.status(400).json({ message: "This email is pending User verification. Complete verification first." });
        if (tempVendors.has(lowerCaseEmail)) return res.status(400).json({ message: "A pending vendor signup already exists. Please check your email." });

        // 3. Prepare Data
        const hashPassword = await bcrypt.hash(password, 10);
        const otp = generateOtp();
        const otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

        // 4. 💾 Store in Temp Map
        tempVendors.set(lowerCaseEmail, { 
            name, 
            email: lowerCaseEmail, 
            password: hashPassword, 
            mobile, 
            otp, 
            otpExpires, 
            role: 'vendor', 
            adminApproved: false 
        });
        console.log(`[VENDOR SIGNUP] Stored in Temp Map: ${lowerCaseEmail}. Size: ${tempVendors.size}`);

        // 5. Send OTP Email
        await sendVendorOtpEmail(name, lowerCaseEmail, otp);

        res.status(200).json({ success: true, message: "OTP sent. Verify to complete vendor signup." });
    } catch (err) {
        if (err.message.includes("Failed to send OTP email")) {
            console.error("Vendor Signup Email Failure:", err.message);
            tempVendors.delete(req.body.email.toLowerCase()); 
            return res.status(503).json({ message: "Failed to send OTP email. Please check your SMTP configuration." });
        }

        console.error("Vendor Signup Error:", err);
        res.status(500).json({ message: "Server error during vendor signup." });
    }
};

// ---------------- Verify OTP (Final Save to DB) ---------------- //
export const verifyOtp = async (req, res) => {
    try {
        const { email: receivedEmailObject, otp: receivedOtp } = req.body;
        
        console.log("[DEBUG] VERIFY OTP Payload Received:", req.body);
        
        // --- FIX THE NESTED PAYLOAD ---
        let email, otp;

        if (receivedEmailObject && typeof receivedEmailObject === 'object' && receivedEmailObject.email) {
            email = receivedEmailObject.email;
            otp = receivedEmailObject.otp;
        } else {
            email = receivedEmailObject;
            otp = receivedOtp;
        }
        // ------------------------------

        // 🛑 FIX: Validate email and OTP presence 
        if (!email || typeof email !== 'string') {
            return res.status(400).json({ message: "ERROR: Email field is missing or invalid in the request body." });
        }
        if (!otp) {
            return res.status(400).json({ message: "OTP is required." });
        }

        const lowerCaseEmail = email.toLowerCase(); 

        let tempUser = tempUsers.get(lowerCaseEmail);
        let tempVendor = tempVendors.get(lowerCaseEmail);
        
        if (!tempUser && !tempVendor) {
            return res.status(404).json({ message: "User/vendor data not found. (OTP expired or server restarted)." });
        }

        let tempAccount = tempUser || tempVendor; // Data found
        let tempMap = tempUser ? tempUsers : tempVendors; // Map where data was found

        // 1. OTP Check
        if (tempAccount.otp !== otp) return res.status(400).json({ message: "Invalid OTP." });

        // 2. Expiration Check
        if (tempAccount.otpExpires < Date.now()) { 
            tempMap.delete(lowerCaseEmail); 
            return res.status(400).json({ message: "OTP expired. Please resend." }); 
        }

        // 3. 🚀 VERIFICATION SUCCESSFUL: DATA KO DB MEIN SAVE KARO
        const finalAccountData = {
            name: tempAccount.name, 
            email: tempAccount.email, 
            password: tempAccount.password, // Hashed Password
            role: tempAccount.role, 
            isVerified: true,
        };

        if (tempAccount.role === 'vendor') {
            finalAccountData.mobile = tempAccount.mobile;
            finalAccountData.adminApproved = tempAccount.adminApproved;
        }

        const newPermanentUser = new User(finalAccountData);
        await newPermanentUser.save();

        // 4. TEMPORARY DATA KO MAP SE DELETE KARO
        tempMap.delete(lowerCaseEmail);
        console.log(`[VERIFY OTP] Success! ${newPermanentUser.role} saved to DB.`);

        // 5. Token Generation aur Response
        const token = genToken(newPermanentUser._id);
        
        res.cookie("token", token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, 
            path: "/" 
        });

        const accountToReturn = newPermanentUser.toObject(); delete accountToReturn.password;
        
        if (newPermanentUser.role === 'vendor') {
            return res.status(200).json({ success: true, message: "Vendor signup complete and verified. Awaiting admin approval.", vendor: accountToReturn });
        } else {
            return res.status(200).json({ success: true, message: "User signup complete and verified.", user: accountToReturn });
        }

    } catch (err) {
        console.error("Verify OTP Error:", err);
        res.status(500).json({ message: "Server error during OTP verification." });
    }
};



// ---------------- Resend OTP ---------------- //
export const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        // Added validation here too for safety
        if (!email || typeof email !== 'string') {
            return res.status(400).json({ message: "Email is required." });
        }

        const lowerCaseEmail = email.toLowerCase();

        let tempUser = tempUsers.get(lowerCaseEmail);
        let tempVendor = tempVendors.get(lowerCaseEmail);
        
        if (!tempUser && !tempVendor) return res.status(404).json({ message: "User/vendor not found for OTP resend. Please sign up again." });

        let tempAccount = tempUser || tempVendor;
        let tempMap = tempUser ? tempUsers : tempVendors;

        const otp = generateOtp();
        const otpExpires = Date.now() + 5 * 60 * 1000;

        // Map mein OTP update karo
        tempAccount.otp = otp; 
        tempAccount.otpExpires = otpExpires; 
        tempMap.set(lowerCaseEmail, tempAccount); 

        // Role ke हिसाब se email bhejo
        if (tempAccount.role === 'user') {
             await sendUserOtpEmail(tempAccount.name, lowerCaseEmail, otp);
        } else if (tempAccount.role === 'vendor') {
             await sendVendorOtpEmail(tempAccount.name, lowerCaseEmail, otp);
        }

        console.log(`[Resent OTP] ${lowerCaseEmail}: ${otp}`);
        res.status(200).json({ success: true, message: "New OTP sent successfully." });
    } catch (err) {
        if (err.message.includes("Failed to send OTP email")) {
            console.error("Resend OTP Email Failure:", err.message);
            return res.status(503).json({ message: "Failed to resend OTP email. Please check your SMTP configuration." });
        }
        console.error("Resend OTP Error:", err);
        res.status(500).json({ message: "Server error." });
    }
};

// --- Forget Password (Sends Reset OTP) ---
export const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || !validator.isEmail(email)) return res.status(400).json({ message: "Please provide a valid email." });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "No account found with that email." });

        const otp = generateOtp();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        user.resetOtp = otp;
        user.resetOtpExpires = otpExpires;
        await user.save();

        await sendResetOtpEmail(user.name, email, otp);
        console.log(`Reset OTP for ${email}: ${otp}`);

        return res.status(200).json({ success: true, message: "Password reset OTP sent to your email." });
    } catch (err) {
        if (err.message.includes("Failed to send OTP email")) {
            console.error("Forget Password Email Failure:", err.message);
            return res.status(503).json({ message: "Failed to send reset email. Please check your SMTP configuration." });
        }
        console.error("Forget Password Error:", err);
        return res.status(500).json({ message: "Server error." });
    }
};

// --- Reset Password (verify reset OTP & update) ---
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) return res.status(400).json({ message: "Missing email, OTP, or new password." });
        if (newPassword.length < 8) return res.status(400).json({ message: "New password must be at least 8 characters." });

        const user = await User.findOne({ email }).select("+password +resetOtp +resetOtpExpires");
        if (!user) return res.status(404).json({ message: "User not found." });

        if (!user.resetOtp || user.resetOtp !== otp) return res.status(400).json({ message: "Invalid reset OTP." });
        if (user.resetOtpExpires < Date.now()) {
            user.resetOtp = undefined;
            user.resetOtpExpires = undefined;
            await user.save();
            return res.status(400).json({ message: "OTP expired, please request a new one." });
        }

        const hashPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashPassword;
        user.resetOtp = undefined; 
        user.resetOtpExpires = undefined;
        await user.save();

        return res.status(200).json({ success: true, message: "Password reset successful. You can now login with your new password." });
    } catch (err) {
        console.error("Reset Password Error:", err);
        return res.status(500).json({ message: "Server error during password reset." });
    }
};


// ---------------- User Login ---------------- //
export const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select("+password");

        if (!user) return res.status(404).json({ message: "Invalid credentials." });
        // Check if account is verified
        if (!user.isVerified) return res.status(403).json({ message: "Please verify your email address to log in." });

        if (user.role !== 'user') return res.status(403).json({ message: "This is not a user account. Please login from the vendor page." });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: "Invalid credentials." });

        const token = genToken(user._id);
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
            maxAge: 30 * 24 * 60 * 60 * 1000, 
            path: "/", 
        });

        const userToReturn = user.toObject();
        delete userToReturn.password;
        res.status(200).json({ success: true, message: "User login successful.", user: userToReturn,token, });
    } catch (err) {
        console.error("User Login Error:", err.message);
        return res.status(500).json({ message: "Server error." });
    }
};

// ---------------- Vendor Login ---------------- //
export const vendorLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const vendor = await User.findOne({ email }).select("+password");

        if (!vendor) return res.status(404).json({ message: "Invalid credentials." });
        // Check if account is verified
        if (!vendor.isVerified) return res.status(403).json({ message: "Please verify your email address to log in." });

        if (vendor.role !== 'vendor') return res.status(403).json({ message: "This is not a vendor account. Please login from the user page." });

        const match = await bcrypt.compare(password, vendor.password);
        if (!match) return res.status(400).json({ message: "Invalid credentials." });

        const token = genToken(vendor._id);
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
            maxAge: 30 * 24 * 60 * 60 * 1000,
            path: "/", 
        });

        const vendorToReturn = vendor.toObject();
        delete vendorToReturn.password;
        res.status(200).json({ success: true, message: "Vendor login successful.", vendor: vendorToReturn,token, });
    } catch (err) {
        console.error("Vendor Login Error:", err.message);
        return res.status(500).json({ message: "Server error." });
    }
};

// ---------------- Logout ---------------- //
export const logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
            path: "/",
        });
        return res.status(200).json({ message: "Logout successful." });
    } catch (err) {
        console.error("Logout Error:", err.message);
        return res.status(500).json({ message: "Server error." });
    }
};

// ---------------- Google Login ---------------- //
export const googleLogin = async (req, res) => {
    try {
        const { name, email } = req.body;
        const lowerCaseEmail = email.toLowerCase();

        let user = await User.findOne({ email: lowerCaseEmail });
        if (!user) {
            const randomPassword = crypto.randomBytes(16).toString('hex');
            const hashPassword = await bcrypt.hash(randomPassword, 10);

            user = await User.create({
                name,
                email: lowerCaseEmail,
                password: hashPassword, 
                isVerified: true, 
                role: 'user', 
            });
        }
        
        if (user.role !== 'user') {
             return res.status(403).json({ message: "Account found, but it is a vendor account. Please use the appropriate login." });
        }


        const token = genToken(user._id);
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
            maxAge: 30 * 24 * 60 * 60 * 1000, 
            path: "/", 
        });


        const userToReturn = user.toObject();
        delete userToReturn.password;
        return res.status(200).json({
          success: true,
          message: "Google login successful.",
          user: userToReturn,
          token,          // ⬅️ IMPORTANT
        });

    } catch (err) {
        console.error("Google Login Error:", err.message);
        return res.status(500).json({ message: "Google login failed due to a server error." });
    }
};
