// src/pages/buyer/PlaceOrder.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert } from '../../components/common/Alert';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

export const PlaceOrder = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [product, setProduct] = useState(null);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        quantity: 1,
        delivery_method: 'pickup',
        delivery_deadline: '',
        pickup_date: '',
        special_instructions: '',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchProduct();
    }, [productId]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/products/${productId}`);
            setProduct(response.data.data);
        } catch (err) {
            console.error('Error fetching product:', err);
            setError('Failed to load product details');
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value) || 1;
        setFormData(prev => ({ ...prev, quantity: Math.max(1, value) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setErrors({});

        try {
            const response = await api.post('/orders', {
                product_id: parseInt(productId),
                quantity: formData.quantity,
                delivery_method: formData.delivery_method,
                delivery_deadline: formData.delivery_method === 'farmer_delivery' ? formData.delivery_deadline || null : null,
                pickup_date: formData.delivery_method === 'pickup' ? formData.pickup_date || null : null,
                special_instructions: formData.special_instructions || null,
            });

            setSuccess('Order placed successfully!');
            setTimeout(() => {
                navigate('/orders');
            }, 2000);
        } catch (err) {
            console.error('Error placing order:', err);
            if (err.errors) {
                setErrors(err.errors);
            } else {
                setError(err.message || 'Failed to place order');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const maxQuantity = product?.quantity || 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="bg-white shadow rounded-lg p-12 text-center">
                <div className="text-6xl mb-4">❌</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Product Not Found</h3>
                <p className="text-gray-500">The product you're looking for doesn't exist.</p>
                <Button className="mt-4" onClick={() => navigate('/browse')}>
                    Browse Products
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white shadow rounded-lg overflow-hidden">
                {/* Product Summary */}
                <div className="p-6 border-b">
                    <div className="flex items-start space-x-4">
                        <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            {product.photos && product.photos.length > 0 ? (
                                <img 
                                    src={product.photos[0]} 
                                    alt={product.name} 
                                    className="w-24 h-24 object-cover rounded-lg"
                                />
                            ) : (
                                <span className="text-4xl">🌾</span>
                            )}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                            <p className="text-sm text-gray-500">{product.category}</p>
                            <div className="mt-2 flex items-center space-x-4">
                                <span className="text-2xl font-bold text-primary-600">
                                    {product.price_formatted || `GMD ${product.price}`}
                                </span>
                                <span className="text-sm text-gray-500">
                                    Available: {product.quantity} {product.unit}
                                </span>
                            </div>
                            <div className="mt-1 flex items-center space-x-2">
                                <span className="text-sm text-gray-500">Sold by:</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {product.farmer?.name || 'Unknown Farmer'}
                                </span>
                            </div>
                            {product.description && (
                                <p className="mt-2 text-sm text-gray-600">{product.description}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Order Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}
                    {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Quantity ({product.unit}) *
                            </label>
                            <input
                                type="number"
                                name="quantity"
                                min="1"
                                max={maxQuantity}
                                value={formData.quantity}
                                onChange={handleQuantityChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            {errors.quantity && (
                                <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                            )}
                            {formData.quantity > maxQuantity && (
                                <p className="mt-1 text-sm text-red-600">
                                    Only {maxQuantity} {product.unit} available
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Total Price
                            </label>
                            <p className="text-2xl font-bold text-primary-600">
                                {product.price_formatted || `GMD ${product.price}`} × {formData.quantity} = 
                                GMD {(product.price * formData.quantity).toFixed(2)}
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Delivery Method *
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                                    formData.delivery_method === 'pickup'
                                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}
                                onClick={() => setFormData(prev => ({ ...prev, delivery_method: 'pickup' }))}
                            >
                                <div className="text-2xl mb-1">📍</div>
                                <div className="font-medium">Pickup</div>
                                <div className="text-xs text-gray-500">Pick up from the farm</div>
                            </button>
                            <button
                                type="button"
                                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                                    formData.delivery_method === 'farmer_delivery'
                                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}
                                onClick={() => setFormData(prev => ({ ...prev, delivery_method: 'farmer_delivery' }))}
                            >
                                <div className="text-2xl mb-1">🚚</div>
                                <div className="font-medium">Delivery</div>
                                <div className="text-xs text-gray-500">Farmer delivers to you</div>
                            </button>
                        </div>
                        {errors.delivery_method && (
                            <p className="mt-1 text-sm text-red-600">{errors.delivery_method}</p>
                        )}
                    </div>

                    {/* Delivery Date / Pickup Date based on method */}
                    {formData.delivery_method === 'pickup' ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Pickup Date (Optional)
                            </label>
                            <input
                                type="date"
                                name="pickup_date"
                                value={formData.pickup_date}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                min={new Date().toISOString().split('T')[0]}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Choose a date to pick up your order from the farm
                            </p>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Delivery Deadline (Optional)
                            </label>
                            <input
                                type="date"
                                name="delivery_deadline"
                                value={formData.delivery_deadline}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                min={new Date().toISOString().split('T')[0]}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                When would you like the order to be delivered?
                            </p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Special Instructions (Optional)
                        </label>
                        <textarea
                            name="special_instructions"
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Any special instructions for the farmer..."
                            value={formData.special_instructions}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Order Summary */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <h3 className="font-semibold text-gray-900">Order Summary</h3>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Product</span>
                            <span className="text-gray-900">{product.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Quantity</span>
                            <span className="text-gray-900">{formData.quantity} {product.unit}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Unit Price</span>
                            <span className="text-gray-900">{product.price_formatted || `GMD ${product.price}`}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Delivery Method</span>
                            <span className="text-gray-900 capitalize">
                                {formData.delivery_method === 'pickup' ? 'Pickup' : 'Farmer Delivery'}
                            </span>
                        </div>
                        {formData.delivery_method === 'pickup' && formData.pickup_date && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Pickup Date</span>
                                <span className="text-gray-900">
                                    {new Date(formData.pickup_date).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                        {formData.delivery_method === 'farmer_delivery' && formData.delivery_deadline && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Delivery Deadline</span>
                                <span className="text-gray-900">
                                    {new Date(formData.delivery_deadline).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                        <div className="border-t pt-2 flex justify-between font-bold">
                            <span className="text-gray-900">Total</span>
                            <span className="text-primary-600">GMD {(product.price * formData.quantity).toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex space-x-4 pt-4 border-t">
                        <Button
                            type="submit"
                            isLoading={submitting}
                            disabled={submitting || formData.quantity > maxQuantity}
                            fullWidth
                        >
                            Place Order
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => navigate(`/app/browse`)}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};