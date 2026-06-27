// src/components/ReviewList.jsx
import { useEffect, useState } from 'react';
import api from '../services/api';
import { ReviewStars } from './ReviewStars';

export const ReviewList = ({ productId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
    });

    useEffect(() => {
        fetchReviews();
    }, [productId, pagination.current_page]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/products/${productId}/reviews?page=${pagination.current_page}`);
            setReviews(response.data.data || []);
            setAverageRating(response.data.meta?.average_rating || 0);
            setTotalReviews(response.data.meta?.total_reviews || 0);
            setPagination({
                current_page: response.data.meta?.current_page || 1,
                last_page: response.data.meta?.last_page || 1,
            });
        } catch (err) {
            console.error('Error fetching reviews:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Rating Summary */}
            {totalReviews > 0 && (
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
                        <ReviewStars rating={averageRating} size="md" />
                        <div className="text-sm text-gray-500">{totalReviews} reviews</div>
                    </div>
                </div>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <ReviewItem key={review.id} review={review} />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.last_page > 1 && (
                <div className="flex justify-center space-x-2 mt-4">
                    <button
                        className={`px-3 py-1 rounded-lg text-sm ${
                            pagination.current_page <= 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                        disabled={pagination.current_page <= 1}
                        onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
                    >
                        Previous
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-600">
                        Page {pagination.current_page} of {pagination.last_page}
                    </span>
                    <button
                        className={`px-3 py-1 rounded-lg text-sm ${
                            pagination.current_page >= pagination.last_page
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                        disabled={pagination.current_page >= pagination.last_page}
                        onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

// Individual Review Item
const ReviewItem = ({ review }) => {
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="border border-gray-100 rounded-xl p-4 bg-white">
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-medium">
                        {review.user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">{review.user?.name || 'Anonymous'}</p>
                        <ReviewStars rating={review.rating} size="sm" />
                    </div>
                </div>
                <span className="text-xs text-gray-400">{formatDate(review.created_at)}</span>
            </div>
            {review.comment && (
                <p className="mt-3 text-gray-600 text-sm">{review.comment}</p>
            )}
        </div>
    );
};