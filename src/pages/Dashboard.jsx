// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { AdminDashboard } from './admin/AdminDashboard';

const S = {
    page: { fontFamily: "'Inter', -apple-system, sans-serif", background: '#f8fafc', minHeight: '100vh' },
    topbar: { background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '20px 24px' },
    inner: { maxWidth: 1100, margin: '0 auto' },
    h1: { fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', marginBottom: 2 },
    sub: { fontSize: 13, color: '#64748b' },
    badge: (color) => ({
        display: 'inline-block', padding: '2px 10px', borderRadius: 20,
        fontSize: 12, fontWeight: 600,
        background: color === 'green' ? '#f0fdf4' : '#fefce8',
        color: color === 'green' ? '#16a34a' : '#ca8a04',
        border: `1px solid ${color === 'green' ? '#bbf7d0' : '#fef08a'}`,
    }),
    refreshBtn: {
        display: 'flex', alignItems: 'center', gap: 6,
        background: '#f0fdf4', color: '#16a34a', border: '1.5px solid #bbf7d0',
        padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer'
    },
    warn: {
        background: '#fffbeb', border: '1.5px solid #fde68a',
        borderRadius: 10, padding: '14px 16px', marginTop: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8
    },
    body: { maxWidth: 1100, margin: '0 auto', padding: '28px 24px' },
    grid4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
    grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 },
    grid2: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 },
    statCard: {
        background: '#fff', border: '1.5px solid #e2e8f0',
        borderRadius: 12, padding: '20px', cursor: 'pointer',
        transition: 'box-shadow 0.15s ease'
    },
    actionCard: {
        background: '#fff', border: '1.5px solid #e2e8f0',
        borderRadius: 12, padding: '18px 20px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 14,
        textDecoration: 'none', transition: 'border-color 0.15s, box-shadow 0.15s'
    },
    panel: {
        background: '#fff', border: '1.5px solid #e2e8f0',
        borderRadius: 12, padding: '20px'
    },
    panelHeader: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16
    },
    panelTitle: { fontSize: 15, fontWeight: 700, color: '#0f172a' },
    viewAll: { fontSize: 13, color: '#16a34a', textDecoration: 'none', fontWeight: 600 },
    row: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 0', borderBottom: '1px solid #f1f5f9'
    },
    statusBadge: (status) => {
        const map = {
            delivered: { bg: '#f0fdf4', color: '#16a34a' },
            pending: { bg: '#fffbeb', color: '#ca8a04' },
            confirmed: { bg: '#eff6ff', color: '#2563eb' },
            shipped: { bg: '#faf5ff', color: '#7c3aed' },
            cancelled: { bg: '#fef2f2', color: '#dc2626' },
            active: { bg: '#f0fdf4', color: '#16a34a' },
        };
        const c = map[status] || { bg: '#f8fafc', color: '#64748b' };
        return {
            background: c.bg, color: c.color,
            padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600
        };
    },
    empty: { textAlign: 'center', padding: '40px 24px', color: '#94a3b8', fontSize: 14 },
    spinner: {
        width: 40, height: 40, border: '3px solid #e2e8f0',
        borderTop: '3px solid #16a34a', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite', margin: '0 auto 12px'
    },
};

export const Dashboard = () => {
    const { user, isLoading } = useAuth();
    if (isLoading) return <Spinner />;
    if (user?.role === 'admin') return <AdminDashboard />;
    return <RegularDashboard />;
};

const Spinner = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={S.spinner} />
    </div>
);

const RegularDashboard = () => {
    const { user, refreshUser } = useAuth();
    const location = useLocation();
    const [stats, setStats] = useState({ total_products: 0, active_products: 0, total_orders: 0, pending_orders: 0, total_revenue: 0, orders_placed: 0 });
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

    return (
        <div style={S.page}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                * { box-sizing: border-box; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .stat-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
                .action-card:hover { border-color: #16a34a !important; box-shadow: 0 4px 16px rgba(22,163,74,0.08); }
            `}</style>

            {/* Header */}
            <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h1 style={S.h1}>Welcome back, {user?.name?.split(' ')[0]}!</h1>
                        <p style={S.sub}>
                            Signed in as{' '}
                            <span style={S.badge('green')}>{user?.role}</span>
                        </p>
                    </div>
                    <button onClick={handleRefresh} disabled={refreshing} style={S.refreshBtn}>
                        <svg style={{ width: 14, height: 14, ...(refreshing ? { animation: 'spin 0.8s linear infinite' } : {}) }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>

                {isFarmer && user?.farmer_profile?.id_verified === false && (
                    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 20px' }}>
                        <div style={S.warn}>
                            <span style={{ fontSize: 13, color: '#92400e' }}>⚠️ Your account isn't verified yet. Submit your ID to start selling.</span>
                            <Link to="/app/profile" style={{
                                background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d',
                                padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none'
                            }}>Verify now</Link>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px' }}>

                {/* Stat Cards */}
                {isFarmer && (
                    <div style={S.grid4}>
                        {[
                            { label: 'Total products', value: stats.total_products, icon: '🌾', to: '/app/products' },
                            { label: 'Active listings', value: stats.active_products, icon: '✅', to: '/app/products' },
                            { label: 'Total orders', value: stats.total_orders, icon: '📦', to: '/app/orders' },
                            { label: 'Revenue', value: fmt(stats.total_revenue), icon: '💰', to: null },
                        ].map((s, i) => <StatCard key={i} {...s} />)}
                    </div>
                )}

                {isBuyer && (
                    <div style={S.grid3}>
                        {[
                            { label: 'Orders placed', value: stats.orders_placed, icon: '🛒', to: '/app/orders' },
                            { label: 'Pending orders', value: stats.pending_orders, icon: '⏳', to: '/app/orders' },
                            { label: 'Browse products', value: '→', icon: '🔍', to: '/app/browse' },
                        ].map((s, i) => <StatCard key={i} {...s} />)}
                    </div>
                )}

                {/* Quick Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
                    {isFarmer && <ActionCard icon="➕" title="Add product" desc="List a new product for sale" to="/app/products/create" />}
                    {isBuyer && <ActionCard icon="🔍" title="Browse products" desc="Discover fresh produce" to="/app/browse" />}
                    <ActionCard icon="📋" title="View orders" desc="Check your order history" to="/app/orders" />
                    <ActionCard icon="👤" title="Edit profile" desc="Update your information" to="/app/profile" />
                </div>

                {/* Recent Activity */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {/* Recent Orders */}
                    <div style={S.panel}>
                        <div style={S.panelHeader}>
                            <span style={S.panelTitle}>Recent orders</span>
                            <Link to="/app/orders" style={S.viewAll}>View all →</Link>
                        </div>
                        {recentOrders.length === 0 ? (
                            <div style={S.empty}>No orders yet</div>
                        ) : recentOrders.map((order) => (
                            <div key={order.id} style={S.row}>
                                <div>
                                    <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>
                                        {order.product?.name || 'Product'}
                                    </p>
                                    <p style={{ fontSize: 12, color: '#94a3b8' }}>
                                        {order.quantity} × {order.product?.price_formatted || 'GMD 0'}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                                    <span style={S.statusBadge(order.status)}>{order.status_label || order.status}</span>
                                    <span style={{ fontSize: 11, color: '#94a3b8' }}>
                                        {order.order_date ? new Date(order.order_date).toLocaleDateString() : ''}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Recent Products / Favorite Farmers */}
                    <div style={S.panel}>
                        {isFarmer ? (
                            <>
                                <div style={S.panelHeader}>
                                    <span style={S.panelTitle}>Recent products</span>
                                    <Link to="/app/products" style={S.viewAll}>View all →</Link>
                                </div>
                                {recentProducts.length === 0 ? (
                                    <div style={S.empty}>
                                        <p style={{ marginBottom: 12 }}>No products listed yet</p>
                                        <Link to="/app/products/create" style={{
                                            background: '#16a34a', color: '#fff', textDecoration: 'none',
                                            padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600
                                        }}>List your first product</Link>
                                    </div>
                                ) : recentProducts.map((product) => (
                                    <div key={product.id} style={S.row}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', background: '#f1f5f9', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                                                {product.photos?.length > 0
                                                    ? <img src={product.photos[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    : '🌾'}
                                            </div>
                                            <div>
                                                <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>{product.name}</p>
                                                <p style={{ fontSize: 12, color: '#94a3b8' }}>{product.price_formatted || `GMD ${product.price}`} · {product.quantity} {product.unit}</p>
                                            </div>
                                        </div>
                                        <span style={S.statusBadge(product.status)}>{product.status_label || product.status}</span>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <>
                                <div style={S.panelHeader}>
                                    <span style={S.panelTitle}>Saved farmers</span>
                                    <Link to="/app/browse" style={S.viewAll}>Browse all →</Link>
                                </div>
                                <div style={S.empty}>
                                    <p style={{ marginBottom: 12 }}>Save farmers for quick ordering</p>
                                    <Link to="/app/browse" style={{
                                        background: '#16a34a', color: '#fff', textDecoration: 'none',
                                        padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600
                                    }}>Browse farmers</Link>
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
        <div className="stat-card" style={S.statCard}>
            <div style={{ fontSize: 24, marginBottom: 12 }}>{icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>{label}</div>
        </div>
    );
    return to ? <Link to={to} style={{ textDecoration: 'none' }}>{content}</Link> : content;
};

const ActionCard = ({ icon, title, desc, to }) => (
    <Link to={to} className="action-card" style={S.actionCard}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
            {icon}
        </div>
        <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>{title}</p>
            <p style={{ fontSize: 12, color: '#64748b' }}>{desc}</p>
        </div>
    </Link>
);
