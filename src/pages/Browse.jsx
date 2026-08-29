// src/pages/Browse.jsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { BrowseSkeleton } from '../components/common/skeletons/BrowseSkeleton';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import api from '../services/api';

const CATEGORY_ICONS = {
    'Vegetables': '🥬', 'Fruits': '🍎', 'Grains': '🌾',
    'Herbs': '🌿', 'Spices': '🌶️', 'Dairy': '🥛',
    'Meat': '🥩', 'Fish': '🐟', 'Poultry': '🐔',
    'Eggs': '🥚', 'Rice': '🍚', 'Groundnuts': '🥜',
    'Cereals': '🌾', 'Legumes': '🫘', 'Roots': '🥔', 'Tubers': '🍠',
};

const Browse = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [products, setProducts] = useState([]);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    
    // Controlled text input string
    const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');
    const [category, setCategory] = useState(searchParams.get('category') || '');
    const [page, setPage] = useState(1);
    
    const [pagination, setPagination] = useState({
        current_page: 1, last_page: 1, per_page: 20, total: 0,
    });

    const searchInputRef = useRef(null);
    // Tracks the last category/search combo actually fetched, so a filter
    // change and the page-1 reset it triggers collapse into a single
    // request instead of firing once with the stale page (e.g. page 3 of
    // the old filter set) and again a render later with the corrected page.
    const prevFiltersRef = useRef({ category, search: searchValue });

    // Debounce processing
    const debouncedSearch = useDebounce(searchValue, 300);

    // Primary data fetcher
    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                category: String(category ?? ''),
                search: String(debouncedSearch ?? ''),
                page: String(page),
                per_page: '20',
            });
            const response = await api.get(`/products?${params}`);
            setProducts(response.data.data || []);
            setPagination(response.data.meta || { current_page: 1, last_page: 1, per_page: 20, total: 0 });
        } catch (err) {
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
            setIsInitialLoad(false);
        }
    }, [category, debouncedSearch, page]);

    // Reset pagination back to page 1 whenever search terms or category
    // change, then fetch exactly once with the correct page for the new
    // filters (see prevFiltersRef above).
    useEffect(() => {
        const filtersChanged =
            prevFiltersRef.current.category !== category ||
            prevFiltersRef.current.search !== debouncedSearch;
        prevFiltersRef.current = { category, search: debouncedSearch };

        if (filtersChanged && page !== 1) {
            setPage(1);
            return;
        }

        fetchProducts();
    }, [category, debouncedSearch, page, fetchProducts]);

    // Isolated runtime category fetcher
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/products/categories');
                setCategories(response.data.data || []);
            } catch (err) {
                console.error('Error fetching categories:', err);
            }
        };
        fetchCategories();
    }, []);

    const clearFilters = () => {
        setSearchValue('');
        setCategory('');
        setPage(1);
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

    if (isInitialLoad) return <BrowseSkeleton />;

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-6xl mx-auto px-6 py-5">
                    <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Browse products</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Fresh produce from verified Gambian farmers</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-6">
                {/* Search + filter bar */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 mb-5 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search products or farmers..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-green-400 dark:focus:border-green-500 focus:bg-white dark:focus:bg-slate-800 transition"
                            autoComplete="off"
                        />
                    </div>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:border-green-400 dark:focus:border-green-500 focus:bg-white dark:focus:bg-slate-800 transition sm:w-48 cursor-pointer"
                    >
                        <option value="">All categories</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>{CATEGORY_ICONS[cat] || '📦'} {cat}</option>
                        ))}
                    </select>
                    {(searchValue || category) && (
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition border-none cursor-pointer flex-shrink-0"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* Category pills */}
                {categories.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1 mb-5">
                        <button
                            onClick={() => setCategory('')}
                            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                                !category
                                    ? 'bg-green-600 text-white border-green-600'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-green-400 dark:hover:border-green-600 hover:text-green-700 dark:hover:text-green-400'
                            }`}
                        >
                            All
                        </button>
                        {categories.slice(0, 12).map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                                    category === cat
                                        ? 'bg-green-600 text-white border-green-600'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-green-400 dark:hover:border-green-600 hover:text-green-700 dark:hover:text-green-400'
                                }`}
                            >
                                <span>{CATEGORY_ICONS[cat] || '📦'}</span>
                                <span>{cat}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Results count */}
                <div className="flex items-center justify-between mb-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {pagination.total > 0 ? `${pagination.total} product${pagination.total !== 1 ? 's' : ''} found` : ''}
                    </p>
                    {(debouncedSearch || category) && (
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                            {category && <span className="font-medium text-green-600 dark:text-green-400">{category}</span>}
                            {debouncedSearch && category && ' · '}
                            {debouncedSearch && <span>"{debouncedSearch}"</span>}
                        </p>
                    )}
                </div>

                {/* Products grid container with smooth opacity transitions */}
                <div className={`transition-opacity duration-200 ${loading ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
                    {products.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-center py-20">
                            <div className="text-5xl mb-3">🔍</div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">No products found</h3>
                            <p className="text-sm text-slate-400 dark:text-slate-500 mb-5">Try a different search or category.</p>
                            <button
                                onClick={clearFilters}
                                className="bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-green-700 transition border-none cursor-pointer"
                            >
                                Clear filters
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {products.map((product) => (
                                    <ProductCard key={product.id} product={product} navigate={navigate} user={user} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination.last_page > 1 && (
                                <nav
                                    aria-label="Product results pagination"
                                    className="mt-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3.5 flex items-center justify-between flex-wrap gap-3"
                                >
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        Showing {products.length} of {pagination.total} products
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            aria-label="Go to previous page"
                                            disabled={loading || pagination.current_page <= 1}
                                            onClick={() => setPage(pagination.current_page - 1)}
                                            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                                        >← Previous</button>
                                        <span aria-live="polite" className="text-xs text-slate-500 dark:text-slate-400 px-1">
                                            Page {pagination.current_page} of {pagination.last_page}
                                        </span>
                                        <button
                                            type="button"
                                            aria-label="Go to next page"
                                            disabled={loading || pagination.current_page >= pagination.last_page}
                                            onClick={() => setPage(pagination.current_page + 1)}
                                            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                                        >Next →</button>
                                    </div>
                                </nav>
                            )}
                        </>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

// Declared strictly outside the main container scope to safeguard input structural focus tracking
const ProductCard = ({ product, navigate, user }) => {
    const isExpired = product.expiry_date && new Date(product.expiry_date) < new Date();
    const isAvailable = product.is_available && !isExpired;

    const handleOrder = (e) => {
        e.stopPropagation();
        navigate(`/app/place-order/${product.id}`);
    };

    return (
        <div
            onClick={() => navigate(`/app/products/${product.id}`)}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:shadow-lg transition-all group"
        >
            {/* Image Wrap */}
            <div className="relative h-36 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <ImageWithFallback
                    src={product.photos?.length > 0 ? product.photos[0] : null}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    icon={CATEGORY_ICONS[product.category] || '🌾'}
                    iconClassName="text-4xl"
                />

                {/* Status badge */}
                <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                    isExpired    ? 'bg-red-500 text-white' :
                    !isAvailable ? 'bg-slate-600 text-white' :
                                   'bg-green-500 text-white'
                }`}>
                    {isExpired ? 'Expired' : !isAvailable ? 'Sold out' : 'Fresh'}
                </span>

                {product.average_rating > 0 && (
                    <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        ⭐ {product.average_rating.toFixed(1)}
                    </span>
                )}
            </div>

            {/* Info */}
            <div className="p-3">
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mb-0.5">
                    {product.farmer?.name || 'Unknown Farmer'}
                </p>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate mb-1.5 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
                    {product.name}
                </h3>
                <div className="flex items-center justify-between mb-2.5">
                    <span className="text-base font-extrabold text-green-600 dark:text-green-400">
                        {product.price_formatted || `GMD ${product.price}`}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">{product.quantity} {product.unit}</span>
                </div>

                {user?.role === 'buyer' && isAvailable ? (
                    <button
                        onClick={handleOrder}
                        className="w-full bg-green-600 text-white text-xs font-semibold py-2 rounded-lg hover:bg-green-700 transition border-none cursor-pointer"
                    >
                        Place order
                    </button>
                ) : user?.role === 'buyer' && !isAvailable ? (
                    <button disabled className="w-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 text-xs font-semibold py-2 rounded-lg cursor-not-allowed border-none">
                        {isExpired ? 'Expired' : 'Sold out'}
                    </button>
                ) : user?.role === 'farmer' ? (
                    <button className="w-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-xs font-semibold py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/60 transition border-none cursor-pointer">
                        View details
                    </button>
                ) : (
                    <Link to="/login" onClick={(e) => e.stopPropagation()}>
                        <button className="w-full bg-green-600 text-white text-xs font-semibold py-2 rounded-lg hover:bg-green-700 transition border-none cursor-pointer">
                            Login to order
                        </button>
                    </Link>
                )}
            </div>
        </div>
    );
};

export default Browse;