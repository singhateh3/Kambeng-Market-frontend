// src/pages/orders/WriteReview.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ReviewForm } from '../../components/ReviewForm';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

 const WriteReview = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/orders/${orderId}`);
            setOrder(response.data.data);
        } catch (err) {
            console.error('Error fetching order:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSuccess = () => {
        navigate(`/app/orders/${orderId}`);
    };

    const handleCancel = () => {
        navigate(`/app/orders/${orderId}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="text-6xl mb-4">❌</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h3>
                <button onClick={() => navigate('/app/orders')} className="text-green-600 hover:text-green-700">
                    Back to Orders
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <button
                    onClick={() => navigate(`/app/orders/${orderId}`)}
                    className="text-gray-600 hover:text-gray-900 flex items-center"
                >
                    ← Back to Order
                </button>
            </div>

            <ReviewForm
                orderId={order.id}
                productName={order.product?.name || 'Product'}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
            />
        </div>
    );
};
export default WriteReview;