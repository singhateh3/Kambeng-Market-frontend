// src/pages/ProductDetail.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

 const ProductDetail = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(0);

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

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value) || 1;
        setQuantity(Math.max(1, Math.min(value, product?.quantity || 1)));
    };

    const handlePlaceOrder = () => {
        navigate(`/app/place-order/${productId}`);
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    const isFarmer = user?.role === 'farmer';
    const isBuyer = user?.role === 'buyer';
    const isExpired = product?.expiry_date && new Date(product.expiry_date) < new Date();
    const isAvailable = product?.is_available && !isExpired;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="text-6xl mb-4">❌</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Product Not Found</h3>
                <p className="text-gray-500">The product you're looking for doesn't exist.</p>
                <Button className="mt-4" onClick={() => navigate('/app/browse')}>
                    Browse Products
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Back Button */}
                <div className="p-4 border-b border-gray-100">
                    <button
                        onClick={handleGoBack}
                        className="text-gray-600 hover:text-gray-900 flex items-center transition"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                </div>

                <div className="p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Product Image */}
                        <div>
                            <div className="bg-gray-50 rounded-xl overflow-hidden relative">
                                {product.photos && product.photos.length > 0 ? (
                                    <img
                                        src={product.photos[activeImage]}
                                        alt={product.name}
                                        className="w-full h-96 object-cover main-image"
                                    />
                                ) : (
                                    <div className="w-full h-96 flex items-center justify-center text-6xl bg-gray-100">
                                        🌾
                                    </div>
                                )}
                                {isExpired && (
                                    <span className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                        Expired
                                    </span>
                                )}
                                {!isAvailable && !isExpired && (
                                    <span className="absolute top-4 right-4 bg-gray-700 text-white px-3 py-1 rounded-full text-sm font-medium">
                                        Sold Out
                                    </span>
                                )}
                                {isAvailable && !isExpired && (
                                    <span className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                        Available
                                    </span>
                                )}
                            </div>
                            
                            {/* Thumbnails */}
                            {product.photos && product.photos.length > 1 && (
                                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                                    {product.photos.map((photo, index) => (
                                        <img
                                            key={index}
                                            src={photo}
                                            alt={`${product.name} ${index + 1}`}
                                            className={`w-20 h-20 object-cover rounded-lg border-2 cursor-pointer transition-all ${
                                                activeImage === index 
                                                    ? 'border-green-500 shadow-md' 
                                                    : 'border-gray-200 hover:border-green-300'
                                            }`}
                                            onClick={() => setActiveImage(index)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="space-y-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                                {product.variety && (
                                    <p className="text-sm text-green-600 font-medium mt-1">
                                        Variety: {product.variety}
                                    </p>
                                )}
                                <p className="text-sm text-gray-500">{product.category}</p>
                            </div>

                            <div className="flex items-center space-x-2">
                                {product.average_rating > 0 && (
                                    <div className="flex items-center">
                                        <span className="text-yellow-400">⭐</span>
                                        <span className="ml-1 text-gray-600 font-medium">
                                            {product.average_rating.toFixed(1)}
                                        </span>
                                    </div>
                                )}
                                <span className="text-gray-300">|</span>
                                <span className="text-sm text-gray-500">
                                    {product.orders_count || 0} orders
                                </span>
                            </div>

                            <div className="border-t border-b border-gray-100 py-4">
                                <div className="text-3xl font-bold text-green-600">
                                    {product.price_formatted || `GMD ${product.price}`}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                    per {product.unit}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between py-1">
                                    <span className="text-gray-600">Quantity Available</span>
                                    <span className="font-medium text-gray-900">
                                        {product.quantity} {product.unit}
                                    </span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-gray-600">Status</span>
                                    <span className={`font-medium ${
                                        isAvailable && !isExpired ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {isExpired ? 'Expired' : 
                                         isAvailable ? 'Available' : 'Sold Out'}
                                    </span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-gray-600">Harvest Date</span>
                                    <span className="font-medium text-gray-900">
                                        {product.harvest_date 
                                            ? new Date(product.harvest_date).toLocaleDateString() 
                                            : '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-gray-600">Expiry Date</span>
                                    <span className="font-medium text-gray-900">
                                        {product.expiry_date 
                                            ? new Date(product.expiry_date).toLocaleDateString() 
                                            : '-'}
                                    </span>
                                </div>
                            </div>

                            {product.description && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Description</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
                                </div>
                            )}

                            {/* Farmer Info */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <h3 className="font-semibold text-gray-900 mb-2">Sold by</h3>
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-sm font-medium text-green-700">
                                        {product.farmer?.name?.[0]?.toUpperCase() || 'F'}
                                    </div>
                                    <div className="ml-3">
                                        <p className="font-medium text-gray-900">
                                            {product.farmer?.name || 'Unknown Farmer'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            📍 {product.farmer?.location || 'Location not provided'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-4 space-y-3">
                                {isBuyer && isAvailable && !isExpired && (
                                    <>
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center space-x-2">
                                                {/* <label className="text-sm font-medium text-gray-700">
                                                    Quantity:
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={product.quantity}
                                                    value={quantity}
                                                    onChange={handleQuantityChange}
                                                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                /> */}
                                            </div>
                                            {/* <span className="text-sm text-gray-500">
                                                {product.unit}s available
                                            </span> */}
                                        </div>
                                        <button
                                            onClick={handlePlaceOrder}
                                            className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition font-semibold text-lg"
                                            disabled={quantity > product.quantity}
                                        >
                                            🛒 Place Order
                                        </button>
                                    </>
                                )}
                                {isBuyer && !isAvailable && !isExpired && (
                                    <button className="w-full bg-gray-300 text-gray-600 py-3 rounded-xl cursor-not-allowed font-semibold text-lg" disabled>
                                        Sold Out
                                    </button>
                                )}
                                {isBuyer && isExpired && (
                                    <button className="w-full bg-gray-300 text-gray-600 py-3 rounded-xl cursor-not-allowed font-semibold text-lg" disabled>
                                        Expired
                                    </button>
                                )}
                                {isFarmer && (
                                    <button
                                        onClick={() => navigate('/app/products')}
                                        className="w-full bg-blue-50 text-blue-600 py-3 rounded-xl hover:bg-blue-100 transition font-semibold text-lg"
                                    >
                                        📦 View My Products
                                    </button>
                                )}
                                {!user && (
                                    <Link to="/login">
                                        <button className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition font-semibold text-lg">
                                            Login to Order
                                        </button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;