// src/App.jsx
import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ForgotPassword } from './components/auth/ForgotPassword';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { LoadingScreen } from './components/common/LoadingScreen';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Helper to handle both named and default exports (keep for components that need it)
const namedLazy = (importFn, name) =>
    lazy(() => importFn().then(m => ({ default: m[name] ?? m.default })));

// Use plain lazy() for components that use export default
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Browse = lazy(() => import('./pages/Browse'));
const Notifications = lazy(() => import('./pages/Notifications'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const PlaceOrder = lazy(() => import('./pages/buyer/PlaceOrder'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const FarmerVerification = lazy(() => import('./pages/admin/FarmerVerification'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const CreateProduct = lazy(() => import('./pages/farmer/CreateProduct'));
const Products = lazy(() => import('./pages/farmer/Products'));
const OrderDetailsPage = lazy(() => import('./pages/orders/OrderDetailsPage'));
const Orders = lazy(() => import('./pages/orders/Orders'));
const WriteReview = lazy(() => import('./pages/orders/WriteReview'));

// Use namedLazy only for components that use named exports (keep if you have any)
// Example: const SomeNamedComponent = namedLazy(() => import('./pages/SomeComponent'), 'SomeNamedExport');

export const App = () => {
    return (
        <AuthProvider>
            <NotificationProvider>
                <Suspense fallback={<LoadingScreen />}>
                    <Routes>
                        {/* PUBLIC ROUTES */}
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />

                        {/* PROTECTED ROUTES */}
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
                            <Route path="products" element={<ProtectedRoute requiredRole="farmer"><Products /></ProtectedRoute>} />
                            <Route path="products/create" element={<ProtectedRoute requiredRole="farmer"><CreateProduct /></ProtectedRoute>} />

                            {/* Buyer Routes */}
                            <Route path="browse" element={<ProtectedRoute requiredRole="buyer"><Browse /></ProtectedRoute>} />
                            <Route path="place-order/:productId" element={<ProtectedRoute requiredRole="buyer"><PlaceOrder /></ProtectedRoute>} />

                            {/* Product Detail */}
                            <Route path="products/:productId" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />

                            {/* Orders */}
                            <Route path="orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                            <Route path="orders/:orderId" element={<ProtectedRoute><OrderDetailsPage /></ProtectedRoute>} />
                            <Route path="orders/:orderId/review" element={<ProtectedRoute><WriteReview /></ProtectedRoute>} />

                            {/* Notifications */}
                            <Route path="notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

                            {/* Admin Routes */}
                            <Route path="admin" element={<ProtectedRoute requiredRole="admin"><Navigate to="/app/admin/dashboard" /></ProtectedRoute>} />
                            <Route path="admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
                            <Route path="admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUsers /></ProtectedRoute>} />
                            <Route path="admin/farmers/verification" element={<ProtectedRoute requiredRole="admin"><FarmerVerification /></ProtectedRoute>} />
                            <Route path="admin/products" element={<ProtectedRoute requiredRole="admin"><AdminProducts /></ProtectedRoute>} />
                        </Route>

                        {/* Redirect old routes */}
                        <Route path="/dashboard" element={<Navigate to="/app/dashboard" />} />
                        <Route path="/profile" element={<Navigate to="/app/profile" />} />
                        <Route path="/products" element={<Navigate to="/app/products" />} />
                        <Route path="/orders" element={<Navigate to="/app/orders" />} />
                        <Route path="/browse" element={<Navigate to="/app/browse" />} />

                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </Suspense>
            </NotificationProvider>
        </AuthProvider>
    );
};