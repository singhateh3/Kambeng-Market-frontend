// src/services/notificationService.js
import api from './api';

export const notificationService = {
    // Get all notifications
    async getNotifications(params = {}) {
        const response = await api.get('/notifications', { params });
        return response.data;
    },

    // Get unread count
    async getUnreadCount() {
        const response = await api.get('/notifications/unread-count');
        return response.data;
    },

    // Mark a notification as read
    async markAsRead(notificationId) {
        const response = await api.post(`/notifications/${notificationId}/read`);
        return response.data;
    },

    // Mark all notifications as read
    async markAllAsRead() {
        const response = await api.post('/notifications/mark-all-read');
        return response.data;
    },

    // Delete a notification
    async deleteNotification(notificationId) {
        const response = await api.delete(`/notifications/${notificationId}`);
        return response.data;
    },

    // Delete all read notifications
    async deleteRead() {
        const response = await api.delete('/notifications/delete-read');
        return response.data;
    },
};