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
    // Safely access all properties with fallbacks
    const orderId = order?.id || 0;
    const status = order?.status || 'pending';
    const quantity = order?.quantity || 0;
    const totalPrice = order?.total_price || 0;
    const totalPriceFormatted = order?.total_price_formatted || `GMD ${totalPrice}`;
    const orderDate = order?.order_date || order?.created_at || new Date().toISOString();
    
    // Safely access nested product properties
    const productName = order?.product?.name || 'Unknown Product';
    const productUnit = order?.product?.unit || '';
    const productFarmerName = order?.product?.farmer?.name || 'Unknown Farmer';
    const productFarmerLocation = order?.product?.farmer?.location || '';
    
    // Safely access nested buyer properties
    const buyerName = order?.buyer?.name || 'Unknown Buyer';
    const buyerEmail = order?.buyer?.email || '';
    const buyerLocation = order?.buyer?.location || '';
    
    // Safely access special instructions
    const specialInstructions = order?.special_instructions || '';

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
        <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
            <div className="flex flex-wrap items-start justify-between gap-4">
                {/* Left: Order Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-semibold text-slate-900">
                            Order #{orderId}
                        </span>
                        <OrderStatusBadge status={status} />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div className="min-w-0">
                            <span className="text-slate-500">Product:</span>
                            <span className="ml-1 font-medium text-slate-900 break-words">
                                {productName}
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-500">Quantity:</span>
                            <span className="ml-1 font-medium text-slate-900">
                                {quantity} {productUnit}
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-500">Total:</span>
                            <span className="ml-1 font-medium text-slate-900">
                                {totalPriceFormatted}
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-500">Date:</span>
                            <span className="ml-1 text-slate-600">
                                {formatDate(orderDate)}
                            </span>
                        </div>
                        {isFarmer && buyerName && (
                            <div className="sm:col-span-2 min-w-0">
                                <span className="text-slate-500">Buyer:</span>
                                <span className="ml-1 font-medium text-slate-900 break-words">
                                    {buyerName}
                                </span>
                                {buyerEmail && (
                                    <span className="ml-2 text-slate-500 text-xs break-words">
                                        {buyerEmail}
                                    </span>
                                )}
                                {buyerLocation && (
                                    <span className="ml-2 text-slate-500 text-xs break-words">
                                        📍 {buyerLocation}
                                    </span>
                                )}
                            </div>
                        )}
                        {isBuyer && productFarmerName && (
                            <div className="sm:col-span-2 min-w-0">
                                <span className="text-slate-500">Farmer:</span>
                                <span className="ml-1 font-medium text-slate-900 break-words">
                                    {productFarmerName}
                                </span>
                                {productFarmerLocation && (
                                    <span className="ml-2 text-slate-500 text-xs break-words">
                                        📍 {productFarmerLocation}
                                    </span>
                                )}
                            </div>
                        )}
                        {specialInstructions && (
                            <div className="sm:col-span-2 min-w-0">
                                <span className="text-slate-500">Instructions:</span>
                                <span className="ml-1 text-slate-600 italic break-words">
                                    {specialInstructions}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => onViewDetails(orderId)}
                        className="px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                        View Details
                    </button>

                    {isFarmer && status === 'pending' && (
                        <button
                            onClick={() => onStatusUpdate(orderId, 'confirmed')}
                            className="px-3 py-1.5 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                            disabled={loadingAction}
                        >
                            Confirm
                        </button>
                    )}
                    {isFarmer && status === 'confirmed' && (
                        <button
                            onClick={() => onStatusUpdate(orderId, 'shipped')}
                            className="px-3 py-1.5 text-sm bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                            disabled={loadingAction}
                        >
                            Ship
                        </button>
                    )}
                    {isFarmer && status === 'shipped' && (
                        <button
                            onClick={() => onStatusUpdate(orderId, 'delivered')}
                            className="px-3 py-1.5 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                            disabled={loadingAction}
                        >
                            Deliver
                        </button>
                    )}

                    {!isFarmer && status === 'pending' && (
                        <button
                            onClick={() => onCancelOrder(orderId)}
                            className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
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