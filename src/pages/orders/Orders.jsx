// src/pages/orders/Orders.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { OrdersSkeleton } from '../../components/common/skeletons/OrdersSkeleton';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { OrderCard } from './OrderCard';
import { OrderDetails } from './OrderDetails';

const Orders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ status: '', page: 1, per_page: 20 });
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, per_page: 20, total: 0 });
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [loadingAction, setLoadingAction] = useState(false);

    useEffect(() => { fetchOrders(); }, [filters]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                status:   String(filters.status   ?? ''),
                page:     String(filters.page     ?? 1),
                per_page: String(filters.per_page ?? 20),
            });
            const response = await api.get(`/orders?${params}`);
            setOrders(response.data.data || []);
            setPagination(response.data.meta || { current_page: 1, last_page: 1, per_page: 20, total: 0 });
        } catch (err) {
            console.error('Error fetching orders:', err);
            flash('error', 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const flash = (type, msg) => {
        if (type === 'success') { setSuccess(msg); setTimeout(() => setSuccess(null), 3000); }
        else { setError(msg); setTimeout(() => setError(null), 3000); }
    };

    const handleStatusUpdate = async (orderId, status) => {
        try {
            setLoadingAction(true);
            await api.patch(`/orders/${orderId}/status`, { status });
            flash('success', `Order status updated to ${status}`);
            await fetchOrders();
        } catch { flash('error', 'Failed to update order status'); }
        finally { setLoadingAction(false); }
    };

    // FIXED: Removed confirm() - confirmation is now handled in the modal
    const handleCancelOrder = async (orderId) => {
        try {
            setLoadingAction(true);
            await api.post(`/orders/${orderId}/cancel`);
            flash('success', 'Order cancelled successfully');
            await fetchOrders();
        } catch { 
            flash('error', 'Failed to cancel order'); 
        } finally { 
            setLoadingAction(false); 
        }
    };

    const handleFilterChange = (key, value) => setFilters(f => ({ ...f, [key]: value, page: 1 }));
    const handlePageChange = (newPage) => setFilters(f => ({ ...f, page: newPage }));

    const isFarmer = user?.role === 'farmer';
    const isBuyer = user?.role === 'buyer';

    const statusOptions = [
        { value: '', label: 'All statuses' },
        { value: 'pending',   label: 'Pending' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'shipped',   label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    if (loading) return <OrdersSkeleton />;

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Orders</h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            {isFarmer ? 'Manage orders for your products' : 'Track your order history'}
                        </p>
                    </div>
                    {isBuyer && (
                        <Link to="/app/browse" className="bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg no-underline hover:bg-green-700 transition">
                            Browse products
                        </Link>
                    )}
                    {isFarmer && (
                        <Link to="/app/products" className="bg-green-50 text-green-700 border border-green-200 text-sm font-semibold px-4 py-2 rounded-lg no-underline hover:bg-green-100 transition">
                            My products
                        </Link>
                    )}
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-6">
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

                <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 mb-5 flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Filter</span>
                    <div className="flex gap-2 flex-wrap">
                        {statusOptions.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => handleFilterChange('status', opt.value)}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                                    filters.status === opt.value
                                        ? 'bg-green-600 text-white border-green-600'
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-green-400 hover:text-green-700'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    <div className="ml-auto text-xs text-slate-400">{pagination.total} order{pagination.total !== 1 ? 's' : ''}</div>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-xl text-center py-20">
                        <div className="text-5xl mb-3">📋</div>
                        <h3 className="text-base font-bold text-slate-900 mb-1">No orders found</h3>
                        <p className="text-sm text-slate-400 mb-5">
                            {isFarmer ? "You haven't received any orders yet." : "You haven't placed any orders yet."}
                        </p>
                        {isBuyer && (
                            <Link to="/app/browse" className="bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg no-underline hover:bg-green-700 transition">
                                Start shopping
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="space-y-3">
                            {orders.map((order) => (
                                <OrderCard
                                    key={order.id}
                                    order={order}
                                    isFarmer={isFarmer}
                                    isBuyer={isBuyer}
                                    onViewDetails={() => { setSelectedOrder(order); setShowModal(true); }}
                                    onStatusUpdate={handleStatusUpdate}
                                    onCancelOrder={handleCancelOrder}
                                    loadingAction={loadingAction}
                                />
                            ))}
                        </div>

                        {pagination.total > 0 && (
                            <div className="mt-5 bg-white border border-slate-200 rounded-xl px-5 py-3.5 flex items-center justify-between flex-wrap gap-3">
                                <span className="text-xs text-slate-500">Showing {orders.length} of {pagination.total} orders</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={pagination.current_page <= 1}
                                        onClick={() => handlePageChange(pagination.current_page - 1)}
                                        className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                    >← Previous</button>
                                    <span className="text-xs text-slate-500 px-1">Page {pagination.current_page} of {pagination.last_page}</span>
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

            {showModal && selectedOrder && (
                <OrderDetails
                    order={selectedOrder}
                    isFarmer={isFarmer}
                    isBuyer={isBuyer}
                    onClose={() => { setShowModal(false); setSelectedOrder(null); }}
                    onStatusUpdate={handleStatusUpdate}
                    onCancelOrder={handleCancelOrder}
                    loadingAction={loadingAction}
                />
            )}
        </div>
    );
};

export default Orders;