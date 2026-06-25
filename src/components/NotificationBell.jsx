// src/components/NotificationBell.jsx
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

export const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const { 
        notifications, 
        unreadCount, 
        loading, 
        markAsRead, 
        markAllAsRead,
        deleteNotification,
        fetchNotifications 
    } = useNotifications();

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = async (notification) => {
        // Mark as read if unread
        if (!notification.is_read) {
            await markAsRead(notification.id);
        }
        
        // Close dropdown
        setIsOpen(false);
        
        // Navigate to the link if it exists
        if (notification.link) {
            navigate(notification.link);
        }
    };

    const getNotificationColor = (type) => {
        const colors = {
            order_placed: 'bg-blue-50 border-l-4 border-blue-500',
            order_confirmed: 'bg-green-50 border-l-4 border-green-500',
            order_shipped: 'bg-purple-50 border-l-4 border-purple-500',
            order_delivered: 'bg-green-50 border-l-4 border-green-500',
            order_cancelled: 'bg-red-50 border-l-4 border-red-500',
            farmer_verified: 'bg-green-50 border-l-4 border-green-500',
            farmer_rejected: 'bg-red-50 border-l-4 border-red-500',
            farmer_verification_request: 'bg-yellow-50 border-l-4 border-yellow-500',
            new_product: 'bg-yellow-50 border-l-4 border-yellow-500',
            low_stock: 'bg-orange-50 border-l-4 border-orange-500',
        };
        return colors[type] || 'bg-gray-50 border-l-4 border-gray-500';
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[500px] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        <div className="flex items-center space-x-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => {
                                        markAllAsRead();
                                    }}
                                    className="text-xs text-primary-600 hover:text-primary-700"
                                >
                                    Mark all read
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Notification List */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="text-4xl mb-2">🔔</div>
                                <p className="text-gray-500">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${getNotificationColor(notification.type)} ${
                                        notification.is_read ? 'opacity-75' : ''
                                    }`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2">
                                                {notification.icon && (
                                                    <span className="text-xl">{notification.icon}</span>
                                                )}
                                                <p className="font-medium text-gray-900 text-sm">
                                                    {notification.title}
                                                </p>
                                                {!notification.is_read && (
                                                    <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full"></span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {notification.time_ago || new Date(notification.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNotification(notification.id);
                                            }}
                                            className="text-gray-400 hover:text-red-600 ml-2 flex-shrink-0"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t text-center">
                            <Link
                                to="/notifications"
                                className="text-sm text-primary-600 hover:text-primary-700"
                                onClick={() => setIsOpen(false)}
                            >
                                View All Notifications
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};