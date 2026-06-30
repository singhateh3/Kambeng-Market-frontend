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
                return null;
            }

            const response = await authService.getUser();
            // response already contains the data from the API
            if (response && response.data) {
                setUser(response.data);
                return response.data;
            } else if (response) {
                setUser(response);
                return response;
            }
            return null;
        } catch (error) {
            console.error('Failed to refresh user:', error);
            setUser(null);
            localStorage.removeItem('authToken');
            return null;
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
        // response contains { user, token }
        localStorage.setItem('authToken', response.token || response.data?.token);
        setUser(response.user || response.data?.user);
        return response;
    };

    const register = async (data) => {
        const response = await authService.register(data);
        localStorage.setItem('authToken', response.token || response.data?.token);
        setUser(response.user || response.data?.user);
        return response;
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
        try {
            const response = await authService.updateProfile(data);
            
            // The response might have the user data directly or nested
            let updatedUser = null;
            if (response && response.data) {
                updatedUser = response.data;
            } else if (response && response.user) {
                updatedUser = response.user;
            } else if (response) {
                updatedUser = response;
            }
            
            if (updatedUser) {
                setUser(updatedUser);
                console.log('✅ User state updated:', updatedUser);
            } else {
                // If no user data in response, refresh the user
                await refreshUser();
            }
            
            return response;
        } catch (error) {
            console.error('❌ Error updating profile:', error);
            throw error;
        }
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