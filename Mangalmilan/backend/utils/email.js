import nodemailer from "nodemailer";
import path from "path";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // Gmail SSL
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Booking Confirmation Email with Vendor Contact & Proper Location Display
export const sendBookingConfirmation = async (userEmail, booking) => {
  /*
    booking.vendor.user → Vendor’s account info (email, mobile)
    booking.vendor.businessName → Vendor business name
    booking.vendor.location → Vendor location (e.g., Tarwara, Siwan, 841506)
  */

  const vendorName = booking.vendor?.businessName || "Your Vendor";
  const vendorPhone =
    booking.vendor?.user?.mobile || booking.vendor?.user?.phone || "Not Available";
  const vendorEmail = booking.vendor?.user?.email || "Not Available";
  const vendorLocation = booking.vendor?.location || "Not Provided";
  const companyEmail = "helps.mangalmilan@gmail.com";

  try {
    const htmlContent = `
      <div style="font-family:'Segoe UI',sans-serif;max-width:650px;margin:auto;background:#fff7f8;border-radius:18px;padding:25px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
        <div style="text-align:center;margin-bottom:25px;">
          <img src="cid:logo" style="width:90px;border-radius:50%;"/>
          <h2 style="color:#d946ef;margin:10px 0;">Hi ${booking.customerInfo?.name || "Customer"}!</h2>
          <p style="color:#555;">Your booking is <strong>confirmed ✅</strong>!</p>
        </div>

        <div style="background:#fff0f3;padding:20px;border-radius:12px;margin-bottom:20px;">
          <h3 style="color:#333;margin-bottom:10px;">📋 Booking Details</h3>
          <p><b>Booking Code:</b> ${booking.bookingCode}</p>
          <p><b>Service:</b> ${booking.serviceInfo?.name || "N/A"}</p>
          <p><b>Date & Time:</b> ${new Date(booking.bookingDateTime).toLocaleString()}</p>
          <p><b>Amount:</b> ₹${booking.amount}</p>
          <p><b>Notes:</b> ${booking.notes || "N/A"}</p>
        </div>

        <div style="background:#fce7f3;padding:20px;border-radius:12px;margin-bottom:20px;">
          <h3 style="color:#333;margin-bottom:10px;">🏨 Vendor Contact Details</h3>
          <ul style="list-style:none;padding:0;line-height:1.8;color:#444;">
            <li>👤 <b>Vendor:</b> ${vendorName}</li>
            <li>📍 <b>Location:</b> 
              <span style="background:#fde2e4;padding:6px 12px;border-radius:8px;color:#b91c1c;font-weight:600;display:inline-block;margin-top:4px;">
                ${vendorLocation}
              </span>
            </li>
            <li>📞 <b>Mobile:</b> 
              <a href="tel:${vendorPhone}" style="color:#d946ef;text-decoration:none;">${vendorPhone}</a>
            </li>
            <li>📧 <b>Email:</b> 
              <a href="mailto:${vendorEmail}" style="color:#d946ef;text-decoration:none;">${vendorEmail}</a>
            </li>
          </ul>
        </div>

        <p style="font-size:15px;color:#444;text-align:center;line-height:1.6;">
          If you have any questions, feel free to reach out to us.<br/>
          <b>Company Email:</b> 
          <a href="mailto:${companyEmail}" style="color:#d946ef;text-decoration:none;">${companyEmail}</a>
        </p>

        <div style="text-align:center;margin-top:25px;color:#888;">
          <p>Thank you for booking with <b>${process.env.COMPANY_NAME}</b> 💖</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"${process.env.COMPANY_NAME}" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Booking Confirmed with ${vendorName}`,
      html: htmlContent,
      attachments: [
        {
          filename: "logo.png",
          path: path.join(process.cwd(), process.env.LOGO_PATH),
          cid: "logo",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Booking confirmation email sent to ${userEmail}`);
  } catch (error) {
    console.error("❌ Error sending booking email:", error.message);
  }
};
