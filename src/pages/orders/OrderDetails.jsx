// src/pages/orders/OrderDetails.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';
import { Modal } from '../../components/Modal';
import ReviewStars from '../../components/ReviewStars';
import { OrderStatusBadge } from './OrderStatusBadge';

export const OrderDetails = ({
    order,
    isFarmer,
    isBuyer,
    onClose,
    onStatusUpdate,
    onCancelOrder,
    loadingAction
}) => {
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);

    if (!order) return null;

    // Safely access all properties with fallbacks
    const orderId = order?.id || 0;
    const status = order?.status || 'pending';
    const quantity = order?.quantity || 0;
    const totalPrice = order?.total_price || 0;
    const totalPriceFormatted = order?.total_price_formatted || `GMD ${totalPrice}`;
    const orderDate = order?.order_date || order?.created_at || new Date().toISOString();
    const deliveryMethod = order?.delivery_method || 'delivery';
    const pickupDate = order?.pickup_date || null;
    const deliveryDeadline = order?.delivery_deadline || null;
    const deliveryAddress = order?.delivery_address || null;
    const specialInstructions = order?.special_instructions || '';

    // Safely access product properties
    const product = order?.product || {};
    const productName = product?.name || 'Unknown Product';
    const productCategory = product?.category || '';
    const productUnit = product?.unit || '';
    const productPrice = product?.price || 0;
    const productPriceFormatted = product?.price_formatted || `GMD ${productPrice}`;
    const productPhotos = product?.photos || [];
    const productFarmer = product?.farmer || {};

    // Safely access farmer properties
    const farmerName = productFarmer?.name || 'Unknown Farmer';
    const farmerLocation = productFarmer?.location || '';
    const farmerPhone = productFarmer?.phone || '';

    // Safely access buyer properties
    const buyer = order?.buyer || {};
    const buyerName = buyer?.name || 'Unknown Buyer';
    const buyerEmail = buyer?.email || '';
    const buyerLocation = buyer?.location || '';
    const buyerPhone = buyer?.phone || '';

    // Safely access review
    const review = order?.review || null;

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

    const handleActionClick = (action) => {
        setConfirmAction(action);
        setShowConfirmModal(true);
    };

    const handleConfirmAction = () => {
        if (confirmAction === 'cancel') {
            onCancelOrder(orderId);
        }
        setShowConfirmModal(false);
        setConfirmAction(null);
        onClose();
    };

    const handleCancel = () => {
        setShowConfirmModal(false);
        setConfirmAction(null);
    };

    // Get confirmation message based on action
    const getConfirmationMessage = () => {
        if (confirmAction === 'cancel') {
            return {
                title: 'Cancel Order',
                message: 'Are you sure you want to cancel this order? This action cannot be undone.',
                icon: '❌',
                confirmText: 'Yes, Cancel Order',
                confirmColor: 'bg-red-600 hover:bg-red-700'
            };
        }
        return {
            title: 'Confirm Action',
            message: 'Are you sure you want to proceed?',
            icon: '⚠️',
            confirmText: 'Confirm',
            confirmColor: 'bg-green-600 hover:bg-green-700'
        };
    };

    const confirmData = getConfirmationMessage();

    return (
        <>
            {/* Main Modal */}
            <Modal isOpen onClose={onClose} title={`Order Details #${orderId}`} maxWidth="max-w-2xl">
                    <div className="p-6 space-y-6">
                        {/* Order Status */}
                        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center">
                                <span className="text-2xl mr-3">
                                    {getStatusIcon(status)}
                                </span>
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Order Status</p>
                                    <div className="mt-1">
                                        <OrderStatusBadge status={status} />
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Order Date</p>
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    {formatDate(orderDate)}
                                </p>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Order Items</h3>
                            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                {/* Table presentation — sm and up */}
                                <div className="hidden sm:grid bg-slate-50 dark:bg-slate-900 px-4 py-2 grid-cols-12 gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    <div className="col-span-5">Product</div>
                                    <div className="col-span-2">Quantity</div>
                                    <div className="col-span-2">Unit Price</div>
                                    <div className="col-span-3 text-right">Total</div>
                                </div>
                                <div className="hidden sm:grid px-4 py-3 grid-cols-12 gap-2 items-center hover:bg-slate-50 dark:hover:bg-slate-900">
                                    <div className="col-span-5 min-w-0">
                                        <div className="flex items-center min-w-0">
                                            <ImageWithFallback
                                                src={productPhotos[0]}
                                                alt={productName}
                                                className="w-12 h-12 rounded-lg object-cover mr-3 flex-shrink-0"
                                            />
                                            <div className="min-w-0">
                                                <p className="font-medium text-slate-900 dark:text-slate-100 break-words">
                                                    {productName}
                                                </p>
                                                {productCategory && (
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 break-words">
                                                        {productCategory}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="font-medium text-slate-900 dark:text-slate-100">
                                            {quantity}
                                        </span>
                                        {productUnit && (
                                            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                                                {productUnit}
                                            </span>
                                        )}
                                    </div>
                                    <div className="col-span-2 break-words">
                                        <span className="text-slate-900 dark:text-slate-100">
                                            {productPriceFormatted}
                                        </span>
                                    </div>
                                    <div className="col-span-3 text-right font-bold text-slate-900 dark:text-slate-100 break-words">
                                        {totalPriceFormatted}
                                    </div>
                                </div>

                                {/* Stacked card — below sm, where a 12-col grid has no room */}
                                <div className="sm:hidden p-4">
                                    <div className="flex items-start gap-3 min-w-0">
                                        <ImageWithFallback
                                            src={productPhotos[0]}
                                            alt={productName}
                                            className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-slate-900 dark:text-slate-100 break-words">{productName}</p>
                                            {productCategory && (
                                                <p className="text-xs text-slate-500 dark:text-slate-400 break-words">{productCategory}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-1.5 text-sm">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-slate-500 dark:text-slate-400">Quantity</span>
                                            <span className="font-medium text-slate-900 dark:text-slate-100 text-right break-words">
                                                {quantity} {productUnit}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-slate-500 dark:text-slate-400">Unit Price</span>
                                            <span className="font-medium text-slate-900 dark:text-slate-100 text-right break-words">
                                                {productPriceFormatted}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-slate-500 dark:text-slate-400">Total</span>
                                            <span className="font-bold text-slate-900 dark:text-slate-100 text-right break-words">
                                                {totalPriceFormatted}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Details */}
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Delivery Details</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                                <div className="min-w-0">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Delivery Method</p>
                                    <p className="font-medium text-slate-900 dark:text-slate-100 capitalize break-words">
                                        {deliveryMethod === 'pickup' ? '📍 Pickup from Farm' : '🚚 Farmer Delivery'}
                                    </p>
                                </div>
                                {deliveryMethod === 'pickup' ? (
                                    <div className="min-w-0">
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Pickup Date</p>
                                        <p className="font-medium text-slate-900 dark:text-slate-100 break-words">
                                            {pickupDate ? formatDate(pickupDate) : 'Not set'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="min-w-0">
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Delivery Deadline</p>
                                        <p className="font-medium text-slate-900 dark:text-slate-100 break-words">
                                            {deliveryDeadline ? formatDate(deliveryDeadline) : 'Not set'}
                                        </p>
                                    </div>
                                )}
                                {deliveryMethod !== 'pickup' && deliveryAddress && (
                                    <div className="sm:col-span-2 min-w-0">
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Delivery Address</p>
                                        <p className="font-medium text-slate-900 dark:text-slate-100 break-words">
                                            {deliveryAddress}
                                        </p>
                                    </div>
                                )}
                                {specialInstructions && (
                                    <div className="sm:col-span-2 min-w-0">
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Special Instructions</p>
                                        <p className="font-medium text-slate-900 dark:text-slate-100 break-words">
                                            {specialInstructions}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Buyer/Farmer Info */}
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                                {isFarmer ? 'Buyer Information' : 'Farmer Information'}
                            </h3>
                            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                                {isFarmer ? (
                                    <div className="flex items-center min-w-0">
                                        <div className="w-12 h-12 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-lg font-medium text-slate-600 dark:text-slate-300 flex-shrink-0">
                                            {buyerName?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <div className="ml-3 min-w-0">
                                            <p className="font-medium text-slate-900 dark:text-slate-100 break-words">
                                                {buyerName}
                                            </p>
                                            {buyerEmail && (
                                                <p className="text-sm text-slate-500 dark:text-slate-400 break-words">
                                                    📧 {buyerEmail}
                                                </p>
                                            )}
                                            {buyerLocation && (
                                                <p className="text-sm text-slate-500 dark:text-slate-400 break-words">
                                                    📍 {buyerLocation}
                                                </p>
                                            )}
                                            {buyerPhone && (
                                                <p className="text-sm text-slate-500 dark:text-slate-400 break-words">
                                                    📞 {buyerPhone}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center min-w-0">
                                        <div className="w-12 h-12 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-lg font-medium text-slate-600 dark:text-slate-300 flex-shrink-0">
                                            {farmerName?.[0]?.toUpperCase() || 'F'}
                                        </div>
                                        <div className="ml-3 min-w-0">
                                            <p className="font-medium text-slate-900 dark:text-slate-100 break-words">
                                                {farmerName}
                                            </p>
                                            {farmerLocation && (
                                                <p className="text-sm text-slate-500 dark:text-slate-400 break-words">
                                                    📍 {farmerLocation}
                                                </p>
                                            )}
                                            {farmerPhone && (
                                                <p className="text-sm text-slate-500 dark:text-slate-400 break-words">
                                                    📞 {farmerPhone}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Review Section */}
                        {review && (
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Your Review</h3>
                                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="flex items-center space-x-2">
                                                <ReviewStars rating={review.rating} size="md" />
                                                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                    {review.rating}.0
                                                </span>
                                            </div>
                                            {review.comment && (
                                                <p className="mt-2 text-slate-700 dark:text-slate-300 text-sm break-words">
                                                    "{review.comment}"
                                                </p>
                                            )}
                                            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                                Reviewed on {formatDate(review.created_at)}
                                            </p>
                                        </div>
                                        <span className="text-2xl">⭐</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <Button variant="secondary" onClick={onClose}>
                                Close
                            </Button>
                            {isFarmer && status === 'pending' && (
                                <Button
                                    variant="primary"
                                    onClick={() => {
                                        onStatusUpdate(orderId, 'confirmed');
                                        onClose();
                                    }}
                                    isLoading={loadingAction}
                                >
                                    Confirm Order
                                </Button>
                            )}
                            {isFarmer && status === 'confirmed' && (
                                <Button
                                    variant="primary"
                                    onClick={() => {
                                        onStatusUpdate(orderId, 'shipped');
                                        onClose();
                                    }}
                                    isLoading={loadingAction}
                                >
                                    Mark as Shipped
                                </Button>
                            )}
                            {isFarmer && status === 'shipped' && (
                                <Button
                                    variant="primary"
                                    onClick={() => {
                                        onStatusUpdate(orderId, 'delivered');
                                        onClose();
                                    }}
                                    isLoading={loadingAction}
                                >
                                    Mark as Delivered
                                </Button>
                            )}
                            {isBuyer && status === 'pending' && (
                                <Button
                                    variant="danger"
                                    onClick={() => handleActionClick('cancel')}
                                    isLoading={loadingAction}
                                >
                                    Cancel Order
                                </Button>
                            )}
                            {isBuyer && status === 'delivered' && !review && (
                                <Link to={`/app/orders/${orderId}/review`}>
                                    <Button variant="outline" className="bg-green-50 dark:bg-green-900/40 text-green-600 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/60 border-green-200 dark:border-green-800">
                                        ⭐ Write Review
                                    </Button>
                                </Link>
                            )}
                            {isBuyer && status === 'delivered' && review && (
                                <div className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center">
                                    ✅ Review submitted
                                </div>
                            )}
                        </div>
                    </div>
            </Modal>

            {/* Confirmation Modal — stacked above the details modal, so it uses a
                higher z-index the same way the original z-[60] overlay did. */}
            <Modal isOpen={showConfirmModal} onClose={handleCancel} maxWidth="max-w-md" zIndex="z-[60]">
                <div className="p-6">
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center text-3xl">
                            {confirmData.icon}
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 text-center mb-2">
                        {confirmData.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
                        {confirmData.message}
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={handleCancel}
                            className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition border-none cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmAction}
                            className={`flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-lg transition border-none cursor-pointer ${confirmData.confirmColor}`}
                        >
                            {confirmData.confirmText}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};
