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
                // PHP does not parse multipart/form-data bodies on PUT (or any
                // non-POST verb) — $request->validate()/hasFile() would see an
                // empty body server-side. Laravel's standard workaround is to
                // send a real POST with a spoofed _method field, which the
                // framework treats as the PUT it's registered as.
                data.append('_method', 'PUT');

                const response = await api.post('/user/profile', data, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                return response.data;
            }

            // If it's a plain object, send as JSON
            const response = await api.put('/user/profile', data);
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