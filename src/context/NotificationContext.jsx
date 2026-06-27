// src/context/NotificationContext.jsx
import { createContext, useCallback, useContext, useState } from 'react';
import api from '../services/api';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0,
    });

    const fetchNotifications = useCallback(async (page = 1, perPage = 20, filter = 'all') => {
        try {
            setLoading(true);
            
            // Build query params
            const params = { page, per_page: perPage };
            if (filter === 'unread') {
                params.is_read = 'false';
            } else if (filter === 'read') {
                params.is_read = 'true';
            }
            
            const response = await api.get('/notifications', { params });
            
            // Handle the response structure from your API
            if (response.data.success) {
                setNotifications(response.data.data);
                setUnreadCount(response.data.meta?.unread_count || 0);
                setPagination({
                    current_page: response.data.meta?.current_page || 1,
                    last_page: response.data.meta?.last_page || 1,
                    per_page: response.data.meta?.per_page || 20,
                    total: response.data.meta?.total || 0,
                });
            } else {
                console.error('Failed to fetch notifications:', response.data.message);
                setNotifications([]);
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setNotifications([]);
            setUnreadCount(0);
        } finally {
            setLoading(false);
        }
    }, []);

    const markAsRead = useCallback(async (id) => {
        try {
            const response = await api.put(`/notifications/${id}/read`);
            
            if (response.data.success) {
                setNotifications(prev => 
                    prev.map(n => 
                        n.id === id ? { ...n, is_read: true } : n
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            } else {
                throw new Error(response.data.message || 'Failed to mark as read');
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            const response = await api.put('/notifications/read-all');
            
            if (response.data.success) {
                setNotifications(prev => 
                    prev.map(n => ({ ...n, is_read: true }))
                );
                setUnreadCount(0);
            } else {
                throw new Error(response.data.message || 'Failed to mark all as read');
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
            throw error;
        }
    }, []);

    const deleteNotification = useCallback(async (id) => {
        try {
            const response = await api.delete(`/notifications/${id}`);
            
            if (response.data.success) {
                const deleted = notifications.find(n => n.id === id);
                setNotifications(prev => prev.filter(n => n.id !== id));
                if (deleted && !deleted.is_read) {
                    setUnreadCount(prev => Math.max(0, prev - 1));
                }
            } else {
                throw new Error(response.data.message || 'Failed to delete notification');
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }, [notifications]);

    const deleteRead = useCallback(async () => {
        try {
            const response = await api.delete('/notifications/read');
            
            if (response.data.success) {
                setNotifications(prev => prev.filter(n => !n.is_read));
            } else {
                throw new Error(response.data.message || 'Failed to delete read notifications');
            }
        } catch (error) {
            console.error('Error deleting read notifications:', error);
            throw error;
        }
    }, []);

    const getUnreadCount = useCallback(async () => {
        try {
            const response = await api.get('/notifications/unread-count');
            if (response.data.success) {
                setUnreadCount(response.data.data.count);
                return response.data.data.count;
            }
            return 0;
        } catch (error) {
            console.error('Error fetching unread count:', error);
            return 0;
        }
    }, []);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                loading,
                pagination,
                fetchNotifications,
                markAsRead,
                markAllAsRead,
                deleteNotification,
                deleteRead,
                getUnreadCount,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};