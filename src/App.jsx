// src/App.jsx
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ForgotPassword } from './components/auth/ForgotPassword';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Browse } from './pages/Browse';
import { Dashboard } from './pages/Dashboard';
import { Home } from './pages/Home';
import { Notifications } from './pages/Notifications';
import { ProductDetail } from './pages/ProductDetail';
import { Profile } from './pages/Profile';
import { PlaceOrder } from './pages/buyer/PlaceOrder';

// Admin Components
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { FarmerVerification } from './pages/admin/FarmerVerification';
import { AdminUsers } from './pages/admin/Users';

// Farmer Components
import { CreateProduct } from './pages/farmer/CreateProduct';
import { Products } from './pages/farmer/Products';

// Order Components
import { OrderDetailsPage } from './pages/orders/OrderDetailsPage';
import { Orders } from './pages/orders/Orders';

// Review
import { WriteReview } from './pages/orders/WriteReview';


export const App = () => {
    return (
        <AuthProvider>
            <NotificationProvider>
                <Routes>
                    {/* PUBLIC ROUTES - No authentication required */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    
                    {/* PROTECTED ROUTES - Authentication required */}
                    <Route
                        path="/app"
                        element={
                            <ProtectedRoute>
                                <Layout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Navigate to="/app/dashboard" />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="profile" element={<Profile />} />
                        
                        {/* Farmer Routes */}
                        <Route
                            path="products"
                            element={
                                <ProtectedRoute requiredRole="farmer">
                                    <Products />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="products/create"
                            element={
                                <ProtectedRoute requiredRole="farmer">
                                    <CreateProduct />
                                </ProtectedRoute>
                            }
                        />
                        
                        {/* Buyer Routes */}
                        <Route
                            path="browse"
                            element={
                                <ProtectedRoute requiredRole="buyer">
                                    <Browse />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="place-order/:productId"
                            element={
                                <ProtectedRoute requiredRole="buyer">
                                    <PlaceOrder />
                                </ProtectedRoute>
                            }
                        />
                        
                        {/* Product Detail - For all authenticated users */}
                        <Route
                            path="products/:productId"
                            element={
                                <ProtectedRoute>
                                    <ProductDetail />
                                </ProtectedRoute>
                            }
                        />
                        
                        {/* Orders Routes - For all authenticated users */}
                        <Route
                            path="orders"
                            element={
                                <ProtectedRoute>
                                    <Orders />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="orders/:orderId"
                            element={
                                <ProtectedRoute>
                                    <OrderDetailsPage />
                                </ProtectedRoute>
                            }
                        />
                        
                        {/* Notifications Route - For all authenticated users */}
                        <Route
                            path="notifications"
                            element={
                                <ProtectedRoute>
                                    <Notifications />
                                </ProtectedRoute>
                            }
                        />
                        
                        {/* Admin Routes (Requires Admin Role) */}
                        <Route
                            path="admin"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <Navigate to="/app/admin/dashboard" />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="admin/dashboard"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <AdminDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="admin/users"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <AdminUsers />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="admin/farmers/verification"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <FarmerVerification />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="admin/products"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <AdminProducts />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="orders/:orderId/review"
                            element={
                                <ProtectedRoute>
                                    <WriteReview />
                                </ProtectedRoute>
                            }
                        />
                    </Route>
                    
                    {/* Redirect old routes to new routes for backward compatibility */}
                    <Route path="/dashboard" element={<Navigate to="/app/dashboard" />} />
                    <Route path="/profile" element={<Navigate to="/app/profile" />} />
                    <Route path="/products" element={<Navigate to="/app/products" />} />
                    <Route path="/orders" element={<Navigate to="/app/orders" />} />
                    <Route path="/browse" element={<Navigate to="/app/browse" />} />
                    
                    {/* Redirect any unknown routes to home */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </NotificationProvider>
        </AuthProvider>
    );
};