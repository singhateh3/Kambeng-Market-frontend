// src/pages/admin/AdminProducts.jsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../../components/common/Alert';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/skeletons/Skeleton';
import { useDebounce } from '../../hooks/useDebounce';
import api from '../../services/api';

// Admin Products Skeleton Component
const AdminProductsSkeleton = () => (
    <div>
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <div>
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-48 mt-1" />
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-10 w-32" />
            </div>
        </div>
        <div className="bg-white shadow rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <th key={i} className="px-4 py-3">
                                    <Skeleton className="h-4 w-16" />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {[1, 2, 3, 4, 5].map(i => (
                            <tr key={i}>
                                <td className="px-4 py-3">
                                    <Skeleton className="h-4 w-4" />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center">
                                        <Skeleton className="w-12 h-12 rounded-lg" />
                                        <div className="ml-3">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-3 w-20 mt-1" />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-16 mt-1" />
                                </td>
                                <td className="px-4 py-3">
                                    <Skeleton className="h-4 w-20" />
                                </td>
                                <td className="px-4 py-3">
                                    <Skeleton className="h-4 w-16" />
                                </td>
                                <td className="px-4 py-3">
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                </td>
                                <td className="px-4 py-3">
                                    <Skeleton className="h-4 w-24" />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center space-x-2">
                                        <Skeleton className="h-8 w-8 rounded" />
                                        <Skeleton className="h-8 w-8 rounded" />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        status: '',
        category: '',
        search: '',
        expiring_soon: false,
        expired: false,
        page: 1,
    });
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0,
    });
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [modalAction, setModalAction] = useState('');
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [loadingAction, setLoadingAction] = useState(false);
    const [categories, setCategories] = useState([]);
    const [searchHistory, setSearchHistory] = useState([]);
    const [showSearchHistory, setShowSearchHistory] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const searchInputRef = useRef(null);
    const searchContainerRef = useRef(null);
    const isTypingRef = useRef(false);

    // Debounce search to avoid too many API calls
    const debouncedSearch = useDebounce(filters.search, 300);

    // Fetch products when filters change (except search on every keystroke)
    useEffect(() => {
        fetchProducts();
        fetchCategories();
        loadSearchHistory();
    }, [filters.status, filters.category, filters.page, debouncedSearch, filters.expiring_soon, filters.expired]);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                status: filters.status || '',
                category: filters.category || '',
                search: debouncedSearch || '',
                expiring_soon: filters.expiring_soon ? 'true' : '',
                expired: filters.expired ? 'true' : '',
                page: filters.page || 1,
                per_page: 20,
            });
            const response = await api.get(`/admin/products?${params}`);
            setProducts(response.data.data || []);
            setPagination(response.data.meta || { 
                current_page: 1, 
                last_page: 1, 
                per_page: 20, 
                total: 0 
            });
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Failed to load products');
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoading(false);
            setIsInitialLoad(false);
        }
    }, [filters.status, filters.category, filters.page, debouncedSearch, filters.expiring_soon, filters.expired]);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/products/categories');
            setCategories(response.data.data || []);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const loadSearchHistory = () => {
        try {
            const history = JSON.parse(localStorage.getItem('adminProductSearchHistory') || '[]');
            setSearchHistory(history.slice(0, 5));
        } catch {
            setSearchHistory([]);
        }
    };

    const saveSearchToHistory = (searchTerm) => {
        if (!searchTerm.trim()) return;
        try {
            const history = JSON.parse(localStorage.getItem('adminProductSearchHistory') || '[]');
            const updated = [searchTerm, ...history.filter(h => h !== searchTerm)].slice(0, 10);
            localStorage.setItem('adminProductSearchHistory', JSON.stringify(updated));
            setSearchHistory(updated);
        } catch {}
    };

    const handleDelete = async (productId) => {
        if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
        
        try {
            setLoadingAction(true);
            await api.delete(`/admin/products/${productId}`);
            setSuccess('Product deleted successfully');
            setShowModal(false);
            fetchProducts();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error deleting product:', err);
            setError('Failed to delete product');
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoadingAction(false);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedProducts.length === 0) {
            setError('Please select products to delete');
            return;
        }
        
        if (!confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) return;
        
        try {
            setLoadingAction(true);
            await api.post('/admin/products/bulk-delete', {
                product_ids: selectedProducts,
            });
            setSuccess(`${selectedProducts.length} products deleted successfully`);
            setSelectedProducts([]);
            fetchProducts();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error deleting products:', err);
            setError('Failed to delete products');
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoadingAction(false);
        }
    };

    const toggleSelect = (productId) => {
        setSelectedProducts(prev => 
            prev.includes(productId) 
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedProducts.length === products.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(products.map(p => p.id));
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

    const handlePageChange = (newPage) => {
        setFilters({ ...filters, page: newPage });
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        
        // Update the input value directly
        setSearchValue(value);
        
        // Mark as typing
        isTypingRef.current = true;
        
        // Update filters with the new search value
        setFilters(f => ({ ...f, search: value, page: 1 }));
        
        // Show search history if there's text or on focus
        if (value.length > 0) {
            setShowSearchHistory(true);
        } else {
            setShowSearchHistory(false);
        }
        
        // Save to history when user types enough
        if (value.length > 2) {
            saveSearchToHistory(value);
        }
        
        // Reset typing flag after a short delay
        clearTimeout(window.typingTimeout);
        window.typingTimeout = setTimeout(() => {
            isTypingRef.current = false;
        }, 500);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setShowSearchHistory(false);
        if (filters.search.trim()) {
            saveSearchToHistory(filters.search);
            fetchProducts();
        }
    };

    const clearSearch = () => {
        setSearchValue('');
        setFilters({ ...filters, search: '', page: 1 });
        setShowSearchHistory(false);
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

    const handleHistoryClick = (term) => {
        setSearchValue(term);
        setFilters({ ...filters, search: term, page: 1 });
        setShowSearchHistory(false);
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

    const clearHistory = () => {
        localStorage.removeItem('adminProductSearchHistory');
        setSearchHistory([]);
        setShowSearchHistory(false);
    };

    // Click outside handler for search history
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                if (!isTypingRef.current) {
                    setShowSearchHistory(false);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (isInitialLoad) {
        return <AdminProductsSkeleton />;
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <p className="text-sm text-gray-600">Manage all products on the platform</p>
                </div>
                <div className="flex gap-2">
                    {selectedProducts.length > 0 && (
                        <Button 
                            variant="danger" 
                            onClick={handleBulkDelete}
                            isLoading={loadingAction}
                        >
                            Delete Selected ({selectedProducts.length})
                        </Button>
                    )}
                    <Link to="/products/create">
                        <Button>
                            + Add New Product
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Success/Error Messages */}
            {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}
            {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

            {/* Search and Filters */}
            <div className="bg-white shadow rounded-lg p-4 mb-6">
                <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {/* Search Input with Suggestions */}
                    <div className="relative lg:col-span-2" ref={searchContainerRef}>
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search products by name, category, or farmer..."
                                value={searchValue}
                                onChange={handleSearchChange}
                                onFocus={() => {
                                    if (searchHistory.length > 0 && !searchValue) {
                                        setShowSearchHistory(true);
                                    }
                                }}
                                className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                autoComplete="off"
                            />
                            {searchValue && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Search History Dropdown */}
                        {showSearchHistory && searchHistory.length > 0 && (
                            <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                <div className="p-2">
                                    <div className="text-xs text-gray-400 px-2 py-1">Recent searches</div>
                                    {searchHistory.map((term, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => handleHistoryClick(term)}
                                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {term}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={clearHistory}
                                        className="w-full text-left px-3 py-1 text-xs text-red-500 hover:bg-red-50 rounded-lg transition"
                                    >
                                        Clear search history
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <select
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="sold">Sold</option>
                    </select>

                    <select
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={filters.category}
                        onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
                    >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>

                    <div className="flex gap-2">
                        <Button type="submit" variant="primary">
                            Search
                        </Button>
                        <Button 
                            type="button" 
                            variant="secondary" 
                            onClick={() => {
                                setSearchValue('');
                                setFilters({ status: '', category: '', search: '', expiring_soon: false, expired: false, page: 1 });
                                setShowSearchHistory(false);
                            }}
                        >
                            Clear
                        </Button>
                    </div>
                </form>

                {/* Advanced Filters */}
                <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                    <span className="text-sm text-gray-500">Advanced:</span>
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={filters.expiring_soon}
                            onChange={(e) => setFilters({ ...filters, expiring_soon: e.target.checked, page: 1 })}
                            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                        Expiring Soon (7 days)
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={filters.expired}
                            onChange={(e) => setFilters({ ...filters, expired: e.target.checked, page: 1 })}
                            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                        Expired
                    </label>
                    {(filters.status || filters.category || filters.search || filters.expiring_soon || filters.expired) && (
                        <button
                            onClick={() => {
                                setSearchValue('');
                                setFilters({ status: '', category: '', search: '', expiring_soon: false, expired: false, page: 1 });
                                setShowSearchHistory(false);
                            }}
                            className="text-sm text-red-500 hover:text-red-700"
                        >
                            Clear all filters
                        </button>
                    )}
                </div>
            </div>

            {/* Products Table Wrapper with Transition */}
            <div className={`bg-white shadow rounded-lg overflow-hidden transition-opacity duration-200 ${loading ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
                {products.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-4xl mb-4">📦</div>
                        <p className="text-gray-500">No products found</p>
                        {filters.search && (
                            <p className="text-sm text-gray-400 mt-1">No results for "{filters.search}"</p>
                        )}
                        <Link to="/products/create" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
                            List your first product →
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedProducts.length === products.length && products.length > 0}
                                                onChange={toggleSelectAll}
                                                className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
                                            />
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Product
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Farmer
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Quantity
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Expiry
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {products.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProducts.includes(product.id)}
                                                    onChange={() => toggleSelect(product.id)}
                                                    className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        {product.photos && product.photos.length > 0 ? (
                                                            <img 
                                                                src={product.photos[0]} 
                                                                alt={product.name} 
                                                                className="w-12 h-12 object-cover rounded-lg"
                                                            />
                                                        ) : (
                                                            <span className="text-2xl">🌾</span>
                                                        )}
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {product.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {product.category}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {product.farmer?.name || 'Unknown'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    ID: #{product.farmer_id}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {product.price_formatted || `GMD ${product.price}`}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                {product.quantity} {product.unit}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    product.status === 'active' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {product.status_label || product.status}
                                                </span>
                                                {product.expiry_date && new Date(product.expiry_date) < new Date() && (
                                                    <span className="ml-1 px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                                                        Expired
                                                    </span>
                                                )}
                                                {product.expiry_date && new Date(product.expiry_date) > new Date() && 
                                                    new Date(product.expiry_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                                                    <span className="ml-1 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                                                        Expiring soon
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {product.expiry_date ? new Date(product.expiry_date).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => openModal(product, 'view')}
                                                        className="text-blue-600 hover:text-blue-900 transition"
                                                        title="View"
                                                    >
                                                        👁️
                                                    </button>
                                                    <button
                                                        onClick={() => openModal(product, 'delete')}
                                                        className="text-red-600 hover:text-red-900 transition"
                                                        title="Delete"
                                                        disabled={loadingAction}
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-4 py-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2">
                            <div className="text-sm text-gray-700">
                                Showing {products.length} of {pagination.total} products
                                {filters.search && <span> for "{filters.search}"</span>}
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    disabled={pagination.current_page === 1}
                                    onClick={() => handlePageChange(pagination.current_page - 1)}
                                >
                                    Previous
                                </Button>
                                <span className="px-3 py-1 text-sm text-gray-600">
                                    Page {pagination.current_page} of {pagination.last_page}
                                </span>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    disabled={pagination.current_page === pagination.last_page}
                                    onClick={() => handlePageChange(pagination.current_page + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Modal */}
            {showModal && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-900">
                                {modalAction === 'delete' ? 'Delete Product' : 'Product Details'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6">
                            {modalAction === 'delete' ? (
                                <>
                                    <div className="mb-4">
                                        <div className="flex items-center mb-4">
                                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                                {selectedProduct.photos && selectedProduct.photos.length > 0 ? (
                                                    <img 
                                                        src={selectedProduct.photos[0]} 
                                                        alt={selectedProduct.name} 
                                                        className="w-16 h-16 object-cover rounded-lg"
                                                    />
                                                ) : (
                                                    <span className="text-3xl">🌾</span>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <h3 className="font-semibold text-gray-900">{selectedProduct.name}</h3>
                                                <p className="text-sm text-gray-500">{selectedProduct.category}</p>
                                            </div>
                                        </div>
                                        <p className="text-gray-600">
                                            Are you sure you want to delete <strong>{selectedProduct.name}</strong>?
                                        </p>
                                        <p className="text-sm text-red-600 mt-2">
                                            This action cannot be undone. All associated data will be permanently removed.
                                        </p>
                                    </div>
                                    <div className="flex justify-end space-x-4">
                                        <Button variant="secondary" onClick={closeModal}>
                                            Cancel
                                        </Button>
                                        <Button 
                                            variant="danger" 
                                            onClick={() => handleDelete(selectedProduct.id)}
                                            isLoading={loadingAction}
                                        >
                                            Delete Product
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Product Name</label>
                                            <p className="text-gray-900 font-medium">{selectedProduct.name}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Category</label>
                                            <p className="text-gray-900">{selectedProduct.category}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Price</label>
                                            <p className="text-gray-900 font-medium">
                                                {selectedProduct.price_formatted || `GMD ${selectedProduct.price}`}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Quantity</label>
                                            <p className="text-gray-900">{selectedProduct.quantity} {selectedProduct.unit}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Status</label>
                                            <p className="text-gray-900">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    selectedProduct.status === 'active' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {selectedProduct.status_label || selectedProduct.status}
                                                </span>
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Farmer</label>
                                            <p className="text-gray-900">{selectedProduct.farmer?.name || 'Unknown'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Harvest Date</label>
                                            <p className="text-gray-900">
                                                {selectedProduct.harvest_date 
                                                    ? new Date(selectedProduct.harvest_date).toLocaleDateString() 
                                                    : '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Expiry Date</label>
                                            <p className="text-gray-900">
                                                {selectedProduct.expiry_date 
                                                    ? new Date(selectedProduct.expiry_date).toLocaleDateString() 
                                                    : '-'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {selectedProduct.photos && selectedProduct.photos.length > 0 && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500 block mb-2">Photos</label>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedProduct.photos.map((photo, index) => (
                                                    <img 
                                                        key={index} 
                                                        src={photo} 
                                                        alt={`${selectedProduct.name} ${index + 1}`} 
                                                        className="w-20 h-20 object-cover rounded-lg border"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {selectedProduct.description && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Description</label>
                                            <p className="text-gray-900">{selectedProduct.description}</p>
                                        </div>
                                    )}
                                    
                                    <div className="flex justify-end pt-4 border-t">
                                        <Button variant="secondary" onClick={closeModal}>
                                            Close
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;