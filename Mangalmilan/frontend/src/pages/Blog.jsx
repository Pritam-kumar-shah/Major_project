import React from 'react';
import SEO from '../components/SEO';
import { FaHeart, FaStar, FaShieldAlt, FaCalendarAlt, FaUserCircle, FaArrowRight } from 'react-icons/fa';

export default function Blog() {
    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-16 font-sans">
            <SEO
                title="Blog"
                description="Updates, news, and wedding planning tips from MangalMilan."
            />

            <div className="max-w-5xl mx-auto px-4 sm:px-6">

                {/* Header */}
                <div className="text-center mb-16">
                    <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-3 inline-block">Official Updates</span>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                        The <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-600">MangalMilan</span> Blog
                    </h1>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                        Your trusted source for platform news, features, and wedding insights.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Article 1: Welcome */}
                    <article className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full group">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                                <FaUserCircle size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">MangalMilan Team</p>
                                <p className="text-xs text-gray-500 flex items-center gap-1"><FaCalendarAlt size={10} /> Jan 2026</p>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-pink-600 transition-colors">
                            Welcome to Your New Wedding Companion! 🌸
                        </h2>

                        <p className="text-gray-600 leading-relaxed mb-6 flex-1">
                            We are thrilled to introduce <strong>MangalMilan</strong>, the smartest way to find wedding vendors in Bhopal.
                            Our mission is simple: <strong>Verified Vendors, Transparent Pricing, and Zero Hassle.</strong>
                            Whether you need a grand venue or a creative photographer, we've got you covered.
                        </p>

                        <div className="mt-auto pt-6 border-t border-gray-50 flex items-center text-pink-600 font-bold text-sm cursor-pointer hover:gap-2 gap-1 transition-all">
                            Read Announcement <FaArrowRight size={12} />
                        </div>
                    </article>

                    {/* Article 2: Why Choose Us */}
                    <article className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full group">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <FaShieldAlt size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">Safety & Trust</p>
                                <p className="text-xs text-gray-500 flex items-center gap-1"><FaCalendarAlt size={10} /> Jan 2026</p>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors">
                            Why 1000+ Couples Trust MangalMilan?
                        </h2>

                        <div className="text-gray-600 leading-relaxed mb-6 flex-1 space-y-3">
                            <div className="flex items-start gap-3">
                                <span className="bg-yellow-50 p-1.5 rounded-lg text-yellow-500 mt-0.5"><FaStar size={14} /></span>
                                <div>
                                    <strong className="text-gray-900 block">100% Verified Profiles</strong>
                                    <span className="text-sm">We personally visit & verify every vendor.</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="bg-pink-50 p-1.5 rounded-lg text-pink-500 mt-0.5"><FaHeart size={14} /></span>
                                <div>
                                    <strong className="text-gray-900 block">No Hidden Costs</strong>
                                    <span className="text-sm">Direct connection with vendors at best rates.</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-gray-50 flex items-center text-green-600 font-bold text-sm cursor-pointer hover:gap-2 gap-1 transition-all">
                            Learn More <FaArrowRight size={12} />
                        </div>
                    </article>

                </div>

                {/* Coming Soon Section */}
                <div className="mt-16 text-center">
                    <div className="inline-flex items-center justify-center p-1 rounded-full bg-gray-100 mb-6">
                        <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-gray-600 shadow-sm border border-gray-200">Coming Soon</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">More Exciting Features on the Way</h3>
                    <p className="text-gray-500 max-w-md mx-auto">We are working on bringing you Wedding Inspiration Galleries, Budget Calculators, and Guest Management tools.</p>
                </div>

            </div>
        </div>
    );
}
