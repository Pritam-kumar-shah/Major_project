import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaFacebookF, FaInstagram, FaLinkedinIn, FaEnvelope, FaPhone } from 'react-icons/fa';

export default function Footer() {
    const BRAND_NAME = "Mangalmilan";
    const BRAND_SLOGAN = "Where every love story finds its perfect setting.";

    return (
        <footer className="bg-gray-900 text-gray-300 border-t border-pink-600/50 pt-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-gray-700">

                    <div className="col-span-2 md:col-span-1">
                        <Link to="/" className="text-2xl font-bold tracking-wider text-pink-500 hover:text-pink-400 transition">
                            {BRAND_NAME}
                        </Link>
                        <p className="mt-2 text-sm text-gray-400">
                            {BRAND_SLOGAN}
                        </p>
                        
                        <div className="flex space-x-4 mt-4">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
                               className="text-gray-400 hover:text-pink-500 transition">
                                <FaFacebookF size={18} />
                            </a>
                            <a href="https://instagram.com/mangal_milan.in?igsh=MTd3ZXJ4M28xZWU0Ng==" target="_blank" rel="noopener noreferrer" 
                               className="text-gray-400 hover:text-pink-500 transition">
                                <FaInstagram size={18} />
                            </a>
                            <a href="https://www.linkedin.com/company/109558217/" target="_blank" rel="noopener noreferrer" 
                               className="text-gray-400 hover:text-pink-500 transition">
                                <FaLinkedinIn size={18} />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/vendors" className="hover:text-pink-500 transition">Find Vendors</Link></li>
                            <li><Link to="/pricing" className="hover:text-pink-500 transition">Pricing Plans</Link></li>
                            <li><Link to="/blog" className="hover:text-pink-500 transition">Blog & Ideas</Link></li>
                            <li><Link to="/contact" className="hover:text-pink-500 transition">Contact Us</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-white mb-3">For Vendors</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/vendor/signup" className="hover:text-pink-500 transition">Register Your Business</Link></li>
                            <li><Link to="/vendor/login" className="hover:text-pink-500 transition">Vendor Login</Link></li>
                            <li><Link to="/vendor/dashboard" className="hover:text-pink-500 transition">Dashboard</Link></li>
                            <li><Link to="/vendor/faq" className="hover:text-pink-500 transition">Vendor FAQ</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Get in Touch</h3>
                        <div className="space-y-2 text-sm">
                            <p className="flex items-center space-x-2">
                                <FaEnvelope className="text-pink-500" />
                                <a href="mailto:helps.mangalmilan2025@gmail.com" className="hover:text-pink-500 transition">helps.mangalmilan2025@gmail.com</a>
                            </p>
                            <p className="flex items-center space-x-2">
                                <FaPhone className="text-pink-500" />
                                <a href="tel:+916299518310" className="hover:text-pink-500 transition">+91 6299518310</a>
                            </p>
                        </div>
                        
                        <div className="mt-4 space-y-2">
                            <Link to="/terms" className="block text-xs hover:text-pink-500 transition">Terms of Service</Link>
                            <Link to="/privacy" className="block text-xs hover:text-pink-500 transition">Privacy Policy</Link>
                        </div>
                    </div>

                </div>

                <div className="pt-4 pb-6 text-center text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} {BRAND_NAME}. Made with <FaHeart className="inline text-red-500 mx-1" /> in India.
                </div>
            </div>
        </footer>
    );
}