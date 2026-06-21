// src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

export const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/dashboard/statistics');
            setStats(response.data.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // Helper function to format currency
    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return 'GMD 0.00';
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(numAmount)) return 'GMD 0.00';
        return `GMD ${numAmount.toFixed(2)}`;
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.name}!</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Users"
                    value={stats?.users?.total || 0}
                    icon="👥"
                    color="blue"
                />
                <StatCard
                    title="Active Products"
                    value={stats?.products?.active || 0}
                    icon="📦"
                    color="green"
                />
                <StatCard
                    title="Orders"
                    value={stats?.orders?.total || 0}
                    icon="🛒"
                    color="purple"
                />
                <StatCard
                    title="Revenue"
                    value={formatCurrency(stats?.orders?.total_revenue)}
                    icon="💰"
                    color="yellow"
                />
            </div>

            {/* Quick Stats */}
            <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Order Status</h3>
                    <div className="space-y-2">
                        <StatusBar label="Pending" count={stats?.orders?.pending || 0} color="bg-yellow-500" />
                        <StatusBar label="Confirmed" count={stats?.orders?.confirmed || 0} color="bg-blue-500" />
                        <StatusBar label="Shipped" count={stats?.orders?.shipped || 0} color="bg-purple-500" />
                        <StatusBar label="Delivered" count={stats?.orders?.delivered || 0} color="bg-green-500" />
                        <StatusBar label="Cancelled" count={stats?.orders?.cancelled || 0} color="bg-red-500" />
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">User Stats</h3>
                    <div className="space-y-2">
                        <StatusBar label="Total Users" count={stats?.users?.total || 0} color="bg-blue-500" />
                        <StatusBar label="Farmers" count={stats?.users?.farmers || 0} color="bg-green-500" />
                        <StatusBar label="Buyers" count={stats?.users?.buyers || 0} color="bg-purple-500" />
                        <StatusBar label="Admins" count={stats?.users?.admins || 0} color="bg-red-500" />
                        <StatusBar 
                            label="Verified Farmers" 
                            count={stats?.users?.verified_farmers || 0} 
                            color="bg-teal-500" 
                        />
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <a href="/admin/farmers/verification" className="block text-primary-600 hover:text-primary-700">
                            → Verify Pending Farmers
                        </a>
                        <a href="/admin/users" className="block text-primary-600 hover:text-primary-700">
                            → Manage Users
                        </a>
                        <a href="/admin/products" className="block text-primary-600 hover:text-primary-700">
                            → Manage Products
                        </a>
                        <a href="/admin/orders" className="block text-primary-600 hover:text-primary-700">
                            → Manage Orders
                        </a>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
                    <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                        {stats?.recent_activity?.recent_orders?.slice(0, 5).map((order) => (
                            <div key={order.id} className="flex items-center justify-between border-b pb-2">
                                <div>
                                    <span className="font-medium">{order.buyer?.name || 'Unknown'}</span>
                                    <span className="text-gray-500 text-sm ml-2">
                                        ordered {order.product?.name || 'Unknown product'}
                                    </span>
                                </div>
                                <span className={`text-sm px-2 py-1 rounded-full ${
                                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                    order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {order.status || 'Unknown'}
                                </span>
                            </div>
                        ))}
                        {(!stats?.recent_activity?.recent_orders || stats?.recent_activity?.recent_orders?.length === 0) && (
                            <p className="text-gray-500 text-center py-4">No recent orders</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, color }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        yellow: 'bg-yellow-50 text-yellow-600',
        red: 'bg-red-50 text-red-600',
        teal: 'bg-teal-50 text-teal-600',
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
                <div className={`w-12 h-12 rounded-lg ${colors[color]} flex items-center justify-center text-2xl`}>
                    {icon}
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-semibold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    );
};

const StatusBar = ({ label, count, color }) => {
    const maxCount = 100; // Adjust based on your data
    
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{label}</span>
            <div className="flex items-center">
                <span className="text-sm font-medium mr-2">{count}</span>
                <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div 
                        className={`h-2 rounded-full ${color}`} 
                        style={{ width: `${Math.min((count / maxCount) * 100, 100)}%` }} 
                    />
                </div>
            </div>
        </div>
    );
};