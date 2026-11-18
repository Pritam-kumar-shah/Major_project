import Booking from "../models/Booking.js";
import VendorProfile from "../models/VendorProfile.js";
import crypto from "crypto";
import Profile from "../models/UserProfile.js";
import WeddingPlan from "../models/WeddingPlan.js";
import { sendBookingConfirmation } from "../utils/email.js";
import { sendToVendor, sendToUser } from "../utils/sendNotification.js";  // ✔ correct functions


// 1️⃣ Vendor updates booking status (CONFIRM / REJECT / CANCEL / COMPLETE)
export const updateBookingStatusByVendorId = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    const vendorProfile = await VendorProfile.findOne({ user: req.user._id });
    if (!vendorProfile)
      return res.status(403).json({ message: "Not a vendor." });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.vendor.toString() !== vendorProfile._id.toString())
      return res.status(403).json({ message: "Cannot update this booking" });


    // ====== CONFIRMED ======
    if (status === "CONFIRMED") {
      if (booking.status !== "PENDING")
        return res.status(400).json({ message: "Only pending bookings can be confirmed." });

      booking.status = "CONFIRMED";

      // 🔔 NOTIFICATION → User ko mile (specific)
      await sendToUser(
        booking.customer,
        "🎉 Booking Confirmed",
        `Aapki booking confirm ho gayi hai: ${booking.bookingCode}`
      );

      // ====== Booking Code Logic ======
      if (!booking.bookingCode) {
        let uniqueCode;
        let isUnique = false;
        while (!isUnique) {
          uniqueCode = crypto.randomInt(100000, 999999).toString();
          const exists = await Booking.findOne({ bookingCode: uniqueCode });
          if (!exists) isUnique = true;
        }
        booking.bookingCode = uniqueCode;
      }

      await booking.save();

      // ====== Budget Updates ======
      const userProfile = await Profile.findOne({ user: booking.customer });
      if (userProfile) {
        userProfile.budget.spent = (userProfile.budget.spent || 0) + booking.amount;
        userProfile.markModified("budget");
        await userProfile.save();
      }

      const weddingPlan = await WeddingPlan.findOne({ user: booking.customer });
      if (weddingPlan) {
        weddingPlan.budgetDetails.spent =
          (weddingPlan.budgetDetails.spent || 0) + booking.amount;
        weddingPlan.markModified("budgetDetails");
        await weddingPlan.save();
      }

      // ====== Email ======
      const populatedBooking = await Booking.findById(booking._id)
        .populate({
          path: "vendor",
          model: "VendorProfile",
          select: "businessName location user",
          populate: {
            path: "user",
            model: "User",
            select: "name email mobile",
          },
        });

      if (booking.customerInfo.email) {
        try {
          await sendBookingConfirmation(
            booking.customerInfo.email,
            populatedBooking
          );
        } catch (err) {
          console.error("Email sending failed:", err.message);
        }
      }

      return res.status(200).json({ message: "Booking confirmed successfully", booking });
    }


    // ====== REJECTED ======
    else if (status === "REJECTED") {
      booking.status = "REJECTED";
      booking.bookingCode = undefined;
      await booking.save();

      // 🔔 NOTIFICATION → User ko
      await sendToUser(
        booking.customer,
        "❌ Booking Rejected",
        `Vendor ne aapki booking reject kar di: ${booking._id}`
      );

      return res.status(200).json({ message: "Booking rejected", booking });
    }


    // ====== CANCELLED BY VENDOR ======
    else if (status === "CANCELLED") {
      booking.status = "CANCELLED";
      booking.bookingCode = undefined;
      booking.cancellationDetails = {
        isCancelled: true,
        cancelledBy: "VENDOR",
        reason: "Cancelled by vendor",
        cancellationDate: new Date(),
      };

      await booking.save();

      // 🔔 NOTIFICATION → User ko
      await sendToUser(
        booking.customer,
        "⚠️ Booking Cancelled",
        `Vendor ne aapki booking cancel kar di: ${booking._id}`
      );

      return res.status(200).json({ message: "Booking cancelled", booking });
    }


    else {
      return res.status(400).json({ message: "Invalid status" });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};



// 2️⃣ Create Booking (User)
export const createBooking = async (req, res) => {
  try {
    const {
      vendorId,
      serviceId,
      bookingDateTime,
      amount,
      notes,
      serviceName,
      customerPhone,
    } = req.body;

    const existingBooking = await Booking.findOne({
      customer: req.user._id,
      vendor: vendorId,
      status: { $in: ["PENDING", "CONFIRMED"] },
    });

    if (existingBooking) {
      return res.status(400).json({
        message: `You already have a booking with status '${existingBooking.status}'.`,
      });
    }

    // ====== Generate code ======
    let bookingCode;
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const digitPart = () => crypto.randomInt(1000, 10000).toString();
    let isUnique = false;
    while (!isUnique) {
      const letterPart = Array.from({ length: 2 }, () =>
        letters.charAt(Math.floor(Math.random() * letters.length))
      ).join("");
      bookingCode = `${letterPart}${digitPart()}`;
      const exists = await Booking.findOne({ bookingCode });
      if (!exists) isUnique = true;
    }

    const booking = new Booking({
      vendor: vendorId,
      customer: req.user._id,
      bookingDateTime,
      amount,
      notes,
      status: "PENDING",
      bookingCode,
      customerInfo: {
        name: req.user.name,
        phone: customerPhone || req.user.phone,
        email: req.user.email,
      },
      serviceInfo: {
        serviceId,
        name: serviceName,
      },
      paymentInfo: { status: "PENDING" },
    });

    await booking.save();

    // 🔔 NOTIFICATION — Only that vendor
    await sendToVendor(
      vendorId,
      "📩 New Booking Request",
      `Ek user ne booking request bheji hai. Booking code: ${booking.bookingCode}`
    );

    res.status(201).json({ message: "Booking created successfully.", booking });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};



// 3️⃣ Vendor completes booking using code
export const completeBookingByCode = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { bookingCode } = req.body;

    const vendorProfile = await VendorProfile.findOne({ user: req.user._id });
    if (!vendorProfile) return res.status(403).json({ message: "Not a vendor." });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.vendor.toString() !== vendorProfile._id.toString())
      return res.status(403).json({ message: "Cannot complete this booking" });

    if (booking.bookingCode !== bookingCode)
      return res.status(400).json({ message: "Invalid booking code" });

    booking.status = "COMPLETED";
    await booking.save();

    // 🔔 NOTIFICATION → user
    await sendToUser(
      booking.customer,
      "✅ Booking Completed",
      `Aapki booking complete ho gayi: ${booking.bookingCode}`
    );

    res.status(200).json({ message: "Booking completed successfully", booking });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};



// 4️⃣ Get User Bookings
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user._id })
      .populate("vendor", "businessName profileImage")
      .sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching user bookings." });
  }
};



// 5️⃣ Get Vendor Bookings
export const getVendorBookings = async (req, res) => {
  try {
    const vendorProfile = await VendorProfile.findOne({ user: req.user._id });
    if (!vendorProfile)
      return res.status(403).json({ message: "Not a vendor." });

    const bookings = await Booking.find({ vendor: vendorProfile._id })
      .populate("customer", "name email phone")
      .sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching vendor bookings." });
  }
};



// 6️⃣ User cancels booking
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.customer.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    booking.status = "CANCELLED";
    booking.bookingCode = undefined;
    booking.cancellationDetails = {
      isCancelled: true,
      cancelledBy: "CUSTOMER",
      reason: reason || "Cancelled by user",
      cancellationDate: new Date(),
    };

    await booking.save();

    // 🔔 NOTIFICATION — vendor ko mile
    await sendToVendor(
      booking.vendor,
      "⚠️ Booking Cancelled",
      `User ne booking cancel kar di: ${booking._id}`
    );

    res.status(200).json({ message: "Booking cancelled", booking });

  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};
