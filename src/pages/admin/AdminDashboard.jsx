// src/pages/admin/AdminDashboard.jsx
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminDashboardSkeleton } from '../../components/common/skeletons/AdminDashboardSkeleton';
import { useAuth } from '../../hooks/useAuth';
import { useCachedFetch } from '../../hooks/useCachedFetch';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pendingVerifications, setPendingVerifications] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    // Use cached fetch for stats - cache for 2 minutes
    const { 
        data: cachedStats, 
        isCached,
        refresh: refreshStats,
        invalidateCache: invalidateStatsCache
    } = useCachedFetch('/admin/dashboard/statistics', {
        ttl: 2 * 60 * 1000, // 2 minutes
        onSuccess: (data) => {
            console.log('📊 Stats data received:', data);
            // Handle different response formats
            if (data) {
                let statsData = null;
                
                // Extract stats data from response
                if (data.data) {
                    statsData = data.data;
                } else if (data.users || data.orders || data.products) {
                    statsData = data;
                } else if (data.success && data.data) {
                    statsData = data.data;
                }
                
                if (statsData) {
                    setStats(statsData);
                    
                    // Try to get pending verifications from stats
                    if (statsData.pending_verifications !== undefined) {
                        setPendingVerifications(statsData.pending_verifications);
                    } else if (statsData.farmer_verifications?.pending !== undefined) {
                        setPendingVerifications(statsData.farmer_verifications.pending);
                    } else if (statsData.users?.pending_verifications !== undefined) {
                        setPendingVerifications(statsData.users.pending_verifications);
                    }
                }
                setLoading(false);
            }
        },
        onError: (error) => {
            console.error('Error fetching stats:', error);
            setLoading(false);
        }
    });

    // Initial data fetch - check cache first
    useEffect(() => {
        // If cached stats exist, use them
        if (cachedStats) {
            console.log('📦 Using cached stats:', cachedStats);
            let statsData = null;
            
            if (cachedStats.data) {
                statsData = cachedStats.data;
            } else if (cachedStats.users || cachedStats.orders || cachedStats.products) {
                statsData = cachedStats;
            }
            
            if (statsData) {
                setStats(statsData);
                
                // Try to get pending verifications from cached stats
                if (statsData.pending_verifications !== undefined) {
                    setPendingVerifications(statsData.pending_verifications);
                } else if (statsData.farmer_verifications?.pending !== undefined) {
                    setPendingVerifications(statsData.farmer_verifications.pending);
                } else if (statsData.users?.pending_verifications !== undefined) {
                    setPendingVerifications(statsData.users.pending_verifications);
                }
            }
            setLoading(false);
        }
    }, []);

    // Handle refresh with loading state
    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        setLoading(true);
        
        try {
            // Invalidate and refresh stats
            invalidateStatsCache();
            await refreshStats();
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    }, [refreshStats, invalidateStatsCache]);

    const fmt = (amount) => {
        if (amount === undefined || amount === null) return 'GMD 0.00';
        const n = typeof amount === 'string' ? parseFloat(amount) : amount;
        return isNaN(n) ? 'GMD 0.00' : `GMD ${n.toFixed(2)}`;
    };

    // Show skeleton only on initial load
    if (loading && !stats) return <AdminDashboardSkeleton />;

    const statusColor = (status) => {
        const map = {
            delivered: 'bg-green-50 text-green-700',
            pending:   'bg-yellow-50 text-yellow-700',
            confirmed: 'bg-blue-50 text-blue-700',
            shipped:   'bg-purple-50 text-purple-700',
            cancelled: 'bg-red-50 text-red-700',
        };
        return map[status] || 'bg-slate-100 text-slate-600';
    };

    const maxStat = Math.max(
        stats?.orders?.pending || 0,
        stats?.orders?.confirmed || 0,
        stats?.orders?.shipped || 0,
        stats?.orders?.delivered || 0,
        stats?.orders?.cancelled || 0,
        stats?.users?.total || 0,
        1
    );

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-sm text-slate-500">Welcome back, {user?.name}!</p>
                                {isCached && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1 animate-in fade-in duration-300">
                                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></span>
                                        Cached
                                    </span>
                                )}
                                {refreshing && (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1 animate-in fade-in duration-300">
                                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        Refreshing...
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cache Status Bar */}
            <div className="max-w-6xl mx-auto px-6 pt-3">
                <div className="flex items-center justify-between text-xs text-slate-400 bg-white border border-slate-200 rounded-lg px-3 py-1.5">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${isCached ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                            {isCached ? 'Using cached data' : 'Live data'}
                        </span>
                        <span>Last updated: {new Date().toLocaleTimeString()}</span>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
                    >
                        {refreshing ? 'Refreshing...' : 'Force refresh'}
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Total users', value: stats?.users?.total || 0, icon: '👥' },
                        { label: 'Active products', value: stats?.products?.active || 0, icon: '📦' },
                        { label: 'Total orders', value: stats?.orders?.total || 0, icon: '🛒' },
                        { label: 'Revenue', value: fmt(stats?.orders?.total_revenue), icon: '💰' },
                    ].map((s, i) => (
                        <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                            <div className="text-2xl mb-3">{s.icon}</div>
                            <div className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">{s.value}</div>
                            <div className="text-xs text-slate-500">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Pending Verifications Alert */}
                {pendingVerifications > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 animate-in slide-in-from-top duration-300">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">👨‍🌾</span>
                                <div>
                                    <p className="text-sm font-semibold text-yellow-800">
                                        {pendingVerifications} farmer verification{pendingVerifications > 1 ? 's' : ''} pending
                                    </p>
                                    <p className="text-xs text-yellow-700">
                                        Review and verify farmer applications
                                    </p>
                                </div>
                            </div>
                            <Link 
                                to="/app/admin/farmers/verification" 
                                className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-4 py-2 rounded-lg hover:bg-yellow-200 transition no-underline"
                            >
                                Review now →
                            </Link>
                        </div>
                    </div>
                )}

                {/* Admin Quick Stats - New Section */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-extrabold text-slate-900">
                                    {stats?.users?.farmers || 0}
                                </p>
                                <p className="text-xs text-slate-500">Total Farmers</p>
                            </div>
                            <span className="text-3xl">👨‍🌾</span>
                        </div>
                        <div className="mt-2">
                            <span className="text-xs text-green-600">
                                {stats?.users?.verified_farmers || 0} verified
                            </span>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-extrabold text-slate-900">
                                    {stats?.orders?.pending || 0}
                                </p>
                                <p className="text-xs text-slate-500">Pending Orders</p>
                            </div>
                            <span className="text-3xl">⏳</span>
                        </div>
                        <div className="mt-2">
                            <Link 
                                to="/app/orders?status=pending" 
                                className="text-xs text-blue-600 hover:text-blue-700"
                            >
                                View pending →
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-extrabold text-slate-900">
                                    {stats?.products?.active || 0}
                                </p>
                                <p className="text-xs text-slate-500">Active Products</p>
                            </div>
                            <span className="text-3xl">📦</span>
                        </div>
                        <div className="mt-2">
                            <Link 
                                to="/app/admin/products" 
                                className="text-xs text-blue-600 hover:text-blue-700"
                            >
                                Manage products →
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                        <h3 className="text-sm font-bold text-slate-900 mb-4">Order status</h3>
                        <div className="space-y-3">
                            {[
                                { label: 'Pending',   count: stats?.orders?.pending   || 0, bar: 'bg-yellow-400' },
                                { label: 'Confirmed', count: stats?.orders?.confirmed || 0, bar: 'bg-blue-500' },
                                { label: 'Shipped',   count: stats?.orders?.shipped   || 0, bar: 'bg-purple-500' },
                                { label: 'Delivered', count: stats?.orders?.delivered || 0, bar: 'bg-green-500' },
                                { label: 'Cancelled', count: stats?.orders?.cancelled || 0, bar: 'bg-red-400' },
                            ].map((row, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="text-xs text-slate-500 w-20 flex-shrink-0">{row.label}</span>
                                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${row.bar}`} style={{ width: `${Math.min((row.count / maxStat) * 100, 100)}%` }} />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-700 w-6 text-right">{row.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                        <h3 className="text-sm font-bold text-slate-900 mb-4">User breakdown</h3>
                        <div className="space-y-3">
                            {[
                                { label: 'Total',            count: stats?.users?.total            || 0, bar: 'bg-slate-400' },
                                { label: 'Farmers',          count: stats?.users?.farmers          || 0, bar: 'bg-green-500' },
                                { label: 'Buyers',           count: stats?.users?.buyers           || 0, bar: 'bg-blue-500' },
                                { label: 'Admins',           count: stats?.users?.admins           || 0, bar: 'bg-red-400' },
                                { label: 'Verified farmers', count: stats?.users?.verified_farmers || 0, bar: 'bg-teal-500' },
                            ].map((row, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="text-xs text-slate-500 w-28 flex-shrink-0">{row.label}</span>
                                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${row.bar}`} style={{ width: `${Math.min((row.count / maxStat) * 100, 100)}%` }} />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-700 w-6 text-right">{row.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-6">
                    <h3 className="text-sm font-bold text-slate-900 mb-3">Quick actions</h3>
                    <div className="grid grid-cols-4 gap-3">
                        {[
                            { icon: '🛒', title: 'Orders',         desc: 'View all orders',   to: '/app/orders' },
                            { icon: '👥', title: 'Users',          desc: 'Manage users',      to: '/app/admin/users' },
                            { icon: '✅', title: 'Verify farmers', desc: 'Review & approve',  to: '/app/admin/farmers/verification' },
                            { icon: '📦', title: 'Products',       desc: 'Manage listings',   to: '/app/admin/products' },
                        ].map((a, i) => (
                            <Link key={i} to={a.to} className="bg-white border border-slate-200 rounded-xl px-4 py-4 flex items-center gap-3 no-underline hover:border-green-400 hover:shadow-sm transition-all group">
                                <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center text-lg flex-shrink-0">{a.icon}</div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900 group-hover:text-green-700 transition-colors">{a.title}</p>
                                    <p className="text-xs text-slate-400">{a.desc}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <h3 className="text-sm font-bold text-slate-900 mb-4">Recent orders</h3>
                    {(!stats?.recent_activity?.recent_orders?.length) ? (
                        <div className="text-center py-10 text-slate-400 text-sm">No recent orders</div>
                    ) : stats.recent_activity.recent_orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                            <div>
                                <span className="text-sm font-semibold text-slate-900">{order.buyer?.name || 'Unknown'}</span>
                                <span className="text-sm text-slate-400 ml-2">ordered {order.product?.name || 'Unknown product'}</span>
                            </div>
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusColor(order.status)}`}>
                                {order.status || 'Unknown'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;