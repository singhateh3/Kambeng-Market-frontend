// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { AdminDashboard } from './admin/AdminDashboard';

export const Dashboard = () => {
    const { user, isLoading } = useAuth();
    if (isLoading) return <Spinner />;
    if (user?.role === 'admin') return <AdminDashboard />;
    return <RegularDashboard />;
};

const Spinner = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-green-600 rounded-full animate-spin" />
    </div>
);

const RegularDashboard = () => {
    const { user, refreshUser } = useAuth();
    const location = useLocation();
    const [stats, setStats] = useState({
        total_products: 0, active_products: 0, total_orders: 0,
        pending_orders: 0, total_revenue: 0, orders_placed: 0,
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [recentOrders, setRecentOrders] = useState([]);
    const [recentProducts, setRecentProducts] = useState([]);

    useEffect(() => { fetchDashboardData(); }, [user, location.key]);

    const fmt = (amount) => {
        if (amount === undefined || amount === null) return 'GMD 0.00';
        const n = typeof amount === 'string' ? parseFloat(amount) : amount;
        return isNaN(n) ? 'GMD 0.00' : `GMD ${n.toFixed(2)}`;
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            if (user?.role === 'farmer') {
                const [statsRes, ordersRes, productsRes] = await Promise.all([
                    api.get('/farmer/profile/statistics').catch(() => ({ data: { data: {} } })),
                    api.get('/orders?limit=5').catch(() => ({ data: { data: [] } })),
                    api.get('/my-products?limit=5').catch(() => ({ data: { data: [] } })),
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
            } else if (user?.role === 'buyer') {
                const ordersRes = await api.get('/orders?limit=5').catch(() => ({ data: { data: [], meta: { total: 0 } } }));
                setStats({
                    total_products: 0, active_products: 0,
                    total_orders: ordersRes.data.meta?.total || 0,
                    pending_orders: ordersRes.data.data?.filter(o => o.status === 'pending').length || 0,
                    total_revenue: 0,
                    orders_placed: ordersRes.data.meta?.total || 0,
                });
                setRecentOrders(ordersRes.data.data || []);
                setRecentProducts([]);
            }
        } catch (e) {
            console.error(e);
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

    if (loading) return <Spinner />;

    const isFarmer = user?.role === 'farmer';
    const isBuyer = user?.role === 'buyer';

    const statusStyles = (status) => {
        const map = {
            delivered: 'bg-green-50 text-green-700',
            active:    'bg-green-50 text-green-700',
            pending:   'bg-yellow-50 text-yellow-700',
            confirmed: 'bg-blue-50 text-blue-700',
            shipped:   'bg-purple-50 text-purple-700',
            cancelled: 'bg-red-50 text-red-700',
        };
        return map[status] || 'bg-slate-100 text-slate-600';
    };

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-6 py-5 flex items-start justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                            Welcome back, {user?.name?.split(' ')[0]}!
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Signed in as{' '}
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200 capitalize">
                                {user?.role}
                            </span>
                        </p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-100 transition cursor-pointer"
                    >
                        <svg className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>

                {isFarmer && user?.farmer_profile?.id_verified === false && (
                    <div className="max-w-6xl mx-auto px-6 pb-5">
                        <div className="flex items-center justify-between flex-wrap gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
                            <span className="text-sm text-yellow-800">⚠️ Your account isn't verified yet. Submit your ID to start selling.</span>
                            <Link
                                to="/app/profile"
                                className="text-xs font-semibold text-yellow-800 bg-yellow-100 border border-yellow-300 px-3 py-1.5 rounded-lg no-underline hover:bg-yellow-200 transition"
                            >
                                Verify now
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            <div className="max-w-6xl mx-auto px-6 py-6">
                {/* Stat Cards */}
                {isFarmer && (
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        {[
                            { label: 'Total products', value: stats.total_products, icon: '🌾', to: '/app/products' },
                            { label: 'Active listings', value: stats.active_products, icon: '✅', to: '/app/products' },
                            { label: 'Total orders', value: stats.total_orders, icon: '📦', to: '/app/orders' },
                            { label: 'Revenue', value: fmt(stats.total_revenue), icon: '💰', to: null },
                        ].map((s, i) => <StatCard key={i} {...s} />)}
                    </div>
                )}

                {isBuyer && (
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {[
                            { label: 'Orders placed', value: stats.orders_placed, icon: '🛒', to: '/app/orders' },
                            { label: 'Pending orders', value: stats.pending_orders, icon: '⏳', to: '/app/orders' },
                            { label: 'Browse products', value: '→', icon: '🔍', to: '/app/browse' },
                        ].map((s, i) => <StatCard key={i} {...s} />)}
                    </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {isFarmer && <ActionCard icon="➕" title="Add product" desc="List a new product for sale" to="/app/products/create" />}
                    {isBuyer && <ActionCard icon="🔍" title="Browse products" desc="Discover fresh produce" to="/app/browse" />}
                    <ActionCard icon="📋" title="View orders" desc="Check your order history" to="/app/orders" />
                    <ActionCard icon="👤" title="Edit profile" desc="Update your information" to="/app/profile" />
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Recent Orders */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-bold text-slate-900">Recent orders</span>
                            <Link to="/app/orders" className="text-xs font-semibold text-green-600 no-underline hover:text-green-700">View all →</Link>
                        </div>
                        {recentOrders.length === 0 ? (
                            <div className="text-center py-10 text-slate-400 text-sm">No orders yet</div>
                        ) : recentOrders.map((order) => (
                            <div key={order.id} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">{order.product?.name || 'Product'}</p>
                                    <p className="text-xs text-slate-400">{order.quantity} × {order.product?.price_formatted || 'GMD 0'}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusStyles(order.status)}`}>
                                        {order.status_label || order.status}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        {order.order_date ? new Date(order.order_date).toLocaleDateString() : ''}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Recent Products / Saved Farmers */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5">
                        {isFarmer ? (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-bold text-slate-900">Recent products</span>
                                    <Link to="/app/products" className="text-xs font-semibold text-green-600 no-underline hover:text-green-700">View all →</Link>
                                </div>
                                {recentProducts.length === 0 ? (
                                    <div className="text-center py-10">
                                        <p className="text-slate-400 text-sm mb-3">No products listed yet</p>
                                        <Link to="/app/products/create" className="bg-green-600 text-white text-xs font-semibold px-4 py-2 rounded-lg no-underline hover:bg-green-700 transition">
                                            List your first product
                                        </Link>
                                    </div>
                                ) : recentProducts.map((product) => (
                                    <div key={product.id} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center text-lg flex-shrink-0">
                                                {product.photos?.length > 0
                                                    ? <img src={product.photos[0]} alt={product.name} className="w-full h-full object-cover" />
                                                    : '🌾'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{product.name}</p>
                                                <p className="text-xs text-slate-400">{product.price_formatted || `GMD ${product.price}`} · {product.quantity} {product.unit}</p>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusStyles(product.status)}`}>
                                            {product.status_label || product.status}
                                        </span>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-bold text-slate-900">Saved farmers</span>
                                    <Link to="/app/browse" className="text-xs font-semibold text-green-600 no-underline hover:text-green-700">Browse all →</Link>
                                </div>
                                <div className="text-center py-10">
                                    <p className="text-slate-400 text-sm mb-3">Save farmers for quick ordering</p>
                                    <Link to="/app/browse" className="bg-green-600 text-white text-xs font-semibold px-4 py-2 rounded-lg no-underline hover:bg-green-700 transition">
                                        Browse farmers
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon, to }) => {
    const content = (
        <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-2xl mb-3">{icon}</div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">{value}</div>
            <div className="text-xs text-slate-500">{label}</div>
        </div>
    );
    return to ? <Link to={to} className="no-underline">{content}</Link> : content;
};

const ActionCard = ({ icon, title, desc, to }) => (
    <Link
        to={to}
        className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex items-center gap-3.5 no-underline hover:border-green-400 hover:shadow-sm transition-all group"
    >
        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-xl flex-shrink-0">
            {icon}
        </div>
        <div>
            <p className="text-sm font-bold text-slate-900 group-hover:text-green-700 transition-colors">{title}</p>
            <p className="text-xs text-slate-500">{desc}</p>
        </div>
    </Link>
);
