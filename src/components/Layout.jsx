// src/components/Layout.jsx
import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { NotificationBell } from './NotificationBell';

export const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };

        if (menuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuOpen]);

    // Close dropdown on escape key
    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape' && menuOpen) {
                setMenuOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscapeKey);
        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [menuOpen]);

    // Close dropdown on navigation (route change)
    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = async () => {
        setMenuOpen(false);
        await logout();
        navigate('/login');
    };

    const isFarmer = user?.role === 'farmer';
    const isBuyer = user?.role === 'buyer';
    const isAdmin = user?.role === 'admin';
    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    // Blinkit/Hyperpure-style pill nav: filled solid green when active, quiet otherwise
    const navLink = (to, label) => (
        <Link
            to={to}
            className={`px-3.5 py-1.5 rounded-full text-[13px] font-bold tracking-tight transition-all duration-150 ${
                isActive(to)
                    ? 'bg-green-600 text-white shadow-sm shadow-green-600/30'
                    : 'text-slate-600 hover:text-green-700 hover:bg-green-50'
            }`}
        >
            {label}
        </Link>
    );

    // Profile dropdown menu items
    const menuItems = [
        { icon: '👤', label: 'My Profile', to: '/app/profile' },
        isFarmer && { icon: '🌾', label: 'My Products', to: '/app/products' },
        isBuyer  && { icon: '🛒', label: 'My Orders',   to: '/app/orders' },
    ].filter(Boolean);

    const roleColors = {
        farmer: 'bg-amber-50 text-amber-700 border-amber-200',
        buyer: 'bg-green-50 text-green-700 border-green-200',
        admin: 'bg-slate-900 text-white border-slate-900',
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navbar */}
            <nav className="bg-white sticky top-0 z-50 shadow-[0_1px_0_rgba(15,23,42,0.06)]">
                <div className="max-w-6xl mx-auto px-6 flex items-center gap-6" style={{ height: 64 }}>
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 no-underline flex-shrink-0 group">
                        <span className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center text-lg shadow-sm shadow-green-600/40 group-hover:scale-105 transition-transform">
                            🌾
                        </span>
                        <span className="font-black text-slate-900 tracking-tight text-[17px] leading-none">
                            Kambeng<span className="text-green-600">Market</span>
                        </span>
                    </Link>

                    {/* Nav links */}
                    <div className="flex items-center gap-1 bg-slate-50 rounded-full p-1">
                        {navLink('/app/dashboard', 'Dashboard')}
                        {isFarmer && navLink('/app/products', 'My Products')}
                        {isBuyer  && navLink('/app/browse', 'Browse')}
                        {navLink('/app/orders', 'Orders')}
                        {isAdmin  && navLink('/app/admin/users', 'Users')}
                        {isAdmin  && navLink('/app/admin/farmers/verification', 'Verify')}
                        {isAdmin  && navLink('/app/admin/products', 'Products')}
                    </div>

                    {/* Right side */}
                    <div className="ml-auto flex items-center gap-3">
                        <NotificationBell />

                        {/* Profile dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="flex items-center gap-2 bg-transparent border-none cursor-pointer pl-1 pr-2.5 py-1 rounded-full hover:bg-slate-50 transition"
                            >
                                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-black flex-shrink-0 ring-2 ring-green-100">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <span className="text-[13px] font-bold text-slate-800">
                                    {user?.name?.split(' ')[0] || 'Account'}
                                </span>
                                <svg
                                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {menuOpen && (
                                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl shadow-slate-900/10 z-50 overflow-hidden">
                                    <div className="px-4 py-3.5 bg-slate-50">
                                        <p className="text-[14px] font-black text-slate-900 leading-tight">{user?.name}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
                                        <span className={`inline-block mt-2 text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border capitalize ${roleColors[user?.role] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                            {user?.role}
                                        </span>
                                    </div>

                                    <div className="py-1">
                                        {menuItems.map((item, i) => (
                                            <Link
                                                key={i}
                                                to={item.to}
                                                onClick={() => setMenuOpen(false)}
                                                className="flex items-center gap-2.5 px-4 py-2.5 no-underline text-slate-700 text-[13px] font-bold hover:bg-green-50 hover:text-green-700 transition"
                                            >
                                                <span>{item.icon}</span>
                                                <span>{item.label}</span>
                                            </Link>
                                        ))}
                                    </div>

                                    <div className="p-1 border-t border-slate-100">
                                        <button
                                            onClick={() => { setMenuOpen(false); handleLogout(); }}
                                            className="flex items-center gap-2.5 w-full px-3 py-2.5 bg-transparent border-none cursor-pointer text-red-600 text-[13px] font-bold text-left rounded-xl hover:bg-red-50 transition"
                                        >
                                            <span>🚪</span>
                                            <span>Log out</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto">
                <Outlet />
            </main>
        </div>
    );
};
