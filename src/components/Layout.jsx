// src/components/Layout.jsx
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from './common/Button';

export const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isFarmer = user?.role === 'farmer';
    const isBuyer = user?.role === 'buyer';

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link to="/dashboard" className="text-xl font-bold text-primary-600">
                                🌾 Kambeng Market
                            </Link>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <Link
                                    to="/dashboard"
                                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                                >
                                    Dashboard
                                </Link>
                                {isFarmer && (
                                    <Link
                                        to="/products"
                                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                                    >
                                        My Products
                                    </Link>
                                )}
                                {isBuyer && (
                                    <Link
                                        to="/browse"
                                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                                    >
                                        Browse Produce
                                    </Link>
                                )}
                                <Link
                                    to="/orders"
                                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                                >
                                    Orders
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/profile"
                                className="text-sm text-gray-700 hover:text-gray-900"
                            >
                                {user?.display_name || user?.name}
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