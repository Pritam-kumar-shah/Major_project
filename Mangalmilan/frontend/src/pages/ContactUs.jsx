import React, { useState } from 'react';
import { FiSend, FiUser, FiMail, FiMessageSquare } from 'react-icons/fi';

const styles = {
    primaryPink: '#ec4899', 
    primaryBlue: '#1a237e', 
    
    pageWrapper: {
        display: 'flex',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: '#f0f2f5', 
        width: '100%',
    },
    contactContainer: {
        marginTop: '80px',   
        marginBottom: '50px',
        
        maxWidth: '450px',
        width: '100%',
        padding: '30px', 
        backgroundColor: '#ffffff',
        borderRadius: '16px', 
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)', 
        fontFamily: 'Roboto, sans-serif',
    },
    header: {
        textAlign: 'center',
        color: '#1a237e', 
        marginBottom: '10px',
        fontSize: '1.6em', 
        fontWeight: '700',
    },
    infoText: {
        textAlign: 'center',
        marginBottom: '20px',
        color: '#666',
        fontSize: '0.9em',
    },
    formGroup: {
        marginBottom: '15px',
    },
    inputStyle: {
        width: '100%',
        padding: '10px 15px', 
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxSizing: 'border-box',
        fontSize: '0.95em',
    },
    textareaStyle: {
        width: '100%',
        padding: '10px 15px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        resize: 'vertical',
        minHeight: '100px', 
        boxSizing: 'border-box',
        fontSize: '0.95em',
    },
    button: {
        backgroundColor: '#ec4899', 
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1em',
        width: '100%',
        fontWeight: '600',
        transition: 'background-color 0.3s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
    },
    successMessage: {
        padding: '20px',
        backgroundColor: '#f0f9ff', 
        color: '#1a237e', 
        border: '2px solid #1a237e',
        borderRadius: '10px',
        textAlign: 'center',
        fontSize: '1em',
        fontWeight: '500',
    },
};

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
   const API_URL = import.meta.env.VITE_API_URL;




    const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
        const res = await fetch(`${API_URL}/api/contact`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                fullName: formData.name,
                email: formData.email,
                subject: formData.subject,
                message: formData.message,
            }),
        });

        const data = await res.json();

        if (data.success) {
            setSubmitted(true);
            setTimeout(() => {
                setSubmitted(false);
                setFormData({ name: '', email: '', subject: '', message: '' });
            }, 5000);
        } else {
            alert("Failed to submit: " + data.message);
        }
    } catch (error) {
        console.error("Error submitting enquiry:", error);
        alert("Something went wrong. Please try again.");
    }
};


    if (submitted) {
        return (
            <div style={styles.pageWrapper}>
                <div style={{...styles.contactContainer, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <div style={styles.successMessage}>
                        🎉 Thank you! Your message has been sent to Mangalmilan. We will respond soon.
                    </div>
                </div>
            </div>
        );
    }

    const InputWithIcon = ({ Icon, ...props }) => (
        <div style={styles.formGroup}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Icon size={18} style={{ color: styles.primaryBlue, position: 'absolute', left: '15px' }} />
                <input 
                    {...props} 
                    style={{ ...styles.inputStyle, paddingLeft: '45px' }} 
                />
            </div>
        </div>
    );

    return (
        <div style={styles.pageWrapper}>
            <div style={styles.contactContainer}>
                <h1 style={styles.header}>Contact Mangalmilan Team</h1>
                <p style={styles.infoText}>
                    Directly share your feedback, queries, or business proposals with us.
                </p>

                <form onSubmit={handleSubmit}>
                    
                    <InputWithIcon 
                        Icon={FiUser}
                        type="text"
                        name="name"
                        placeholder="Your Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />

                    <InputWithIcon 
                        Icon={FiMail}
                        type="email"
                        name="email"
                        placeholder="Your Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    
                    <InputWithIcon 
                        Icon={FiMessageSquare}
                        type="text"
                        name="subject"
                        placeholder="Subject (e.g., Feedback, Query, Partnership)"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                    />

                    <div style={styles.formGroup}>
                        <textarea
                            name="message"
                            placeholder="Type your detailed message here..."
                            value={formData.message}
                            onChange={handleChange}
                            required
                            style={styles.textareaStyle}
                        />
                    </div>

                    <button type="submit" style={styles.button}>
                        <FiSend size={18} />
                        Send Message to Mangalmilan
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ContactUs;