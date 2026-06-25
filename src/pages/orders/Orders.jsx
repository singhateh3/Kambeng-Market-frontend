// src/pages/orders/Orders.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../../components/common/Alert';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { OrderCard } from './OrderCard';
import { OrderDetails } from './OrderDetails';

export const Orders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        page: 1,
        per_page: 20,
    });
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0,
    });
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [loadingAction, setLoadingAction] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, [filters]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                status: filters.status,
                page: filters.page || 1,
                per_page: filters.per_page || 20,
            });
            
            const response = await api.get(`/orders?${params}`);
            setOrders(response.data.data || []);
            setPagination(response.data.meta || {
                current_page: 1,
                last_page: 1,
                per_page: 20,
                total: 0,
            });
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Failed to load orders');
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, status) => {
        try {
            setLoadingAction(true);
            await api.patch(`/orders/${orderId}/status`, { status });
            setSuccess(`Order status updated to ${status}`);
            await fetchOrders();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error updating order status:', err);
            setError('Failed to update order status');
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoadingAction(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!confirm('Are you sure you want to cancel this order?')) return;
        
        try {
            setLoadingAction(true);
            await api.post(`/orders/${orderId}/cancel`);
            setSuccess('Order cancelled successfully');
            await fetchOrders();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error cancelling order:', err);
            setError('Failed to cancel order');
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoadingAction(false);
        }
    };

    const openOrderDetailsModal = (order) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedOrder(null);
    };

    const handlePageChange = (newPage) => {
        setFilters({ ...filters, page: newPage });
    };

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value, page: 1 });
    };

    const isFarmer = user?.role === 'farmer';
    const isBuyer = user?.role === 'buyer';

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                    <p className="text-sm text-gray-600">
                        {isFarmer ? 'Manage orders for your products' : 'View your order history'}
                    </p>
                </div>
                <div className="flex gap-2">
                    {isBuyer && (
                        <Link to="/browse">
                            <Button variant="outline">
                                Browse Products
                            </Button>
                        </Link>
                    )}
                    {isFarmer && (
                        <Link to="/products">
                            <Button variant="outline">
                                View Products
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Success/Error Messages */}
            {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}
            {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

            {/* Filters */}
            <div className="bg-white shadow rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <select
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <Button variant="secondary" onClick={fetchOrders}>
                        Apply Filters
                    </Button>
                </div>
            </div>

            {/* Orders List */}
            {orders.length === 0 ? (
                <div className="bg-white shadow rounded-lg p-12 text-center">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3>
                    <p className="text-gray-500">
                        {isFarmer 
                            ? 'You haven\'t received any orders yet.' 
                            : 'You haven\'t placed any orders yet.'}
                    </p>
                    {isBuyer && (
                        <Link to="/browse">
                            <Button className="mt-4">Start Shopping</Button>
                        </Link>
                    )}
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                isFarmer={isFarmer}
                                isBuyer={isBuyer}
                                onViewDetails={() => openOrderDetailsModal(order)}
                                onStatusUpdate={handleStatusUpdate}
                                onCancelOrder={handleCancelOrder}
                                loadingAction={loadingAction}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.total > 0 && (
                        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 bg-white shadow rounded-lg px-4 py-4">
                            <div className="text-sm text-gray-700">
                                Showing {orders.length} of {pagination.total} orders
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    disabled={pagination.current_page <= 1}
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
                                    disabled={pagination.current_page >= pagination.last_page}
                                    onClick={() => handlePageChange(pagination.current_page + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Order Details Modal */}
            {showModal && selectedOrder && (
                <OrderDetails
                    order={selectedOrder}
                    isFarmer={isFarmer}
                    isBuyer={isBuyer}
                    onClose={closeModal}
                    onStatusUpdate={handleStatusUpdate}
                    onCancelOrder={handleCancelOrder}
                    loadingAction={loadingAction}
                />
            )}
        </div>
    );
};