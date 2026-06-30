// src/pages/admin/AdminDashboard.jsx
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminDashboardSkeleton } from '../../components/common/skeletons/AdminDashboardSkeleton';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../hooks/useAuth';
import { useCachedFetch } from '../../hooks/useCachedFetch';

const AdminDashboard = () => {
    const { user } = useAuth();
    const { 
        notifications, 
        unreadCount, 
        fetchNotifications, 
        markAsRead, 
        markAllAsRead 
    } = useNotifications();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showNotifications, setShowNotifications] = useState(false);
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
        fetchNotifications();
        
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
            
            // Refresh notifications
            await fetchNotifications();
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    }, [refreshStats, fetchNotifications, invalidateStatsCache]);

    const fmt = (amount) => {
        if (amount === undefined || amount === null) return 'GMD 0.00';
        const n = typeof amount === 'string' ? parseFloat(amount) : amount;
        return isNaN(n) ? 'GMD 0.00' : `GMD ${n.toFixed(2)}`;
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.is_read) {
            await markAsRead(notification.id);
        }
        // Navigate based on notification type
        if (notification.link) {
            window.location.href = notification.link;
        } else if (notification.type === 'farmer_verification_request') {
            window.location.href = '/app/admin/farmers/verification';
        } else if (notification.type === 'order_placed' || notification.type === 'order_confirmed' || 
                   notification.type === 'order_shipped' || notification.type === 'order_delivered' || 
                   notification.type === 'order_cancelled') {
            const orderId = notification.data?.order_id;
            if (orderId) {
                window.location.href = `/app/orders/${orderId}`;
            }
        } else if (notification.type === 'user_registered') {
            window.location.href = '/app/admin/users';
        } else if (notification.type === 'new_product') {
            const productId = notification.data?.product_id;
            if (productId) {
                window.location.href = `/app/products/${productId}`;
            }
        }
        setShowNotifications(false);
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

    // Get admin-specific notifications
    const adminNotifications = notifications.filter(n => 
        n.type === 'farmer_verification_request' || 
        n.type === 'user_registered' ||
        n.type === 'reported_product' ||
        n.type === 'payment_dispute'
    );

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Header with Notification Bell */}
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
                        
                        <div className="flex items-center gap-3">
                            {/* Refresh Button */}
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                {refreshing ? 'Refreshing...' : 'Refresh'}
                            </button>

                            {/* Notification Bell */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
                                >
                                    <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                                        />
                                    </svg>
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Notification Dropdown */}
                                {showNotifications && (
                                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50 animate-in fade-in-down duration-200">
                                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                                            <h3 className="font-bold text-sm text-slate-900">Notifications</h3>
                                            <div className="flex items-center gap-2">
                                                {unreadCount > 0 && (
                                                    <button
                                                        onClick={() => {
                                                            markAllAsRead();
                                                            setShowNotifications(false);
                                                        }}
                                                        className="text-xs text-green-600 hover:text-green-700 font-semibold"
                                                    >
                                                        Mark all read
                                                    </button>
                                                )}
                                                <Link
                                                    to="/app/notifications"
                                                    className="text-xs text-green-600 hover:text-green-700 font-semibold"
                                                    onClick={() => setShowNotifications(false)}
                                                >
                                                    View all
                                                </Link>
                                            </div>
                                        </div>

                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="text-center py-8">
                                                    <span className="text-3xl block mb-2">🔔</span>
                                                    <p className="text-sm text-slate-400">No notifications</p>
                                                </div>
                                            ) : (
                                                notifications.slice(0, 10).map((notification) => (
                                                    <div
                                                        key={notification.id}
                                                        onClick={() => handleNotificationClick(notification)}
                                                        className={`px-4 py-3 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition ${
                                                            !notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                                                        }`}
                                                    >
                                                        <div className="flex items-start gap-2">
                                                            <span className="text-lg flex-shrink-0">
                                                                {notification.icon || '🔔'}
                                                            </span>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <p className={`text-sm font-medium ${!notification.is_read ? 'text-slate-900' : 'text-slate-600'}`}>
                                                                        {notification.title}
                                                                    </p>
                                                                    {!notification.is_read && (
                                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-800 flex-shrink-0">
                                                                            New
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                                                    {notification.message}
                                                                </p>
                                                                <div className="flex items-center gap-3 mt-1">
                                                                    <span className="text-[10px] text-slate-400">
                                                                        {notification.time_ago || new Date(notification.created_at).toLocaleString()}
                                                                    </span>
                                                                    {notification.type && (
                                                                        <span className="text-[10px] font-medium text-slate-400 uppercase">
                                                                            {notification.type.replace(/_/g, ' ')}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        {notifications.length > 0 && (
                                            <div className="px-4 py-2 border-t border-slate-100 bg-slate-50">
                                                <Link
                                                    to="/app/notifications"
                                                    className="text-xs text-green-600 hover:text-green-700 font-semibold block text-center"
                                                    onClick={() => setShowNotifications(false)}
                                                >
                                                    View all notifications →
                                                </Link>
                                            </div>
                                        )}
                                    </div>
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

                {/* Unread Notifications Alert */}
                {unreadCount > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 animate-in slide-in-from-top duration-300">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-blue-600">🔔</span>
                                <p className="text-sm text-blue-800">
                                    <strong>{unreadCount}</strong> unread notification{unreadCount > 1 ? 's' : ''}
                                </p>
                            </div>
                            <button
                                onClick={markAllAsRead}
                                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                            >
                                Mark all read
                            </button>
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

                {/* Recent Admin Notifications */}
                {adminNotifications.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-900">Admin notifications</h3>
                            <Link to="/app/notifications" className="text-xs font-semibold text-green-600 no-underline hover:text-green-700">
                                View all →
                            </Link>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {adminNotifications.slice(0, 5).map((notification) => (
                                <div 
                                    key={notification.id} 
                                    className={`py-3 flex items-start gap-3 cursor-pointer hover:bg-slate-50 px-2 rounded-lg transition ${
                                        !notification.is_read ? 'bg-blue-50/50' : ''
                                    }`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <span className="text-xl flex-shrink-0 mt-0.5">
                                        {notification.icon || '🔔'}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className={`text-sm font-medium ${!notification.is_read ? 'text-slate-900' : 'text-slate-600'}`}>
                                                {notification.title}
                                            </p>
                                            {!notification.is_read && (
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-800 flex-shrink-0">
                                                    New
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-1">
                                            {notification.time_ago || new Date(notification.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    {!notification.is_read && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                markAsRead(notification.id);
                                            }}
                                            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex-shrink-0"
                                        >
                                            Mark read
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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