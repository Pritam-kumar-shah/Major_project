import React from 'react';

const styles = {
    container: {
        maxWidth: '950px',
        margin: '80px auto 50px', // Top gap for fixed header/navbar
        padding: '40px',
        backgroundColor: '#ffffff',
        border: '1px solid #e3e3e3',
        borderRadius: '15px',
        fontFamily: 'Roboto, Arial, sans-serif',
        lineHeight: '1.7',
        color: '#333',
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
    },
    header: {
        textAlign: 'center',
        color: '#1a237e', // Darker Blue
        marginBottom: '50px',
        borderBottom: '4px solid #1a237e',
        paddingBottom: '15px',
        letterSpacing: '1px',
        fontSize: '2.2em',
        fontWeight: '700',
    },
    section: {
        marginBottom: '40px',
    },
    h2: {
        color: '#1a237e',
        fontSize: '1.6em',
        marginBottom: '15px',
        borderLeft: '5px solid #00c853', // Green highlight for policy points
        paddingLeft: '15px',
        fontWeight: '600',
    },
    highlightBox: {
        backgroundColor: '#e8f5e9', // Very light green for important notice
        border: '2px solid #00c853',
        padding: '25px',
        borderRadius: '12px',
        marginBottom: '35px',
    },
    bold: {
        fontWeight: 'bold',
        color: '#d32f2f', // Red emphasis
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

const PrivacyPolicy = () => {
    const city = "Bhopal";
    const grievanceEmail = "helps.mangalmilan2025@gmail.com";

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Privacy Policy – Mangalmilan.in</h1>
            <p style={{ textAlign: 'center', fontSize: '1.05em', color: '#444', marginBottom: '40px' }}>
                This Privacy Policy explains how Mangalmilan.in collects, uses, and protects user information. By using this site, you agree to this policy.
            </p>

            {/* --- IMPORTANT NOTICE --- */}
            <section style={styles.highlightBox}>
                <h2 style={{ ...styles.h2, color: '#d32f2f', borderLeftColor: '#d32f2f' }}>⚠️ Important Notice: Platform Nature & Data Scope</h2>
                <p>
                    <strong>Mangalmilan.in</strong> is an independent wedding services platform currently <strong style={styles.bold}>not registered as a company</strong>.
                    It operates solely as a connector between users and vendors. Crucially, the platform <strong style={styles.bold}>does not process payments or store sensitive financial/ID data</strong>.
                </p>
            </section>

            {/* --- 1. Information We Collect --- */}
            <section style={styles.section}>
                <h2 style={styles.h2}>1. Information We Collect (जानकारी जो हम जमा करते हैं)</h2>
                <ul style={styles.ul}>
                    <li style={styles.li}>
                        **Basic Contact Information:** Name, email address, and phone number when users submit inquiries or vendor listings.
                    </li>
                    <li style={styles.li}>
                        **Non-Personal Data:** Browser type, device information, IP address, and pages visited (collected for site performance and analytics purposes only).
                    </li>
                    <li style={styles.li}>
                        We <strong style={styles.bold}>DO NOT collect or store</strong> financial details, credit/debit card information, or government IDs (Aadhaar, PAN, etc.).
                    </li>
                </ul>
            </section>

            {/* --- 2. How We Use the Information --- */}
            <section style={styles.section}>
                <h2 style={styles.h2}>2. How We Use the Information (जानकारी का उपयोग)</h2>
                <ul style={styles.ul}>
                    <li style={styles.li}>To connect users with suitable vendors and respond to inquiries promptly.</li>
                    <li style={styles.li}>To analyze platform usage, troubleshoot issues, and optimize website performance.</li>
                    <li style={styles.li}>To prevent spam, fraud, or unauthorized access to maintain security.</li>
                </ul>
            </section>

            {/* --- 3. Data Sharing and Disclosure --- */}
            <section style={styles.section}>
                <h2 style={styles.h2}>3. Data Sharing and Disclosure (डेटा शेयरिंग)</h2>
                <ul style={styles.ul}>
                    <li style={styles.li}>
                        We <strong style={styles.bold}>do not sell, rent, or trade</strong> user information to any third parties for marketing purposes.
                    </li>
                    <li style={styles.li}>
                        Data (Name, Phone, Email) is shared **only with the specific vendors** listed on the platform when a user explicitly requests their service.
                    </li>
                    <li style={styles.li}>
                        We may disclose limited information if strictly required by law or binding order from government authorities.
                    </li>
                </ul>
            </section>

            {/* --- 4. Cookies and Analytics --- */}
            <section style={styles.section}>
                <h2 style={styles.h2}>4. Cookies and Analytics (कुकीज़ और विश्लेषण)</h2>
                <p>
                    Mangalmilan.in may use cookies (small data files) and third-party analytics tools (like Google Analytics) to understand aggregated user behavior. These tools collect **anonymous traffic data only** and do not identify individual users personally.
                </p>
            </section>

            {/* --- 5. Data Security --- */}
            <section style={styles.section}>
                <h2 style={styles.h2}>5. Data Security (डेटा सुरक्षा)</h2>
                <p>
                    We use reasonable technical and administrative safeguards to protect the limited data we collect. However, as we do not handle critical data, users are strongly advised to exercise caution and perform **due diligence** when sharing personal or financial details with vendors directly.
                </p>
            </section>

            {/* --- 6. Your Rights and Changes to Policy --- */}
            <section style={styles.section}>
                <h2 style={styles.h2}>6. Your Rights and Policy Changes (आपके अधिकार)</h2>
                <ul style={styles.ul}>
                    <li style={styles.li}>You can request to delete or correct your data anytime by emailing our Grievance Officer.</li>
                    <li style={styles.li}>You can opt out of any non-essential promotional communication.</li>
                    <li style={styles.li}>We reserve the right to update this policy. The new policy will be effective immediately upon posting.</li>
                </ul>
            </section>

            {/* --- 7. Legal Jurisdiction and Contact --- */}
            <section style={styles.section}>
                <h2 style={styles.h2}>7. Legal Jurisdiction and Contact Information</h2>
                <p>
                    This Privacy Policy is governed by the laws of India. Any dispute related to privacy shall fall under the exclusive jurisdiction of the courts in **{city}**, Madhya Pradesh.
                </p>
                <p style={{ marginTop: '15px', fontSize: '1.05em' }}>
                    For concerns, complaints, or clarification about this Privacy Policy, contact our Grievance Officer at: <br />
                    <strong style={{color: '#1a237e'}}>{grievanceEmail}</strong>
                </p>
            </section>

            <p style={styles.footer}>
                Last Updated: 15/11/2025 | © 2025 Mangalmilan.in | Privacy Policy | All Rights Reserved.
            </p>
        </div>
    );
};

export default PrivacyPolicy;