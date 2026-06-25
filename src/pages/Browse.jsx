// src/pages/Browse.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

export const Browse = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({
        category: '',
        search: '',
        page: 1,
        per_page: 20,
    });
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0,
    });

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [filters]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                category: filters.category,
                search: filters.search,
                page: filters.page || 1,
                per_page: filters.per_page || 20,
            });
            const response = await api.get(`/products?${params}`);
            setProducts(response.data.data || []);
            setPagination(response.data.meta || {
                current_page: 1,
                last_page: 1,
                per_page: 20,
                total: 0,
            });
        } catch (err) {
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/products/categories');
            setCategories(response.data.data || []);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value, page: 1 });
    };

    const handlePageChange = (newPage) => {
        setFilters({ ...filters, page: newPage });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <h1 className="text-2xl font-bold text-gray-900">Browse Products</h1>
                    <p className="text-sm text-gray-500">Discover fresh produce from local farmers</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                            />
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <select
                            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                            value={filters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                        <Button 
                            variant="secondary" 
                            onClick={fetchProducts}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
                        >
                            Apply Filters
                        </Button>
                    </div>
                </div>

                {/* Products Grid */}
                {products.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
                        <p className="text-gray-500">Try adjusting your search or filters.</p>
                        <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => {
                                setFilters({ category: '', search: '', page: 1, per_page: 20 });
                            }}
                        >
                            Clear Filters
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.total > 0 && (
                            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-4 flex flex-wrap items-center justify-between gap-2">
                                <div className="text-sm text-gray-600">
                                    Showing <span className="font-medium">{products.length}</span> of <span className="font-medium">{pagination.total}</span> products
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        className={`px-4 py-2 text-sm rounded-lg transition ${
                                            pagination.current_page <= 1
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        }`}
                                        disabled={pagination.current_page <= 1}
                                        onClick={() => handlePageChange(pagination.current_page - 1)}
                                    >
                                        Previous
                                    </button>
                                    <span className="px-4 py-2 text-sm text-gray-600">
                                        Page {pagination.current_page} of {pagination.last_page}
                                    </span>
                                    <button
                                        className={`px-4 py-2 text-sm rounded-lg transition ${
                                            pagination.current_page >= pagination.last_page
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        }`}
                                        disabled={pagination.current_page >= pagination.last_page}
                                        onClick={() => handlePageChange(pagination.current_page + 1)}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// Product Card Component - Updated
const ProductCard = ({ product }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isExpired = product.expiry_date && new Date(product.expiry_date) < new Date();
    const isAvailable = product.is_available && !isExpired;

    const handleCardClick = () => {
        navigate(`/app/products/${product.id}`);
    };

    const handlePlaceOrder = (e) => {
        e.stopPropagation();
        navigate(`/app/place-order/${product.id}`);
    };

    return (
        <div 
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer border border-gray-100"
            onClick={handleCardClick}
        >
            <div className="relative h-48 bg-gray-100">
                {product.photos && product.photos.length > 0 ? (
                    <img
                        src={product.photos[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                        🌾
                    </div>
                )}
                {isExpired && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        Expired
                    </span>
                )}
                {isAvailable && !isExpired && (
                    <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        Available
                    </span>
                )}
                {!isAvailable && !isExpired && (
                    <span className="absolute top-2 left-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
                        Sold Out
                    </span>
                )}
            </div>
            <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">
                    {product.name}
                </h3>
                <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                <p className="text-sm text-gray-500 mb-2">
                    by {product.farmer?.name || 'Unknown Farmer'}
                </p>
                
                <div className="flex justify-between items-center mb-3">
                    <span className="text-xl font-bold text-green-600">
                        {product.price_formatted || `GMD ${product.price}`}
                    </span>
                    <span className="text-sm text-gray-500">
                        {product.quantity} {product.unit}
                    </span>
                </div>

                {product.average_rating > 0 && (
                    <div className="flex items-center text-sm">
                        <span className="text-yellow-400">⭐</span>
                        <span className="ml-1 text-gray-600">
                            {product.average_rating.toFixed(1)}
                        </span>
                    </div>
                )}

                <div className="mt-3">
                    {user?.role === 'buyer' && isAvailable && !isExpired ? (
                        <button
                            onClick={handlePlaceOrder}
                            className="w-full bg-green-600 text-white text-sm py-2 rounded-lg hover:bg-green-700 transition"
                        >
                            🛒 Place Order
                        </button>
                    ) : user?.role === 'buyer' && !isAvailable ? (
                        <button className="w-full bg-gray-300 text-gray-600 text-sm py-2 rounded-lg cursor-not-allowed" disabled>
                            Sold Out
                        </button>
                    ) : user?.role === 'farmer' ? (
                        <button className="w-full bg-blue-50 text-blue-600 text-sm py-2 rounded-lg hover:bg-blue-100 transition">
                            👁️ View
                        </button>
                    ) : (
                        <Link to="/login">
                            <button className="w-full bg-green-600 text-white text-sm py-2 rounded-lg hover:bg-green-700 transition">
                                Login to Order
                            </button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};