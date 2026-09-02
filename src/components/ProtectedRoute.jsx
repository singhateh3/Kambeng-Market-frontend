// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { buildReturnState } from '../utils/authRedirect';

export const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 dark:border-green-400"></div>
            </div>
        );
    }

    // Redirect to login if not authenticated, remembering where to return.
    if (!user) {
        return <Navigate to="/login" state={buildReturnState(location)} replace />;
    }

    // Check role-based access
    if (requiredRole && user.role !== requiredRole) {
        // Redirect to dashboard with access denied message
        return <Navigate to="/app/dashboard" state={{ message: 'Access denied. You do not have permission to view this page.' }} replace />;
    }

    return children;
};