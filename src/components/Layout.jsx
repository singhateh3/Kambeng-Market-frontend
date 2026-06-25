// src/components/Layout.jsx
import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { NotificationBell } from './NotificationBell';

export const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isFarmer = user?.role === 'farmer';
    const isBuyer = user?.role === 'buyer';
    const isAdmin = user?.role === 'admin';
    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Bar - Blinkit style */}
            <div className="bg-green-600 text-white text-sm">
                <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <span className="hidden sm:inline">🌾 Fresh from Gambian farms</span>
                        <span className="hidden md:inline">•</span>
                        <span className="hidden md:inline">🚚 Free delivery on orders over GMD 500</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        {!user ? (
                            <>
                                <Link to="/login" className="hover:text-green-200 transition">Sign In</Link>
                                <Link to="/register" className="bg-white/20 px-4 py-1 rounded-full hover:bg-white/30 transition">Sign Up</Link>
                            </>
                        ) : (
                            <span className="text-sm">Welcome, {user?.name?.split(' ')[0]}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Navigation - Blinkit style */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link to="/" className="flex items-center space-x-2">
                                <span className="text-2xl">🌾</span>
                                <span className="text-xl font-bold text-green-600">Kambeng Market</span>
                            </Link>
                            <div className="hidden md:ml-8 md:flex md:space-x-1">
                                <Link
                                    to="/"
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                                        location.pathname === '/'
                                            ? 'bg-green-50 text-green-700'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    Home
                                </Link>
                                
                                <Link
                                    to="/app/dashboard"
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                                        isActive('/app/dashboard')
                                            ? 'bg-green-50 text-green-700'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    Dashboard
                                </Link>
                                
                                {isFarmer && (
                                    <Link
                                        to="/app/products"
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                                            isActive('/app/products')
                                                ? 'bg-green-50 text-green-700'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    >
                                        My Products
                                    </Link>
                                )}
                                
                                {isBuyer && (
                                    <Link
                                        to="/app/browse"
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                                            isActive('/app/browse')
                                                ? 'bg-green-50 text-green-700'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    >
                                        Browse
                                    </Link>
                                )}
                                
                                {/* <Link
                                    to="/app/orders"
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                                        isActive('/app/orders')
                                            ? 'bg-green-50 text-green-700'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    Orders
                                </Link> */}

                                {/* {isAdmin && (
                                    <div className="relative group">
                                        <button className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition">
                                            Admin
                                            <svg className="inline-block ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        <div className="absolute left-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 hidden group-hover:block">
                                            <Link
                                                to="/app/admin/users"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition"
                                            >
                                                👥 Users
                                            </Link>
                                            <Link
                                                to="/app/admin/farmers/verification"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition"
                                            >
                                                ✅ Verify
                                            </Link>
                                            <Link
                                                to="/app/admin/products"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition"
                                            >
                                                📦 Products
                                            </Link>
                                        </div>
                                    </div>
                                )} */}
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            {/* Notification Bell */}
                            <NotificationBell />
                            
                            {/* Profile */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                    className="flex items-center space-x-2 focus:outline-none group"
                                >
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-medium text-sm group-hover:bg-green-200 transition">
                                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <span className="hidden sm:inline text-sm text-gray-700 group-hover:text-gray-900">
                                        {user?.display_name?.split(' ')[0] || user?.name?.split(' ')[0] || 'User'}
                                    </span>
                                    <svg className={`h-4 w-4 text-gray-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                
                                {isProfileMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                            <p className="text-xs text-gray-500">{user?.email}</p>
                                        </div>
                                        <Link
                                            to="/app/profile"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition"
                                            onClick={() => setIsProfileMenuOpen(false)}
                                        >
                                            👤 My Profile
                                        </Link>
                                        {user?.role === 'farmer' && (
                                            <Link
                                                to="/app/products"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition"
                                                onClick={() => setIsProfileMenuOpen(false)}
                                            >
                                                🌾 My Products
                                            </Link>
                                        )}
                                        {user?.role === 'buyer' && (
                                            <Link
                                                to="/app/orders"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition"
                                                onClick={() => setIsProfileMenuOpen(false)}
                                            >
                                                🛒 My Orders
                                            </Link>
                                        )}
                                        {user?.role === 'admin' && (
                                            <>
                                                <div className="border-t border-gray-100 my-1"></div>
                                                <Link
                                                    to="/app/admin/dashboard"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition"
                                                    onClick={() => setIsProfileMenuOpen(false)}
                                                >
                                                    📊 Admin Dashboard
                                                </Link>
                                            </>
                                        )}
                                        <div className="border-t border-gray-100 my-1"></div>
                                        <button
                                            onClick={() => {
                                                setIsProfileMenuOpen(false);
                                                handleLogout();
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                                        >
                                            🚪 Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <Outlet />
            </main>
        </div>
    );
};