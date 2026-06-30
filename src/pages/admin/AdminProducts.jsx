// src/pages/admin/AdminProducts.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../../components/common/Alert';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/skeletons/Skeleton';
import api from '../../services/api';

// Admin Products Skeleton Component
const AdminProductsSkeleton = () => (
    <div>
        {/* Header Skeleton */}
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

        {/* Filters Skeleton */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        </div>

        {/* Table Skeleton */}
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

// Product Row Skeleton for loading more
const ProductRowSkeleton = () => (
    <tr>
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
);

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [filters, setFilters] = useState({
        status: '',
        category: '',
        search: '',
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

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [filters]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                ...filters,
                page: filters.page || 1,
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

    // If loading, show skeleton
    if (loading) {
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

            {/* Filters */}
            <div className="bg-white shadow rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                    />
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
                    <Button variant="secondary" onClick={() => fetchProducts()}>
                        Apply Filters
                    </Button>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                {products.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-4xl mb-4">📦</div>
                        <p className="text-gray-500">No products found</p>
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