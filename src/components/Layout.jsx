// src/components/Layout.jsx (with dropdown state)
import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from './common/Button';

export const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isFarmer = user?.role === 'farmer';
    const isBuyer = user?.role === 'buyer';
    const isAdmin = user?.role === 'admin';
    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link to="/" className="text-xl font-bold text-primary-600">
                                🌾 Kambeng Market
                            </Link>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <Link
                                    to="/dashboard"
                                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                                        isActive('/dashboard')
                                            ? 'text-gray-900 border-b-2 border-primary-500'
                                            : 'text-gray-500 hover:text-gray-900'
                                    }`}
                                >
                                    Dashboard
                                </Link>
                                
                                {isFarmer && (
                                    <Link
                                        to="/products"
                                        className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                                            isActive('/products')
                                                ? 'text-gray-900 border-b-2 border-primary-500'
                                                : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                    >
                                        My Products
                                    </Link>
                                )}
                                
                                {isBuyer && (
                                    <Link
                                        to="/browse"
                                        className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                                            isActive('/browse')
                                                ? 'text-gray-900 border-b-2 border-primary-500'
                                                : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                    >
                                        Browse Produce
                                    </Link>
                                )}
                                
                                <Link
                                    to="/orders"
                                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                                        isActive('/orders')
                                            ? 'text-gray-900 border-b-2 border-primary-500'
                                            : 'text-gray-500 hover:text-gray-900'
                                    }`}
                                >
                                    Orders
                                </Link>
                                
                                {isAdmin && (
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                                            className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                                                isActive('/admin')
                                                    ? 'text-gray-900 border-b-2 border-primary-500'
                                                    : 'text-gray-500 hover:text-gray-900'
                                            }`}
                                        >
                                            Admin
                                            <svg className={`ml-1 h-4 w-4 transition-transform ${isAdminMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        {isAdminMenuOpen && (
                                            <div className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                                                <Link
                                                    to="/admin/dashboard"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                                                    onClick={() => setIsAdminMenuOpen(false)}
                                                >
                                                    📊 Dashboard
                                                </Link>
                                                <Link
                                                    to="/admin/users"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                                                    onClick={() => setIsAdminMenuOpen(false)}
                                                >
                                                    👥 Users
                                                </Link>
                                                <Link
                                                    to="/admin/farmers/verification"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                                                    onClick={() => setIsAdminMenuOpen(false)}
                                                >
                                                    ✅ Verify Farmers
                                                </Link>
                                                <div className="border-t border-gray-200 my-1"></div>
                                                <Link
                                                    to="/admin/products"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                                                    onClick={() => setIsAdminMenuOpen(false)}
                                                >
                                                    📦 Products
                                                </Link>
                                                <Link
                                                    to="/admin/orders"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                                                    onClick={() => setIsAdminMenuOpen(false)}
                                                >
                                                    🛒 Orders
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/profile"
                                className="text-sm text-gray-700 hover:text-gray-900 flex items-center"
                            >
                                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium mr-2">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <span className="hidden sm:inline">{user?.display_name || user?.name}</span>
                            </Link>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleLogout}
                            >
                                Logout
                            </Button>
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