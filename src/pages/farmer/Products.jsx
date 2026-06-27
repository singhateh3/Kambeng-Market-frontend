// src/pages/farmer/Products.jsx
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Alert } from '../../components/common/Alert';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

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

    // Check if we came back from product creation
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

    const isFarmer = user?.role === 'farmer';

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" color="primary" label="Loading products..." />
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header with stats */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
                            <p className="text-sm text-gray-500">
                                {pagination.total} product{pagination.total !== 1 ? 's' : ''} listed
                            </p>
                        </div>
                        <Link to="/app/products/create">
                            <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full">
                                + Add New Product
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Success/Error Messages */}
            {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}
            {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

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
                        <div className="text-6xl mb-4">🌾</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Listed</h3>
                        <p className="text-gray-500 mb-4">You haven't listed any products yet.</p>
                        <Link to="/products/create">
                            <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full">
                                List Your First Product
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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

            {/* Modal */}
            {showModal && selectedProduct && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-900">
                                {modalAction === 'delete' ? 'Delete Product' :
                                 modalAction === 'view' ? 'Product Details' :
                                 'Product'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600"
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
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                            <p className="text-sm text-yellow-800">
                                                ⚠️ Are you sure you want to delete <strong>{selectedProduct.name}</strong>?
                                            </p>
                                            <p className="text-sm text-red-600 mt-2">
                                                This action cannot be undone. All associated data will be permanently removed.
                                            </p>
                                        </div>
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
                                            Yes, Delete Product
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
                                            <label className="text-sm font-medium text-gray-500">Orders</label>
                                            <p className="text-gray-900">{selectedProduct.orders_count || 0}</p>
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
                                    
                                    <div className="flex justify-end space-x-4 pt-4 border-t">
                                        <Button variant="secondary" onClick={closeModal}>
                                            Close
                                        </Button>
                                        {selectedProduct.status === 'active' && (
                                            <Button 
                                                variant="outline"
                                                onClick={() => {
                                                    handleStatusUpdate(selectedProduct.id, 'sold');
                                                    closeModal();
                                                }}
                                                isLoading={loadingAction}
                                            >
                                                Mark as Sold
                                            </Button>
                                        )}
                                        {selectedProduct.status === 'sold' && (
                                            <Button 
                                                variant="primary"
                                                onClick={() => {
                                                    handleStatusUpdate(selectedProduct.id, 'active');
                                                    closeModal();
                                                }}
                                                isLoading={loadingAction}
                                            >
                                                Mark as Available
                                            </Button>
                                        )}
                                        <Button 
                                            variant="danger"
                                            onClick={() => {
                                                setModalAction('delete');
                                            }}
                                        >
                                            Delete
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

// Product Card Component - Blinkit style
const ProductCard = ({ product, onView, onDelete, onStatusUpdate, loadingAction }) => {
    const isExpired = product.expiry_date && new Date(product.expiry_date) < new Date();

    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100">
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
                {product.status === 'sold' && (
                    <span className="absolute top-2 left-2 bg-gray-700 text-white text-xs px-2 py-1 rounded-full">
                        Sold Out
                    </span>
                )}
                {product.status === 'active' && !isExpired && (
                    <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        Available
                    </span>
                )}
            </div>
            <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-sm truncate">
                    {product.name}
                </h3>
                <p className="text-xs text-gray-500 mb-2">{product.category}</p>
                
                <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-bold text-green-600">
                        {product.price_formatted || `GMD ${product.price}`}
                    </span>
                    <span className="text-xs text-gray-500">
                        {product.quantity} {product.unit}
                    </span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>📦 {product.orders_count || 0} orders</span>
                    <span>📅 {product.expiry_date ? new Date(product.expiry_date).toLocaleDateString() : '-'}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={onView}
                        className="flex-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                        View
                    </button>
                    {product.status === 'active' && (
                        <button
                            onClick={() => onStatusUpdate(product.id, 'sold')}
                            className="flex-1 px-3 py-1.5 text-sm bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors"
                            disabled={loadingAction}
                        >
                            Sold Out
                        </button>
                    )}
                    {product.status === 'sold' && (
                        <button
                            onClick={() => onStatusUpdate(product.id, 'active')}
                            className="flex-1 px-3 py-1.5 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                            disabled={loadingAction}
                        >
                            Available
                        </button>
                    )}
                    <button
                        onClick={onDelete}
                        className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    );
};