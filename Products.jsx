// src/pages/farmer/Products.jsx
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';

export const Products = () => {
    const location = useLocation();
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ category: '', search: '', page: 1, per_page: 20 });
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, per_page: 20, total: 0 });
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [modalAction, setModalAction] = useState('');
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [loadingAction, setLoadingAction] = useState(false);

    useEffect(() => {
        if (location.state?.refresh) setFilters(f => ({ ...f, page: 1 }));
    }, [location.state]);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [filters]);

    const flash = (type, msg) => {
        if (type === 'success') { setSuccess(msg); setTimeout(() => setSuccess(null), 3000); }
        else { setError(msg); setTimeout(() => setError(null), 3000); }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                category: String(filters.category ?? ''),
                search:   String(filters.search   ?? ''),
                page:     String(filters.page     ?? 1),
                per_page: String(filters.per_page ?? 20),
            });
            const response = await api.get(`/my-products?${params}`);
            setProducts(response.data.data || []);
            setPagination(response.data.meta || { current_page: 1, last_page: 1, per_page: 20, total: 0 });
        } catch (err) {
            console.error(err);
            flash('error', 'Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await api.get('/products/categories');
            setCategories(res.data.data || []);
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

    const openModal = (product, action) => { setSelectedProduct(product); setModalAction(action); setShowModal(true); };
    const closeModal = () => { setShowModal(false); setSelectedProduct(null); setModalAction(''); };
    const handlePageChange = (p) => setFilters(f => ({ ...f, page: p }));
    const handleFilterChange = (key, value) => setFilters(f => ({ ...f, [key]: value, page: 1 }));

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">My Products</h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            {pagination.total} listing{pagination.total !== 1 ? 's' : ''} in your store
                        </p>
                    </div>
                    <Link
                        to="/app/products/create"
                        className="bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg no-underline hover:bg-green-700 transition"
                    >
                        + Add product
                    </Link>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-6">
                {/* Alerts */}
                {success && (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-xl mb-4">
                        <span>✅ {success}</span>
                        <button onClick={() => setSuccess(null)} className="text-green-600 bg-transparent border-none cursor-pointer text-lg leading-none">×</button>
                    </div>
                )}
                {error && (
                    <div className="flex items-center justify-between bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 rounded-xl mb-4">
                        <span>⚠️ {error}</span>
                        <button onClick={() => setError(null)} className="text-red-600 bg-transparent border-none cursor-pointer text-lg leading-none">×</button>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search products..."
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
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Loading */}
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="w-10 h-10 border-4 border-slate-200 border-t-green-600 rounded-full animate-spin" />
                    </div>
                ) : products.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-xl text-center py-20">
                        <div className="text-5xl mb-3">🌾</div>
                        <h3 className="text-base font-bold text-slate-900 mb-1">No products yet</h3>
                        <p className="text-sm text-slate-400 mb-5">List your first product to start selling.</p>
                        <Link
                            to="/app/products/create"
                            className="bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg no-underline hover:bg-green-700 transition"
                        >
                            Add your first product
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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

                        {/* Pagination */}
                        {pagination.total > 0 && (
                            <div className="mt-5 bg-white border border-slate-200 rounded-xl px-5 py-3.5 flex items-center justify-between flex-wrap gap-3">
                                <span className="text-xs text-slate-500">
                                    Showing {products.length} of {pagination.total} products
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={pagination.current_page <= 1}
                                        onClick={() => handlePageChange(pagination.current_page - 1)}
                                        className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                    >
                                        ← Previous
                                    </button>
                                    <span className="text-xs text-slate-500 px-1">
                                        {pagination.current_page} / {pagination.last_page}
                                    </span>
                                    <button
                                        disabled={pagination.current_page >= pagination.last_page}
                                        onClick={() => handlePageChange(pagination.current_page + 1)}
                                        className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
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
            {showModal && selectedProduct && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100">
                        {/* Modal header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                            <h2 className="text-sm font-bold text-slate-900">
                                {modalAction === 'delete' ? 'Delete product' : 'Product details'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition border-none cursor-pointer text-sm"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-5">
                            {modalAction === 'delete' ? (
                                <div className="space-y-4">
                                    {/* Product preview */}
                                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-slate-100 flex-shrink-0 flex items-center justify-center text-xl">
                                            {selectedProduct.photos?.[0]
                                                ? <img src={selectedProduct.photos[0]} alt="" className="w-full h-full object-cover" />
                                                : '🌾'}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-900 truncate">{selectedProduct.name}</p>
                                            <p className="text-xs text-slate-400">{selectedProduct.category}</p>
                                        </div>
                                    </div>
                                    <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                                        <p className="text-sm text-red-800">
                                            Are you sure you want to delete this product? This action cannot be undone.
                                        </p>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-1">
                                        <button onClick={closeModal} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition border-none cursor-pointer">
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleDelete(selectedProduct.id)}
                                            disabled={loadingAction}
                                            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition border-none cursor-pointer"
                                        >
                                            {loadingAction ? 'Deleting...' : 'Delete product'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Photos */}
                                    {selectedProduct.photos?.length > 0 && (
                                        <div className="flex gap-2 overflow-x-auto pb-1">
                                            {selectedProduct.photos.map((photo, i) => (
                                                <img
                                                    key={i}
                                                    src={getImageUrl(photo)}
                                                    alt=""
                                                    className="w-20 h-20 object-cover rounded-xl border border-slate-100 flex-shrink-0 bg-slate-50"
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Details grid */}
                                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                                        {[
                                            { label: 'Name',     value: selectedProduct.name },
                                            { label: 'Category', value: selectedProduct.category },
                                            { label: 'Price',    value: selectedProduct.price_formatted || `GMD ${selectedProduct.price}` },
                                            { label: 'Stock',    value: `${selectedProduct.quantity} ${selectedProduct.unit}` },
                                        ].map((d, i) => (
                                            <div key={i}>
                                                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{d.label}</span>
                                                <span className={`text-sm font-bold ${d.label === 'Price' ? 'text-green-600' : 'text-slate-900'}`}>{d.value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {selectedProduct.description && (
                                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                                            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Description</span>
                                            <p className="text-xs text-slate-600 leading-relaxed">{selectedProduct.description}</p>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                        <button onClick={closeModal} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition border-none cursor-pointer">
                                            Close
                                        </button>
                                        {selectedProduct.status === 'active' ? (
                                            <button
                                                onClick={() => { handleStatusUpdate(selectedProduct.id, 'sold'); closeModal(); }}
                                                className="px-4 py-2 text-sm font-semibold text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition cursor-pointer"
                                            >
                                                Mark as sold out
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => { handleStatusUpdate(selectedProduct.id, 'active'); closeModal(); }}
                                                className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition border-none cursor-pointer"
                                            >
                                                Make active
                                            </button>
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

const ProductCard = ({ product, onView, onDelete, onStatusUpdate, loadingAction }) => {
    const isExpired = product.expiry_date && new Date(product.expiry_date) < new Date();

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition-all group">
            {/* Image */}
            <div className="relative h-36 bg-slate-100">
                {product.photos?.length > 0 ? (
                    <img
                        src={getImageUrl(product.photos[0])}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🌾</div>
                )}

                {/* Status badge */}
                <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                    isExpired
                        ? 'bg-red-500 text-white'
                        : product.status === 'sold'
                        ? 'bg-slate-700 text-white'
                        : 'bg-green-500 text-white'
                }`}>
                    {isExpired ? 'Expired' : product.status === 'sold' ? 'Sold out' : 'Active'}
                </span>
            </div>

            {/* Info */}
            <div className="p-3">
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mb-0.5">{product.category}</p>
                <h3 className="text-sm font-bold text-slate-900 truncate mb-1 group-hover:text-green-700 transition-colors">
                    {product.name}
                </h3>
                <p className="text-xs text-slate-400 mb-3">{product.quantity} {product.unit} · {product.orders_count || 0} orders</p>

                <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-slate-900">
                        {product.price_formatted || `GMD ${product.price}`}
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={onView}
                            className="w-7 h-7 flex items-center justify-center text-xs bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                            title="View details"
                        >
                            👁️
                        </button>
                        {product.status === 'active' ? (
                            <button
                                onClick={() => onStatusUpdate(product.id, 'sold')}
                                disabled={loadingAction}
                                className="px-2 py-1 text-[10px] font-bold text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition cursor-pointer disabled:opacity-50"
                            >
                                Out
                            </button>
                        ) : (
                            <button
                                onClick={() => onStatusUpdate(product.id, 'active')}
                                disabled={loadingAction}
                                className="px-2 py-1 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition cursor-pointer disabled:opacity-50"
                            >
                                Live
                            </button>
                        )}
                        <button
                            onClick={onDelete}
                            className="w-7 h-7 flex items-center justify-center text-xs bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition cursor-pointer"
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
