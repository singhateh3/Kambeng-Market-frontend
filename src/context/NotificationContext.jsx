// src/context/NotificationContext.jsx
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth'; // Add this import
import { notificationService } from '../services/notificationService';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const { isAuthenticated, user } = useAuth(); // Get authentication state
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0,
    });

    const fetchNotifications = useCallback(async (page = 1, perPage = 20, filter = 'all') => {
        // Check if user is authenticated before making request
        const token = localStorage.getItem('authToken');
        if (!token || !isAuthenticated) {
            console.log('⏭️ Skipping notification fetch - user not authenticated');
            setNotifications([]);
            setUnreadCount(0);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            const params = { page, per_page: perPage };
            if (filter === 'unread') {
                params.is_read = 'false';
            } else if (filter === 'read') {
                params.is_read = 'true';
            }
            
            console.log('📤 Fetching notifications for user:', user?.id);
            const response = await notificationService.getNotifications(params);
            
            if (response.success) {
                setNotifications(response.data || []);
                const unread = response.meta?.unread_count || 
                              (response.data || []).filter(n => !n.is_read).length;
                setUnreadCount(unread);
                setPagination({
                    current_page: response.meta?.current_page || 1,
                    last_page: response.meta?.last_page || 1,
                    per_page: response.meta?.per_page || 20,
                    total: response.meta?.total || 0,
                });
            } else {
                console.error('❌ Failed to fetch notifications:', response.message);
                setNotifications([]);
                setUnreadCount(0);
                setError(response.message || 'Failed to fetch notifications');
            }
        } catch (error) {
            console.error('❌ Error fetching notifications:', error);
            
            // Don't treat 401 as an error when not authenticated
            if (error.response?.status === 401) {
                console.warn('🔒 Authentication required for notifications');
                setNotifications([]);
                setUnreadCount(0);
                // Don't set error for 401 when not authenticated
            } else {
                setNotifications([]);
                setUnreadCount(0);
                setError(error.message || 'Error fetching notifications');
            }
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user]);

    const markAsRead = useCallback(async (id) => {
        const token = localStorage.getItem('authToken');
        if (!token || !isAuthenticated) {
            console.warn('⚠️ Not authenticated, cannot mark as read');
            return;
        }

        try {
            const response = await notificationService.markAsRead(id);
            
            if (response.success) {
                setNotifications(prev => 
                    prev.map(n => 
                        n.id === id ? { ...n, is_read: true } : n
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
                return true;
            } else {
                throw new Error(response.message || 'Failed to mark as read');
            }
        } catch (error) {
            console.error('❌ Error marking notification as read:', error);
            throw error;
        }
    }, [isAuthenticated]);

    const markAllAsRead = useCallback(async () => {
        const token = localStorage.getItem('authToken');
        if (!token || !isAuthenticated) {
            console.warn('⚠️ Not authenticated, cannot mark all as read');
            return;
        }

        try {
            const response = await notificationService.markAllAsRead();
            
            if (response.success) {
                setNotifications(prev => 
                    prev.map(n => ({ ...n, is_read: true }))
                );
                setUnreadCount(0);
                return true;
            } else {
                throw new Error(response.message || 'Failed to mark all as read');
            }
        } catch (error) {
            console.error('❌ Error marking all as read:', error);
            throw error;
        }
    }, [isAuthenticated]);

    const deleteNotification = useCallback(async (id) => {
        const token = localStorage.getItem('authToken');
        if (!token || !isAuthenticated) {
            console.warn('⚠️ Not authenticated, cannot delete notification');
            return;
        }

        try {
            const response = await notificationService.deleteNotification(id);
            
            if (response.success) {
                const deleted = notifications.find(n => n.id === id);
                setNotifications(prev => prev.filter(n => n.id !== id));
                if (deleted && !deleted.is_read) {
                    setUnreadCount(prev => Math.max(0, prev - 1));
                }
                return true;
            } else {
                throw new Error(response.message || 'Failed to delete notification');
            }
        } catch (error) {
            console.error('❌ Error deleting notification:', error);
            throw error;
        }
    }, [notifications, isAuthenticated]);

    const deleteRead = useCallback(async () => {
        const token = localStorage.getItem('authToken');
        if (!token || !isAuthenticated) {
            console.warn('⚠️ Not authenticated, cannot delete read notifications');
            return;
        }

        try {
            const response = await notificationService.deleteRead();
            
            if (response.success) {
                setNotifications(prev => prev.filter(n => !n.is_read));
                return true;
            } else {
                throw new Error(response.message || 'Failed to delete read notifications');
            }
        } catch (error) {
            console.error('❌ Error deleting read notifications:', error);
            throw error;
        }
    }, [isAuthenticated]);

    const getUnreadCount = useCallback(async () => {
        const token = localStorage.getItem('authToken');
        if (!token || !isAuthenticated) {
            console.log('⏭️ Skipping unread count fetch - user not authenticated');
            return 0;
        }

        try {
            const response = await notificationService.getUnreadCount();
            if (response.success) {
                setUnreadCount(response.data.count);
                return response.data.count;
            }
            return 0;
        } catch (error) {
            console.error('❌ Error fetching unread count:', error);
            return 0;
        }
    }, [isAuthenticated]);

    // Fetch notifications only when authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            console.log('🔔 User authenticated, fetching notifications for:', user.id);
            fetchNotifications();
            
            // Set up polling for new notifications only when authenticated
            const interval = setInterval(() => {
                getUnreadCount();
            }, 30000);
            
            return () => clearInterval(interval);
        } else {
            // Clear notifications when not authenticated
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [isAuthenticated, user, fetchNotifications, getUnreadCount]);

    const value = {
        notifications,
        unreadCount,
        loading,
        error,
        pagination,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteRead,
        getUnreadCount,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};