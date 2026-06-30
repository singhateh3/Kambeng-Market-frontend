// src/pages/buyer/PlaceOrder.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

// Enhanced Skeleton with more detail
const PlaceOrderSkeleton = () => (
    <div className="bg-slate-50 min-h-screen">
        <div className="bg-white border-b border-slate-200">
            <div className="max-w-2xl mx-auto px-6 py-5">
                <div className="h-7 w-48 bg-slate-200 rounded animate-pulse mb-2" />
                <div className="h-4 w-36 bg-slate-100 rounded animate-pulse" />
            </div>
        </div>
        <div className="max-w-2xl mx-auto px-6 py-6 space-y-4">
            {/* Product card skeleton */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex gap-4">
                    <div className="w-20 h-20 bg-slate-200 rounded-xl animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-3">
                        <div className="h-5 w-48 bg-slate-200 rounded animate-pulse" />
                        <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
                        <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
                        <div className="h-6 w-28 bg-slate-200 rounded animate-pulse" />
                    </div>
                </div>
            </div>
            
            {/* Quantity skeleton */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="h-5 w-24 bg-slate-200 rounded animate-pulse mb-4" />
                <div className="flex items-center gap-4">
                    <div className="h-10 w-32 bg-slate-100 rounded-lg animate-pulse" />
                    <div className="h-4 w-16 bg-slate-100 rounded animate-pulse" />
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="h-6 w-32 bg-slate-200 rounded animate-pulse ml-auto" />
                </div>
            </div>
            
            {/* Delivery method skeleton */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="h-5 w-32 bg-slate-200 rounded animate-pulse mb-4" />
                <div className="grid grid-cols-2 gap-3">
                    <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
                    <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
                </div>
            </div>
            
            {/* Order summary skeleton */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="h-5 w-28 bg-slate-200 rounded animate-pulse mb-4" />
                <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex justify-between">
                            <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
                            <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
                        </div>
                    ))}
                    <div className="border-t border-slate-100 pt-3">
                        <div className="flex justify-between">
                            <div className="h-5 w-16 bg-slate-200 rounded animate-pulse" />
                            <div className="h-6 w-24 bg-slate-200 rounded animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Action buttons skeleton */}
            <div className="flex gap-3">
                <div className="flex-1 h-12 bg-slate-200 rounded-xl animate-pulse" />
                <div className="h-12 w-24 bg-slate-100 rounded-xl animate-pulse" />
            </div>
        </div>
    </div>
);

// Success animation overlay
const OrderSuccessOverlay = ({ onComplete }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 2000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-50 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Order Placed! 🎉</h3>
                <p className="text-sm text-slate-500">
                    Your order has been successfully placed. Redirecting to orders...
                </p>
                <div className="mt-4 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-green-600 h-1.5 rounded-full animate-progress" style={{ width: '100%', animation: 'progress 2s ease-in-out' }} />
                </div>
            </div>
        </div>
    );
};

// Loading overlay for order submission
const SubmittingOverlay = () => (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-xl">
            <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-green-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl">📦</span>
                </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Placing Your Order</h3>
            <p className="text-sm text-slate-500">Please wait while we process your order...</p>
            <div className="mt-4 w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                <div className="bg-green-600 h-1 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
        </div>
    </div>
);

const PlaceOrder = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [product, setProduct] = useState(null);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [formData, setFormData] = useState({
        quantity: 1,
        delivery_method: 'pickup',
        delivery_deadline: '',
        pickup_date: '',
        delivery_address: '',
        special_instructions: '',
    });

    useEffect(() => {
        fetchProduct();
        // Pre-fill delivery address from user profile if available
        if (user?.location) {
            setFormData(f => ({ ...f, delivery_address: user.location }));
        }
    }, [productId]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/products/${productId}`);
            setProduct(response.data.data);
        } catch (err) {
            setError('Failed to load product details');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(f => ({ ...f, [name]: value }));
        if (fieldErrors[name]) setFieldErrors(f => ({ ...f, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate delivery address for farmer_delivery
        if (formData.delivery_method === 'farmer_delivery' && !formData.delivery_address.trim()) {
            setFieldErrors(f => ({ ...f, delivery_address: 'Please provide a delivery address so the farmer knows where to deliver.' }));
            return;
        }

        setSubmitting(true);
        setError(null);
        setFieldErrors({});

        try {
            await api.post('/orders', {
                product_id: parseInt(productId),
                quantity: formData.quantity,
                delivery_method: formData.delivery_method,
                delivery_address: formData.delivery_method === 'farmer_delivery' ? formData.delivery_address : null,
                delivery_deadline: formData.delivery_method === 'farmer_delivery' ? formData.delivery_deadline || null : null,
                pickup_date: formData.delivery_method === 'pickup' ? formData.pickup_date || null : null,
                special_instructions: formData.special_instructions || null,
            });

            setSuccess('Order placed successfully!');
            setShowSuccessOverlay(true);
        } catch (err) {
            if (err.errors) setFieldErrors(err.errors);
            else setError(err.message || 'Failed to place order');
            setSubmitting(false);
        }
    };

    const handleSuccessComplete = () => {
        navigate('/app/orders');
    };

    const total = product ? (product.price * formData.quantity).toFixed(2) : '0.00';
    const maxQty = product?.quantity || 0;
    const overMax = formData.quantity > maxQty;
    const today = new Date().toISOString().split('T')[0];

    const inputClass = (field) =>
        `w-full px-3 py-2.5 border rounded-lg text-sm outline-none transition bg-slate-50 text-slate-900 ${
            fieldErrors[field]
                ? 'border-red-300 focus:border-red-400 bg-red-50'
                : 'border-slate-200 focus:border-green-400 focus:bg-white'
        }`;

    const labelClass = "block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5";

    if (loading) return <PlaceOrderSkeleton />;

    if (!product) {
        return (
            <div className="bg-slate-50 min-h-screen flex items-center justify-center p-6">
                <div className="bg-white border border-slate-200 rounded-xl text-center p-16 max-w-sm w-full">
                    <div className="text-5xl mb-3">❌</div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">Product not found</h3>
                    <p className="text-sm text-slate-400 mb-5">This product may have been removed.</p>
                    <button
                        onClick={() => navigate('/app/browse')}
                        className="bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-green-700 transition border-none cursor-pointer"
                    >
                        Browse products
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Place order</h1>
                        <p className="text-sm text-slate-500 mt-0.5">Review and confirm your order</p>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        disabled={submitting}
                        className="text-sm text-slate-500 hover:text-slate-700 border border-slate-200 bg-white px-4 py-2 rounded-lg font-medium transition cursor-pointer disabled:opacity-50"
                    >
                        ← Back
                    </button>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-6 py-6">
                {/* Alerts */}
                {error && (
                    <div className="flex items-center justify-between bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 rounded-xl mb-5 animate-in slide-in-from-top duration-300">
                        <span className="flex items-center gap-2">
                            <span>⚠️</span>
                            <span>{error}</span>
                        </span>
                        <button onClick={() => setError(null)} className="text-red-600 bg-transparent border-none cursor-pointer text-lg leading-none">×</button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Product summary */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
                        <div className="flex gap-4">
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center text-3xl flex-shrink-0">
                                {product.photos?.length > 0
                                    ? <img src={product.photos[0]} alt={product.name} className="w-full h-full object-cover" />
                                    : '🌾'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-base font-bold text-slate-900 truncate">{product.name}</h2>
                                <p className="text-xs text-slate-400 mb-1">{product.category}</p>
                                <p className="text-xs text-slate-500 mb-2">
                                    by <span className="font-semibold text-slate-700">{product.farmer?.name || 'Unknown'}</span>
                                    {product.farmer?.location && <span className="text-slate-400"> · {product.farmer.location}</span>}
                                </p>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className="text-lg font-extrabold text-green-600">{product.price_formatted || `GMD ${product.price}`}</span>
                                    <span className="text-xs text-slate-400">per {product.unit}</span>
                                    <span className="text-xs text-slate-400">·</span>
                                    <span className={`text-xs ${product.quantity > 0 ? 'text-slate-500' : 'text-red-500'}`}>
                                        {product.quantity > 0 ? `${product.quantity} ${product.unit} available` : 'Out of stock'}
                                    </span>
                                </div>
                                {product.description && (
                                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">{product.description}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quantity */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
                        <h3 className="text-sm font-bold text-slate-900 mb-4">Quantity</h3>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => setFormData(f => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))}
                                    disabled={submitting}
                                    className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition border-none cursor-pointer text-lg font-semibold bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >−</button>
                                <input
                                    type="number"
                                    name="quantity"
                                    min="1"
                                    max={maxQty}
                                    value={formData.quantity}
                                    onChange={(e) => setFormData(f => ({ ...f, quantity: Math.max(1, parseInt(e.target.value) || 1) }))}
                                    disabled={submitting}
                                    className="w-16 text-center text-sm font-bold text-slate-900 border-none outline-none bg-white py-2 disabled:opacity-50"
                                />
                                <button
                                    type="button"
                                    onClick={() => setFormData(f => ({ ...f, quantity: Math.min(maxQty, f.quantity + 1) }))}
                                    disabled={submitting || overMax}
                                    className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition border-none cursor-pointer text-lg font-semibold bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >+</button>
                            </div>
                            <span className="text-sm text-slate-500">{product.unit}</span>
                            {overMax && (
                                <span className="text-xs text-red-600 font-semibold animate-pulse">Only {maxQty} {product.unit} available</span>
                            )}
                        </div>
                        {fieldErrors.quantity && <p className="mt-2 text-xs text-red-600">{fieldErrors.quantity}</p>}

                        {/* Total */}
                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-sm text-slate-500">Estimated total</span>
                            <span className="text-xl font-extrabold text-green-600">GMD {total}</span>
                        </div>
                    </div>

                    {/* Delivery method */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
                        <h3 className="text-sm font-bold text-slate-900 mb-4">Delivery method</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { value: 'pickup', icon: '📍', title: 'Pickup', desc: 'Collect from the farm' },
                                { value: 'farmer_delivery', icon: '🚚', title: 'Delivery', desc: 'Farmer delivers to you' },
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setFormData(f => ({ ...f, delivery_method: opt.value }))}
                                    disabled={submitting}
                                    className={`p-4 border-2 rounded-xl text-left transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                        formData.delivery_method === opt.value
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-slate-200 bg-white hover:border-slate-300'
                                    }`}
                                >
                                    <div className="text-2xl mb-2">{opt.icon}</div>
                                    <div className={`text-sm font-bold mb-0.5 ${formData.delivery_method === opt.value ? 'text-green-700' : 'text-slate-900'}`}>
                                        {opt.title}
                                    </div>
                                    <div className="text-xs text-slate-400">{opt.desc}</div>
                                </button>
                            ))}
                        </div>

                        {/* Pickup date */}
                        {formData.delivery_method === 'pickup' && (
                            <div className="mt-4 animate-in slide-in-from-top duration-200">
                                <label className={labelClass}>Pickup date <span className="text-slate-400 normal-case font-normal">(optional)</span></label>
                                <input
                                    type="date" name="pickup_date" min={today}
                                    value={formData.pickup_date} onChange={handleChange}
                                    disabled={submitting}
                                    className={inputClass('pickup_date')}
                                />
                                <p className="mt-1.5 text-xs text-slate-400">Choose a date to collect your order from the farm</p>
                            </div>
                        )}

                        {/* Farmer delivery fields */}
                        {formData.delivery_method === 'farmer_delivery' && (
                            <div className="mt-4 space-y-4 animate-in slide-in-from-top duration-200">
                                {/* Delivery address — shared with farmer */}
                                <div>
                                    <label className={labelClass}>
                                        Your delivery address <span className="text-red-500">*</span>
                                        <span className="ml-2 text-[10px] bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-full normal-case font-normal">Shared with farmer</span>
                                    </label>
                                    <textarea
                                        name="delivery_address"
                                        rows={2}
                                        placeholder="e.g. House 14, Kairaba Avenue, Serrekunda"
                                        value={formData.delivery_address}
                                        onChange={handleChange}
                                        disabled={submitting}
                                        className={`${inputClass('delivery_address')} resize-none`}
                                    />
                                    {fieldErrors.delivery_address
                                        ? <p className="mt-1 text-xs text-red-600">{fieldErrors.delivery_address}</p>
                                        : <p className="mt-1.5 text-xs text-slate-400">This address will be visible to the farmer so they can deliver to you</p>
                                    }
                                </div>

                                {/* Delivery deadline */}
                                <div>
                                    <label className={labelClass}>Delivery deadline <span className="text-slate-400 normal-case font-normal">(optional)</span></label>
                                    <input
                                        type="date" name="delivery_deadline" min={today}
                                        value={formData.delivery_deadline} onChange={handleChange}
                                        disabled={submitting}
                                        className={inputClass('delivery_deadline')}
                                    />
                                    <p className="mt-1.5 text-xs text-slate-400">When do you need this delivered by?</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Special instructions */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
                        <h3 className="text-sm font-bold text-slate-900 mb-4">Special instructions <span className="text-slate-400 font-normal">(optional)</span></h3>
                        <textarea
                            name="special_instructions"
                            rows={3}
                            placeholder="Any notes for the farmer — packaging preferences, ripeness, handling, etc."
                            value={formData.special_instructions}
                            onChange={handleChange}
                            disabled={submitting}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-900 outline-none focus:border-green-400 focus:bg-white transition resize-none disabled:opacity-50"
                        />
                    </div>

                    {/* Order summary */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
                        <h3 className="text-sm font-bold text-slate-900 mb-4">Order summary</h3>
                        <div className="space-y-2.5">
                            {[
                                { label: 'Product',  value: product.name },
                                { label: 'Quantity', value: `${formData.quantity} ${product.unit}` },
                                { label: 'Unit price', value: product.price_formatted || `GMD ${product.price}` },
                                { label: 'Delivery', value: formData.delivery_method === 'pickup' ? 'Pickup from farm' : 'Farmer delivery' },
                                formData.delivery_method === 'farmer_delivery' && formData.delivery_address && {
                                    label: 'Deliver to', value: formData.delivery_address
                                },
                                formData.delivery_method === 'pickup' && formData.pickup_date && {
                                    label: 'Pickup date', value: new Date(formData.pickup_date).toLocaleDateString()
                                },
                                formData.delivery_method === 'farmer_delivery' && formData.delivery_deadline && {
                                    label: 'Deadline', value: new Date(formData.delivery_deadline).toLocaleDateString()
                                },
                            ].filter(Boolean).map((row, i) => (
                                <div key={i} className="flex items-start justify-between gap-4">
                                    <span className="text-xs text-slate-500 flex-shrink-0">{row.label}</span>
                                    <span className="text-xs font-semibold text-slate-900 text-right break-words max-w-[60%]">{row.value}</span>
                                </div>
                            ))}
                            <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-900">Total</span>
                                <span className="text-lg font-extrabold text-green-600">GMD {total}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={submitting || overMax || product.quantity <= 0}
                            className="flex-1 bg-green-600 text-white text-sm font-bold py-3.5 rounded-xl hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition border-none cursor-pointer flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Placing order...
                                </>
                            ) : product.quantity <= 0 ? (
                                'Out of stock'
                            ) : (
                                'Place order'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/app/browse')}
                            disabled={submitting}
                            className="px-6 text-sm font-semibold text-slate-600 bg-white border border-slate-200 py-3.5 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>

            {/* Submitting overlay */}
            {submitting && !showSuccessOverlay && <SubmittingOverlay />}

            {/* Success overlay */}
            {showSuccessOverlay && <OrderSuccessOverlay onComplete={handleSuccessComplete} />}
        </div>
    );
};

export default PlaceOrder;