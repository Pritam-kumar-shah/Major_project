import React from 'react';

const styles = {
    container: {
        maxWidth: '950px',
        margin: '80px auto 50px', // Navbar gap
        padding: '40px',
        backgroundColor: '#ffffff',
        border: '1px solid #e3e3e3',
        borderRadius: '15px',
        fontFamily: 'Roboto, Arial, sans-serif',
        lineHeight: '1.75',
        color: '#333',
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
    },
    header: {
        textAlign: 'center',
        color: '#1a237e', // Dark Blue
        marginBottom: '40px',
        borderBottom: '4px solid #1a237e',
        paddingBottom: '15px',
        letterSpacing: '1px',
        fontSize: '2.2em',
        fontWeight: '700',
    },
    versionInfo: {
        textAlign: 'center',
        fontSize: '0.95em',
        color: '#555',
        marginBottom: '40px',
        fontWeight: '500',
    },
    section: {
        marginBottom: '40px',
        paddingLeft: '10px',
    },
    h2: {
        color: '#1a237e',
        fontSize: '1.6em',
        marginBottom: '15px',
        borderLeft: '5px solid #00c853', // Green highlight
        paddingLeft: '15px',
        fontWeight: '600',
    },
    highlightBox: {
        backgroundColor: '#e8f5e9', // Light green
        border: '2px solid #00c853',
        padding: '25px',
        borderRadius: '12px',
        marginBottom: '35px',
    },
    boldRed: {
        fontWeight: 'bold',
        color: '#d32f2f', // Red emphasis
    },
    boldBlue: {
        fontWeight: 'bold',
        color: '#1a237e',
    },
    ul: {
        marginLeft: '25px',
        listStyleType: 'disc',
    },
    li: {
        marginBottom: '12px',
    },
    footer: {
        fontSize: '0.85em',
        color: '#757575',
        textAlign: 'center',
        marginTop: '60px',
        paddingTop: '20px',
        borderTop: '1px solid #e0e0e0',
    },
};

const VendorPrivacyPolicy = () => {
    const city = "Bhopal";
    const grievanceEmail = "helps.mangalmilan2025@gmail.com";
    const effectiveDate = "November 14, 2025";
    const version = "1.0";

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Privacy Policy for Vendors – Mangalmilan.in</h1>

            <p style={styles.versionInfo}>
                **Effective Date:** {effectiveDate} | **Version:** {version}
            </p>
            <p style={{ textAlign: 'center', fontSize: '1.05em', color: '#444', marginBottom: '40px' }}>
                This policy outlines how Mangalmilan.in collects, uses, publishes, and protects the business and personal information provided by its Vendors.
            </p>

            <section style={styles.highlightBox}>
                <h2 style={{ ...styles.h2, color: '#d32f2f', borderLeftColor: '#d32f2f' }}>⚠️ Important Notice: Public Disclosure</h2>
                <p>
                    By creating a Vendor Profile, you agree that your <strong style={styles.boldRed}>Business Name, Profile Images, Service Descriptions, Pricing, and Contact Phone Number</strong> will be publicly visible to website users to facilitate business inquiries.
                </p>
            </section>

            <section style={styles.section}>
                <h2 style={styles.h2}>1. Information Collected from Vendors</h2>
                <ul style={styles.ul}>
                    <li style={styles.li}>
                        **Business Identification Data:** Business name, Category, Profile images, About section, Location (address, city, pincode).
                    </li>
                    <li style={styles.li}>
                        **Contact Information:** Primary contact phone number and email address (some may be public, others private for administration).
                    </li>
                    <li style={styles.li}>
                        **Service Details:** Pricing structure, specific service offerings, and capacity details (e.g., Venue seating capacity, Photographer deliverables).
                    </li>
                    <li style={styles.li}>
                        **Administrative Data:** IP address at the time of registration, TNC acceptance date/version, and profile approval status.
                    </li>
                    <li style={styles.li}>
                        We <strong style={styles.boldRed}>do not collect</strong> the Vendor's personal bank account numbers, passwords, or government IDs (unless explicitly required and noted for a specific purpose).
                    </li>
                </ul>
            </section>

            <section style={styles.section}>
                <h2 style={styles.h2}>2. How We Use Vendor Information</h2>
                <ul style={styles.ul}>
                    <li style={styles.li}>
                        **Service Publishing:** To create and display your public listing on the Mangalmilan.in website for users to browse.
                    </li>
                    <li style={styles.li}>
                        **Facilitating Contact:** To share your public contact information directly with users who express interest in your service.
                    </li>
                    <li style={styles.li}>
                        **Platform Improvement:** For internal analytics (e.g., determining which cities/categories are popular) and improving website features.
                    </li>
                    <li style={styles.li}>
                        **Communication:** To send you administrative updates, approval status, and, optionally, promotional materials.
                    </li>
                </ul>
            </section>

            <section style={styles.section}>
                <h2 style={styles.h2}>3. Data Sharing and Disclosure</h2>
                <ul style={styles.ul}>
                    <li style={styles.li}>
                        **Public Sharing:** Your **Business Name, Profile Image, Contact Phone Number, and all Service Details** are shared publicly on the platform for business purposes.
                    </li>
                    <li style={styles.li}>
                        **Administrative Disclosure:** Data may be shared with third-party service providers (e.g., Cloudinary for image hosting, analytics providers) strictly for website operation.
                    </li>
                    <li style={styles.li}>
                        **Legal Compliance:** We will disclose information if required by law, court order, or government request.
                    </li>
                </ul>
            </section>
            
            <section style={styles.section}>
                <h2 style={styles.h2}>4. Vendor's Responsibility for Customer Data</h2>
                <p>
                    When a customer contacts you, you receive their personal data (Name, Phone, Email). The Vendor is **solely responsible** for complying with all applicable privacy laws regarding the storage, use, and security of this customer data. Mangalmilan.in has no control over how Vendors use or protect customer information received via the platform.
                </p>
            </section>

            <section style={styles.section}>
                <h2 style={styles.h2}>5. Data Security and Vendor Rights</h2>
                <ul style={styles.ul}>
                    <li style={styles.li}>
                        **Data Security:** We employ standard technical measures to protect our database against unauthorized access.
                    </li>
                    <li style={styles.li}>
                        **Data Modification:** Vendors can update or correct their listed information anytime via their dashboard.
                    </li>
                    <li style={styles.li}>
                        **Profile Deletion:** You can request the permanent deletion of your profile and associated data by contacting the Grievance Officer.
                    </li>
                </ul>
            </section>

            <section style={styles.section}>
                <h2 style={styles.h2}>6. Legal Jurisdiction and Contact</h2>
                <p>
                    This policy is governed by the laws of India. Disputes shall fall under the **exclusive jurisdiction** of the courts in **{city}**, Madhya Pradesh.
                </p>
                <p style={{ marginTop: '15px', fontSize: '1.05em' }}>
                    For all privacy concerns, contact our Grievance Officer at: <br />
                    <strong style={styles.boldBlue}>{grievanceEmail}</strong>
                </p>
            </section>

            <p style={styles.footer}>
                © 2025 Mangalmilan.in | All Rights Reserved.
            </p>
        </div>
    );
};

export default VendorPrivacyPolicy;