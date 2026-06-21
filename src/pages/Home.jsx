// src/pages/Home.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

export const Home = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchHomeData();
    }, []);

    const fetchHomeData = async () => {
        try {
            setLoading(true);
            const [productsRes, categoriesRes, statsRes] = await Promise.all([
                api.get('/products?limit=6&sort_by=created_at&sort_order=desc'),
                api.get('/products/categories'),
                api.get('/admin/dashboard/statistics').catch(() => ({ data: null })),
            ]);

            setFeaturedProducts(productsRes.data?.data || []);
            setCategories(categoriesRes.data?.data || []);
            setStats(statsRes.data?.data || null);
        } catch (error) {
            console.error('Error fetching home data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
                <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div>
                            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                                🌾 Welcome to Kambeng Market
                            </h1>
                            <p className="text-xl text-primary-100 mb-6">
                                Connect directly with Gambian farmers. Fresh produce, fair prices, no middlemen.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                {!isAuthenticated ? (
                                    <>
                                        <Button
                                            size="lg"
                                            className="bg-white text-primary-600 hover:bg-primary-50"
                                            onClick={() => navigate('/register')}
                                        >
                                            Get Started
                                        </Button>
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            className="border-white text-white hover:bg-white/10"
                                            onClick={() => navigate('/login')}
                                        >
                                            Sign In
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        size="lg"
                                        className="bg-white text-primary-600 hover:bg-primary-50"
                                        onClick={() => navigate('/dashboard')}
                                    >
                                        Go to Dashboard
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="hidden lg:block">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                                    <div className="text-4xl mb-2">🌾</div>
                                    <div className="text-2xl font-bold">{stats?.products?.active || 0}</div>
                                    <div className="text-sm text-primary-200">Active Products</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                                    <div className="text-4xl mb-2">👨‍🌾</div>
                                    <div className="text-2xl font-bold">{stats?.users?.farmers || 0}</div>
                                    <div className="text-sm text-primary-200">Farmers</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                                    <div className="text-4xl mb-2">🛒</div>
                                    <div className="text-2xl font-bold">{stats?.orders?.total || 0}</div>
                                    <div className="text-sm text-primary-200">Orders Completed</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                                    <div className="text-4xl mb-2">⭐</div>
                                    <div className="text-2xl font-bold">{stats?.reviews?.average_rating || 0}</div>
                                    <div className="text-sm text-primary-200">Average Rating</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        Why Choose Kambeng Market?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">🌱</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Fresh & Local
                            </h3>
                            <p className="text-gray-600">
                                Directly from Gambian farms to your table. Fresh produce at its best.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">💰</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Fair Prices
                            </h3>
                            <p className="text-gray-600">
                                No middlemen. Farmers get fair prices and buyers get great deals.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">🤝</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Trust & Quality
                            </h3>
                            <p className="text-gray-600">
                                Verified farmers, quality produce, and reliable delivery options.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        Browse Categories
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {categories.slice(0, 12).map((category, index) => (
                            <Link
                                key={index}
                                to={`/browse?category=${category}`}
                                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 text-center"
                            >
                                <div className="text-2xl mb-2">
                                    {getCategoryIcon(category)}
                                </div>
                                <div className="text-sm font-medium text-gray-700">
                                    {category}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">
                            Featured Products
                        </h2>
                        <Link
                            to="/browse"
                            className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                            View All →
                        </Link>
                    </div>
                    {featuredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {featuredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No products available yet.</p>
                            {isAuthenticated && user?.role === 'farmer' && (
                                <Link to="/products/create" className="text-primary-600 hover:text-primary-700">
                                    List your first product →
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section for Farmers */}
            <section className="bg-primary-700 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        Are You a Farmer?
                    </h2>
                    <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
                        Join Kambeng Market today and connect directly with buyers. No middlemen, fair prices, and a reliable marketplace.
                    </p>
                    {!isAuthenticated ? (
                        <Button
                            size="lg"
                            className="bg-white text-primary-600 hover:bg-primary-50"
                            onClick={() => navigate('/register')}
                        >
                            Start Selling Today
                        </Button>
                    ) : user?.role === 'farmer' ? (
                        <Button
                            size="lg"
                            className="bg-white text-primary-600 hover:bg-primary-50"
                            onClick={() => navigate('/products/create')}
                        >
                            List Your Products
                        </Button>
                    ) : (
                        <Button
                            size="lg"
                            className="bg-white text-primary-600 hover:bg-primary-50"
                            onClick={() => navigate('/browse')}
                        >
                            Browse Products
                        </Button>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-white font-bold text-lg mb-4">🌾 Kambeng Market</h3>
                            <p className="text-sm">
                                Connecting Gambian farmers directly with hotels, restaurants, and caterers.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link to="/browse" className="hover:text-white">Browse Products</Link></li>
                                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">For Farmers</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link to="/register" className="hover:text-white">Join as Farmer</Link></li>
                                <li><Link to="/help/farmer" className="hover:text-white">Farmer Guide</Link></li>
                                <li><Link to="/help/pricing" className="hover:text-white">Pricing</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Contact</h4>
                            <ul className="space-y-2 text-sm">
                                <li>📧 info@kambeng.com</li>
                                <li>📞 +220 700 0000</li>
                                <li>📍 Banjul, The Gambia</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
                        <p>&copy; {new Date().getFullYear()} Kambeng Market. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

// Product Card Component
const ProductCard = ({ product }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div 
                className="cursor-pointer"
                onClick={() => navigate(`/products/${product.id}`)}
            >
                <div className="h-48 bg-gray-200 relative">
                    {product.photos && product.photos.length > 0 ? (
                        <img
                            src={product.photos[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl bg-gray-100">
                            🌾
                        </div>
                    )}
                    {product.is_available && (
                        <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                            Available
                        </span>
                    )}
                </div>
                <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">
                        {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                        {product.farmer?.name || 'Unknown Farmer'}
                    </p>
                    <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-primary-600">
                            {product.price_formatted}
                        </span>
                        <span className="text-sm text-gray-500">
                            {product.quantity} {product.unit}
                        </span>
                    </div>
                    {product.average_rating > 0 && (
                        <div className="flex items-center mt-2 text-sm">
                            <span className="text-yellow-400">⭐</span>
                            <span className="ml-1 text-gray-600">
                                {product.average_rating.toFixed(1)}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper function to get category icons
const getCategoryIcon = (category) => {
    const icons = {
        'Vegetables': '🥬',
        'Fruits': '🍎',
        'Grains': '🌾',
        'Herbs': '🌿',
        'Spices': '🌶️',
        'Dairy': '🥛',
        'Meat': '🥩',
        'Fish': '🐟',
        'Poultry': '🐔',
        'Eggs': '🥚',
        'Rice': '🍚',
        'Groundnuts': '🥜',
    };
    return icons[category] || '📦';
};