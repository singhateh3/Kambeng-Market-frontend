// src/pages/orders/OrderDetails.jsx
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-900">
                        Order Details #{order.id}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Order Status */}
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center">
                            <span className="text-2xl mr-3">
                                {getStatusIcon(order.status)}
                            </span>
                            <div>
                                <p className="text-sm text-gray-500">Order Status</p>
                                <div className="mt-1">
                                    <OrderStatusBadge status={order.status} />
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Order Date</p>
                            <p className="text-sm font-medium text-gray-900">
                                {order.order_date 
                                    ? new Date(order.order_date).toLocaleString() 
                                    : '-'}
                            </p>
                        </div>
                    </div>

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
                            <div className="px-4 py-3 grid grid-cols-12 gap-2 items-center">
                                <div className="col-span-5">
                                    <div className="flex items-center">
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
                                    </div>
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
                        <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                            <div>
                                <p className="text-sm text-gray-500">Delivery Method</p>
                                <p className="font-medium text-gray-900 capitalize">
                                    {order.delivery_method === 'pickup' ? '📍 Pickup' : '🚚 Farmer Delivery'}
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

                    {/* Buyer/Farmer Info */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3">
                            {isFarmer ? 'Buyer Information' : 'Farmer Information'}
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                            {isFarmer ? (
                                <div className="flex items-center">
                                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-lg font-medium text-gray-600">
                                        {order.buyer?.name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="ml-3">
                                        <p className="font-medium text-gray-900">
                                            {order.buyer?.name || 'Unknown'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {order.buyer?.email || ''}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            📍 {order.buyer?.location || 'Location not provided'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            📞 {order.buyer?.phone || 'Phone not provided'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-lg font-medium text-gray-600">
                                        {order.product?.farmer?.name?.[0]?.toUpperCase() || 'F'}
                                    </div>
                                    <div className="ml-3">
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
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t">
                        <Button variant="secondary" onClick={onClose}>
                            Close
                        </Button>
                        {isFarmer && order.status === 'pending' && (
                            <Button 
                                variant="primary"
                                onClick={() => {
                                    onStatusUpdate(order.id, 'confirmed');
                                    onClose();
                                }}
                                isLoading={loadingAction}
                            >
                                Confirm Order
                            </Button>
                        )}
                        {isFarmer && order.status === 'confirmed' && (
                            <Button 
                                variant="primary"
                                onClick={() => {
                                    onStatusUpdate(order.id, 'shipped');
                                    onClose();
                                }}
                                isLoading={loadingAction}
                            >
                                Mark as Shipped
                            </Button>
                        )}
                        {isFarmer && order.status === 'shipped' && (
                            <Button 
                                variant="primary"
                                onClick={() => {
                                    onStatusUpdate(order.id, 'delivered');
                                    onClose();
                                }}
                                isLoading={loadingAction}
                            >
                                Mark as Delivered
                            </Button>
                        )}
                        {isBuyer && order.status === 'pending' && (
                            <Button 
                                variant="danger"
                                onClick={() => {
                                    onCancelOrder(order.id);
                                    onClose();
                                }}
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
        </div>
    );
};