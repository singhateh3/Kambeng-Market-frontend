// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, isLoading, isAuthenticated } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
        return <Navigate to="/dashboard" />;
    }

    return children;
};