// src/services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
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
        
        // Handle unauthorized
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        
        return Promise.reject(error);
    }
);

export default api;