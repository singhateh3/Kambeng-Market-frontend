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
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchHomeData();
    }, []);

    const fetchHomeData = async () => {
        try {
            setLoading(true);
            const [productsRes, categoriesRes, statsRes] = await Promise.all([
                api.get('/products?limit=8&sort_by=created_at&sort_order=desc'),
                api.get('/products/categories'),
                api.get('/public/statistics').catch(() => ({ data: { data: null } })),
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

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            if (isAuthenticated) {
                navigate(`/browse?search=${encodeURIComponent(searchQuery)}`);
            } else {
                navigate('/login');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50">
            {/* Top Banner / Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                        <span className="hidden sm:inline">🌾 Fresh from Gambian farms</span>
                        <span className="hidden md:inline">•</span>
                        <span className="hidden md:inline">🚚 Free delivery on orders over GMD 500</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        {!isAuthenticated ? (
                            <>
                                <Link to="/login" className="hover:underline">Sign In</Link>
                                <Link to="/register" className="bg-white/20 px-4 py-1 rounded-full hover:bg-white/30 transition">Sign Up</Link>
                            </>
                        ) : (
                            <Link to="/dashboard" className="hover:underline">Dashboard</Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Hero Section - Blinkit style */}
            <section className="bg-gradient-to-b from-green-50 to-white">
                <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
                            Fresh Produce,{' '}
                            <span className="text-green-600">Direct from Farm</span>
                        </h1>
                        <p className="text-lg text-gray-600 mb-8">
                            Connect directly with Gambian farmers. No middlemen, fair prices, guaranteed freshness.
                        </p>

                        {/* Search Bar - Blinkit style */}
                        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search for fresh produce..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-6 py-4 pl-14 text-lg border-2 border-gray-200 rounded-full focus:outline-none focus:border-green-500 shadow-lg"
                                />
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition"
                                >
                                    Search
                                </button>
                            </div>
                        </form>

                        {/* CTA Buttons for Non-Authenticated Users */}
                        {!isAuthenticated ? (
                            <div className="mt-8 flex flex-wrap justify-center gap-4">
                                <Button
                                    size="lg"
                                    className="bg-green-600 text-white hover:bg-green-700 px-8 py-3 text-lg rounded-full"
                                    onClick={() => navigate('/register')}
                                >
                                    Get Started
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-3 text-lg rounded-full"
                                    onClick={() => navigate('/login')}
                                >
                                    Sign In
                                </Button>
                            </div>
                        ) : (
                            <div className="mt-8">
                                <Button
                                    size="lg"
                                    className="bg-green-600 text-white hover:bg-green-700 px-8 py-3 text-lg rounded-full"
                                    onClick={() => navigate('/dashboard')}
                                >
                                    Go to Dashboard
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Stats Bar */}
                    {stats && (
                        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                            <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
                                <div className="text-2xl font-bold text-green-600">{stats?.products?.active || 0}+</div>
                                <div className="text-sm text-gray-500">Fresh Products</div>
                            </div>
                            <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
                                <div className="text-2xl font-bold text-green-600">{stats?.users?.farmers || 0}+</div>
                                <div className="text-sm text-gray-500">Trusted Farmers</div>
                            </div>
                            <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
                                <div className="text-2xl font-bold text-green-600">{stats?.orders?.total || 0}+</div>
                                <div className="text-sm text-gray-500">Orders Delivered</div>
                            </div>
                            <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
                                <div className="text-2xl font-bold text-green-600">{stats?.reviews?.average_rating || 0}⭐</div>
                                <div className="text-sm text-gray-500">Average Rating</div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Categories - Horizontal Scroll */}
            <section className="py-8 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Shop by Category</h2>
                        <Link 
                            to={isAuthenticated ? '/browse' : '/login'} 
                            className="text-sm text-green-600 hover:text-green-700 font-medium"
                        >
                            View All →
                        </Link>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {categories.slice(0, 12).map((category, index) => (
                            <Link
                                key={index}
                                to={isAuthenticated ? `/browse?category=${category}` : '/login'}
                                className="flex-shrink-0 w-24 text-center group"
                            >
                                <div className="w-20 h-20 mx-auto bg-gray-50 rounded-full flex items-center justify-center text-3xl group-hover:bg-green-50 transition border-2 border-transparent group-hover:border-green-200">
                                    {getCategoryIcon(category)}
                                </div>
                                <div className="text-xs font-medium text-gray-700 mt-2 truncate">
                                    {category}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products - Grid */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
                        <Link
                            to={isAuthenticated ? '/browse' : '/login'}
                            className="text-sm text-green-600 hover:text-green-700 font-medium"
                        >
                            View All →
                        </Link>
                    </div>
                    {featuredProducts.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {featuredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl">
                            <div className="text-6xl mb-4">🌾</div>
                            <p className="text-gray-500">No products available yet.</p>
                            {isAuthenticated && user?.role === 'farmer' && (
                                <Link to="/products/create" className="text-green-600 hover:text-green-700 inline-block mt-2">
                                    List your first product →
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Why Kambeng - Blinkit style */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
                        Why Choose Kambeng Market?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-4xl">🌱</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Fresh & Local</h3>
                            <p className="text-gray-500 text-sm">Directly from Gambian farms to your table. Fresh produce at its best.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-4xl">💰</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Fair Prices</h3>
                            <p className="text-gray-500 text-sm">No middlemen. Farmers get fair prices and buyers get great deals.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-4xl">🤝</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Trust & Quality</h3>
                            <p className="text-gray-500 text-sm">Verified farmers, quality produce, and reliable delivery options.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section - Login/Register for Non-Authenticated Users */}
            <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    {!isAuthenticated ? (
                        <>
                            <h2 className="text-3xl font-bold mb-4">Ready to Start?</h2>
                            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                                Join Kambeng Market today and connect directly with farmers. Fresh produce, fair prices, no middlemen.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Button
                                    size="lg"
                                    className="bg-green text-green-600 hover:bg-green-50 px-8 py-3 text-lg rounded-full"
                                    onClick={() => navigate('/register')}
                                >
                                    Create Account
                                </Button>
                                <Button
                                    size="lg"
                                    className="bg-green-800 text-white hover:bg-green-900 px-8 py-3 text-lg rounded-full"
                                    onClick={() => navigate('/login')}
                                >
                                    Sign In
                                </Button>
                            </div>
                        </>
                    ) : user?.role === 'farmer' ? (
                        <>
                            <h2 className="text-3xl font-bold mb-4">Are You a Farmer?</h2>
                            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                                Join Kambeng Market today and connect directly with buyers. No middlemen, fair prices, and a reliable marketplace.
                            </p>
                            <Button
                                size="lg"
                                className="bg-white text-green-600 hover:bg-green-50 px-8 py-3 text-lg rounded-full text-green"
                                onClick={() => navigate('/products/create')}
                            >
                                List Your Products
                            </Button>
                        </>
                    ) : (
                        <>
                            <h2 className="text-3xl font-bold mb-4">Start Shopping</h2>
                            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                                Discover fresh produce from local farmers. Quality guaranteed.
                            </p>
                            <Button
                                size="lg"
                                className="bg-green-50 text-green-600 hover:bg-green-50 px-8 py-3 text-lg rounded-full"
                                onClick={() => navigate('/browse')}
                            >
                                Browse Products
                            </Button>
                        </>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-white font-bold text-lg mb-4">🌾 Kambeng Market</h3>
                            <p className="text-sm text-gray-400">
                                Connecting Gambian farmers directly with hotels, restaurants, and caterers.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link to={isAuthenticated ? '/browse' : '/login'} className="hover:text-white">Browse Products</Link></li>
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
                    <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center text-gray-400">
                        <p>&copy; {new Date().getFullYear()} Kambeng Market. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

// Product Card Component - Blinkit style
const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const handleClick = () => {
        if (isAuthenticated) {
            navigate(`/app/products/${product.id}`);
        } else {
            navigate('/login');
        }
    };

    const handlePlaceOrder = (e) => {
        e.stopPropagation();
        if (isAuthenticated) {
            // Fix: Use the correct path for place order - /app/place-order/{productId}
            navigate(`/app/place-order/${product.id}`);
        } else {
            navigate('/login');
        }
    };

    return (
        <div 
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer border border-gray-100"
            onClick={handleClick}
        >
            <div className="relative h-40 bg-gray-100">
                {product.photos && product.photos.length > 0 ? (
                    <img
                        src={product.photos[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">
                        🌾
                    </div>
                )}
                {product.is_available && (
                    <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        Fresh
                    </span>
                )}
                {product.average_rating > 0 && (
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center">
                        ⭐ {product.average_rating.toFixed(1)}
                    </div>
                )}
            </div>
            <div className="p-3">
                <h3 className="font-semibold text-gray-900 text-sm truncate">
                    {product.name}
                </h3>
                <p className="text-xs text-gray-500 truncate">
                    {product.farmer?.name || 'Unknown Farmer'}
                </p>
                <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold text-green-600">
                        {product.price_formatted}
                    </span>
                    <span className="text-xs text-gray-500">
                        {product.quantity} {product.unit}
                    </span>
                </div>
                <button 
                    className="w-full mt-2 bg-green-600 text-white text-sm py-1.5 rounded-lg hover:bg-green-700 transition"
                    onClick={handlePlaceOrder}
                >
                    🛒 Place Order
                </button>
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
        'Cereals': '🌾',
        'Legumes': '🫘',
        'Roots': '🥔',
        'Tubers': '🍠',
    };
    return icons[category] || '📦';
};