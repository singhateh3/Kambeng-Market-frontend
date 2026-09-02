// src/App.jsx
import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicLayout } from './components/PublicLayout';
import { ForgotPassword } from './components/auth/ForgotPassword';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { LoadingScreen } from './components/common/LoadingScreen';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Helper to handle both named and default exports
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
const AdminDisputes = lazy(() => import('./pages/admin/AdminDisputes'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const FarmerVerification = lazy(() => import('./pages/admin/FarmerVerification'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const CreateProduct = lazy(() => import('./pages/farmer/CreateProduct'));
const EditProduct = lazy(() => import('./pages/farmer/EditProduct'));
const Products = lazy(() => import('./pages/farmer/Products'));
const OrderDetailsPage = lazy(() => import('./pages/orders/OrderDetailsPage'));
const Orders = lazy(() => import('./pages/orders/Orders'));
const WriteReview = lazy(() => import('./pages/orders/WriteReview'));
const ReportIssue = lazy(() => import('./pages/orders/ReportIssue'));
const FarmerProfile = lazy(() => import('./pages/FarmerProfile'));
const SavedFarmers = lazy(() => import('./pages/buyer/SavedFarmers'));

export const App = () => {
    return (
        <AuthProvider>
            <NotificationProvider>
                <Suspense fallback={<LoadingScreen />}>
                    <Routes>
                        {/* PUBLIC ROUTES */}
                        <Route element={<PublicLayout />}>
                            <Route path="/" element={<Home />} />
                        </Route>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />

                        {/* /app — the layout itself is no longer gated on auth, since
                            some of its children (browse, product detail, place-order,
                            farmer profile) are now public. Every route that still
                            needs auth declares its own <ProtectedRoute> explicitly
                            instead of inheriting it implicitly from this parent. */}
                        <Route path="/app" element={<Layout />}>
                            <Route index element={<Navigate to="/app/dashboard" />} />
                            <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                            <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

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
                            <Route
                                path="products/:productId/edit"
                                element={
                                    <ProtectedRoute requiredRole="farmer">
                                        <EditProduct />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Public marketplace — browsing/viewing needs no account.
                                The backend already serves these endpoints publicly;
                                the only thing that ever gated them was this route
                                nesting. Buyer-only actions (placing an order, saving a
                                farmer) are gated inside the components themselves, not
                                the route, so farmers/admins can still view but don't
                                get buyer affordances, and anonymous visitors can browse
                                and start checkout before being asked to sign in. */}
                            <Route path="browse" element={<Browse />} />
                            <Route path="place-order/:productId" element={<PlaceOrder />} />
                            <Route path="products/:productId" element={<ProductDetail />} />
                            <Route path="farmers/:userId" element={<FarmerProfile />} />

                            {/* Saved Farmers - Buyers only (private) */}
                            <Route path="saved-farmers" element={<ProtectedRoute requiredRole="buyer"><SavedFarmers /></ProtectedRoute>} />

                            {/* Orders - Accessible by both farmers and buyers (private) */}
                            <Route path="orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                            <Route path="orders/:orderId" element={<ProtectedRoute><OrderDetailsPage /></ProtectedRoute>} />
                            <Route path="orders/:orderId/review" element={<ProtectedRoute><WriteReview /></ProtectedRoute>} />
                            <Route path="orders/:orderId/report" element={<ProtectedRoute requiredRole="buyer"><ReportIssue /></ProtectedRoute>} />

                            {/* Notifications - Accessible by all authenticated users (private) */}
                            <Route path="notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

                            {/* Admin Routes */}
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
                                path="admin/disputes"
                                element={
                                    <ProtectedRoute requiredRole="admin">
                                        <AdminDisputes />
                                    </ProtectedRoute>
                                }
                            />
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