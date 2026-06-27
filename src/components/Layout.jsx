// src/components/Layout.jsx
import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { NotificationBell } from './NotificationBell';

export const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isFarmer = user?.role === 'farmer';
    const isBuyer = user?.role === 'buyer';
    const isAdmin = user?.role === 'admin';
    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    const navLink = (to, label) => (
        <Link
            to={to}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive(to)
                    ? 'bg-green-50 text-green-700'
                    : 'text-slate-500 hover:text-green-700 hover:bg-green-50'
            }`}
        >
            {label}
        </Link>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navbar */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 flex items-center gap-6" style={{ height: 60 }}>
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 no-underline flex-shrink-0">
                        <span className="text-xl">🌾</span>
                        <span className="font-extrabold text-green-700 tracking-tight">Kambeng</span>
                        <span className="font-normal text-slate-400">Market</span>
                    </Link>

                    {/* Nav links */}
                    <div className="flex items-center gap-1">
                        {navLink('/app/dashboard', 'Dashboard')}
                        {isFarmer && navLink('/app/products', 'My Products')}
                        {isBuyer && navLink('/app/browse', 'Browse')}
                        {navLink('/app/orders', 'Orders')}
                        {isAdmin && navLink('/app/admin/dashboard', 'Admin')}
                    </div>

                    {/* Right side */}
                    <div className="ml-auto flex items-center gap-3">
                        <NotificationBell />

                        {/* Profile dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="flex items-center gap-2 bg-transparent border-none cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-50 transition"
                            >
                                <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <span className="text-sm font-medium text-slate-700">
                                    {user?.name?.split(' ')[0] || 'Account'}
                                </span>
                                <svg
                                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {menuOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-slate-100">
                                        <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                                        <p className="text-xs text-slate-400">{user?.email}</p>
                                    </div>

                                    {[
                                        { icon: '👤', label: 'My Profile', to: '/app/profile' },
                                        isFarmer && { icon: '🌾', label: 'My Products', to: '/app/products' },
                                        isBuyer && { icon: '🛒', label: 'My Orders', to: '/app/orders' },
                                        isAdmin && { icon: '📊', label: 'Admin Dashboard', to: '/app/admin/dashboard' },
                                    ].filter(Boolean).map((item, i) => (
                                        <Link
                                            key={i}
                                            to={item.to}
                                            onClick={() => setMenuOpen(false)}
                                            className="flex items-center gap-2.5 px-4 py-2.5 no-underline text-slate-700 text-sm font-medium hover:bg-green-50 hover:text-green-700 transition"
                                        >
                                            <span>{item.icon}</span>
                                            <span>{item.label}</span>
                                        </Link>
                                    ))}

                                    <div className="border-t border-slate-100">
                                        <button
                                            onClick={() => { setMenuOpen(false); handleLogout(); }}
                                            className="flex items-center gap-2.5 w-full px-4 py-2.5 bg-transparent border-none cursor-pointer text-red-600 text-sm font-medium text-left hover:bg-red-50 transition"
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
