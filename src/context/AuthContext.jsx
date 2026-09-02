// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { queryClient } from '../lib/queryClient';
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
            // Token was invalid/expired — this is an involuntary logout, so
            // it gets the same cache wipe an explicit logout() does. Any
            // private queries cached under the previous session must not
            // linger and be readable by whoever ends up signed in next.
            queryClient.clear();
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

    // Shared by password login/register and Google/Apple sign-in — all
    // four return the same {token, user} shape and need the same
    // "persist token, wipe stale cache, set user" sequence. The cache
    // wipe happens *before* the new user is set, so nothing private from
    // a prior session (or a different account) on this browser tab can
    // ever be read by the incoming one — per-user query keys alone aren't
    // relied on for this, this clear is unconditional.
    const applyAuthResponse = (response) => {
        localStorage.setItem('authToken', response.token || response.data?.token);
        queryClient.clear();
        setUser(response.user || response.data?.user);
        return response;
    };

    const login = async (data) => {
        try {
            return applyAuthResponse(await authService.login(data));
        } catch (error) {
            console.error('Login error in AuthContext:', error);
            // Re-throw the error so the component can handle it
            throw error;
        }
    };

    const register = async (data) => {
        try {
            return applyAuthResponse(await authService.register(data));
        } catch (error) {
            console.error('Register error in AuthContext:', error);
            throw error;
        }
    };

    const loginWithGoogle = async (idToken) => {
        try {
            return applyAuthResponse(await authService.loginWithGoogle(idToken));
        } catch (error) {
            console.error('Google login error in AuthContext:', error);
            throw error;
        }
    };

    const loginWithApple = async (idToken, name) => {
        try {
            return applyAuthResponse(await authService.loginWithApple(idToken, name));
        } catch (error) {
            console.error('Apple login error in AuthContext:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('authToken');
            setUser(null);
            // Same reasoning as login() — no private query result should
            // survive to be seen by whoever uses this browser tab next.
            queryClient.clear();
        }
    };

    const updateProfile = async (data) => {
        try {
            const response = await authService.updateProfile(data);
            
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
            } else {
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
        loginWithGoogle,
        loginWithApple,
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