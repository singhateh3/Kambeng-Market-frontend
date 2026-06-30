// src/pages/Browse.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BrowseSkeleton } from '../components/common/skeletons/BrowseSkeleton';
import { useAuth } from '../hooks/useAuth';
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
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        search:   searchParams.get('search')   || '',
        page: 1,
        per_page: 20,
    });
    const [pagination, setPagination] = useState({
        current_page: 1, last_page: 1, per_page: 20, total: 0,
    });

    useEffect(() => {
        fetchProducts();
    }, [filters]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                category: String(filters.category ?? ''),
                search:   String(filters.search   ?? ''),
                page:     String(filters.page     ?? 1),
                per_page: String(filters.per_page ?? 20),
            });
            const response = await api.get(`/products?${params}`);
            setProducts(response.data.data || []);
            setPagination(response.data.meta || { current_page: 1, last_page: 1, per_page: 20, total: 0 });
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
        } catch {}
    };

    const handleFilterChange = (key, value) =>
        setFilters(f => ({ ...f, [key]: value, page: 1 }));

    const handlePageChange = (newPage) =>
        setFilters(f => ({ ...f, page: newPage }));

    const clearFilters = () =>
        setFilters({ category: '', search: '', page: 1, per_page: 20 });

    if (loading) return <BrowseSkeleton />;

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-6 py-5">
                    <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Browse products</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Fresh produce from verified Gambian farmers</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-6">
                {/* Search + filter bar */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 mb-5 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search products or farmers..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-900 outline-none focus:border-green-400 focus:bg-white transition"
                        />
                    </div>
                    <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-700 outline-none focus:border-green-400 focus:bg-white transition sm:w-48 cursor-pointer"
                    >
                        <option value="">All categories</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>{CATEGORY_ICONS[cat] || '📦'} {cat}</option>
                        ))}
                    </select>
                    {(filters.search || filters.category) && (
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition border-none cursor-pointer flex-shrink-0"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* Category pills */}
                {categories.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1 mb-5">
                        <button
                            onClick={() => handleFilterChange('category', '')}
                            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                                !filters.category
                                    ? 'bg-green-600 text-white border-green-600'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-green-400 hover:text-green-700'
                            }`}
                        >
                            All
                        </button>
                        {categories.slice(0, 12).map((cat) => (
                            <button
                                key={cat}
                                onClick={() => handleFilterChange('category', cat)}
                                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                                    filters.category === cat
                                        ? 'bg-green-600 text-white border-green-600'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-green-400 hover:text-green-700'
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
                    <p className="text-xs text-slate-500">
                        {pagination.total > 0 ? `${pagination.total} product${pagination.total !== 1 ? 's' : ''} found` : ''}
                    </p>
                    {(filters.search || filters.category) && (
                        <p className="text-xs text-slate-400">
                            {filters.category && <span className="font-medium text-green-600">{filters.category}</span>}
                            {filters.search && filters.category && ' · '}
                            {filters.search && <span>"{filters.search}"</span>}
                        </p>
                    )}
                </div>

                {/* Products grid */}
                {products.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-xl text-center py-20">
                        <div className="text-5xl mb-3">🔍</div>
                        <h3 className="text-base font-bold text-slate-900 mb-1">No products found</h3>
                        <p className="text-sm text-slate-400 mb-5">Try a different search or category.</p>
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
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.last_page > 1 && (
                            <div className="mt-5 bg-white border border-slate-200 rounded-xl px-5 py-3.5 flex items-center justify-between flex-wrap gap-3">
                                <span className="text-xs text-slate-500">
                                    Showing {products.length} of {pagination.total} products
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={pagination.current_page <= 1}
                                        onClick={() => handlePageChange(pagination.current_page - 1)}
                                        className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                    >← Previous</button>
                                    <span className="text-xs text-slate-500 px-1">
                                        {pagination.current_page} / {pagination.last_page}
                                    </span>
                                    <button
                                        disabled={pagination.current_page >= pagination.last_page}
                                        onClick={() => handlePageChange(pagination.current_page + 1)}
                                        className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                    >Next →</button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

const ProductCard = ({ product }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isExpired = product.expiry_date && new Date(product.expiry_date) < new Date();
    const isAvailable = product.is_available && !isExpired;

    const handleOrder = (e) => {
        e.stopPropagation();
        navigate(`/app/place-order/${product.id}`);
    };

    return (
        <div
            onClick={() => navigate(`/app/products/${product.id}`)}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:shadow-lg transition-all group"
        >
            {/* Image */}
            <div className="relative h-36 bg-slate-100">
                {product.photos?.length > 0 ? (
                    <img
                        src={product.photos[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                        {CATEGORY_ICONS[product.category] || '🌾'}
                    </div>
                )}

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
                <p className="text-[11px] text-slate-400 font-medium mb-0.5">
                    {product.farmer?.name || 'Unknown Farmer'}
                </p>
                <h3 className="text-sm font-bold text-slate-900 truncate mb-1.5 group-hover:text-green-700 transition-colors">
                    {product.name}
                </h3>
                <div className="flex items-center justify-between mb-2.5">
                    <span className="text-base font-extrabold text-green-600">
                        {product.price_formatted || `GMD ${product.price}`}
                    </span>
                    <span className="text-[11px] text-slate-400">{product.quantity} {product.unit}</span>
                </div>

                {user?.role === 'buyer' && isAvailable ? (
                    <button
                        onClick={handleOrder}
                        className="w-full bg-green-600 text-white text-xs font-semibold py-2 rounded-lg hover:bg-green-700 transition border-none cursor-pointer"
                    >
                        Place order
                    </button>
                ) : user?.role === 'buyer' && !isAvailable ? (
                    <button disabled className="w-full bg-slate-100 text-slate-400 text-xs font-semibold py-2 rounded-lg cursor-not-allowed border-none">
                        {isExpired ? 'Expired' : 'Sold out'}
                    </button>
                ) : user?.role === 'farmer' ? (
                    <button className="w-full bg-blue-50 text-blue-600 text-xs font-semibold py-2 rounded-lg hover:bg-blue-100 transition border-none cursor-pointer">
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
