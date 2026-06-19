// src/services/authService.js
import api from './api';

export const authService = {
    async register(data) {
        const response = await api.post('/register', data);
        return response.data;
    },

    async login(data) {
        const response = await api.post('/login', data);
        return response.data;
    },

    async logout() {
        const response = await api.post('/logout');
        return response.data;
    },

    async getUser() {
        const response = await api.get('/user');
        return response.data;
    },

    async updateProfile(data) {
        const formData = new FormData();
        
        Object.keys(data).forEach(key => {
            const value = data[key];
            if (value !== undefined && value !== null) {
                if (key === 'avatar' && value instanceof File) {
                    formData.append('avatar', value);
                } else if (typeof value === 'string') {
                    formData.append(key, value);
                }
            }
        });
        
        formData.append('_method', 'PUT');

        const response = await api.post('/user/profile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    async forgotPassword(email) {
        const response = await api.post('/forgot-password', { email });
        return response.data;
    },

    async refreshToken() {
        const response = await api.post('/user/refresh-token');
        return response.data;
    },
};