// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, isLoading, isAuthenticated } = useAuth();

    console.log('ProtectedRoute - isAuthenticated:', isAuthenticated);
    console.log('ProtectedRoute - user:', user);
    console.log('ProtectedRoute - isLoading:', isLoading);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        console.log('Redirecting to login - not authenticated');
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
        console.log(`Redirecting - required role: ${requiredRole}, user role: ${user?.role}`);
        return <Navigate to="/app/dashboard" replace />;
    }

    console.log('Rendering protected content');
    return children;
};