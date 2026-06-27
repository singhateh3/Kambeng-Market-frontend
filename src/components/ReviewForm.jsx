// src/components/ReviewForm.jsx
import { useState } from 'react';
import api from '../services/api'; // <-- Add this import
import { ReviewStars } from './ReviewStars';
import { Alert } from './common/Alert';
import { Button } from './common/Button';


export const ReviewForm = ({ orderId, productName, onSuccess, onCancel }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await api.post(`/orders/${orderId}/review`, {
                rating,
                comment,
            });

            setSuccess('Review submitted successfully!');
            setTimeout(() => {
                if (onSuccess) onSuccess();
            }, 2000);
        } catch (err) {
            setError(err.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Write a Review for {productName}
            </h3>

            {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}
            {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Rating *
                    </label>
                    <ReviewStars
                        rating={rating}
                        size="lg"
                        interactive={true}
                        onRatingChange={setRating}
                    />
                    {rating === 0 && (
                        <p className="mt-1 text-sm text-red-600">Please select a rating</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Review (Optional)
                    </label>
                    <textarea
                        rows="4"
                        placeholder="Share your experience with this product..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    />
                </div>

                <div className="flex space-x-4">
                    <Button
                        type="submit"
                        isLoading={loading}
                        disabled={loading || rating === 0}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl"
                    >
                        Submit Review
                    </Button>
                    {onCancel && (
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onCancel}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-xl"
                        >
                            Cancel
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
};