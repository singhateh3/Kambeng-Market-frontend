// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setUser(null);
                return;
            }

            const response = await authService.getUser();
            setUser(response.data);
        } catch (error) {
            console.error('Failed to refresh user:', error);
            setUser(null);
            localStorage.removeItem('authToken');
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            setIsLoading(true);
            await refreshUser();
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (data) => {
        const response = await authService.login(data);
        localStorage.setItem('authToken', response.data.token);
        setUser(response.data.user);
    };

    const register = async (data) => {
        const response = await authService.register(data);
        localStorage.setItem('authToken', response.data.token);
        setUser(response.data.user);
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('authToken');
            setUser(null);
        }
    };

    const updateProfile = async (data) => {
        const response = await authService.updateProfile(data);
        setUser(response.data);
    };

    const value = {
        user,
        isLoading,
        isAuthenticated: !!user && !!localStorage.getItem('authToken'),
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};