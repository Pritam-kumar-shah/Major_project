import Contact from "../models/Contact.js";

// --------------------------
// CREATE CONTACT / ENQUIRY
// --------------------------
export const createEnquiry = async (req, res) => {
  try {
    const { fullName, email, subject, message } = req.body;

    // Basic validation
    if (!fullName || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Create new enquiry
    const enquiry = await Contact.create({
      fullName,
      email,
      subject,
      message,
      status: "Pending",
    });

    return res.status(201).json({
      success: true,
      message: "Your enquiry has been submitted successfully!",
      data: enquiry,
    });

  } catch (error) {
    console.error("Create Enquiry Error:", error);

   

    return res.status(500).json({
      success: false,
      message: "Server error, please try again later.",
    });
  }
};

// --------------------------
// GET ALL ENQUIRIES (ADMIN)
// --------------------------
export const getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await Contact.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: enquiries.length,
      data: enquiries,
    });

  } catch (error) {
    console.error("Get All Enquiries Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch enquiries.",
    });
  }
};

// --------------------------
// GET SINGLE ENQUIRY BY ID
// --------------------------
export const getEnquiryById = async (req, res) => {
  try {
    const enquiry = await Contact.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: enquiry,
    });

  } catch (error) {
    console.error("Get Enquiry By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch enquiry.",
    });
  }
};

// --------------------------
// UPDATE STATUS (Pending → Complete)
// --------------------------
export const updateEnquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Validate status
    if (!["Pending", "Complete"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either Pending or Complete.",
      });
    }

    const updated = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Status updated successfully!",
      data: updated,
    });

  } catch (error) {
    console.error("Update Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update enquiry status.",
    });
  }
};
