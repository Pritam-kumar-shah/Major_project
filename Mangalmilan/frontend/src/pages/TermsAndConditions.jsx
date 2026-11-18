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
        borderLeft: '5px solid #ffb300', // Highlight bar
        paddingLeft: '15px',
        fontWeight: '600',
    },
    highlightBox: {
        backgroundColor: '#fffde7', // Light Yellow
        border: '2px solid #ffb300',
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

const TermsAndConditions = () => {
    const city = "Bhopal";
    const grievanceEmail = "helps.mangalmilan2025@gmail.com";

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Terms & Conditions – Mangalmilan.in</h1>

            <p style={{ textAlign: 'center', fontSize: '1.05em', color: '#444', marginBottom: '40px' }}>
                These Terms & Conditions govern your use of Mangalmilan.in. By accessing or using this website, you agree to comply with them in full.
            </p>

            {/* --- IMPORTANT NOTICE --- */}
            <section style={styles.highlightBox}>
                <h2 style={{ ...styles.h2, color: '#d32f2f', borderLeftColor: '#d32f2f' }}>⚠️ Important Notice: Platform Status & Intermediary Role</h2>
                <p>
                    <strong>Mangalmilan.in</strong> operates as an independent online platform to connect users with wedding service vendors.
                    It is currently <strong style={styles.bold}>not a registered company</strong> (such as Pvt. Ltd., LLP, or Partnership) and is managed by a sole proprietor.
                    By using this website, you acknowledge and accept that Mangalmilan.in’s role and liability are <strong style={styles.bold}>strictly limited to that of an online intermediary platform</strong>.
                </p>
            </section>

            {/* --- 1. Role and Responsibilities --- */}
            <section style={styles.section}>
                <h2 style={styles.h2}>1. Role and Responsibilities (ज़िम्मेदारियां)</h2>
                <ul style={styles.ul}>
                    <li style={styles.li}>
                        Mangalmilan.in serves solely as a <strong>facilitator</strong> connecting users and verified vendors.
                    </li>
                    <li style={styles.li}>
                        We are <strong style={styles.bold}>not a contracting party</strong> to any transaction between user and vendor.
                    </li>
                    <li style={styles.li}>
                        <strong style={styles.bold}>Vendor Verification Disclaimer:</strong> Although we try to verify listings, we do not guarantee the quality, service delivery, or business integrity of any vendor.
                    </li>
                    <li style={styles.li}>
                        All communications, negotiations, and service contracts are handled directly between the involved parties.
                    </li>
                </ul>
            </section>

            {/* --- 2. Payments and Financial Terms --- */}
            <section style={styles.section}>
                <h2 style={styles.h2}>2. Payments & Financial Terms (भुगतान और शर्तें)</h2>
                <ul style={styles.ul}>
                    <li style={styles.li}>
                        Mangalmilan.in <strong style={styles.bold}>does not collect or process payments</strong>. Users must pay vendors directly after verifying their services and terms.
                    </li>
                    <li style={styles.li}>
                        We are <strong style={styles.bold}>not responsible</strong> for non-delivery, refund disputes, pricing disagreements, or fraudulent activities occurring between users and vendors.
                    </li>
                    <li style={styles.li}>
                        Users must verify vendor legitimacy and detailed terms <strong style={styles.bold}>before transferring any amount</strong>.
                    </li>
                </ul>
            </section>

            {/* --- 3. User Conduct and Termination --- */}
            <section style={styles.section}>
                <h2 style={styles.h2}>3. User Conduct and Termination (उपयोगकर्ता आचरण और समाप्ति)</h2>
                <ul style={styles.ul}>
                    <li style={styles.li}>Users agree not to misuse, spam, or post defamatory content on the platform.</li>
                    <li style={styles.li}>Fake profiles, false listings, or misleading content will lead to immediate <strong style={styles.bold}>removal and permanent termination</strong> of the account/listing without notice.</li>
                    <li style={styles.li}>Mangalmilan.in reserves the right to suspend or terminate access to any user or vendor at its sole discretion for violating these T&C.</li>
                </ul>
            </section>

            {/* --- 4. Limitation of Liability and Indemnity --- */}
            <section style={styles.section}>
                <h2 style={styles.h2}>4. Limitation of Liability & Indemnity (ज़िम्मेदारी की सीमा)</h2>
                <ul style={styles.ul}>
                    <li style={styles.li}>
                        Mangalmilan.in and its owner (Pritam Kumar) are <strong style={styles.bold}>not liable</strong> for any direct, indirect, or consequential loss, damage, or dispute arising out of the use of vendor services.
                    </li>
                    <li style={styles.li}>
                        Our liability is limited to the maximum extent permitted under Indian law.
                    </li>
                    <li style={styles.li}>
                        Users agree to **indemnify** and hold harmless Mangalmilan.in against all claims, losses, damages, legal fees, or liabilities arising from their misuse or violation of these Terms.
                    </li>
                </ul>
            </section>

            {/* --- 5. Intellectual Property --- */}
            <section style={styles.section}>
                <h2 style={styles.h2}>5. Intellectual Property (बौद्धिक संपदा)</h2>
                <p>
                    All content, including text, graphics, design, logos, and layout on Mangalmilan.in, is the protected intellectual property of the platform owner. You may not copy, reproduce, or distribute them without explicit written consent.
                </p>
            </section>

            {/* --- 6. Changes to Terms and Conditions --- */}
            <section style={styles.section}>
                <h2 style={styles.h2}>6. Changes to Terms and Conditions (नियमों में बदलाव)</h2>
                <p>
                    Mangalmilan.in reserves the right to modify or replace these Terms at any time without prior notice. The updated Terms will be effective immediately upon posting on this page. By continuing to use the website after changes are posted, you accept the new terms.
                </p>
            </section>

            {/* --- 7. Governing Law & Dispute Resolution --- */}
            <section style={styles.section}>
                <h2 style={styles.h2}>7. Governing Law & Dispute Resolution (विवाद निवारण)</h2>
                <p>
                    These Terms are governed by the laws of India. Any disputes shall be resolved under the <strong style={styles.bold}>exclusive jurisdiction</strong> of the courts located in <strong>{city}</strong>, Madhya Pradesh.
                </p>
                <p style={{ marginTop: '15px', fontSize: '1.05em' }}>
                    For grievances, please contact our Grievance Officer at: <strong style={{color: '#1a237e'}}>{grievanceEmail}</strong>
                </p>
            </section>

            <p style={styles.footer}>
                Last Updated: 15/11/2025 | © 2025 Mangalmilan.in | All Rights Reserved.
            </p>
        </div>
    );
};

export default TermsAndConditions;