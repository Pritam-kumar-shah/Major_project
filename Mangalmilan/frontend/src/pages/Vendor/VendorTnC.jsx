import React from 'react';

const styles = {
    container: {
        maxWidth: '950px',
        margin: '80px auto 50px', // Navbar gap maintained
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
        borderLeft: '5px solid #ffc107', // Gold/Yellow highlight
        paddingLeft: '15px',
        fontWeight: '600',
    },
    highlightBox: {
        backgroundColor: '#fffde7',
        border: '2px solid #ffc107',
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
        listStyleType: 'square',
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

const VendorTermsAndConditions = () => {
    const city = "Bhopal";
    const grievanceEmail = "helps.mangalmilan2025@gmail.com";
    const effectiveDate = "November 15, 2025";
    const version = "1.1";

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Terms & Conditions for Vendors – Mangalmilan.in</h1>

            <p style={styles.versionInfo}>
                **Effective Date:** {effectiveDate} | **Version:** {version}
            </p>

            <section style={styles.highlightBox}>
                <h2 style={{ ...styles.h2, color: '#d32f2f', borderLeftColor: '#d32f2f' }}>⚠️ Important Notice: Intermediary & Liability</h2>
                <p>
                    Mangalmilan.in acts **only as a facilitator** and is currently <strong style={styles.boldRed}>not a registered company</strong>. You acknowledge that our liability is strictly limited to that of an online intermediary platform.
                </p>
            </section>

            <section style={styles.section}>
                <h2 style={styles.h2}>1. Vendor Acceptance & Listing Rules</h2>
                <ul style={styles.ul}>
                    <li style={styles.li}>
                        **Mandatory Acceptance:** Profile creation requires explicit agreement to these Terms and the Privacy Policy, which will be digitally recorded.
                    </li>
                    <li style={styles.li}>
                        **Accuracy Guarantee:** You are <strong style={styles.boldBlue}>solely responsible</strong> for the accuracy and legality of all information, contact details, and pricing listed. False or misleading content is prohibited.
                    </li>
                    <li style={styles.li}>
                        **Content Ownership:** You guarantee that all uploaded content (photos, logos, videos) is either owned by you or you possess the necessary rights for its publication.
                    </li>
                </ul>
            </section>

            <section style={styles.section}>
                <h2 style={styles.h2}>2. Financial and Service Delivery</h2>
                <ul style={styles.ul}>
                    <li style={styles.li}>
                        **No Payment Handling:** Mangalmilan.in <strong style={styles.boldRed}>does not handle, process, or guarantee any payments</strong>. All financial transactions (advances, final payments) are direct between the Vendor and the Customer.
                    </li>
                    <li style={styles.li}>
                        **Refunds/Disputes:** Issues regarding cancellations, refunds, service quality, or non-payment must be resolved <strong style={styles.boldBlue}>directly by the Vendor</strong> according to their own business policy.
                    </li>
                    <li style={styles.li}>
                        **Service Quality:** You are responsible for ensuring the quality, timely delivery, and professional conduct of your staff (applicable to Venue, Photographer, Caterer, MUA, DJ).
                    </li>
                </ul>
            </section>

            <section style={styles.section}>
                <h2 style={styles.h2}>3. Limitation of Liability and Indemnification</h2>
                <ul style={styles.ul}>
                    <li style={styles.li}>
                        **Exclusion of Liability:** Mangalmilan.in and its owner are <strong style={styles.boldRed}>not liable</strong> for any loss, damage, injury, delay, or financial dispute arising from the use or non-performance of your services.
                    </li>
                    <li style={styles.li}>
                        **Indemnification:** You agree to compensate (indemnify) Mangalmilan.in against any legal claims, losses, or legal costs arising from your breach of these Terms or any customer dispute related to your service quality.
                    </li>
                </ul>
            </section>

            <section style={styles.section}>
                <h2 style={styles.h2}>4. Termination and Governing Law</h2>
                <ul style={styles.ul}>
                    <li style={styles.li}>
                        **Termination Right:** We reserve the right to <strong style={styles.boldRed}>terminate your listing without prior notice</strong> for TNC violation, fraud, or receiving repeated, severe customer complaints.
                    </li>
                    <li style={styles.li}>
                        **Governing Law:** These Terms are governed by the laws of India.
                    </li>
                    <li style={styles.li}>
                        **Jurisdiction:** Any legal dispute shall fall under the <strong style={styles.boldBlue}>exclusive jurisdiction</strong> of the courts located in **{city}**, Madhya Pradesh.
                    </li>
                </ul>
            </section>

            <section style={styles.section}>
                <h2 style={styles.h2}>5. Grievance Contact</h2>
                <p>
                    For concerns, complaints, or legal notices related to the platform: <br />
                    <strong style={styles.boldBlue}>{grievanceEmail}</strong>
                </p>
            </section>

            <p style={styles.footer}>
                © 2025 Mangalmilan.in | All Rights Reserved.
            </p>
        </div>
    );
};

export default VendorTermsAndConditions;