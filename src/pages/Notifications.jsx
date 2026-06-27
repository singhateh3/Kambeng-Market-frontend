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
    const [currentPage, setCurrentPage] = useState(1);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchNotifications(currentPage, 20, filter);
    }, [fetchNotifications, currentPage, filter]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.last_page) {
            setCurrentPage(newPage);
        }
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setCurrentPage(1); // Reset to first page when filter changes
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

    const getNotificationColor = (type) => {
        const colors = {
            order_placed: 'bg-blue-50 border-blue-200',
            order_confirmed: 'bg-green-50 border-green-200',
            order_shipped: 'bg-purple-50 border-purple-200',
            order_delivered: 'bg-green-50 border-green-200',
            order_cancelled: 'bg-red-50 border-red-200',
            farmer_verified: 'bg-green-50 border-green-200',
            farmer_rejected: 'bg-red-50 border-red-200',
            farmer_verification_request: 'bg-yellow-50 border-yellow-200',
            new_product: 'bg-yellow-50 border-yellow-200',
            low_stock: 'bg-orange-50 border-orange-200',
        };
        return colors[type] || 'bg-gray-50 border-gray-200';
    };

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
        };
        return icons[type] || '🔔';
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
                        <div className="flex gap-2 flex-wrap">
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
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                            }`}
                            onClick={() => handleFilterChange('all')}
                        >
                            All ({pagination.total || 0})
                        </button>
                        <button
                            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                                filter === 'unread'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                            }`}
                            onClick={() => handleFilterChange('unread')}
                        >
                            Unread ({unreadCount})
                        </button>
                        <button
                            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                                filter === 'read'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                            }`}
                            onClick={() => handleFilterChange('read')}
                        >
                            Read ({pagination.total - unreadCount})
                        </button>
                    </div>
                </div>

                {/* Notifications List */}
                {notifications.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🔔</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Notifications</h3>
                        <p className="text-gray-500">
                            {filter === 'all'
                                ? "You don't have any notifications yet."
                                : filter === 'unread'
                                ? "You have no unread notifications."
                                : "You have no read notifications."}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="divide-y divide-gray-200">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-6 border-l-4 ${getNotificationColor(notification.type)} ${
                                        notification.is_read ? 'opacity-75' : ''
                                    } cursor-pointer hover:shadow-md transition-all duration-200`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-3">
                                                <span className="text-2xl">
                                                    {notification.icon || getNotificationIcon(notification.type)}
                                                </span>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold text-gray-900">
                                                            {notification.title}
                                                        </p>
                                                        {!notification.is_read && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                New
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center space-x-4 mt-2">
                                                        <span className="text-xs text-gray-400">
                                                            {notification.time_ago || 
                                                                new Date(notification.created_at).toLocaleString()}
                                                        </span>
                                                        {notification.type && (
                                                            <span className="text-xs text-gray-400 capitalize">
                                                                {notification.type.replace('_', ' ')}
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
                                                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
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
                                                className="text-gray-400 hover:text-red-600 transition-colors"
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
                        {pagination.total > pagination.per_page && (
                            <div className="px-6 py-4 border-t flex flex-wrap items-center justify-between gap-2">
                                <div className="text-sm text-gray-700">
                                    Showing {notifications.length} of {pagination.total} notifications
                                </div>
                                <div className="flex space-x-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        disabled={currentPage <= 1}
                                        onClick={() => handlePageChange(currentPage - 1)}
                                    >
                                        Previous
                                    </Button>
                                    <span className="px-3 py-1 text-sm text-gray-600">
                                        Page {currentPage} of {pagination.last_page}
                                    </span>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        disabled={currentPage >= pagination.last_page}
                                        onClick={() => handlePageChange(currentPage + 1)}
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