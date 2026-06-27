// src/pages/farmer/Products.jsx
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Alert } from '../../components/common/Alert';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';

export const Products = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
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
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [modalAction, setModalAction] = useState('');
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [loadingAction, setLoadingAction] = useState(false);

    useEffect(() => {
        if (location.state?.refresh) {
            setFilters(prev => ({ ...prev, page: 1 }));
        }
    }, [location.state]);

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
            
            const response = await api.get(`/my-products?${params}`);
            setProducts(response.data.data || []);
            setPagination(response.data.meta || {
                current_page: 1,
                last_page: 1,
                per_page: 20,
                total: 0,
            });
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Failed to load products');
            setTimeout(() => setError(null), 3000);
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

    const handleDelete = async (productId) => {
        try {
            setLoadingAction(true);
            await api.delete(`/products/${productId}`);
            setSuccess('Product deleted successfully');
            setShowModal(false);
            setSelectedProduct(null);
            await fetchProducts();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error deleting product:', err);
            setError('Failed to delete product');
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoadingAction(false);
        }
    };

    const handleStatusUpdate = async (productId, status) => {
        try {
            setLoadingAction(true);
            await api.patch(`/products/${productId}/status`, { status });
            setSuccess(`Product marked as ${status}`);
            await fetchProducts();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error updating status:', err);
            setError('Failed to update product status');
            setTimeout(() => setError(null), 3000);
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

    const handlePageChange = (newPage) => {
        setFilters({ ...filters, page: newPage });
    };

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value, page: 1 });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4 animate-fade-in">
                <Spinner size="lg" color="primary" />
                <p className="text-sm font-medium text-gray-500 tracking-wide uppercase">Refreshing Inventory...</p>
            </div>
        );
    }

    return (
        <div className="bg-[#f8f9fa] min-h-screen font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
            {/* Header Top Bar */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/90">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">My Products</h1>
                            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mt-1">
                                {pagination.total} Live listing{pagination.total !== 1 ? 's' : ''} in store
                            </p>
                        </div>
                        <Link to="/app/products/create">
                            <Button className="bg-[#0c8346] hover:bg-[#0a6e3a] active:scale-95 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-sm shadow-emerald-200 text-sm tracking-wide">
                                + Add New Item
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Notifications layout */}
            <div className="fixed top-24 right-6 z-50 space-y-2 max-w-md w-full pointer-events-none">
                {success && <div className="pointer-events-auto animate-slide-in shadow-xl rounded-xl"><Alert type="success" message={success} onClose={() => setSuccess(null)} /></div>}
                {error && <div className="pointer-events-auto animate-slide-in shadow-xl rounded-xl"><Alert type="error" message={error} onClose={() => setError(null)} /></div>}
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Filters View */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-8 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Search inventory (e.g. Fresh Tomatoes)..."
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                            />
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <div className="w-full md:w-64">
                            <select
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm appearance-none cursor-pointer"
                                value={filters.category}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Grid Framework */}
                {products.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm max-w-xl mx-auto animate-fade-in">
                        <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 animate-bounce">🌾</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Your storefront is empty</h3>
                        <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">List fresh agricultural assets directly onto the marketplace platform.</p>
                        <Link to="/products/create">
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl">
                                Create Listing
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
                            {products.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onView={() => openModal(product, 'view')}
                                    onDelete={() => openModal(product, 'delete')}
                                    onStatusUpdate={handleStatusUpdate}
                                    loadingAction={loadingAction}
                                />
                            ))}
                        </div>

                        {/* Pagination Unit */}
                        {pagination.total > 0 && (
                            <div className="mt-10 bg-white rounded-2xl border border-gray-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                                <div className="text-sm font-medium text-gray-500">
                                    Displaying <span className="text-gray-900 font-bold">{products.length}</span> of <span className="text-gray-900 font-bold">{pagination.total}</span> entries
                                </div>
                                <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                                    <button
                                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all tracking-wider uppercase border border-transparent ${
                                            pagination.current_page <= 1
                                                ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'
                                        }`}
                                        disabled={pagination.current_page <= 1}
                                        onClick={() => handlePageChange(pagination.current_page - 1)}
                                    >
                                        Prev
                                    </button>
                                    <span className="text-xs font-bold text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                                        {pagination.current_page} / {pagination.last_page}
                                    </span>
                                    <button
                                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all tracking-wider uppercase border border-transparent ${
                                            pagination.current_page >= pagination.last_page
                                                ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'
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

            {/* Modal Architecture */}
            {showModal && selectedProduct && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 transform scale-100 transition-all animate-scale-up">
                        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-50 bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                                {modalAction === 'delete' ? 'Remove Listing' : 'Item Specifications'}
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 bg-white shadow-sm p-1.5 rounded-full border border-gray-100 hover:scale-105 transition-all">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6">
                            {modalAction === 'delete' ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                                        <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-gray-100 shrink-0">
                                            {selectedProduct.photos?.[0] ? (
                                                <img src={selectedProduct.photos[0]} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-2xl">🌾</span>
                                            )}
                                        </div>
                                        <div className="truncate">
                                            <h3 className="font-bold text-gray-900 truncate">{selectedProduct.name}</h3>
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{selectedProduct.category}</p>
                                        </div>
                                    </div>
                                    <div className="bg-red-50/60 border border-red-100 rounded-2xl p-4">
                                        <p className="text-sm text-red-800 font-medium">
                                            Confirm structural removal of this batch from the public marketplace matrix? This cannot be restored.
                                        </p>
                                    </div>
                                    <div className="flex justify-end gap-3 pt-2">
                                        <Button variant="secondary" onClick={closeModal} className="rounded-xl font-semibold">Cancel</Button>
                                        <Button variant="danger" onClick={() => handleDelete(selectedProduct.id)} isLoading={loadingAction} className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl px-5">
                                            Delete Permanently
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {selectedProduct.photos?.length > 0 && (
                                        <div className="flex gap-2 overflow-x-auto pb-1 snap-x">
                                            {selectedProduct.photos.map((photo, index) => (
                                                <img 
                                                    key={index} 
                                                    src={getImageUrl(photo)} 
                                                    alt="" 
                                                    className="w-24 h-24 object-cover rounded-2xl border border-gray-100 snap-start bg-gray-50 shrink-0"
                                                />
                                            ))}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-x-4 gap-y-5 border-t border-gray-50 pt-5">
                                        <div>
                                            <span className="block text-[11px] font-bold tracking-wider text-gray-400 uppercase">Product Details</span>
                                            <p className="text-sm font-bold text-gray-900 mt-0.5">{selectedProduct.name}</p>
                                        </div>
                                        <div>
                                            <span className="block text-[11px] font-bold tracking-wider text-gray-400 uppercase">Category Allocation</span>
                                            <p className="text-sm font-semibold text-gray-700 mt-0.5">{selectedProduct.category}</p>
                                        </div>
                                        <div>
                                            <span className="block text-[11px] font-bold tracking-wider text-gray-400 uppercase">Pricing Standard</span>
                                            <p className="text-base font-black text-emerald-600 mt-0.5">{selectedProduct.price_formatted || `GMD ${selectedProduct.price}`}</p>
                                        </div>
                                        <div>
                                            <span className="block text-[11px] font-bold tracking-wider text-gray-400 uppercase">Available Volume</span>
                                            <p className="text-sm font-bold text-gray-800 mt-0.5">{selectedProduct.quantity} {selectedProduct.unit}</p>
                                        </div>
                                    </div>
                                    
                                    {selectedProduct.description && (
                                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                            <span className="block text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-1">Batch Logistics Note</span>
                                            <p className="text-xs leading-relaxed text-gray-600 font-medium">{selectedProduct.description}</p>
                                        </div>
                                    )}
                                    
                                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                                        <Button variant="secondary" onClick={closeModal} className="rounded-xl">Close</Button>
                                        {selectedProduct.status === 'active' ? (
                                            <Button 
                                                variant="outline"
                                                onClick={() => { handleStatusUpdate(selectedProduct.id, 'sold'); closeModal(); }}
                                                className="border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl font-bold text-xs px-4"
                                            >
                                                Mark Out of Stock
                                            </Button>
                                        ) : (
                                            <Button 
                                                variant="primary"
                                                onClick={() => { handleStatusUpdate(selectedProduct.id, 'active'); closeModal(); }}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs px-4"
                                            >
                                                Make Available
                                            </Button>
                                        )}
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

// Blinkit Quick-Commerce Inspired Card Layout
const ProductCard = ({ product, onView, onDelete, onStatusUpdate, loadingAction }) => {
    const isExpired = product.expiry_date && new Date(product.expiry_date) < new Date();

    return (
        <div className="group bg-white rounded-2xl border border-gray-200/70 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div className="relative aspect-square bg-gray-50 overflow-hidden border-b border-gray-100">
                {product.photos?.length > 0 ? (
                    <img
                        src={getImageUrl(product.photos[0])}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        loading="lazy"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-4xl bg-gray-50">🌾</div>';
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl bg-gray-50">🌾</div>
                )}

                {/* Micro badges optimized for visual hierarchy */}
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                    {isExpired ? (
                        <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md tracking-wider uppercase shadow-sm">Expired</span>
                    ) : product.status === 'sold' ? (
                        <span className="bg-gray-900 text-white text-[10px] font-black px-2 py-0.5 rounded-md tracking-wider uppercase shadow-sm">Sold Out</span>
                    ) : (
                        <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md tracking-wider uppercase shadow-sm">Active</span>
                    )}
                </div>
            </div>

            {/* Core Text Section */}
            <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                    <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block mb-0.5">{product.category}</span>
                    <h3 className="font-bold text-gray-900 text-sm tracking-tight leading-snug group-hover:text-emerald-700 transition-colors line-clamp-1">
                        {product.name}
                    </h3>
                    <div className="text-[11px] font-semibold text-gray-400 mt-1 flex items-center gap-3">
                        <span className="bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">⚖️ {product.quantity} {product.unit}</span>
                        <span>📦 {product.orders_count || 0} filled</span>
                    </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-base font-black text-gray-900 tracking-tight">
                        {product.price_formatted || `GMD ${product.price}`}
                    </span>
                    
                    {/* Compact Interactive Actions Panel */}
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={onView}
                            className="p-2 text-xs font-bold bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-all border border-gray-200/40 active:scale-95"
                            title="View Specs"
                        >
                            👁️
                        </button>
                        {product.status === 'active' ? (
                            <button
                                onClick={() => onStatusUpdate(product.id, 'sold')}
                                className="px-3 py-1.5 text-xs font-extrabold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/40 rounded-xl transition-all active:scale-95"
                                disabled={loadingAction}
                            >
                                Out
                            </button>
                        ) : (
                            <button
                                onClick={() => onStatusUpdate(product.id, 'active')}
                                className="px-3 py-1.5 text-xs font-extrabold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/40 rounded-xl transition-all active:scale-95"
                                disabled={loadingAction}
                            >
                                Live
                            </button>
                        )}
                        <button 
                            onClick={onDelete}
                            className="p-2 text-xs bg-red-50 text-red-600 rounded-xl hover:bg-red-100 border border-red-100 transition-all active:scale-95"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};