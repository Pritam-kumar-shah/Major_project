import Enquiry from "../models/Enquiry.js";
import VendorProfile from "../models/VendorProfile.js";
import User from "../models/User.js";
import { sendToVendor, sendToUser } from "../utils/sendNotification.js";



// =================================================================
// 1. CREATE A NEW ENQUIRY (with Notification Logic)  💬
// =================================================================

export const createEnquiry = async (req, res) => {
  try {
    const { vendor, message, phone, eventDate, guestName } = req.body;

    if (!vendor || !message || !phone || !eventDate) {
      return res.status(400).json({
        message: "Vendor, message, mobile number and event date are required"
      });
    }

    // 🔹 1) enquiry save
    const newEnquiry = await Enquiry.create({
      vendor,
      user: req.user?._id || null,
      guestName: !req.user ? guestName : undefined,
      message,
      phone,
      eventDate
    });

    const vendorProfile = await VendorProfile.findById(vendor);
    const vendorUserId = vendorProfile.user;

    // 🔹 3) Notification send to USER id jo vendor ka hai
    await sendToVendor(
      vendorUserId,
      "📩 New Enquiry Received",
      `Aapko ek nayi enquiry mili hai`,
      {
        enquiryId: String(newEnquiry._id),
        redirectUrl: "/vendor/enquiry" // ✅ Passed correctly in extraData
      }
    );

    res.status(201).json({
      message: "Enquiry sent successfully",
      enquiry: newEnquiry
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



// =================================================================
// 2. GET ENQUIRIES OF LOGGED-IN USER ✅
// =================================================================
export const getUserEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find({ user: req.user._id })
      .populate("vendor", "businessName profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json(enquiries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// =================================================================
// 3. GET ALL ENQUIRIES FOR A VENDOR (Secure) ✅
// =================================================================
export const getVendorEnquiries = async (req, res) => {
  try {
    const vendorProfile = await VendorProfile.findOne({ user: req.user._id });

    if (!vendorProfile) {
      return res.status(403).json({ message: "Access denied. You are not a vendor." });
    }

    const enquiries = await Enquiry.find({ vendor: vendorProfile._id })
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json(enquiries);
  } catch (err) {
    console.error("Error fetching vendor enquiries:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// =================================================================
// 4. UPDATE ENQUIRY STATUS (Secure) ✅
// =================================================================
export const updateEnquiryStatus = async (req, res) => {
  const { enquiryId } = req.params;
  const { status } = req.body;

  if (!["PENDING", "CONTACTED", "REJECTED"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const vendorProfile = await VendorProfile.findOne({ user: req.user._id });
    if (!vendorProfile) {
      return res.status(403).json({ message: "Access denied. You are not a vendor." });
    }

    const enquiry = await Enquiry.findById(enquiryId);

    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    if (enquiry.vendor.toString() !== vendorProfile._id.toString()) {
      return res.status(403).json({ message: "Forbidden. You cannot update this enquiry." });
    }

    enquiry.status = status;
    await enquiry.save();
    if (enquiry.user) {   // user null ho sakta hai guest enquiry case me
      let title = "📌 Enquiry Update";
      let body = "";

      if (status === "CONTACTED") body = "Vendor ne aapse contact kiya hoga. Aap update check karein.";
      if (status === "REJECTED") body = "Vendor ne aapki enquiry ko reject kar diya hai.";
      if (status === "PENDING") body = "Aapki enquiry fir se pending status me hai.";

      await sendToUser(
        enquiry.user,     // user ka _id (NotificationToken ownerId se match karta hai)
        title,
        body,
        {
          enquiryId: enquiry._id.toString(),
          redirectUrl: "/my-bookings" // ✅ User ko bookings page par bhejo
        }
      );
    }


    res.status(200).json({ message: "Status updated successfully", enquiry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};