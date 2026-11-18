import React, { useState } from "react";
import { 
    FaShareAlt, FaTimes, FaCopy,
    FaWhatsapp, FaFacebookF, FaTwitter, FaLinkedinIn 
} from "react-icons/fa";
import { toast } from "react-toastify";

const ShareModal = ({ url, onClose }) => {
    const encodedUrl = encodeURIComponent(url);

    const options = [
        { name: "WhatsApp", icon: <FaWhatsapp />, link: `https://wa.me/?text=${encodedUrl}` },
        { name: "Facebook", icon: <FaFacebookF />, link: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { name: "Twitter (X)", icon: <FaTwitter />, link: `https://twitter.com/intent/tweet?url=${encodedUrl}` },
        { name: "LinkedIn", icon: <FaLinkedinIn />, link: `https://www.linkedin.com/shareArticle?url=${encodedUrl}` },
    ];

    const copyLink = () => {
        navigator.clipboard.writeText(url);
        toast.success("Link Copied!");
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-white/70 p-4" onClick={onClose}>
            
            <div 
                className="bg-white rounded-xl p-5 w-11/12 max-w-sm shadow-xl border"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-semibold">Share Vendor Profile</h2>
                    <FaTimes onClick={onClose} className="cursor-pointer text-gray-600" />
                </div>

                {/* Share Options */}
                <div className="grid grid-cols-4 gap-4 mb-4">
                    {options.map((o) => (
                        <a
                            key={o.name}
                            href={o.link}
                            target="_blank"
                            rel="noreferrer"
                            className="flex flex-col items-center text-gray-800 hover:text-black"
                            onClick={onClose}
                        >
                            <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full shadow-sm">
                                {o.icon}
                            </div>
                            <p className="text-xs mt-1 font-medium">{o.name}</p>
                        </a>
                    ))}
                </div>

                {/* Copy Button */}
                <button 
                    onClick={copyLink}
                    className="w-full px-4 py-2 bg-black text-white rounded-lg flex items-center justify-center gap-2"
                >
                    <FaCopy /> Copy Link
                </button>
            </div>
        </div>
    );
};

const ShareButton = ({ url = window.location.href }) => {
    const [open, setOpen] = useState(false);

    const handleClick = async () => {
        if (navigator.share) {
            try { 
                await navigator.share({ url });
                return; 
            } catch {}
        }
        setOpen(true);
    };

    return (
        <>
            <button 
                onClick={handleClick}
                className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded-lg"
            >
                <FaShareAlt /> Share
            </button>

            {open && <ShareModal url={url} onClose={() => setOpen(false)} />}
        </>
    );
};

export default ShareButton;
