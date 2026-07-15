// src/components/farmer/ProductModal.jsx
import { getImageUrl } from '../../utils/imageUtils';

export const ProductModal = ({ 
    show, 
    product, 
    action, 
    loadingAction, 
    onClose, 
    onDelete, 
    onStatusUpdate 
}) => {
    if (!show || !product) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <h2 className="text-sm font-bold text-slate-900">
                        {action === 'delete' ? 'Delete product' : 'Product details'}
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition border-none cursor-pointer text-sm"
                    >
                        ×
                    </button>
                </div>
                <div className="p-5">
                    {action === 'delete' ? (
                        <DeleteProductContent 
                            product={product} 
                            loadingAction={loadingAction} 
                            onClose={onClose} 
                            onDelete={onDelete} 
                        />
                    ) : (
                        <ViewProductContent 
                            product={product} 
                            loadingAction={loadingAction} 
                            onClose={onClose} 
                            onStatusUpdate={onStatusUpdate} 
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

// Delete Product Content
const DeleteProductContent = ({ product, loadingAction, onClose, onDelete }) => (
    <div className="space-y-4">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-slate-100 flex-shrink-0 flex items-center justify-center text-xl">
                {product.photos?.[0] ? 
                    <img src={getImageUrl(product.photos[0])} alt="" className="w-full h-full object-cover" /> : 
                    '🌾'
                }
            </div>
            <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{product.name}</p>
                <p className="text-xs text-slate-400">{product.category}</p>
            </div>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-3">
            <p className="text-sm text-red-800">Are you sure you want to delete this product? This action cannot be undone.</p>
        </div>
        <div className="flex justify-end gap-2 pt-1">
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition border-none cursor-pointer">
                Cancel
            </button>
            <button 
                onClick={onDelete} 
                disabled={loadingAction} 
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition border-none cursor-pointer"
            >
                {loadingAction ? 'Deleting...' : 'Delete product'}
            </button>
        </div>
    </div>
);

// View Product Content
const ViewProductContent = ({ product, loadingAction, onClose, onStatusUpdate }) => (
    <div className="space-y-4">
        {product.photos?.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
                {product.photos.map((photo, i) => (
                    <img 
                        key={i} 
                        src={getImageUrl(photo)} 
                        alt="" 
                        className="w-20 h-20 object-cover rounded-xl border border-slate-100 flex-shrink-0 bg-slate-50" 
                    />
                ))}
            </div>
        )}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
            {[
                { label: 'Name', value: product.name },
                { label: 'Category', value: product.category },
                { label: 'Price', value: product.price_formatted || `GMD ${product.price}` },
                { label: 'Stock', value: `${product.quantity} ${product.unit}` },
            ].map((d, i) => (
                <div key={i}>
                    <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
                        {d.label}
                    </span>
                    <span className={`text-sm font-bold ${d.label === 'Price' ? 'text-green-600' : 'text-slate-900'}`}>
                        {d.value}
                    </span>
                </div>
            ))}
        </div>
        {product.description && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                    Description
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">{product.description}</p>
            </div>
        )}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition border-none cursor-pointer">
                Close
            </button>
            {product.status === 'active' ? (
                <button 
                    onClick={() => { 
                        console.log('🔄 [ProductModal] Marking as sold out');
                        onStatusUpdate(product.id, 'sold'); 
                        onClose(); 
                    }} 
                    className="px-4 py-2 text-sm font-semibold text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition cursor-pointer"
                >
                    Mark as sold out
                </button>
            ) : (
                <button 
                    onClick={() => { 
                        console.log('🔄 [ProductModal] Making active');
                        onStatusUpdate(product.id, 'active'); 
                        onClose(); 
                    }} 
                    className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition border-none cursor-pointer"
                >
                    Make active
                </button>
            )}
        </div>
    </div>
);