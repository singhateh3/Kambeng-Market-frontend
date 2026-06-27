// src/services/api.js
import axios from 'axios';

// Use your Render backend URL
const API_URL = 'https://kambeng-market.onrender.com/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: false,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const data = error.response.data;
            const apiError = {
                message: data?.message || 'Server error',
                errors: data?.errors,
            };
            
            if (error.response.status === 401) {
                localStorage.removeItem('authToken');
                window.location.href = '/login';
            }
            
            return Promise.reject(apiError);
        }
        
        if (error.request) {
            return Promise.reject({
                message: 'Network error. Please check your connection.'
            });
        }
        
        return Promise.reject({
            message: error.message || 'An unexpected error occurred'
        });
    }
);

export default api;