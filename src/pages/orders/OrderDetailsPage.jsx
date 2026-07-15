// src/pages/orders/OrderDetailsPage.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert } from '../../components/common/Alert';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

const OrderDetailsPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [loadingAction, setLoadingAction] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/orders/${orderId}`);
            setOrder(response.data?.data || null);
        } catch (err) {
            console.error('Error fetching order:', err);
            setError('Failed to load order details');
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (status) => {
        try {
            setLoadingAction(true);
            await api.patch(`/orders/${orderId}/status`, { status });
            setSuccess(`Order status updated to ${status}`);
            setShowConfirmModal(false);
            setConfirmAction(null);
            fetchOrderDetails();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error updating order status:', err);
            setError('Failed to update order status');
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoadingAction(false);
        }
    };

    const handleCancelOrder = async () => {
        try {
            setLoadingAction(true);
            await api.post(`/orders/${orderId}/cancel`);
            setSuccess('Order cancelled successfully');
            setShowConfirmModal(false);
            setConfirmAction(null);
            fetchOrderDetails();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error cancelling order:', err);
            setError('Failed to cancel order');
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoadingAction(false);
        }
    };

    const openConfirmModal = (action) => {
        setConfirmAction(action);
        setShowConfirmModal(true);
    };

    const closeConfirmModal = () => {
        setShowConfirmModal(false);
        setConfirmAction(null);
    };

    const handleConfirmAction = () => {
        if (confirmAction === 'confirm') {
            handleStatusUpdate('confirmed');
        } else if (confirmAction === 'ship') {
            handleStatusUpdate('shipped');
        } else if (confirmAction === 'deliver') {
            handleStatusUpdate('delivered');
        } else if (confirmAction === 'cancel') {
            handleCancelOrder();
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            shipped: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: '⏳',
            confirmed: '✅',
            shipped: '🚚',
            delivered: '📦',
            cancelled: '❌',
        };
        return icons[status] || '📋';
    };

    const getStatusLabel = (status) => {
        const labels = {
            pending: 'Pending',
            confirmed: 'Confirmed',
            shipped: 'Shipped',
            delivered: 'Delivered',
            cancelled: 'Cancelled',
        };
        return labels[status] || status;
    };

    const getConfirmationContent = () => {
        const contents = {
            confirm: {
                icon: '✅',
                iconBg: 'bg-blue-100',
                title: 'Confirm Order',
                message: 'Are you sure you want to confirm this order? This will notify the buyer that you have accepted their order.',
                confirmText: 'Yes, Confirm Order',
                confirmColor: 'bg-blue-600 hover:bg-blue-700',
                iconColor: 'text-blue-600',
            },
            ship: {
                icon: '🚚',
                iconBg: 'bg-purple-100',
                title: 'Mark as Shipped',
                message: 'Are you sure you want to mark this order as shipped? The buyer will be notified that their order is on the way.',
                confirmText: 'Yes, Mark as Shipped',
                confirmColor: 'bg-purple-600 hover:bg-purple-700',
                iconColor: 'text-purple-600',
            },
            deliver: {
                icon: '📦',
                iconBg: 'bg-green-100',
                title: 'Mark as Delivered',
                message: 'Are you sure you want to mark this order as delivered? The buyer will be notified that their order has arrived.',
                confirmText: 'Yes, Mark as Delivered',
                confirmColor: 'bg-green-600 hover:bg-green-700',
                iconColor: 'text-green-600',
            },
            cancel: {
                icon: '❌',
                iconBg: 'bg-red-100',
                title: 'Cancel Order',
                message: 'Are you sure you want to cancel this order? This action cannot be undone and will notify both the buyer and farmer.',
                confirmText: 'Yes, Cancel Order',
                confirmColor: 'bg-red-600 hover:bg-red-700',
                iconColor: 'text-red-600',
            },
        };
        return contents[confirmAction] || contents.confirm;
    };

    // Safely check access
    const isFarmer = user?.role === 'farmer';
    const isBuyer = user?.role === 'buyer';
    const isAdmin = user?.role === 'admin';

    const canViewOrder = () => {
    if (!order) return false;
    if (isAdmin) return true; // Admin can view any order
    if (isFarmer && order?.product?.farmer_id === user?.id) return true;
    if (isBuyer && order?.buyer_id === user?.id) return true;
    return false;
};

    // Format date helper
    const formatDate = (date) => {
        try {
            if (!date) return '-';
            const d = new Date(date);
            if (isNaN(d.getTime())) return '-';
            return d.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch (e) {
            return '-';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (!canViewOrder()) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="text-6xl mb-4">🔒</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h3>
                <p className="text-gray-500">You don't have permission to view this order.</p>
                <Button className="mt-4" onClick={() => navigate('/app/orders')}>
                    Back to Orders
                </Button>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="text-6xl mb-4">❌</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h3>
                <p className="text-gray-500">The order you're looking for doesn't exist.</p>
                <Button className="mt-4" onClick={() => navigate('/app/orders')}>
                    Back to Orders
                </Button>
            </div>
        );
    }

    // Safely extract data
    const orderDate = order?.order_date || order?.created_at || new Date().toISOString();
    const product = order?.product || {};
    const buyer = order?.buyer || {};
    const farmer = product?.farmer || {};
    const confirmationContent = getConfirmationContent();

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <button
                                onClick={() => navigate(-1)}
                                className="text-gray-600 hover:text-gray-900 flex items-center mb-2 transition"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Order #{order?.id || 'N/A'}
                            </h1>
                            <p className="text-sm text-gray-500">
                                Placed on {formatDate(orderDate)}
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order?.status)}`}>
                                {getStatusIcon(order?.status)} {getStatusLabel(order?.status)}
                            </span>
                        </div>
                    </div>
                </div>

                {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}
                {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

                <div className="p-6 space-y-6">
                    {/* Order Items */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                        <div className="border rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2 grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div className="col-span-5">Product</div>
                                <div className="col-span-2">Quantity</div>
                                <div className="col-span-2">Unit Price</div>
                                <div className="col-span-3 text-right">Total</div>
                            </div>
                            <div className="px-4 py-3 grid grid-cols-12 gap-2 items-center hover:bg-gray-50">
                                <div className="col-span-5">
                                    <Link to={`/app/products/${order?.product_id}`} className="flex items-center hover:text-green-600 transition">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                                            {product?.photos && product.photos.length > 0 ? (
                                                <img 
                                                    src={product.photos[0]} 
                                                    alt={product?.name || 'Product'} 
                                                    className="w-12 h-12 object-cover rounded-lg"
                                                />
                                            ) : (
                                                <span className="text-2xl">🌾</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {product?.name || 'Unknown Product'}
                                            </p>
                                            {product?.category && (
                                                <p className="text-xs text-gray-500">
                                                    {product.category}
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                </div>
                                <div className="col-span-2">
                                    <span className="font-medium text-gray-900">
                                        {order?.quantity || 0}
                                    </span>
                                    {product?.unit && (
                                        <span className="text-xs text-gray-500 ml-1">
                                            {product.unit}
                                        </span>
                                    )}
                                </div>
                                <div className="col-span-2">
                                    <span className="text-gray-900">
                                        {product?.price_formatted || `GMD ${product?.price || 0}`}
                                    </span>
                                </div>
                                <div className="col-span-3 text-right font-bold text-gray-900">
                                    {order?.total_price_formatted || `GMD ${order?.total_price || 0}`}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Details */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Delivery Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                            <div>
                                <p className="text-sm text-gray-500">Delivery Method</p>
                                <p className="font-medium text-gray-900 capitalize">
                                    {order?.delivery_method === 'pickup' ? '📍 Pickup from Farm' : '🚚 Farmer Delivery'}
                                </p>
                            </div>
                            {order?.delivery_method === 'pickup' ? (
                                <div>
                                    <p className="text-sm text-gray-500">Pickup Date</p>
                                    <p className="font-medium text-gray-900">
                                        {order?.pickup_date ? formatDate(order.pickup_date) : 'Not set'}
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-sm text-gray-500">Delivery Deadline</p>
                                    <p className="font-medium text-gray-900">
                                        {order?.delivery_deadline ? formatDate(order.delivery_deadline) : 'Not set'}
                                    </p>
                                </div>
                            )}
                            {order?.special_instructions && (
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500">Special Instructions</p>
                                    <p className="font-medium text-gray-900">
                                        {order.special_instructions}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Buyer Information (for farmers) */}
                    {(isFarmer || isAdmin) && buyer && (
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Buyer Information</h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-lg font-medium text-gray-600">
                                        {buyer?.name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">
                                            {buyer?.name || 'Unknown Buyer'}
                                        </p>
                                        {buyer?.email && (
                                            <p className="text-sm text-gray-500">
                                                📧 {buyer.email}
                                            </p>
                                        )}
                                        {buyer?.location && (
                                            <p className="text-sm text-gray-500">
                                                📍 {buyer.location}
                                            </p>
                                        )}
                                        {buyer?.phone && (
                                            <p className="text-sm text-gray-500">
                                                📞 {buyer.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Farmer Information (for buyers) */}
                    {(isBuyer || isAdmin) && farmer && (
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Farmer Information</h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-lg font-medium text-gray-600">
                                        {farmer?.name?.[0]?.toUpperCase() || 'F'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">
                                            {farmer?.name || 'Unknown Farmer'}
                                        </p>
                                        {farmer?.location && (
                                            <p className="text-sm text-gray-500">
                                                📍 {farmer.location}
                                            </p>
                                        )}
                                        {farmer?.phone && (
                                            <p className="text-sm text-gray-500">
                                                📞 {farmer.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t">
                        <Button variant="secondary" onClick={() => navigate('/app/orders')}>
                            Back to Orders
                        </Button>
                        {isFarmer && order?.status === 'pending' && (
                            <Button 
                                variant="primary"
                                onClick={() => openConfirmModal('confirm')}
                                isLoading={loadingAction}
                            >
                                Confirm Order
                            </Button>
                        )}
                        {isFarmer && order?.status === 'confirmed' && (
                            <Button 
                                variant="primary"
                                onClick={() => openConfirmModal('ship')}
                                isLoading={loadingAction}
                            >
                                Mark as Shipped
                            </Button>
                        )}
                        {isFarmer && order?.status === 'shipped' && (
                            <Button 
                                variant="primary"
                                onClick={() => openConfirmModal('deliver')}
                                isLoading={loadingAction}
                            >
                                Mark as Delivered
                            </Button>
                        )}
                        {isBuyer && order?.status === 'pending' && (
                            <Button 
                                variant="danger"
                                onClick={() => openConfirmModal('cancel')}
                                isLoading={loadingAction}
                            >
                                Cancel Order
                            </Button>
                        )}
                        {isBuyer && order?.status === 'delivered' && !order?.review && (
                            <Link to={`/app/orders/${orderId}/review`}>
                                <Button variant="outline" className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200">
                                    ⭐ Write Review
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl max-w-md w-full shadow-xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Confirm Action</h2>
                            <button
                                onClick={closeConfirmModal}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex flex-col items-center text-center mb-6">
                                <div className={`w-16 h-16 ${confirmationContent.iconBg} rounded-full flex items-center justify-center text-3xl mb-4`}>
                                    {confirmationContent.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {confirmationContent.title}
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {confirmationContent.message}
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={closeConfirmModal}
                                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition border-none cursor-pointer"
                                    disabled={loadingAction}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmAction}
                                    disabled={loadingAction}
                                    className={`flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-lg transition border-none cursor-pointer ${confirmationContent.confirmColor} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                                >
                                    {loadingAction ? (
                                        <>
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                            </svg>
                                            Processing...
                                        </>
                                    ) : (
                                        confirmationContent.confirmText
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDetailsPage;