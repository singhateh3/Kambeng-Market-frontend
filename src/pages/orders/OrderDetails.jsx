// src/pages/orders/OrderDetails.jsx
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { ReviewStars } from '../../components/ReviewStars';
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">
                        Order Details #{orderId}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Order Status */}
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center">
                            <span className="text-2xl mr-3">
                                {getStatusIcon(status)}
                            </span>
                            <div>
                                <p className="text-sm text-gray-500">Order Status</p>
                                <div className="mt-1">
                                    <OrderStatusBadge status={status} />
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Order Date</p>
                            <p className="text-sm font-medium text-gray-900">
                                {formatDate(orderDate)}
                            </p>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2 grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div className="col-span-5">Product</div>
                                <div className="col-span-2">Quantity</div>
                                <div className="col-span-2">Unit Price</div>
                                <div className="col-span-3 text-right">Total</div>
                            </div>
                            <div className="px-4 py-3 grid grid-cols-12 gap-2 items-center hover:bg-gray-50">
                                <div className="col-span-5">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                                            {productPhotos.length > 0 ? (
                                                <img 
                                                    src={productPhotos[0]} 
                                                    alt={productName} 
                                                    className="w-12 h-12 object-cover rounded-lg"
                                                />
                                            ) : (
                                                <span className="text-2xl">🌾</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {productName}
                                            </p>
                                            {productCategory && (
                                                <p className="text-xs text-gray-500">
                                                    {productCategory}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <span className="font-medium text-gray-900">
                                        {quantity}
                                    </span>
                                    {productUnit && (
                                        <span className="text-xs text-gray-500 ml-1">
                                            {productUnit}
                                        </span>
                                    )}
                                </div>
                                <div className="col-span-2">
                                    <span className="text-gray-900">
                                        {productPriceFormatted}
                                    </span>
                                </div>
                                <div className="col-span-3 text-right font-bold text-gray-900">
                                    {totalPriceFormatted}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Details */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Delivery Details</h3>
                        <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <div>
                                <p className="text-sm text-gray-500">Delivery Method</p>
                                <p className="font-medium text-gray-900 capitalize">
                                    {deliveryMethod === 'pickup' ? '📍 Pickup from Farm' : '🚚 Farmer Delivery'}
                                </p>
                            </div>
                            {deliveryMethod === 'pickup' ? (
                                <div>
                                    <p className="text-sm text-gray-500">Pickup Date</p>
                                    <p className="font-medium text-gray-900">
                                        {pickupDate ? formatDate(pickupDate) : 'Not set'}
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-sm text-gray-500">Delivery Deadline</p>
                                    <p className="font-medium text-gray-900">
                                        {deliveryDeadline ? formatDate(deliveryDeadline) : 'Not set'}
                                    </p>
                                </div>
                            )}
                            {specialInstructions && (
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500">Special Instructions</p>
                                    <p className="font-medium text-gray-900">
                                        {specialInstructions}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Buyer/Farmer Info */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3">
                            {isFarmer ? 'Buyer Information' : 'Farmer Information'}
                        </h3>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            {isFarmer ? (
                                <div className="flex items-center">
                                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-lg font-medium text-gray-600">
                                        {buyerName?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="ml-3">
                                        <p className="font-medium text-gray-900">
                                            {buyerName}
                                        </p>
                                        {buyerEmail && (
                                            <p className="text-sm text-gray-500">
                                                📧 {buyerEmail}
                                            </p>
                                        )}
                                        {buyerLocation && (
                                            <p className="text-sm text-gray-500">
                                                📍 {buyerLocation}
                                            </p>
                                        )}
                                        {buyerPhone && (
                                            <p className="text-sm text-gray-500">
                                                📞 {buyerPhone}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-lg font-medium text-gray-600">
                                        {farmerName?.[0]?.toUpperCase() || 'F'}
                                    </div>
                                    <div className="ml-3">
                                        <p className="font-medium text-gray-900">
                                            {farmerName}
                                        </p>
                                        {farmerLocation && (
                                            <p className="text-sm text-gray-500">
                                                📍 {farmerLocation}
                                            </p>
                                        )}
                                        {farmerPhone && (
                                            <p className="text-sm text-gray-500">
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
                            <h3 className="font-semibold text-gray-900 mb-3">Your Review</h3>
                            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <ReviewStars rating={review.rating} size="md" />
                                            <span className="text-sm font-medium text-gray-900">
                                                {review.rating}.0
                                            </span>
                                        </div>
                                        {review.comment && (
                                            <p className="mt-2 text-gray-700 text-sm">
                                                "{review.comment}"
                                            </p>
                                        )}
                                        <p className="mt-1 text-xs text-gray-400">
                                            Reviewed on {formatDate(review.created_at)}
                                        </p>
                                    </div>
                                    <span className="text-2xl">⭐</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
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
                                onClick={() => {
                                    onCancelOrder(orderId);
                                    onClose();
                                }}
                                isLoading={loadingAction}
                            >
                                Cancel Order
                            </Button>
                        )}
                        {isBuyer && status === 'delivered' && !review && (
                            <Link to={`/app/orders/${orderId}/review`}>
                                <Button variant="outline" className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200">
                                    ⭐ Write Review
                                </Button>
                            </Link>
                        )}
                        {isBuyer && status === 'delivered' && review && (
                            <div className="text-sm text-green-600 font-medium flex items-center">
                                ✅ Review submitted
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};