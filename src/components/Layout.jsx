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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

    // Close dropdown/mobile menu on escape key
    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key !== 'Escape') return;
            if (menuOpen) setMenuOpen(false);
            if (mobileMenuOpen) setMobileMenuOpen(false);
        };

        document.addEventListener('keydown', handleEscapeKey);
        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [menuOpen, mobileMenuOpen]);

    // Close dropdown/mobile menu on navigation (route change)
    useEffect(() => {
        setMenuOpen(false);
        setMobileMenuOpen(false);
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

    // Same active-state color language as navLink(), laid out as a full-width
    // stacked row for the mobile menu panel instead of an inline pill.
    const mobileNavLink = (to, label) => (
        <Link
            to={to}
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-4 py-3 rounded-xl text-[14px] font-bold tracking-tight transition-all duration-150 ${
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
                    {/* Logo — wordmark hides below sm so the icon + hamburger/avatar/bell
                        cluster reliably fit one row at 320-375px; aria-label keeps the
                        link's accessible name when the text is visually hidden. */}
                    <Link to="/" aria-label="Kambeng Market home" className="flex items-center gap-2 no-underline flex-shrink-0 group">
                        <span className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center text-lg shadow-sm shadow-green-600/40 group-hover:scale-105 transition-transform">
                            🌾
                        </span>
                        <span className="hidden sm:inline font-black text-slate-900 tracking-tight text-[17px] leading-none">
                            Kambeng<span className="text-green-600">Market</span>
                        </span>
                    </Link>

                    {/* Nav links — desktop only; collapses to the hamburger panel below lg */}
                    <div className="hidden lg:flex items-center gap-1 bg-slate-50 rounded-full p-1">
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
                        {/* Hamburger — mobile/tablet only. Ordered first on mobile so the
                            bell (order-3) stays the rightmost element, which keeps its
                            viewport-width-based dropdown positioning correct; ordered
                            back to lg:order-1 on desktop where it's hidden anyway. */}
                        <button
                            type="button"
                            onClick={() => { setMobileMenuOpen((o) => !o); setMenuOpen(false); }}
                            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={mobileMenuOpen}
                            aria-controls="mobile-nav-panel"
                            className="order-1 lg:hidden lg:order-1 flex items-center justify-center w-9 h-9 rounded-full text-slate-600 hover:bg-slate-50 transition bg-transparent border-none cursor-pointer flex-shrink-0"
                        >
                            {mobileMenuOpen ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>

                        {/* Profile dropdown */}
                        <div className="relative order-2" ref={dropdownRef}>
                            <button
                                onClick={() => { setMenuOpen(!menuOpen); setMobileMenuOpen(false); }}
                                aria-label="Account menu"
                                aria-haspopup="true"
                                aria-expanded={menuOpen}
                                className="flex items-center gap-2 bg-transparent border-none cursor-pointer pl-1 pr-1 lg:pr-2.5 py-1 rounded-full hover:bg-slate-50 transition"
                            >
                                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-black flex-shrink-0 ring-2 ring-green-100">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                {/* Name + chevron hide below lg — the avatar alone is the
                                    "compact" mobile profile control; the button and dropdown
                                    panel below are otherwise unchanged. */}
                                <span className="hidden lg:inline text-[13px] font-bold text-slate-800">
                                    {user?.name?.split(' ')[0] || 'Account'}
                                </span>
                                <svg
                                    className={`hidden lg:block w-3.5 h-3.5 text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
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

                        <div className="order-3">
                            <NotificationBell />
                        </div>
                    </div>
                </div>

                {/* Mobile nav panel — stacked links, reuses navLink's active-state
                    styling via mobileNavLink(). Closes on item click, route change,
                    hamburger re-toggle, or Escape (see the effects above). */}
                {mobileMenuOpen && (
                    <div id="mobile-nav-panel" className="lg:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
                        {mobileNavLink('/app/dashboard', 'Dashboard')}
                        {isFarmer && mobileNavLink('/app/products', 'My Products')}
                        {isBuyer  && mobileNavLink('/app/browse', 'Browse')}
                        {mobileNavLink('/app/orders', 'Orders')}
                        {isAdmin  && mobileNavLink('/app/admin/users', 'Users')}
                        {isAdmin  && mobileNavLink('/app/admin/farmers/verification', 'Verify')}
                        {isAdmin  && mobileNavLink('/app/admin/products', 'Products')}
                    </div>
                )}
            </nav>

            <main className="max-w-6xl mx-auto">
                <Outlet />
            </main>
        </div>
    );
};
