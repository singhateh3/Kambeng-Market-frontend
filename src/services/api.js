// src/services/api.js
import axios from 'axios';

// Vite uses import.meta.env instead of process.env
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        // ✅ FIX: Use 'authToken' consistently with AuthContext
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Global loading indicator (optional)
let loadingCount = 0;
const loadingCallbacks = [];

export const onLoadingChange = (callback) => {
    loadingCallbacks.push(callback);
};

const updateLoading = (isLoading) => {
    loadingCallbacks.forEach(callback => callback(isLoading));
};

api.interceptors.request.use(
    (config) => {
        if (loadingCount === 0) {
            updateLoading(true);
        }
        loadingCount++;
        return config;
    },
    (error) => {
        loadingCount--;
        if (loadingCount === 0) {
            updateLoading(false);
        }
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        loadingCount--;
        if (loadingCount === 0) {
            updateLoading(false);
        }
        return response;
    },
    (error) => {
        loadingCount--;
        if (loadingCount === 0) {
            updateLoading(false);
        }
        
        // Handle unauthorized - only redirect to login, don't logout
        if (error.response?.status === 401) {
            // Check if it's NOT an auth endpoint
            const isAuthEndpoint = error.config?.url?.includes('/login') || 
                                  error.config?.url?.includes('/register') ||
                                  error.config?.url?.includes('/forgot-password');
            
            // Only redirect if not on login page and not an auth endpoint
            if (!isAuthEndpoint && !window.location.pathname.includes('/login')) {
                localStorage.removeItem('authToken');
                window.location.href = '/login';
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;