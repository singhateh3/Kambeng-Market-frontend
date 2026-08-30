// src/pages/farmer/Products.jsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Modal } from '../../components/Modal';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';
import { ProductsSkeleton } from '../../components/common/skeletons/ProductsSkeleton';
import { useAuth } from '../../hooks/useAuth';
import { useDebounce } from '../../hooks/useDebounce';
import api from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';

const Products = () => {
    const location = useLocation();
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filters, setFilters] = useState({
        category: '',
        search: '',
        status: '',
        page: 1,
        per_page: 20
    });
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0
    });
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [modalAction, setModalAction] = useState('');
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [loadingAction, setLoadingAction] = useState(false);
    const [searchHistory, setSearchHistory] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchInputRef = useRef(null);
    const searchContainerRef = useRef(null);
    const isTypingRef = useRef(false);

    // Debounce search to avoid too many API calls
    const debouncedSearch = useDebounce(filters.search, 300);

    // Separate state for search value to prevent re-renders
    const [searchValue, setSearchValue] = useState('');

    useEffect(() => {
        if (location.state?.refresh) setFilters(f => ({ ...f, page: 1 }));
    }, [location.state]);

    // Only refetch on the settled (debounced) search value + the non-search filters.
    useEffect(() => {
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.category, filters.status, filters.page, filters.per_page, debouncedSearch]);

    // Categories + search history only need to load once
    useEffect(() => {
        fetchCategories();
        loadSearchHistory();
    }, []);

    // Click outside handler for suggestions
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                // Don't close if we're typing
                if (!isTypingRef.current) {
                    setShowSuggestions(false);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const flash = (type, msg) => {
        if (type === 'success') {
            setSuccess(msg);
            setTimeout(() => setSuccess(null), 3000);
        } else {
            setError(msg);
            setTimeout(() => setError(null), 3000);
        }
    };

    const fetchProducts = useCallback(async () => {
        try {
            setRefreshing(true);
            const params = new URLSearchParams({
                category: String(filters.category ?? ''),
                search: String(debouncedSearch ?? ''),
                status: String(filters.status ?? ''),
                page: String(filters.page ?? 1),
                per_page: String(filters.per_page ?? 20),
            });
            const response = await api.get(`/my-products?${params}`);
            setProducts(response.data.data || []);
            setPagination(response.data.meta || {
                current_page: 1,
                last_page: 1,
                per_page: 20,
                total: 0
            });
        } catch (err) {
            console.error(err);
            flash('error', 'Failed to load products');
        } finally {
            setRefreshing(false);
            setInitialLoading(false);
        }
    }, [filters.category, filters.status, filters.page, filters.per_page, debouncedSearch]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/products/categories');
            setCategories(res.data.data || []);
        } catch {}
    };

    // Load search history from localStorage
    const loadSearchHistory = () => {
        try {
            const history = JSON.parse(localStorage.getItem('productSearchHistory') || '[]');
            setSearchHistory(history.slice(0, 5));
        } catch {
            setSearchHistory([]);
        }
    };

    // Save search to history
    const saveSearchToHistory = (searchTerm) => {
        if (!searchTerm.trim()) return;
        try {
            const history = JSON.parse(localStorage.getItem('productSearchHistory') || '[]');
            const updated = [searchTerm, ...history.filter(h => h !== searchTerm)].slice(0, 10);
            localStorage.setItem('productSearchHistory', JSON.stringify(updated));
            setSearchHistory(updated);
        } catch {}
    };

    const handleDelete = async (productId) => {
        try {
            setLoadingAction(true);
            await api.delete(`/products/${productId}`);
            flash('success', 'Product deleted');
            setShowModal(false);
            setSelectedProduct(null);
            await fetchProducts();
        } catch {
            flash('error', 'Failed to delete product');
        } finally {
            setLoadingAction(false);
        }
    };

    const handleStatusUpdate = async (productId, status) => {
        try {
            setLoadingAction(true);
            await api.patch(`/products/${productId}/status`, { status });
            flash('success', `Product marked as ${status}`);
            await fetchProducts();
        } catch {
            flash('error', 'Failed to update status');
        } finally {
            setLoadingAction(false);
        }
    };

    const openModal = (product, action) => {
        setSelectedProduct(product);
        setModalAction(action);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedProduct(null);
        setModalAction('');
    };

    const handlePageChange = (p) => setFilters(f => ({ ...f, page: p }));

    // FIXED: Handle search change without losing focus
    const handleSearchChange = (e) => {
        const value = e.target.value;

        // Update the input value directly
        setSearchValue(value);

        // Mark as typing
        isTypingRef.current = true;

        // Update filters with the new search value
        setFilters(f => ({ ...f, search: value, page: 1 }));

        // Show suggestions if there's text
        if (value.length > 0) {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }

        // Reset typing flag after a short delay
        clearTimeout(window.typingTimeout);
        window.typingTimeout = setTimeout(() => {
            isTypingRef.current = false;
        }, 500);
    };

    // Save to history only once typing has settled
    useEffect(() => {
        if (debouncedSearch && debouncedSearch.length > 2) {
            saveSearchToHistory(debouncedSearch);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setShowSuggestions(false);
        if (filters.search.trim()) {
            saveSearchToHistory(filters.search);
            fetchProducts();
        }
    };

    const clearSearch = () => {
        setSearchValue('');
        setFilters(f => ({ ...f, search: '', page: 1 }));
        setShowSuggestions(false);
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(f => ({ ...f, [key]: value, page: 1 }));
        setShowSuggestions(false);
    };

    const handleHistoryClick = (term) => {
        setSearchValue(term);
        setFilters(f => ({ ...f, search: term, page: 1 }));
        setShowSuggestions(false);
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

    // Get status badge color
    const getStatusBadge = (product) => {
        const isExpired = product.expiry_date && new Date(product.expiry_date) < new Date();
        if (isExpired) return { label: 'Expired', color: 'bg-red-500 text-white' };
        if (product.status === 'sold') return { label: 'Sold out', color: 'bg-slate-700 text-white' };
        if (product.status === 'active') return { label: 'Active', color: 'bg-green-500 text-white' };
        return { label: product.status, color: 'bg-gray-500 text-white' };
    };

    if (initialLoading) return <ProductsSkeleton />;

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">My Products</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            {pagination.total} listing{pagination.total !== 1 ? 's' : ''} in your store
                        </p>
                    </div>
                    <Link
                        to="/app/products/create"
                        className="bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg no-underline hover:bg-green-700 transition flex items-center gap-2"
                    >
                        <span>+</span> Add product
                    </Link>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-6">
                {/* Alerts */}
                {success && (
                    <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 text-sm px-4 py-3 rounded-xl mb-4 animate-in slide-in-from-top duration-300">
                        <span>✅ {success}</span>
                        <button onClick={() => setSuccess(null)} className="text-green-600 dark:text-green-400 bg-transparent border-none cursor-pointer text-lg leading-none">×</button>
                    </div>
                )}
                {error && (
                    <div className="flex items-center justify-between bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-sm px-4 py-3 rounded-xl mb-4 animate-in slide-in-from-top duration-300">
                        <span>⚠️ {error}</span>
                        <button onClick={() => setError(null)} className="text-red-600 dark:text-red-400 bg-transparent border-none cursor-pointer text-lg leading-none">×</button>
                    </div>
                )}

                {/* Search and Filters */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 mb-6">
                    <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
                        {/* Search Input with Suggestions Container */}
                        <div className="relative flex-1" ref={searchContainerRef}>
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search products by name, category, or description..."
                                    value={searchValue}
                                    onChange={handleSearchChange}
                                    onFocus={() => {
                                        if (filters.search.length > 0) {
                                            setShowSuggestions(true);
                                        }
                                    }}
                                    className="w-full pl-9 pr-10 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-green-400 dark:focus:border-green-600 focus:bg-white dark:focus:bg-slate-900 transition"
                                    autoComplete="off"
                                />
                                {filters.search && (
                                    <button
                                        type="button"
                                        onClick={clearSearch}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            {/* Search Suggestions Dropdown - Fixed positioning */}
                            {showSuggestions && filters.search && (
                                <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50 max-h-60 overflow-y-auto">
                                    {searchHistory.length > 0 && (
                                        <div className="p-2">
                                            <div className="text-xs text-slate-400 dark:text-slate-500 px-2 py-1">Recent searches</div>
                                            {searchHistory.map((term, i) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => handleHistoryClick(term)}
                                                    className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition flex items-center gap-2"
                                                >
                                                    <svg className="w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {term}
                                                </button>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    localStorage.removeItem('productSearchHistory');
                                                    setSearchHistory([]);
                                                    setShowSuggestions(false);
                                                }}
                                                className="w-full text-left px-3 py-1 text-xs text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                            >
                                                Clear search history
                                            </button>
                                        </div>
                                    )}
                                    {filters.search && (
                                        <div className="border-t border-slate-100 dark:border-slate-700 p-2">
                                            <button
                                                type="submit"
                                                className="w-full text-left px-3 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                                Search for "{filters.search}"
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Category Filter */}
                        <select
                            value={filters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 outline-none focus:border-green-400 dark:focus:border-green-600 focus:bg-white dark:focus:bg-slate-900 transition sm:w-48 cursor-pointer"
                        >
                            <option value="">All categories</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>

                        {/* Status Filter */}
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 outline-none focus:border-green-400 dark:focus:border-green-600 focus:bg-white dark:focus:bg-slate-900 transition sm:w-40 cursor-pointer"
                        >
                            <option value="">All status</option>
                            <option value="active">Active</option>
                            <option value="sold">Sold out</option>
                        </select>
                    </form>

                    {/* Active Filters */}
                    {(filters.category || filters.status) && (
                        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                            <span className="text-xs text-slate-400 dark:text-slate-500">Active filters:</span>
                            {filters.category && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full border border-green-200 dark:border-green-800">
                                    Category: {filters.category}
                                    <button
                                        type="button"
                                        onClick={() => handleFilterChange('category', '')}
                                        className="hover:text-green-900 dark:hover:text-green-100"
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                            {filters.status && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800">
                                    Status: {filters.status}
                                    <button
                                        type="button"
                                        onClick={() => handleFilterChange('status', '')}
                                        className="hover:text-blue-900 dark:hover:text-blue-100"
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchValue('');
                                    setFilters({ category: '', search: '', status: '', page: 1, per_page: 20 });
                                    setShowSuggestions(false);
                                    if (searchInputRef.current) {
                                        searchInputRef.current.focus();
                                    }
                                }}
                                className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                Clear all
                            </button>
                        </div>
                    )}
                </div>

                {/* Products Grid - Rest of the component stays the same */}
                {products.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-center py-20">
                        <div className="text-5xl mb-3">🌾</div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                            {filters.search || filters.category || filters.status ? 'No matching products' : 'No products yet'}
                        </h3>
                        <p className="text-sm text-slate-400 dark:text-slate-500 mb-5">
                            {filters.search || filters.category || filters.status
                                ? 'Try adjusting your search or filters'
                                : 'List your first product to start selling.'}
                        </p>
                        {!filters.search && !filters.category && !filters.status && (
                            <Link to="/app/products/create" className="bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg no-underline hover:bg-green-700 transition">
                                Add your first product
                            </Link>
                        )}
                        {(filters.search || filters.category || filters.status) && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchValue('');
                                    setFilters({ category: '', search: '', status: '', page: 1, per_page: 20 });
                                    setShowSuggestions(false);
                                }}
                                className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
                            >
                                Clear all filters
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Results Summary */}
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                Showing {products.length} of {pagination.total} products
                                {filters.search && <span> for "{filters.search}"</span>}
                                {refreshing && (
                                    <span className="inline-block w-3.5 h-3.5 border-2 border-slate-300 dark:border-slate-600 border-t-green-600 dark:border-t-green-400 rounded-full animate-spin" />
                                )}
                            </p>
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                                Page {pagination.current_page} of {pagination.last_page}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {products.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onView={() => openModal(product, 'view')}
                                    onDelete={() => openModal(product, 'delete')}
                                    onStatusUpdate={handleStatusUpdate}
                                    loadingAction={loadingAction}
                                    getStatusBadge={getStatusBadge}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.total > 0 && (
                            <div className="mt-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3.5 flex items-center justify-between flex-wrap gap-3">
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    Showing {products.length} of {pagination.total} products
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={pagination.current_page <= 1}
                                        onClick={() => handlePageChange(pagination.current_page - 1)}
                                        className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                    >
                                        ← Previous
                                    </button>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 px-1">
                                        {pagination.current_page} / {pagination.last_page}
                                    </span>
                                    <button
                                        disabled={pagination.current_page >= pagination.last_page}
                                        onClick={() => handlePageChange(pagination.current_page + 1)}
                                        className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                    >
                                        Next →
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal */}
            <Modal isOpen={showModal && !!selectedProduct} onClose={closeModal} maxWidth="max-w-md">
                {selectedProduct && (
                    <>
                        {modalAction === 'delete' ? (
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Delete product</h3>
                                    <button
                                        onClick={closeModal}
                                        className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 bg-transparent border-none cursor-pointer text-xl leading-none"
                                    >
                                        ×
                                    </button>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">
                                    Are you sure you want to delete <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedProduct.name}</span>?
                                </p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">This action cannot be undone.</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={closeModal}
                                        disabled={loadingAction}
                                        className="flex-1 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 py-2.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition border-none cursor-pointer disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleDelete(selectedProduct.id)}
                                        disabled={loadingAction}
                                        className="flex-1 text-sm font-semibold text-white bg-red-600 py-2.5 rounded-lg hover:bg-red-700 transition border-none cursor-pointer disabled:opacity-50"
                                    >
                                        {loadingAction ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="relative h-56 bg-slate-100 dark:bg-slate-800">
                                    <ImageWithFallback
                                        src={selectedProduct.photos?.length > 0 ? getImageUrl(selectedProduct.photos[0]) : null}
                                        alt={selectedProduct.name}
                                        className="w-full h-full object-cover"
                                        iconClassName="text-5xl"
                                    />
                                    <button
                                        onClick={closeModal}
                                        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white rounded-full text-slate-600 text-lg leading-none border-none cursor-pointer shadow-sm"
                                    >
                                        ×
                                    </button>
                                    <span className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${getStatusBadge(selectedProduct).color}`}>
                                        {getStatusBadge(selectedProduct).label}
                                    </span>
                                </div>
                                <div className="p-5">
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide mb-0.5">
                                        {selectedProduct.category}
                                        {selectedProduct.variety && ` · ${selectedProduct.variety}`}
                                    </p>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">{selectedProduct.name}</h3>

                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xl font-extrabold text-green-600 dark:text-green-400">
                                            {selectedProduct.price_formatted || `GMD ${selectedProduct.price}`}
                                        </span>
                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                            per {selectedProduct.unit_display || selectedProduct.unit}
                                        </span>
                                    </div>

                                    {selectedProduct.description && (
                                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                                            {selectedProduct.description}
                                        </p>
                                    )}

                                    <div className="grid grid-cols-2 gap-3 text-sm border-t border-slate-100 dark:border-slate-700 pt-4">
                                        <div>
                                            <p className="text-xs text-slate-400 dark:text-slate-500">Quantity</p>
                                            <p className="font-medium text-slate-900 dark:text-slate-100">
                                                {selectedProduct.quantity} {selectedProduct.unit}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 dark:text-slate-500">Orders</p>
                                            <p className="font-medium text-slate-900 dark:text-slate-100">{selectedProduct.orders_count || 0}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 dark:text-slate-500">Harvested</p>
                                            <p className="font-medium text-slate-900 dark:text-slate-100">
                                                {selectedProduct.harvest_date_display || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 dark:text-slate-500">Expires</p>
                                            <p className="font-medium text-slate-900 dark:text-slate-100">
                                                {selectedProduct.expiry_date_display || '-'}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={closeModal}
                                        className="w-full mt-5 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 py-2.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition border-none cursor-pointer"
                                    >
                                        Close
                                    </button>
                                </div>
                            </>
                        )}
                    </>
                )}
            </Modal>
        </div>
    );
};

const ProductCard = ({ product, onView, onDelete, onStatusUpdate, loadingAction, getStatusBadge }) => {
    const status = getStatusBadge(product);
    const isExpired = product.expiry_date && new Date(product.expiry_date) < new Date();

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition-all group">
            <div className="relative h-36 bg-slate-100 dark:bg-slate-800">
                <ImageWithFallback
                    src={product.photos?.length > 0 ? getImageUrl(product.photos[0]) : null}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    iconClassName="text-4xl"
                />
                <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${status.color}`}>
                    {status.label}
                </span>
                {isExpired && (
                    <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white uppercase tracking-wide">
                        Expired
                    </span>
                )}
            </div>
            <div className="p-3">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide mb-0.5">
                    {product.category}
                </p>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate mb-1 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
                    {product.name}
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
                    {product.quantity} {product.unit} · {product.orders_count || 0} orders
                </p>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                        {product.price_formatted || `GMD ${product.price}`}
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={onView}
                            className="w-7 h-7 flex items-center justify-center text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                            title="View details"
                        >
                            👁️
                        </button>
                        <Link
                            to={`/app/products/${product.id}/edit`}
                            className="w-7 h-7 flex items-center justify-center text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition no-underline"
                            title="Edit product"
                            aria-label="Edit product"
                        >
                            ✏️
                        </Link>
                        {!isExpired && (
                            product.status === 'active' ? (
                                <button
                                    onClick={() => onStatusUpdate(product.id, 'sold')}
                                    disabled={loadingAction}
                                    className="px-2 py-1 text-[10px] font-bold text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/40 border border-yellow-200 dark:border-yellow-800 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/60 transition cursor-pointer disabled:opacity-50"
                                >
                                    Out
                                </button>
                            ) : (
                                <button
                                    onClick={() => onStatusUpdate(product.id, 'active')}
                                    disabled={loadingAction}
                                    className="px-2 py-1 text-[10px] font-bold text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/40 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/60 transition cursor-pointer disabled:opacity-50"
                                >
                                    Live
                                </button>
                            )
                        )}
                        <button
                            onClick={onDelete}
                            className="w-7 h-7 flex items-center justify-center text-xs bg-red-50 dark:bg-red-900/40 border border-red-100 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/60 transition cursor-pointer"
                            title="Delete"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Products;
