// src/components/farmer/ProductCard.jsx
import { getImageUrl } from '../../utils/imageUtils';

export const ProductCard = ({ product, onView, onDelete, onStatusUpdate, loadingAction, getStatusBadge }) => {
    const status = getStatusBadge(product);
    const isExpired = product.expiry_date && new Date(product.expiry_date) < new Date();

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition-all group">
            <div className="relative h-36 bg-slate-100">
                {product.photos?.length > 0 ? (
                    <img 
                        src={getImageUrl(product.photos[0])} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        loading="lazy" 
                        onError={(e) => { e.target.style.display = 'none'; }} 
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🌾</div>
                )}
                <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${status.color}`}>
                    {status.label}
                </span>
                {isExpired && (
                    <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white uppercase tracking-wide">
                        Expired
                    </span>
                )}
            </div>
            <div className="p-3">
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mb-0.5">
                    {product.category}
                </p>
                <h3 className="text-sm font-bold text-slate-900 truncate mb-1 group-hover:text-green-700 transition-colors">
                    {product.name}
                </h3>
                <p className="text-xs text-slate-400 mb-3">
                    {product.quantity} {product.unit} · {product.orders_count || 0} orders
                </p>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-slate-900">
                        {product.price_formatted || `GMD ${product.price}`}
                    </span>
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={() => {
                                console.log('👁️ [ProductCard] View clicked for:', product.id);
                                onView();
                            }} 
                            className="w-7 h-7 flex items-center justify-center text-xs bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition cursor-pointer" 
                            title="View details"
                        >
                            👁️
                        </button>
                        {!isExpired && (
                            product.status === 'active' ? (
                                <button 
                                    onClick={() => {
                                        console.log('🔄 [ProductCard] Marking as sold out:', product.id);
                                        onStatusUpdate(product.id, 'sold');
                                    }} 
                                    disabled={loadingAction} 
                                    className="px-2 py-1 text-[10px] font-bold text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition cursor-pointer disabled:opacity-50"
                                >
                                    Out
                                </button>
                            ) : (
                                <button 
                                    onClick={() => {
                                        console.log('🔄 [ProductCard] Making active:', product.id);
                                        onStatusUpdate(product.id, 'active');
                                    }} 
                                    disabled={loadingAction} 
                                    className="px-2 py-1 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition cursor-pointer disabled:opacity-50"
                                >
                                    Live
                                </button>
                            )
                        )}
                        <button 
                            onClick={() => {
                                console.log('🗑️ [ProductCard] Delete clicked for:', product.id);
                                onDelete();
                            }} 
                            className="w-7 h-7 flex items-center justify-center text-xs bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition cursor-pointer" 
                            title="Delete"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};