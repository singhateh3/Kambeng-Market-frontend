// src/components/ReportIssueForm.jsx
import { useState } from 'react';
import api from '../services/api';
import { Alert } from './common/Alert';
import { Button } from './common/Button';

const REASONS = [
    { value: 'item_not_received', label: 'Item not received' },
    { value: 'item_not_as_described', label: 'Item not as described' },
    { value: 'quality_issue', label: 'Quality issue' },
    { value: 'wrong_item', label: 'Wrong item' },
    { value: 'farmer_unresponsive', label: 'Farmer unresponsive' },
    { value: 'other', label: 'Other' },
];

export const ReportIssueForm = ({ orderId, productName, onSuccess, onCancel }) => {
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!reason) {
            setError('Please select a reason');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await api.post(`/orders/${orderId}/report`, {
                reason,
                description: description || undefined,
            });

            setSuccess('Issue reported successfully!');
            setTimeout(() => {
                if (onSuccess) onSuccess();
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to report issue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
                Report an Issue with {productName}
            </h3>

            {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}
            {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Reason *
                    </label>
                    <select
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    >
                        <option value="">Select a reason...</option>
                        {REASONS.map((r) => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                    </select>
                    {!reason && (
                        <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">Choose the reason that best matches your issue</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Details (Optional)
                    </label>
                    <textarea
                        rows="4"
                        placeholder="Describe what went wrong..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        maxLength={1000}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    />
                </div>

                <div className="flex space-x-4">
                    <Button
                        type="submit"
                        isLoading={loading}
                        disabled={loading || !reason}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl"
                    >
                        Report Issue
                    </Button>
                    {onCancel && (
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onCancel}
                            className="bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 px-6 py-2 rounded-xl"
                        >
                            Cancel
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
};
