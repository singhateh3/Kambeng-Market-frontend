// src/pages/Home.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Skeleton } from '../components/common/Skeleton';
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

    useEffect(() => { fetchHomeData(); }, []);

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
            navigate(isAuthenticated ? `/browse?search=${encodeURIComponent(searchQuery)}` : '/login');
        }
    };

    // If loading, show skeleton
    if (loading) {
        return <HomeSkeleton />;
    }

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Navbar */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 flex items-center gap-6" style={{ height: 60 }}>
                    <Link to="/" className="flex items-center gap-2 no-underline flex-shrink-0">
                        <span className="text-xl">🌾</span>
                        <span className="font-extrabold text-green-700 tracking-tight">Kambeng</span>
                        <span className="font-normal text-slate-400">Market</span>
                    </Link>

                    <form onSubmit={handleSearch} className="flex-1 max-w-md">
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search produce, farmers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-900 outline-none focus:border-green-400 focus:bg-white transition"
                            />
                        </div>
                    </form>

                    <div className="ml-auto flex items-center gap-3 flex-shrink-0">
                        {!isAuthenticated ? (
                            <>
                                <Link to="/login" className="text-sm font-medium text-slate-600 no-underline hover:text-green-700 transition">Sign in</Link>
                                <Link to="/register" className="bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg no-underline hover:bg-green-700 transition">
                                    Get started
                                </Link>
                            </>
                        ) : (
                            <Link to="/dashboard" className="bg-green-50 text-green-700 border border-green-200 text-sm font-semibold px-4 py-2 rounded-lg no-underline hover:bg-green-100 transition">
                                Dashboard
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="bg-white border-b border-slate-100">
                <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 text-xs font-semibold px-3 py-1 rounded-full mb-5">
                            <span className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                            Fresh from Gambian farms
                        </div>
                        <h1 className="text-5xl font-extrabold text-slate-900 leading-tight tracking-tight mb-4">
                            Farm-fresh produce,<br />
                            <span className="text-green-600">no middlemen.</span>
                        </h1>
                        <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-md">
                            Order directly from verified Gambian farmers. Fair prices for buyers, fair pay for farmers.
                        </p>

                        <div className="flex gap-3 flex-wrap">
                            {!isAuthenticated ? (
                                <>
                                    <button onClick={() => navigate('/register')} className="bg-green-600 text-white font-bold px-7 py-3 rounded-lg hover:bg-green-700 transition cursor-pointer border-none text-sm">
                                        Start buying
                                    </button>
                                    <button onClick={() => navigate('/login')} className="bg-slate-50 text-slate-700 font-semibold px-7 py-3 rounded-lg border border-slate-200 hover:bg-slate-100 transition cursor-pointer text-sm">
                                        Sign in
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => navigate('/dashboard')} className="bg-green-600 text-white font-bold px-7 py-3 rounded-lg hover:bg-green-700 transition cursor-pointer border-none text-sm">
                                    Go to dashboard
                                </button>
                            )}
                        </div>

                        <p className="mt-6 text-sm text-slate-500 flex items-center gap-2">
                            🚚 Free delivery on orders over <strong className="text-slate-800">GMD 500</strong>
                        </p>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { emoji: '🥬', label: 'Fresh products', value: stats?.products?.active ?? '50+' },
                            { emoji: '👨‍🌾', label: 'Verified farmers', value: stats?.users?.farmers ?? '20+' },
                            { emoji: '📦', label: 'Orders placed', value: stats?.orders?.total ?? '100+' },
                            { emoji: '⭐', label: 'Avg. rating', value: stats?.reviews?.average_rating ? Number(stats.reviews.average_rating).toFixed(1) : '4.8' },
                        ].map((s, i) => (
                            <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                                <div className="text-3xl mb-2">{s.emoji}</div>
                                <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{s.value}</div>
                                <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories */}
            {categories.length > 0 && (
                <section className="bg-white border-b border-slate-100 py-6">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold text-slate-900">Shop by category</h2>
                            <Link to={isAuthenticated ? '/browse' : '/login'} className="text-xs font-semibold text-green-600 no-underline hover:text-green-700">
                                All categories →
                            </Link>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            {categories.slice(0, 14).map((cat, i) => (
                                <Link
                                    key={i}
                                    to={isAuthenticated ? `/browse?category=${cat}` : '/login'}
                                    className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-slate-700 text-xs font-medium no-underline hover:bg-green-50 hover:border-green-400 hover:text-green-700 transition"
                                >
                                    <span>{getCategoryIcon(cat)}</span>
                                    <span>{cat}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Featured Products */}
            <section className="py-10">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Featured products</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Freshly listed by farmers near you</p>
                        </div>
                        <Link to={isAuthenticated ? '/browse' : '/login'} className="text-xs font-semibold text-green-600 no-underline hover:text-green-700">
                            View all →
                        </Link>
                    </div>

                    {featuredProducts.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {featuredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200">
                            <div className="text-5xl mb-3">🌾</div>
                            <p className="text-slate-500 text-sm">No products listed yet.</p>
                            {isAuthenticated && user?.role === 'farmer' && (
                                <Link to="/products/create" className="text-green-600 text-sm font-semibold no-underline hover:text-green-700 mt-2 inline-block">
                                    List your first product →
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Why Kambeng */}
            <section className="bg-white border-t border-slate-100 py-14">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-lg font-extrabold text-slate-900 tracking-tight mb-8">Why Kambeng Market?</h2>
                    <div className="grid grid-cols-3 gap-6">
                        {[
                            { icon: '🌱', title: 'Straight from the farm', desc: 'No cold storage, no middlemen. Produce moves from farm to you within 24 hours.' },
                            { icon: '💰', title: 'Farmers earn more', desc: 'Farmers set their own prices and keep the majority of every sale.' },
                            { icon: '✅', title: 'Verified listings', desc: 'Every farmer is verified. Every product listing is reviewed before going live.' },
                        ].map((item, i) => (
                            <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                                <div className="text-3xl mb-3">{item.icon}</div>
                                <h3 className="text-sm font-bold text-slate-900 mb-2">{item.title}</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            <section className="bg-green-600 py-14 px-6">
                <div className="max-w-xl mx-auto text-center">
                    {!isAuthenticated ? (
                        <>
                            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-3">Ready to buy fresh?</h2>
                            <p className="text-green-100 text-sm mb-7 leading-relaxed">
                                Create a free account and start ordering directly from Gambian farmers today.
                            </p>
                            <div className="flex gap-3 justify-center flex-wrap">
                                <button onClick={() => navigate('/register')} className="bg-white text-green-700 font-bold px-7 py-3 rounded-lg text-sm hover:bg-green-50 transition cursor-pointer border-none">
                                    Create account
                                </button>
                                <button onClick={() => navigate('/login')} className="bg-transparent text-white font-semibold px-7 py-3 rounded-lg text-sm border border-white/40 hover:bg-white/10 transition cursor-pointer">
                                    Sign in
                                </button>
                            </div>
                        </>
                    ) : user?.role === 'farmer' ? (
                        <>
                            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-3">List your produce</h2>
                            <p className="text-green-100 text-sm mb-7">Reach hotels, restaurants and caterers across The Gambia.</p>
                            <button onClick={() => navigate('/products/create')} className="bg-white text-green-700 font-bold px-7 py-3 rounded-lg text-sm hover:bg-green-50 transition cursor-pointer border-none">
                                Add a product
                            </button>
                        </>
                    ) : (
                        <>
                            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-3">Browse today's listings</h2>
                            <p className="text-green-100 text-sm mb-7">Fresh produce added daily by farmers across The Gambia.</p>
                            <button onClick={() => navigate('/browse')} className="bg-white text-green-700 font-bold px-7 py-3 rounded-lg text-sm hover:bg-green-50 transition cursor-pointer border-none">
                                Browse products
                            </button>
                        </>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 px-6 pt-12 pb-8">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-4 gap-10 mb-10">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-lg">🌾</span>
                                <span className="font-extrabold text-white">Kambeng Market</span>
                            </div>
                            <p className="text-slate-500 text-xs leading-relaxed max-w-[200px]">
                                Connecting Gambian farmers directly with hotels, restaurants, and caterers.
                            </p>
                        </div>
                        {[
                            { title: 'Platform', links: [{ label: 'Browse products', to: isAuthenticated ? '/browse' : '/login' }, { label: 'About us', to: '/about' }, { label: 'Contact', to: '/contact' }] },
                            { title: 'Farmers', links: [{ label: 'Join as farmer', to: '/register' }, { label: 'Farmer guide', to: '/help/farmer' }, { label: 'Pricing', to: '/help/pricing' }] },
                        ].map((col, i) => (
                            <div key={i}>
                                <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">{col.title}</h4>
                                <ul className="space-y-2.5 list-none p-0 m-0">
                                    {col.links.map((l, j) => (
                                        <li key={j}>
                                            <Link to={l.to} className="text-slate-500 text-xs no-underline hover:text-slate-300 transition">{l.label}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                        <div>
                            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">Contact</h4>
                            <ul className="space-y-2.5 list-none p-0 m-0">
                                {['📧 info@kambeng.com', '📞 +220 700 0000', '📍 Banjul, The Gambia'].map((item, i) => (
                                    <li key={i} className="text-slate-500 text-xs">{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 pt-6 flex items-center justify-between">
                        <p className="text-slate-600 text-xs">© {new Date().getFullYear()} Kambeng Market. All rights reserved.</p>
                        <p className="text-slate-600 text-xs">Made in 🇬🇲 The Gambia</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

// Separate Skeleton Component
const HomeSkeleton = () => {
    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Navbar Skeleton */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 flex items-center gap-6" style={{ height: 60 }}>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Skeleton className="w-6 h-6 rounded-full" />
                        <Skeleton className="h-6 w-24" />
                    </div>
                    <div className="flex-1 max-w-md">
                        <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                    <div className="ml-auto flex items-center gap-3 flex-shrink-0">
                        <Skeleton className="h-8 w-16 rounded-lg" />
                        <Skeleton className="h-8 w-24 rounded-lg" />
                    </div>
                </div>
            </nav>

            {/* Hero Skeleton */}
            <section className="bg-white border-b border-slate-100">
                <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-2 gap-16 items-center">
                    <div>
                        <Skeleton className="h-6 w-40 rounded-full mb-5" />
                        <Skeleton className="h-12 w-full mb-3" />
                        <Skeleton className="h-12 w-3/4 mb-4" />
                        <Skeleton className="h-6 w-80 mb-8" />
                        <div className="flex gap-3 flex-wrap">
                            <Skeleton className="h-12 w-32 rounded-lg" />
                            <Skeleton className="h-12 w-32 rounded-lg" />
                        </div>
                        <Skeleton className="h-5 w-60 mt-6" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                                <Skeleton className="h-8 w-8 mb-2" />
                                <Skeleton className="h-8 w-16 mb-1" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories Skeleton */}
            <section className="bg-white border-b border-slate-100 py-6">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex items-center justify-between mb-4">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-5 w-28" />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <Skeleton key={i} className="h-9 w-24 rounded-full flex-shrink-0" />
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products Skeleton */}
            <section className="py-10">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <Skeleton className="h-7 w-48 mb-1" />
                            <Skeleton className="h-4 w-36" />
                        </div>
                        <Skeleton className="h-5 w-20" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <Skeleton className="w-full h-36" />
                                <div className="p-3 space-y-2">
                                    <Skeleton className="h-3 w-24" />
                                    <Skeleton className="h-5 w-3/4" />
                                    <div className="flex items-center justify-between">
                                        <Skeleton className="h-6 w-16" />
                                        <Skeleton className="h-4 w-12" />
                                    </div>
                                    <Skeleton className="h-9 w-full rounded-lg" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Kambeng Skeleton */}
            <section className="bg-white border-t border-slate-100 py-14">
                <div className="max-w-6xl mx-auto px-6">
                    <Skeleton className="h-7 w-48 mb-8" />
                    <div className="grid grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                                <Skeleton className="h-10 w-10 mb-3" />
                                <Skeleton className="h-5 w-32 mb-2" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4 mt-1" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Skeleton */}
            <section className="bg-green-600 py-14 px-6">
                <div className="max-w-xl mx-auto text-center">
                    <Skeleton className="h-8 w-64 mx-auto mb-3" />
                    <Skeleton className="h-5 w-80 mx-auto mb-7" />
                    <div className="flex gap-3 justify-center flex-wrap">
                        <Skeleton className="h-12 w-40 rounded-lg" />
                        <Skeleton className="h-12 w-32 rounded-lg" />
                    </div>
                </div>
            </section>

            {/* Footer Skeleton */}
            <footer className="bg-slate-900 px-6 pt-12 pb-8">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-4 gap-10 mb-10">
                        <div>
                            <Skeleton className="h-6 w-32 mb-3" />
                            <Skeleton className="h-4 w-40" />
                        </div>
                        {[1, 2, 3].map((i) => (
                            <div key={i}>
                                <Skeleton className="h-4 w-24 mb-4" />
                                <div className="space-y-2">
                                    <Skeleton className="h-3 w-32" />
                                    <Skeleton className="h-3 w-28" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-slate-800 pt-6 flex items-center justify-between">
                        <Skeleton className="h-3 w-48" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                </div>
            </footer>
        </div>
    );
};

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const handleClick = () => navigate(isAuthenticated ? `/app/products/${product.id}` : '/login');
    const handleOrder = (e) => {
        e.stopPropagation();
        navigate(isAuthenticated ? `/app/place-order/${product.id}` : '/login');
    };

    return (
        <div
            onClick={handleClick}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:shadow-lg transition-all"
        >
            <div className="relative h-36 bg-slate-100">
                {product.photos?.length > 0 ? (
                    <img
                        src={product.photos[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                        {getCategoryIcon(product.category)}
                    </div>
                )}
                {product.is_available && (
                    <span className="absolute top-2 left-2 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                        Fresh
                    </span>
                )}
            </div>
            <div className="p-3">
                <p className="text-[11px] text-slate-400 font-medium mb-0.5">{product.farmer?.name || 'Unknown Farmer'}</p>
                <h3 className="text-sm font-bold text-slate-900 truncate mb-1.5">{product.name}</h3>
                <div className="flex items-center justify-between mb-2.5">
                    <span className="text-base font-extrabold text-green-600">{product.price_formatted}</span>
                    <span className="text-[11px] text-slate-400">{product.quantity} {product.unit}</span>
                </div>
                <button
                    onClick={handleOrder}
                    className="w-full bg-green-600 text-white text-xs font-semibold py-2 rounded-lg hover:bg-green-700 transition border-none cursor-pointer"
                >
                    Place order
                </button>
            </div>
        </div>
    );
};

const getCategoryIcon = (category) => {
    const icons = {
        'Vegetables': '🥬', 'Fruits': '🍎', 'Grains': '🌾',
        'Herbs': '🌿', 'Spices': '🌶️', 'Dairy': '🥛',
        'Meat': '🥩', 'Fish': '🐟', 'Poultry': '🐔',
        'Eggs': '🥚', 'Rice': '🍚', 'Groundnuts': '🥜',
        'Cereals': '🌾', 'Legumes': '🫘', 'Roots': '🥔', 'Tubers': '🍠',
    };
    return icons[category] || '📦';
};