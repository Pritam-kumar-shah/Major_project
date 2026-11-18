import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth";
import logo from "../assets/logo1.png";
import {
    FaUserCircle, FaSignOutAlt, FaCaretDown, FaBars, FaTimes,
    FaHeart, FaTachometerAlt, FaStore, FaUsers,
    FaClipboardList, FaCheck, FaCalendarAlt, FaCameraRetro, FaEnvelope
} from "react-icons/fa";

export default function Navbar() {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const dropdownRef = useRef(null);
    const mobileDrawerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
            if (mobileMenuOpen) {
                const insideDrawer = mobileDrawerRef.current && mobileDrawerRef.current.contains(e.target);
                if (!insideDrawer) setMobileMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [mobileMenuOpen]);

    const handleLogout = () => {
        logout();
        setDropdownOpen(false);
        setMobileMenuOpen(false);
        navigate("/");
    };

    const handleMobileMenuToggle = (e) => {
        setDropdownOpen(false);
        setMobileMenuOpen(!mobileMenuOpen);
        if (e) e.stopPropagation();
    };

    const activeLinkStyle = {
        color: "#D90368",
        fontWeight: "bold",
    };

    const getNavLinks = (role) => {
        if (role === "vendor") {
            return [
                { title: "Home", path: "/", desktop: true, mobile: true },
                { title: "Blog", path: "/blog", desktop: true, mobile: true },
                { title: "Dashboard", path: "/vendor/dashboard", icon: <FaTachometerAlt />, dropdown: true, mobile: true },
                { title: "Profile", path: "/vendor-profile", icon: <FaUserCircle />, dropdown: true, mobile: true },
                { title: "Portfolio", path: "/vendor/portfolio", icon: <FaCameraRetro />, dropdown: true, mobile: true },
                { title: "Bookings", path: "/vendor-bookings", icon: <FaClipboardList />, dropdown: true, mobile: true },
                { title: "Enquiries", path: "/vendor/Enquiry", icon: <FaUsers />, dropdown: true, mobile: true },
                { title: "Calendar", path: "/vendor/calendar", icon: <FaCalendarAlt />, dropdown: true, mobile: true },
            ];
        }
        if (role === "admin") {
            return [
                { title: "Home", path: "/", desktop: true, mobile: true },
                { title: "Blog", path: "/blog", desktop: true, mobile: true },
                { title: "Dashboard", path: "/admin/Dashboard", icon: <FaTachometerAlt />, dropdown: true, mobile: true },
                { title: "Categories", path: "/admin/categories", icon: <FaClipboardList />, dropdown: true, mobile: true },
                { title: "Vendor Approval", path: "/admin/pending-vendors", icon: <FaCheck />, dropdown: true, mobile: true },
                { title: "Enquiries", path: "/admin/enquiries", icon: <FaEnvelope />, dropdown: true, mobile: true },
            ];
        }
        return [
            { title: "Home", path: "/", desktop: true, mobile: true },
            { title: "Blog", path: "/blog", desktop: true, mobile: true },
            { title: "Dashboard", path: "/dashboard", icon: <FaTachometerAlt />, dropdown: true, mobile: true },
            { title: "My Favorites", path: "/my-favorites", icon: <FaHeart />, dropdown: true, mobile: true },
            { title: "My Bookings", path: "/my-bookings", icon: <FaClipboardList />, dropdown: true, mobile: true },
        ];
    };

    const navLinks = getNavLinks(user?.role);

    const getDashboardPath = () => {
        if (user?.role === "vendor") return "/vendor/dashboard";
        if (user?.role === "admin") return "/admin/Dashboard";
        return "/dashboard";
    };

    const MobileNavLink = ({ link }) => (
        <NavLink
            to={link.path}
            style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
            onClick={() => setMobileMenuOpen(false)}
            className="font-medium text-base text-gray-700 hover:text-pink-500 px-2 py-1 flex items-center gap-2"
        >
            <span className="text-lg text-pink-500">{link.icon || <FaTachometerAlt />}</span>
            {link.title}
        </NavLink>
    );

    return (
        <>
            <header className="w-full h-20 flex items-center justify-center px-4 sm:px-8 fixed top-0 z-50 bg-white/95 backdrop-blur-lg shadow-sm">
                <nav className="w-full max-w-7xl flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
                        <img src={logo} alt="Mangalmilan Logo" className="w-12 h-12" />
                        <h1 className="text-xl font-bold text-[#D90368] sm:text-2xl">Mangalmilan</h1>
                    </Link>

                    <div className="hidden md:flex gap-8 items-center">
                        {navLinks
                            .filter((l) => l.desktop && !l.dropdown)
                            .map((link) => (
                                <NavLink
                                    key={link.title}
                                    to={link.path}
                                    style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
                                    className="font-semibold text-gray-600 hover:text-pink-500"
                                >
                                    {link.title}
                                </NavLink>
                            ))}
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        {isAuthenticated ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200"
                                >
                                    <FaUserCircle className="text-2xl text-pink-500" />
                                    <span className="font-semibold text-gray-700 max-w-[100px] truncate">
                                        {user?.name || user?.email}
                                    </span>
                                    <FaCaretDown className={`${dropdownOpen ? "rotate-180" : ""}`} />
                                </button>

                                <div
                                    className={`absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 transition-all origin-top-right ${dropdownOpen
                                        ? "opacity-100 scale-100"
                                        : "opacity-0 scale-95 pointer-events-none"
                                        }`}
                                >
                                    <Link
                                        to={getDashboardPath()}
                                        onClick={() => setDropdownOpen(false)}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-pink-50"
                                    >
                                        <FaTachometerAlt className="text-pink-500" /> My Dashboard
                                    </Link>

                                    {navLinks
                                        .filter((l) => l.dropdown && l.title !== "Dashboard" && l.title !== "Home")
                                        .map((link) => (
                                            <Link
                                                key={link.title}
                                                to={link.path}
                                                onClick={() => setDropdownOpen(false)}
                                                className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-pink-50"
                                            >
                                                {link.icon} {link.title}
                                            </Link>
                                        ))}

                                    <div className="border-t my-1"></div>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50"
                                    >
                                        <FaSignOutAlt /> Logout
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="px-5 py-2 border border-pink-500 text-pink-500 rounded-lg hover:bg-pink-50"
                                >
                                    Login
                                </Link>

                                <Link
                                    to="/signup"
                                    className="px-5 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 shadow-md"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    <div className="md:hidden">
                        <button onClick={handleMobileMenuToggle} className="p-2">
                            {mobileMenuOpen ? (
                                <FaTimes className="text-3xl text-pink-500" />
                            ) : (
                                <FaBars className="text-3xl text-pink-500" />
                            )}
                        </button>
                    </div>
                </nav>
            </header>

            <div
                ref={mobileDrawerRef}
                className={`md:hidden fixed top-20 left-0 h-[calc(100vh-80px)] w-full max-w-xs bg-white shadow-xl z-40 transition-transform p-6 rounded-r-lg ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex flex-col gap-4">
                    {isAuthenticated && (
                        <div className="mb-2 pb-3 border-b border-gray-100">
                            <p className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <FaUserCircle className="text-pink-500" />
                                {user?.name || user?.email}
                            </p>

                            <p className="text-xs text-pink-600 font-medium ml-6">
                                {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)} Access
                            </p>
                        </div>
                    )}

                    {isAuthenticated &&
                        navLinks
                            .filter((l) => l.mobile)
                            .map((link) => <MobileNavLink key={link.title} link={link} />)}

                    {!isAuthenticated && (
                        <div className="border-t pt-4 mt-4 space-y-3">
                            <Link
                                to="/signup"
                                onClick={() => setMobileMenuOpen(false)}
                                className="w-full flex items-center gap-3 px-2 py-2 bg-pink-50 text-pink-600 rounded-lg"
                            >
                                <FaUserCircle className="text-xl" /> User Sign Up
                            </Link>

                            <Link
                                to="/vendor/signup"
                                onClick={() => setMobileMenuOpen(false)}
                                className="w-full flex items-center gap-3 px-2 py-2 bg-yellow-50 text-yellow-800 rounded-lg"
                            >
                                <FaStore className="text-xl" /> Become a Vendor
                            </Link>

                            <div className="border-t pt-3">
                                <Link
                                    to="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-full text-center block px-5 py-2 border-2 border-pink-500 text-pink-500 rounded-lg font-bold transition hover:bg-pink-50"
                                >
                                    Login
                                </Link>
                            </div>
                        </div>
                    )}

                    {isAuthenticated && (
                        <div className="border-t pt-4 mt-4 space-y-3">
                            <button
                                onClick={handleLogout}
                                className="w-full px-5 py-2 bg-red-50 text-red-600 rounded-lg font-semibold"
                            >
                                <FaSignOutAlt className="inline mr-2" /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {mobileMenuOpen && (
                <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={handleMobileMenuToggle} />
            )}
        </>
    );
}
