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
                    value={`GMD ${stats?.orders?.total_revenue?.toFixed(2) || '0'}`}
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
                    <h3 className="font-semibold text-gray-900 mb-4">Top Categories</h3>
                    <div className="space-y-2">
                        {stats?.products?.top_categories?.map((category, index) => (
                            <CategoryBar
                                key={index}
                                name={category.category}
                                count={category.count}
                                index={index}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="mt-8">
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {stats?.recent_activity?.recent_orders?.map((order) => (
                            <div key={order.id} className="flex items-center justify-between border-b pb-2">
                                <div>
                                    <span className="font-medium">{order.buyer?.name}</span>
                                    <span className="text-gray-500 text-sm ml-2">
                                        ordered {order.product?.name}
                                    </span>
                                </div>
                                <span className={`text-sm px-2 py-1 rounded-full ${
                                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {order.status}
                                </span>
                            </div>
                        ))}
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

const StatusBar = ({ label, count, color }) => (
    <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">{label}</span>
        <div className="flex items-center">
            <span className="text-sm font-medium mr-2">{count}</span>
            <div className="w-20 h-2 bg-gray-200 rounded-full">
                <div className={`h-2 rounded-full ${color}`} style={{ width: `${Math.min(count * 10, 100)}%` }} />
            </div>
        </div>
    </div>
);

const CategoryBar = ({ name, count, index }) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500'];
    const maxCount = 10;

    return (
        <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{name}</span>
            <div className="flex items-center">
                <span className="text-sm font-medium mr-2">{count}</span>
                <div className="w-32 h-2 bg-gray-200 rounded-full">
                    <div
                        className={`h-2 rounded-full ${colors[index % colors.length]}`}
                        style={{ width: `${Math.min((count / maxCount) * 100, 100)}%` }}
                    />
                </div>
            </div>
        </div>
    );
};