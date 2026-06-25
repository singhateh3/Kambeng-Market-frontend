// src/pages/Notifications.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../components/common/Alert';
import { Button } from '../components/common/Button';
import { useNotifications } from '../context/NotificationContext';

export const Notifications = () => {
    const navigate = useNavigate();
    const {
        notifications,
        unreadCount,
        loading,
        pagination,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteRead,
    } = useNotifications();

    const [filter, setFilter] = useState('all');
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handlePageChange = (newPage) => {
        fetchNotifications(newPage);
    };

    const handleMarkAsRead = async (id) => {
        try {
            await markAsRead(id);
            setSuccess('Notification marked as read');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Failed to mark as read');
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            setSuccess('All notifications marked as read');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Failed to mark all as read');
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this notification?')) return;
        try {
            await deleteNotification(id);
            setSuccess('Notification deleted');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Failed to delete notification');
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleDeleteRead = async () => {
        if (!confirm('Delete all read notifications?')) return;
        try {
            await deleteRead();
            setSuccess('Read notifications deleted');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Failed to delete read notifications');
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleNotificationClick = async (notification) => {
        // Mark as read if unread
        if (!notification.is_read) {
            await markAsRead(notification.id);
        }
        
        // Navigate to the link if it exists
        if (notification.link) {
            navigate(notification.link);
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.is_read;
        if (filter === 'read') return n.is_read;
        return true;
    });

    const getNotificationColor = (type) => {
        const colors = {
            order_placed: 'bg-blue-50',
            order_confirmed: 'bg-green-50',
            order_shipped: 'bg-purple-50',
            order_delivered: 'bg-green-50',
            order_cancelled: 'bg-red-50',
            farmer_verified: 'bg-green-50',
            farmer_rejected: 'bg-red-50',
            farmer_verification_request: 'bg-yellow-50',
            new_product: 'bg-yellow-50',
            low_stock: 'bg-orange-50',
        };
        return colors[type] || 'bg-gray-50';
    };

    if (loading && notifications.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow rounded-lg overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                            {unreadCount > 0 && (
                                <p className="text-sm text-gray-500">
                                    {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                                </p>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {unreadCount > 0 && (
                                <Button size="sm" onClick={handleMarkAllAsRead}>
                                    Mark All Read
                                </Button>
                            )}
                            <Button size="sm" variant="danger" onClick={handleDeleteRead}>
                                Delete Read
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Success/Error */}
                {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}
                {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

                {/* Filters */}
                <div className="p-4 border-b bg-gray-50">
                    <div className="flex flex-wrap gap-2">
                        <button
                            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                                filter === 'all'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                            onClick={() => setFilter('all')}
                        >
                            All
                        </button>
                        <button
                            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                                filter === 'unread'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                            onClick={() => setFilter('unread')}
                        >
                            Unread
                        </button>
                        <button
                            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                                filter === 'read'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                            onClick={() => setFilter('read')}
                        >
                            Read
                        </button>
                    </div>
                </div>

                {/* Notifications List */}
                {filteredNotifications.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🔔</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Notifications</h3>
                        <p className="text-gray-500">
                            {filter === 'all'
                                ? 'You don\'t have any notifications yet.'
                                : filter === 'unread'
                                ? 'You have no unread notifications.'
                                : 'You have no read notifications.'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="divide-y divide-gray-200">
                            {filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-6 ${getNotificationColor(notification.type)} ${
                                        notification.is_read ? 'opacity-75' : ''
                                    } cursor-pointer hover:bg-opacity-75 transition-colors`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-3">
                                                {notification.icon && (
                                                    <span className="text-2xl">{notification.icon}</span>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center space-x-4 mt-2">
                                                        <span className="text-xs text-gray-400">
                                                            {notification.time_ago || 
                                                                new Date(notification.created_at).toLocaleString()}
                                                        </span>
                                                        {!notification.is_read && (
                                                            <span className="text-xs text-blue-600 font-medium">
                                                                ● Unread
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 flex-shrink-0">
                                            {!notification.is_read && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMarkAsRead(notification.id);
                                                    }}
                                                    className="text-xs text-primary-600 hover:text-primary-700"
                                                    title="Mark as read"
                                                >
                                                    Mark read
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(notification.id);
                                                }}
                                                className="text-gray-400 hover:text-red-600"
                                                title="Delete"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.total > 20 && (
                            <div className="px-6 py-4 border-t flex flex-wrap items-center justify-between gap-2">
                                <div className="text-sm text-gray-700">
                                    Showing {filteredNotifications.length} of {pagination.total} notifications
                                </div>
                                <div className="flex space-x-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        disabled={pagination.current_page <= 1}
                                        onClick={() => handlePageChange(pagination.current_page - 1)}
                                    >
                                        Previous
                                    </Button>
                                    <span className="px-3 py-1 text-sm text-gray-600">
                                        Page {pagination.current_page} of {pagination.last_page}
                                    </span>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        disabled={pagination.current_page >= pagination.last_page}
                                        onClick={() => handlePageChange(pagination.current_page + 1)}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};