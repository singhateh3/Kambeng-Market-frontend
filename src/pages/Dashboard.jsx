// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { AdminDashboard } from './admin/AdminDashboard';

export const Dashboard = () => {
    const { user, isLoading } = useAuth();

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    // If user is admin, render admin dashboard
    if (user?.role === 'admin') {
        return <AdminDashboard />;
    }

    // For farmers and buyers, render the regular dashboard
    return <RegularDashboard />;
};

// Regular Dashboard Component (Farmers & Buyers)
const RegularDashboard = () => {
    const { user, refreshUser } = useAuth();
    const location = useLocation();
    const [stats, setStats] = useState({
        total_products: 0,
        active_products: 0,
        total_orders: 0,
        pending_orders: 0,
        total_revenue: 0,
        orders_placed: 0,
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [recentOrders, setRecentOrders] = useState([]);
    const [recentProducts, setRecentProducts] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, [user, location.key]);

    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return 'GMD 0.00';
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(numAmount)) return 'GMD 0.00';
        return `GMD ${numAmount.toFixed(2)}`;
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            if (user?.role === 'farmer') {
                try {
                    const [statsRes, ordersRes, productsRes] = await Promise.all([
                        api.get('/farmer/profile/statistics').catch(err => {
                            console.error('Stats API error:', err);
                            return { data: { data: {} } };
                        }),
                        api.get('/orders?limit=5').catch(err => {
                            console.error('Orders API error:', err);
                            return { data: { data: [], meta: { total: 0 } } };
                        }),
                        api.get('/my-products?limit=5').catch(err => {
                            console.error('Products API error:', err);
                            return { data: { data: [], meta: { total: 0 } } };
                        }),
                    ]);
                    
                    setStats({
                        total_products: statsRes.data.data?.total_products || 0,
                        active_products: statsRes.data.data?.active_products || 0,
                        total_orders: statsRes.data.data?.total_orders || 0,
                        pending_orders: statsRes.data.data?.pending_orders || 0,
                        total_revenue: statsRes.data.data?.total_revenue || 0,
                        orders_placed: 0,
                    });
                    
                    setRecentOrders(ordersRes.data.data || []);
                    setRecentProducts(productsRes.data.data || []);
                } catch (err) {
                    console.error('Error fetching farmer data:', err);
                }
            } 
            else if (user?.role === 'buyer') {
                try {
                    const [ordersRes] = await Promise.all([
                        api.get('/orders?limit=5').catch(err => {
                            console.error('Orders API error:', err);
                            return { data: { data: [], meta: { total: 0 } } };
                        }),
                    ]);
                    
                    setStats({
                        total_products: 0,
                        active_products: 0,
                        total_orders: ordersRes.data.meta?.total || 0,
                        pending_orders: ordersRes.data.data?.filter(o => o.status === 'pending').length || 0,
                        total_revenue: 0,
                        orders_placed: ordersRes.data.meta?.total || 0,
                    });
                    
                    setRecentOrders(ordersRes.data.data || []);
                    setRecentProducts([]);
                } catch (err) {
                    console.error('Error fetching buyer data:', err);
                }
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await refreshUser();
        await fetchDashboardData();
        setRefreshing(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Welcome Section */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Welcome back, {user?.name}!
                            </h1>
                            <p className="text-sm text-gray-500">
                                You are logged in as a <span className="font-medium capitalize text-green-600">{user?.role}</span>
                            </p>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="text-sm text-green-600 hover:text-green-700 flex items-center bg-green-50 px-4 py-2 rounded-lg"
                        >
                            <svg className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                    
                    {user?.role === 'farmer' && user?.farmer_profile?.id_verified === false && (
                        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                            <p className="text-sm text-yellow-800">
                                ⚠️ Your account is not yet verified. Please submit your verification documents to start selling.
                            </p>
                            <Link to="/profile">
                                <Button variant="outline" size="sm" className="mt-2">
                                    Verify Account
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Statistics Cards */}
                {user?.role === 'farmer' && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                        <StatCard
                            title="Total Products"
                            value={stats.total_products}
                            icon="🌾"
                            color="green"
                            link="/products"
                        />
                        <StatCard
                            title="Active Products"
                            value={stats.active_products}
                            icon="✅"
                            color="green"
                            link="/products"
                        />
                        <StatCard
                            title="Total Orders"
                            value={stats.total_orders}
                            icon="📦"
                            color="blue"
                            link="/orders"
                        />
                        <StatCard
                            title="Revenue"
                            value={formatCurrency(stats.total_revenue)}
                            icon="💰"
                            color="yellow"
                        />
                    </div>
                )}

                {user?.role === 'buyer' && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
                        <StatCard
                            title="Orders Placed"
                            value={stats.orders_placed}
                            icon="🛒"
                            color="green"
                            link="/orders"
                        />
                        <StatCard
                            title="Pending Orders"
                            value={stats.pending_orders}
                            icon="⏳"
                            color="yellow"
                            link="/orders"
                        />
                        <StatCard
                            title="Active Farmers"
                            value="0"
                            icon="👨‍🌾"
                            color="blue"
                            link="/browse"
                        />
                    </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
                    {user?.role === 'farmer' && (
                        <QuickActionCard
                            title="Add New Product"
                            description="List a new product for sale"
                            icon="➕"
                            link="/products/create"
                            color="green"
                        />
                    )}
                    {user?.role === 'buyer' && (
                        <QuickActionCard
                            title="Browse Products"
                            description="Discover fresh produce"
                            icon="🔍"
                            link="/browse"
                            color="green"
                        />
                    )}
                    <QuickActionCard
                        title="View Orders"
                        description="Check your orders"
                        icon="📋"
                        link="/orders"
                        color="blue"
                    />
                    <QuickActionCard
                        title="Edit Profile"
                        description="Update your information"
                        icon="👤"
                        link="/profile"
                        color="gray"
                    />
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Recent Orders */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-gray-900">Recent Orders</h3>
                            <Link to="/orders" className="text-sm text-green-600 hover:text-green-700 font-medium">
                                View All →
                            </Link>
                        </div>
                        {recentOrders.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No orders yet</p>
                        ) : (
                            <div className="space-y-3">
                                {recentOrders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between border-b border-gray-100 pb-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {order.product?.name || 'Product'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {order.quantity} × {order.product?.price_formatted || 'GMD 0'}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                                order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {order.status_label || order.status}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {order.order_date ? new Date(order.order_date).toLocaleDateString() : ''}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Products (Farmers only) */}
                    {user?.role === 'farmer' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-gray-900">Recent Products</h3>
                                <Link to="/products" className="text-sm text-green-600 hover:text-green-700 font-medium">
                                    View All →
                                </Link>
                            </div>
                            {recentProducts.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">No products listed yet</p>
                                    <Link to="/products/create">
                                        <Button variant="outline" size="sm" className="mt-2">
                                            List Your First Product
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentProducts.map((product) => (
                                        <div key={product.id} className="flex items-center justify-between border-b border-gray-100 pb-3">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    {product.photos && product.photos.length > 0 ? (
                                                        <img 
                                                            src={product.photos[0]} 
                                                            alt={product.name} 
                                                            className="w-10 h-10 object-cover rounded-lg"
                                                        />
                                                    ) : (
                                                        <span className="text-lg">🌾</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {product.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {product.price_formatted || `GMD ${product.price}`} · {product.quantity} {product.unit}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    product.status === 'active' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {product.status_label || product.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Favorite Farmers (Buyers only) */}
                    {user?.role === 'buyer' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-gray-900">Favorite Farmers</h3>
                                <Link to="/browse" className="text-sm text-green-600 hover:text-green-700 font-medium">
                                    Browse All →
                                </Link>
                            </div>
                            <div className="text-center py-8">
                                <p className="text-gray-500">Save your favorite farmers for quick ordering</p>
                                <Link to="/browse">
                                    <Button variant="outline" size="sm" className="mt-2">
                                        Browse Farmers
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Stat Card Component - Blinkit style
const StatCard = ({ title, value, icon, color, link }) => {
    const colors = {
        primary: 'bg-primary-50 text-primary-600',
        green: 'bg-green-50 text-green-600',
        blue: 'bg-blue-50 text-blue-600',
        yellow: 'bg-yellow-50 text-yellow-600',
        red: 'bg-red-50 text-red-600',
        purple: 'bg-purple-50 text-purple-600',
    };

    const content = (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all">
            <div className="flex items-center">
                <div className={`w-12 h-12 rounded-xl ${colors[color]} flex items-center justify-center text-2xl`}>
                    {icon}
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    );

    if (link) {
        return <Link to={link}>{content}</Link>;
    }

    return content;
};

// Quick Action Card Component - Blinkit style
const QuickActionCard = ({ title, description, icon, link, color }) => {
    const colors = {
        primary: 'border-primary-200 hover:border-primary-400 hover:bg-primary-50',
        blue: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50',
        gray: 'border-gray-200 hover:border-gray-400 hover:bg-gray-50',
        green: 'border-green-200 hover:border-green-400 hover:bg-green-50',
    };

    return (
        <Link to={link}>
            <div className={`bg-white border-2 rounded-xl p-5 transition-all hover:shadow-md ${colors[color]}`}>
                <div className="flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl mr-4">
                        {icon}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{title}</h3>
                        <p className="text-sm text-gray-500">{description}</p>
                    </div>
                </div>
            </div>
        </Link>
    );
};