// src/pages/orders/OrderCard.jsx
import { OrderStatusBadge } from './OrderStatusBadge';

export const OrderCard = ({ 
    order, 
    isFarmer, 
    isBuyer, 
    onViewDetails, 
    onStatusUpdate, 
    onCancelOrder,
    loadingAction 
}) => {
    return (
        <div className="bg-white shadow rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex flex-wrap items-start justify-between gap-4">
                {/* Left: Order Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-semibold text-gray-900">
                            Order #{order.id}
                        </span>
                        <OrderStatusBadge status={order.status} />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div>
                            <span className="text-gray-500">Product:</span>
                            <span className="ml-1 font-medium text-gray-900">
                                {order.product?.name || 'Unknown'}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500">Quantity:</span>
                            <span className="ml-1 font-medium text-gray-900">
                                {order.quantity} {order.product?.unit || ''}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500">Total:</span>
                            <span className="ml-1 font-medium text-gray-900">
                                {order.total_price_formatted || `GMD ${order.total_price}`}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500">Date:</span>
                            <span className="ml-1 text-gray-600">
                                {order.order_date 
                                    ? new Date(order.order_date).toLocaleDateString() 
                                    : '-'}
                            </span>
                        </div>
                        {isFarmer && order.buyer && (
                            <div className="sm:col-span-2">
                                <span className="text-gray-500">Buyer:</span>
                                <span className="ml-1 font-medium text-gray-900">
                                    {order.buyer.name}
                                </span>
                                <span className="ml-2 text-gray-500 text-xs">
                                    {order.buyer.email}
                                </span>
                            </div>
                        )}
                        {isBuyer && order.product?.farmer && (
                            <div className="sm:col-span-2">
                                <span className="text-gray-500">Farmer:</span>
                                <span className="ml-1 font-medium text-gray-900">
                                    {order.product.farmer.name}
                                </span>
                                <span className="ml-2 text-gray-500 text-xs">
                                    {order.product.farmer.location}
                                </span>
                            </div>
                        )}
                        {order.special_instructions && (
                            <div className="sm:col-span-2">
                                <span className="text-gray-500">Instructions:</span>
                                <span className="ml-1 text-gray-600 italic">
                                    {order.special_instructions}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => onViewDetails(order.id)}
                        className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                    >
                        View Details
                    </button>
                    
                    {isFarmer && order.status === 'pending' && (
                        <button
                            onClick={() => onStatusUpdate(order.id, 'confirmed')}
                            className="px-3 py-1.5 text-sm bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                            disabled={loadingAction}
                        >
                            Confirm
                        </button>
                    )}
                    {isFarmer && order.status === 'confirmed' && (
                        <button
                            onClick={() => onStatusUpdate(order.id, 'shipped')}
                            className="px-3 py-1.5 text-sm bg-purple-50 text-purple-600 rounded hover:bg-purple-100 transition-colors"
                            disabled={loadingAction}
                        >
                            Ship
                        </button>
                    )}
                    {isFarmer && order.status === 'shipped' && (
                        <button
                            onClick={() => onStatusUpdate(order.id, 'delivered')}
                            className="px-3 py-1.5 text-sm bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                            disabled={loadingAction}
                        >
                            Deliver
                        </button>
                    )}
                    
                    {!isFarmer && order.status === 'pending' && (
                        <button
                            onClick={() => onCancelOrder(order.id)}
                            className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                            disabled={loadingAction}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};