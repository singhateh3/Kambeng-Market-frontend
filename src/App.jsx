// src/App.jsx
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ForgotPassword } from './components/auth/ForgotPassword';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { AuthProvider } from './context/AuthContext';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';

export const App = () => {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="/dashboard" />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="profile" element={<Profile />} />
                    <Route
                        path="products"
                        element={
                            <ProtectedRoute requiredRole="farmer">
                                <div className="bg-white shadow rounded-lg p-6">
                                    <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
                                    <p className="text-gray-600">You haven't listed any products yet.</p>
                                </div>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="browse"
                        element={
                            <ProtectedRoute requiredRole="buyer">
                                <div className="bg-white shadow rounded-lg p-6">
                                    <h1 className="text-2xl font-bold text-gray-900">Browse Produce</h1>
                                    <p className="text-gray-600">Discover fresh produce from local farmers.</p>
                                </div>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="orders"
                        element={
                            <div className="bg-white shadow rounded-lg p-6">
                                <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                                <p className="text-gray-600">You have no orders yet.</p>
                            </div>
                        }
                    />
                </Route>
            </Routes>
        </AuthProvider>
    );
};