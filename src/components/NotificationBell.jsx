// src/components/NotificationBell.jsx
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { Skeleton } from './common/skeletons/Skeleton';

// Notification Skeleton Component
const NotificationSkeleton = () => (
    <div className="p-4 border-b border-gray-100">
        <div className="flex items-start space-x-3">
            <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-20" />
            </div>
        </div>
    </div>
);

// Empty State Component
const EmptyState = () => (
    <div className="text-center py-8">
        <div className="text-4xl mb-3">🔔</div>
        <p className="text-gray-500 text-sm">No notifications yet</p>
        <p className="text-gray-400 text-xs mt-1">We'll notify you when something arrives</p>
    </div>
);

export const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isFirstOpen, setIsFirstOpen] = useState(true);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const { 
        notifications, 
        unreadCount, 
        loading, 
        fetchNotifications,
        markAsRead, 
        markAllAsRead,
        deleteNotification,
    } = useNotifications();

    // Fetch notifications when dropdown opens
    useEffect(() => {
        if (isOpen) {
            const token = localStorage.getItem('authToken');
            if (token) {
                console.log('🔔 Fetching notifications on dropdown open');
                fetchNotifications();
                setIsFirstOpen(false);
            }
        }
    }, [isOpen, fetchNotifications]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle notification click
    const handleNotificationClick = async (notification) => {
        console.log('🔔 Notification clicked:', notification);
        console.log('🔗 Original link from database:', notification.link);
        
        try {
            // Mark as read if unread
            if (!notification.is_read) {
                await markAsRead(notification.id);
            }
            
            // Close dropdown
            setIsOpen(false);
            
            // Determine the correct link to navigate to
            let finalLink = null;
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const isAdmin = user?.role === 'admin';
            
            // Check if the notification has a link from the database
            if (notification.link) {
                // If it's an admin notification, ensure it goes to the correct page
                let link = notification.link;
                
                // If the link contains '/admin/' or starts with '/app/admin', it's an admin link
                if (link.includes('/admin/') || link.startsWith('/app/admin')) {
                    // For order notifications, redirect to regular order details
                    if (notification.type === 'order_placed' || 
                        notification.type === 'order_confirmed' || 
                        notification.type === 'order_shipped' || 
                        notification.type === 'order_delivered' || 
                        notification.type === 'order_cancelled') {
                        const orderId = notification.data?.order_id;
                        if (orderId) {
                            finalLink = `/app/orders/${orderId}`;
                        } else {
                            finalLink = '/app/orders';
                        }
                    } else {
                        // For other admin notifications, use the link as-is
                        finalLink = formatLink(link);
                    }
                } else {
                    // Regular user link
                    finalLink = formatLink(link);
                }
            }
            
            // If no link found or link is empty, generate one from the type
            if (!finalLink) {
                finalLink = generateLinkFromNotification(notification);
            }
            
            console.log('📍 Final navigation link:', finalLink);
            
            // Navigate to the final link
            if (finalLink) {
                navigate(finalLink);
            } else {
                // Fallback to dashboard
                if (isAdmin) {
                    navigate('/app/admin/dashboard');
                } else {
                    navigate('/app/dashboard');
                }
            }
        } catch (error) {
            console.error('❌ Error handling notification click:', error);
            setIsOpen(false);
            // Fallback navigation
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user?.role === 'admin') {
                navigate('/app/admin/dashboard');
            } else {
                navigate('/app/dashboard');
            }
        }
    };

    // Format link to ensure it has /app prefix
    const formatLink = (link) => {
        if (!link) return null;
        
        // If link already starts with /app, return as-is
        if (link.startsWith('/app')) {
            return link;
        }
        
        // If link starts with /, add /app prefix
        if (link.startsWith('/')) {
            return `/app${link}`;
        }
        
        // If link doesn't start with /, add /app/
        return `/app/${link}`;
    };

    // Generate link based on notification type (fallback)
    const generateLinkFromNotification = (notification) => {
        const type = notification.type;
        const data = notification.data || {};
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const isAdmin = user?.role === 'admin';
        
        console.log('🔍 Generating link for type:', type, 'isAdmin:', isAdmin);
        
        switch (type) {
            // Order related notifications - FIXED: Admin goes to regular order details
            case 'order_placed':
            case 'order_confirmed':
            case 'order_shipped':
            case 'order_delivered':
            case 'order_cancelled':
                if (data.order_id) {
                    // Both admin and regular users go to the same order details page
                    return `/app/orders/${data.order_id}`;
                }
                return '/app/orders';
            
            // Farmer verification notifications
            case 'farmer_verification_request':
            case 'farmer_verified':
            case 'farmer_rejected':
                return isAdmin ? '/app/admin/farmers/verification' : '/app/profile';
            
            // User registration notifications - only for admins
            case 'user_registered':
                return '/app/admin/users';
            
            // Product notifications
            case 'new_product':
            case 'low_stock':
                return isAdmin ? '/app/admin/products' : '/app/products';
            
            // Review notifications
            case 'new_review':
                if (data.order_id) {
                    return `/app/orders/${data.order_id}`;
                }
                return isAdmin ? '/app/admin/orders' : '/app/orders';
            
            // Default fallback
            default:
                return isAdmin ? '/app/admin/dashboard' : '/app/dashboard';
        }
    };

    // Get notification color based on type
    const getNotificationColor = (type) => {
        const colors = {
            order_placed: 'border-l-4 border-blue-500 hover:bg-blue-50',
            order_confirmed: 'border-l-4 border-green-500 hover:bg-green-50',
            order_shipped: 'border-l-4 border-purple-500 hover:bg-purple-50',
            order_delivered: 'border-l-4 border-green-500 hover:bg-green-50',
            order_cancelled: 'border-l-4 border-red-500 hover:bg-red-50',
            farmer_verified: 'border-l-4 border-green-500 hover:bg-green-50',
            farmer_rejected: 'border-l-4 border-red-500 hover:bg-red-50',
            farmer_verification_request: 'border-l-4 border-yellow-500 hover:bg-yellow-50',
            new_product: 'border-l-4 border-yellow-500 hover:bg-yellow-50',
            low_stock: 'border-l-4 border-orange-500 hover:bg-orange-50',
            new_review: 'border-l-4 border-purple-500 hover:bg-purple-50',
            user_registered: 'border-l-4 border-indigo-500 hover:bg-indigo-50',
        };
        return colors[type] || 'border-l-4 border-gray-500 hover:bg-gray-50';
    };

    // Get notification icon based on type
    const getNotificationIcon = (type) => {
        const icons = {
            order_placed: '🛒',
            order_confirmed: '✅',
            order_shipped: '🚚',
            order_delivered: '📦',
            order_cancelled: '❌',
            farmer_verified: '🎉',
            farmer_rejected: '❌',
            farmer_verification_request: '👨‍🌾',
            new_product: '🌾',
            low_stock: '⚠️',
            new_review: '⭐',
            user_registered: '👤',
        };
        return icons[type] || '🔔';
    };

    // Format time ago
    const getTimeAgo = (date) => {
        if (!date) return '';
        try {
            const now = new Date();
            const past = new Date(date);
            const diffMs = now - past;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffDays < 7) return `${diffDays}d ago`;
            return past.toLocaleDateString();
        } catch (e) {
            return '';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none transition-colors rounded-lg hover:bg-gray-100"
                aria-label="Notifications"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full min-w-[20px] min-h-[20px] animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-[500px] flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50 flex-shrink-0">
                        <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                            <span>🔔</span>
                            Notifications
                            {unreadCount > 0 && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                    {unreadCount} new
                                </span>
                            )}
                        </h3>
                        <div className="flex items-center space-x-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => {
                                        markAllAsRead();
                                    }}
                                    className="text-xs text-green-600 hover:text-green-700 transition font-medium"
                                >
                                    Mark all read
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Notification List */}
                    <div className="flex-1 overflow-y-auto">
                        {loading && isFirstOpen ? (
                            <NotificationSkeleton />
                        ) : loading && notifications.length > 0 ? (
                            <div className="relative">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${getNotificationColor(notification.type)} ${
                                            notification.is_read ? 'opacity-75' : ''
                                        }`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <span className="text-xl flex-shrink-0">
                                                {notification.icon || getNotificationIcon(notification.type)}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-medium text-gray-900 text-sm truncate">
                                                        {notification.title}
                                                    </p>
                                                    {!notification.is_read && (
                                                        <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full ml-2"></span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center justify-between mt-1">
                                                    <span className="text-xs text-gray-400">
                                                        {notification.time_ago || getTimeAgo(notification.created_at)}
                                                    </span>
                                                    {notification.link && (
                                                        <span className="text-xs text-blue-500">
                                                            Click to view →
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                                </div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <EmptyState />
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${getNotificationColor(notification.type)} ${
                                        notification.is_read ? 'opacity-75' : ''
                                    }`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex items-start space-x-3">
                                        <span className="text-xl flex-shrink-0">
                                            {notification.icon || getNotificationIcon(notification.type)}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium text-gray-900 text-sm truncate">
                                                    {notification.title}
                                                </p>
                                                {!notification.is_read && (
                                                    <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full ml-2"></span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-xs text-gray-400">
                                                    {notification.time_ago || getTimeAgo(notification.created_at)}
                                                </span>
                                                <div className="flex items-center space-x-2">
                                                    {!notification.is_read && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                markAsRead(notification.id);
                                                            }}
                                                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                                        >
                                                            Mark read
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (confirm('Delete this notification?')) {
                                                                deleteNotification(notification.id);
                                                            }
                                                        }}
                                                        className="text-gray-400 hover:text-red-600 transition"
                                                        title="Delete"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-gray-100 text-center bg-gray-50 flex-shrink-0">
                        <Link
                            to="/app/notifications"
                            className="text-sm text-green-600 hover:text-green-700 transition font-medium"
                            onClick={() => setIsOpen(false)}
                        >
                            View All Notifications →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};