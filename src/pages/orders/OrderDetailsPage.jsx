// src/pages/orders/OrderDetailsPage.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert } from '../../components/common/Alert';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

export const OrderDetailsPage = () => {
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
    const [confirmData, setConfirmData] = useState(null);

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/orders/${orderId}`);
            setOrder(response.data.data);
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
            setConfirmData(null);
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
            setConfirmData(null);
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

    const openConfirmModal = (action, data) => {
        setConfirmAction(action);
        setConfirmData(data);
        setShowConfirmModal(true);
    };

    const closeConfirmModal = () => {
        setShowConfirmModal(false);
        setConfirmAction(null);
        setConfirmData(null);
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

    const isFarmer = user?.role === 'farmer';
    const isBuyer = user?.role === 'buyer';
    const isAdmin = user?.role === 'admin';

    // Check if user can view this order
    const canViewOrder = () => {
        if (!order) return false;
        if (isAdmin) return true;
        if (isFarmer && order.product?.farmer_id === user?.id) return true;
        if (isBuyer && order.buyer_id === user?.id) return true;
        return false;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!canViewOrder()) {
        return (
            <div className="bg-white shadow rounded-lg p-12 text-center">
                <div className="text-6xl mb-4">🔒</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h3>
                <p className="text-gray-500">You don't have permission to view this order.</p>
                <Button className="mt-4" onClick={() => navigate('/orders')}>
                    Back to Orders
                </Button>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="bg-white shadow rounded-lg p-12 text-center">
                <div className="text-6xl mb-4">❌</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h3>
                <p className="text-gray-500">The order you're looking for doesn't exist.</p>
                <Button className="mt-4" onClick={() => navigate('/orders')}>
                    Back to Orders
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow rounded-lg overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <button
                                onClick={() => navigate(-1)}
                                className="text-gray-600 hover:text-gray-900 flex items-center mb-2"
                            >
                                ← Back
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Order #{order.id}
                            </h1>
                            <p className="text-sm text-gray-500">
                                Placed on {new Date(order.order_date).toLocaleString()}
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)} {getStatusLabel(order.status)}
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
                                    <Link to={`/products/${order.product_id}`} className="flex items-center hover:text-primary-600">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                                            {order.product?.photos && order.product.photos.length > 0 ? (
                                                <img 
                                                    src={order.product.photos[0]} 
                                                    alt={order.product.name} 
                                                    className="w-12 h-12 object-cover rounded-lg"
                                                />
                                            ) : (
                                                <span className="text-2xl">🌾</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {order.product?.name || 'Unknown Product'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {order.product?.category || ''}
                                            </p>
                                        </div>
                                    </Link>
                                </div>
                                <div className="col-span-2">
                                    <span className="font-medium text-gray-900">
                                        {order.quantity}
                                    </span>
                                    <span className="text-xs text-gray-500 ml-1">
                                        {order.product?.unit || ''}
                                    </span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-gray-900">
                                        {order.product?.price_formatted || `GMD ${order.product?.price}`}
                                    </span>
                                </div>
                                <div className="col-span-3 text-right font-bold text-gray-900">
                                    {order.total_price_formatted || `GMD ${order.total_price}`}
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
                                    {order.delivery_method === 'pickup' ? '📍 Pickup from Farm' : '🚚 Farmer Delivery'}
                                </p>
                            </div>
                            {order.delivery_method === 'pickup' ? (
                                <div>
                                    <p className="text-sm text-gray-500">Pickup Date</p>
                                    <p className="font-medium text-gray-900">
                                        {order.pickup_date 
                                            ? new Date(order.pickup_date).toLocaleDateString() 
                                            : 'Not set'}
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-sm text-gray-500">Delivery Deadline</p>
                                    <p className="font-medium text-gray-900">
                                        {order.delivery_deadline 
                                            ? new Date(order.delivery_deadline).toLocaleDateString() 
                                            : 'Not set'}
                                    </p>
                                </div>
                            )}
                            {order.special_instructions && (
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
                    {(isFarmer || isAdmin) && (
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Buyer Information</h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-lg font-medium text-gray-600">
                                        {order.buyer?.name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">
                                            {order.buyer?.name || 'Unknown Buyer'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            📧 {order.buyer?.email || 'Email not provided'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            📍 {order.buyer?.location || 'Location not provided'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            📞 {order.buyer?.phone || 'Phone not provided'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Farmer Information (for buyers) */}
                    {(isBuyer || isAdmin) && (
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Farmer Information</h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-lg font-medium text-gray-600">
                                        {order.product?.farmer?.name?.[0]?.toUpperCase() || 'F'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">
                                            {order.product?.farmer?.name || 'Unknown Farmer'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            📍 {order.product?.farmer?.location || 'Location not provided'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            📞 {order.product?.farmer?.phone || 'Phone not provided'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t">
                        <Button variant="secondary" onClick={() => navigate('/orders')}>
                            Back to Orders
                        </Button>
                        {isFarmer && order.status === 'pending' && (
                            <Button 
                                variant="primary"
                                onClick={() => openConfirmModal('confirm')}
                                isLoading={loadingAction}
                            >
                                Confirm Order
                            </Button>
                        )}
                        {isFarmer && order.status === 'confirmed' && (
                            <Button 
                                variant="primary"
                                onClick={() => openConfirmModal('ship')}
                                isLoading={loadingAction}
                            >
                                Mark as Shipped
                            </Button>
                        )}
                        {isFarmer && order.status === 'shipped' && (
                            <Button 
                                variant="primary"
                                onClick={() => openConfirmModal('deliver')}
                                isLoading={loadingAction}
                            >
                                Mark as Delivered
                            </Button>
                        )}
                        {isBuyer && order.status === 'pending' && (
                            <Button 
                                variant="danger"
                                onClick={() => openConfirmModal('cancel')}
                                isLoading={loadingAction}
                            >
                                Cancel Order
                            </Button>
                        )}
                        {isBuyer && order.status === 'delivered' && !order.review && (
                            <Link to={`/orders/${order.id}/review`}>
                                <Button variant="outline">
                                    Write Review
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-900">Confirm Action</h2>
                            <button
                                onClick={closeConfirmModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="mb-4">
                                {confirmAction === 'confirm' && (
                                    <>
                                        <div className="flex items-center justify-center mb-4">
                                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl">
                                                ✅
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                                            Confirm Order
                                        </h3>
                                        <p className="text-gray-600 text-center">
                                            Are you sure you want to confirm this order?
                                        </p>
                                    </>
                                )}
                                {confirmAction === 'ship' && (
                                    <>
                                        <div className="flex items-center justify-center mb-4">
                                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-3xl">
                                                🚚
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                                            Mark as Shipped
                                        </h3>
                                        <p className="text-gray-600 text-center">
                                            Are you sure you want to mark this order as shipped?
                                        </p>
                                    </>
                                )}
                                {confirmAction === 'deliver' && (
                                    <>
                                        <div className="flex items-center justify-center mb-4">
                                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl">
                                                📦
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                                            Mark as Delivered
                                        </h3>
                                        <p className="text-gray-600 text-center">
                                            Are you sure you want to mark this order as delivered?
                                        </p>
                                    </>
                                )}
                                {confirmAction === 'cancel' && (
                                    <>
                                        <div className="flex items-center justify-center mb-4">
                                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-3xl">
                                                ❌
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                                            Cancel Order
                                        </h3>
                                        <p className="text-gray-600 text-center">
                                            Are you sure you want to cancel this order? This action cannot be undone.
                                        </p>
                                    </>
                                )}
                            </div>

                            <div className="flex justify-end space-x-4">
                                <Button variant="secondary" onClick={closeConfirmModal}>
                                    Cancel
                                </Button>
                                <Button 
                                    variant={confirmAction === 'cancel' ? 'danger' : 'primary'}
                                    onClick={handleConfirmAction}
                                    isLoading={loadingAction}
                                    disabled={loadingAction}
                                >
                                    {confirmAction === 'confirm' ? 'Confirm Order' : 
                                     confirmAction === 'ship' ? 'Mark as Shipped' : 
                                     confirmAction === 'deliver' ? 'Mark as Delivered' : 
                                     'Cancel Order'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};