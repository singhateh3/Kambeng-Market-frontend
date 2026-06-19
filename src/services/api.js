// src/services/api.js
import axios from 'axios';

// Use environment variable for API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor
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

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const apiError = {
            message: 'An error occurred',
        };

        if (error.response) {
            const data = error.response.data;
            apiError.message = data?.message || 'Server error';
            apiError.errors = data?.errors;
            
            if (error.response.status === 401) {
                localStorage.removeItem('authToken');
                window.location.href = '/login';
            }
        } else if (error.request) {
            apiError.message = 'Network error. Please check your connection.';
        } else {
            apiError.message = error.message || 'An unexpected error occurred';
        }

        return Promise.reject(apiError);
    }
);

export default api;