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
        try {
            // Check if data is FormData
            if (data instanceof FormData) {
                // Log what we're sending for debugging
                console.log('📤 Updating profile with FormData:');
                for (let [key, value] of data.entries()) {
                    console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
                }

                const response = await api.put('/user/profile', data, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                
                console.log('✅ Profile updated successfully:', response.data);
                return response.data;
            }

            // If it's a plain object, send as JSON
            const response = await api.put('/user/profile', data);
            console.log('✅ Profile updated successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Profile update error:', error);
            
            // Log detailed error information
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
                
                // Check for validation errors
                if (error.response.status === 422) {
                    const errors = error.response.data.errors || {};
                    console.error('Validation errors:', errors);
                    
                    // Format validation errors for display
                    const errorMessages = Object.entries(errors)
                        .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                        .join('; ');
                    
                    throw new Error(`Validation failed: ${errorMessages}`);
                }
            }
            
            throw error;
        }
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