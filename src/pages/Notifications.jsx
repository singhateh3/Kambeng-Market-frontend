// src/pages/Notifications.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../components/common/Alert';
import { Button } from '../components/common/Button';
import { Modal } from '../components/Modal';
import { Skeleton } from '../components/common/skeletons/Skeleton';
import { useNotifications } from '../context/NotificationContext';

const Notifications = () => {
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
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmData, setConfirmData] = useState(null);

    useEffect(() => {
        fetchNotifications(currentPage, 20, filter).finally(() => {
            setIsInitialLoad(false);
        });
    }, [fetchNotifications, currentPage, filter]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.last_page) {
            setCurrentPage(newPage);
        }
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setCurrentPage(1);
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
        try {
            await deleteNotification(id);
            setSuccess('Notification deleted');
            setShowConfirmModal(false);
            setConfirmAction(null);
            setConfirmData(null);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Failed to delete notification');
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleDeleteRead = async () => {
        try {
            await deleteRead();
            setSuccess('Read notifications deleted');
            setShowConfirmModal(false);
            setConfirmAction(null);
            setConfirmData(null);
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

        // Get the link from notification
        let link = notification.link;

        // If no link, try to generate one from the type
        if (!link) {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const isAdmin = user?.role === 'admin';
            const data = notification.data || {};

            switch (notification.type) {
                // Order related notifications - Admin goes to regular order details
                case 'order_placed':
                case 'order_confirmed':
                case 'order_shipped':
                case 'order_delivered':
                case 'order_cancelled':
                    if (data.order_id) {
                        link = `/app/orders/${data.order_id}`;
                    } else {
                        link = '/app/orders';
                    }
                    break;
                // Review notifications - Admin goes to regular order details
                case 'new_review':
                    if (data.order_id) {
                        link = `/app/orders/${data.order_id}`;
                    } else {
                        link = '/app/orders';
                    }
                    break;
                case 'farmer_verification_request':
                case 'farmer_verified':
                case 'farmer_rejected':
                    link = isAdmin ? '/app/admin/farmers/verification' : '/app/profile';
                    break;
                case 'user_registered':
                    link = '/app/admin/users';
                    break;
                case 'new_product':
                case 'low_stock':
                    link = isAdmin ? '/app/admin/products' : '/app/products';
                    break;
                default:
                    link = isAdmin ? '/app/admin/dashboard' : '/app/dashboard';
            }
        }

        // Ensure the link is properly formatted
        if (link) {
            if (!link.startsWith('/app') && !link.startsWith('http')) {
                link = `/app${link.startsWith('/') ? '' : '/'}${link}`;
            }

            navigate(link);
        } else {
            console.warn('⚠️ No link found for notification');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user?.role === 'admin') {
                navigate('/app/admin/dashboard');
            } else {
                navigate('/app/dashboard');
            }
        }
    };

    const openConfirmModal = (action, data) => {
        setConfirmAction(action);
        setConfirmData(data);
        setShowConfirmModal(true);
    };

    const closeConfirmModal = () => {
        setShowConfirmModal(false);
        setConfirmAction(null);
        setConfirmData(null);
    };

    const handleConfirmAction = () => {
        if (confirmAction === 'delete') {
            handleDelete(confirmData);
        } else if (confirmAction === 'deleteRead') {
            handleDeleteRead();
        }
    };

    const getConfirmationContent = () => {
        if (confirmAction === 'delete') {
            return {
                title: 'Delete Notification',
                message: 'Are you sure you want to delete this notification? This action cannot be undone.',
                icon: '🗑️',
                confirmText: 'Yes, Delete',
                confirmColor: 'bg-red-600 hover:bg-red-700',
                iconBg: 'bg-red-100 dark:bg-red-900/40',
                iconColor: 'text-red-600 dark:text-red-400',
            };
        } else if (confirmAction === 'deleteRead') {
            return {
                title: 'Delete All Read Notifications',
                message: 'Are you sure you want to delete all read notifications? This action cannot be undone.',
                icon: '🗑️',
                confirmText: 'Yes, Delete All',
                confirmColor: 'bg-red-600 hover:bg-red-700',
                iconBg: 'bg-red-100 dark:bg-red-900/40',
                iconColor: 'text-red-600 dark:text-red-400',
            };
        }
        return {
            title: 'Confirm Action',
            message: 'Are you sure you want to proceed?',
            icon: '⚠️',
            confirmText: 'Confirm',
            confirmColor: 'bg-green-600 hover:bg-green-700',
            iconBg: 'bg-yellow-100 dark:bg-yellow-900/40',
            iconColor: 'text-yellow-600 dark:text-yellow-400',
        };
    };

    const confirmationContent = getConfirmationContent();

    // Loading skeleton component
    const NotificationSkeleton = () => (
        <div className="divide-y divide-gray-200 dark:divide-slate-700">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-6">
                    <div className="flex items-start space-x-4">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-5 w-48" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <div className="flex items-center space-x-4">
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    // If loading and it's the initial load, show full skeleton
    if (isInitialLoad && loading) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-slate-800 shadow rounded-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                        <div className="flex justify-between items-center">
                            <div>
                                <Skeleton className="h-8 w-48" />
                                <Skeleton className="h-4 w-32 mt-2" />
                            </div>
                            <div className="flex space-x-2">
                                <Skeleton className="h-10 w-32" />
                                <Skeleton className="h-10 w-32" />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
                        <div className="flex space-x-2">
                            <Skeleton className="h-10 w-20" />
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-20" />
                        </div>
                    </div>

                    <NotificationSkeleton />
                </div>
            </div>
        );
    }

    if (loading && !isInitialLoad) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-slate-800 shadow rounded-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                        <div className="flex flex-wrap justify-between items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Notifications</h1>
                                {unreadCount > 0 && (
                                    <p className="text-sm text-gray-500 dark:text-slate-400">
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
                                <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => openConfirmModal('deleteRead')}
                                >
                                    Delete Read
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-center py-12">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
                            <p className="text-gray-500 dark:text-slate-400">Loading notifications...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-800 shadow rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Notifications</h1>
                            {unreadCount > 0 && (
                                <p className="text-sm text-gray-500 dark:text-slate-400">
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
                            <Button
                                size="sm"
                                variant="danger"
                                onClick={() => openConfirmModal('deleteRead')}
                            >
                                Delete Read
                            </Button>
                        </div>
                    </div>
                </div>

                {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}
                {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

                <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
                    <div className="flex flex-wrap gap-2">
                        <button
                            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                                filter === 'all'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-300 dark:border-slate-600'
                            }`}
                            onClick={() => handleFilterChange('all')}
                        >
                            All ({pagination.total || 0})
                        </button>
                        <button
                            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                                filter === 'unread'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-300 dark:border-slate-600'
                            }`}
                            onClick={() => handleFilterChange('unread')}
                        >
                            Unread ({unreadCount})
                        </button>
                        <button
                            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                                filter === 'read'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-300 dark:border-slate-600'
                            }`}
                            onClick={() => handleFilterChange('read')}
                        >
                            Read ({pagination.total - unreadCount})
                        </button>
                    </div>
                </div>

                {notifications.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🔔</div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">No Notifications</h3>
                        <p className="text-gray-500 dark:text-slate-400">
                            {filter === 'all'
                                ? "You don't have any notifications yet."
                                : filter === 'unread'
                                ? "You have no unread notifications."
                                : "You have no read notifications."}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="divide-y divide-gray-200 dark:divide-slate-700">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-6 border-l-4 ${
                                        notification.is_read
                                            ? 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600'
                                            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-500'
                                    } cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-200`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-3">
                                                <span className="text-2xl">
                                                    {notification.icon || '🔔'}
                                                </span>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className={`font-semibold ${notification.is_read ? 'text-gray-700 dark:text-slate-300' : 'text-gray-900 dark:text-slate-100'}`}>
                                                            {notification.title}
                                                        </p>
                                                        {!notification.is_read && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                                                                New
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center space-x-4 mt-2">
                                                        <span className="text-xs text-gray-400 dark:text-slate-500">
                                                            {notification.time_ago ||
                                                                new Date(notification.created_at).toLocaleString()}
                                                        </span>
                                                        {notification.link && (
                                                            <span className="text-xs text-blue-500 dark:text-blue-400">
                                                                Click to view →
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
                                                    className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                                                    title="Mark as read"
                                                >
                                                    Mark read
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openConfirmModal('delete', notification.id);
                                                }}
                                                className="text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors p-2 -m-2"
                                                title="Delete"
                                                aria-label="Delete notification"
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

                        {pagination.total > pagination.per_page && (
                            <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
                                <div className="text-sm text-gray-700 dark:text-slate-300">
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
                                    <span className="px-3 py-1 text-sm text-gray-600 dark:text-slate-400">
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

            <Modal
                isOpen={showConfirmModal}
                onClose={closeConfirmModal}
                title={confirmationContent.title}
                maxWidth="max-w-md"
            >
                <div className="p-6">
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className={`w-16 h-16 ${confirmationContent.iconBg} rounded-full flex items-center justify-center text-3xl mb-4`}>
                            {confirmationContent.icon}
                        </div>
                        <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed">
                            {confirmationContent.message}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={closeConfirmModal}
                            className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition border-none cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmAction}
                            className={`flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-lg transition border-none cursor-pointer ${confirmationContent.confirmColor}`}
                        >
                            {confirmationContent.confirmText}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Notifications;
