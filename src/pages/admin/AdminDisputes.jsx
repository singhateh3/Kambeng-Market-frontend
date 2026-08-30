// src/pages/admin/AdminDisputes.jsx
import { useEffect, useState } from 'react';
import { Alert } from '../../components/common/Alert';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/skeletons/Skeleton';
import { DisputeStatusBadge } from '../orders/DisputeStatusBadge';
import api from '../../services/api';

const STATUS_FILTERS = [
    { value: '', label: 'All statuses' },
    { value: 'open', label: 'Open' },
    { value: 'under_review', label: 'Under review' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'rejected', label: 'Rejected' },
];

const AdminDisputesSkeleton = () => (
    <div>
        <Skeleton className="h-8 w-40 mb-1" />
        <Skeleton className="h-4 w-56 mb-6" />
        <div className="bg-white dark:bg-slate-800 shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-gray-50 dark:bg-slate-900">
                        <tr>
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <th key={i} className="px-4 py-3"><Skeleton className="h-4 w-16" /></th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                        {[1, 2, 3, 4].map(i => (
                            <tr key={i}>
                                {[1, 2, 3, 4, 5, 6].map(j => (
                                    <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

const AdminDisputes = () => {
    const [disputes, setDisputes] = useState([]);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, per_page: 20, total: 0 });
    const [selectedDispute, setSelectedDispute] = useState(null);
    const [actionStatus, setActionStatus] = useState('');
    const [adminNote, setAdminNote] = useState('');
    const [loadingAction, setLoadingAction] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => { fetchDisputes(); }, [status, page]);

    const fetchDisputes = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                status: String(status ?? ''),
                page: String(page),
                per_page: '20',
            });
            const response = await api.get(`/admin/disputes?${params}`);
            setDisputes(response.data.data || []);
            setPagination(response.data.meta || { current_page: 1, last_page: 1, per_page: 20, total: 0 });
        } catch (err) {
            console.error('Error fetching disputes:', err);
            flash('error', 'Failed to load disputes');
        } finally {
            setLoading(false);
            setIsInitialLoad(false);
        }
    };

    const flash = (type, msg) => {
        if (type === 'success') { setSuccess(msg); setTimeout(() => setSuccess(null), 3000); }
        else { setError(msg); setTimeout(() => setError(null), 3000); }
    };

    const openDispute = (dispute) => {
        setSelectedDispute(dispute);
        setActionStatus('');
        setAdminNote('');
    };

    const closeModal = () => {
        setSelectedDispute(null);
        setActionStatus('');
        setAdminNote('');
    };

    const nextStatuses = (currentStatus) => {
        if (currentStatus === 'open') return ['under_review'];
        if (currentStatus === 'under_review') return ['resolved', 'rejected'];
        return [];
    };

    const handleUpdateStatus = async () => {
        if (!actionStatus) return;
        try {
            setLoadingAction(true);
            await api.patch(`/admin/disputes/${selectedDispute.id}/status`, {
                status: actionStatus,
                ...(adminNote ? { admin_note: adminNote } : {}),
            });
            flash('success', 'Dispute updated successfully');
            closeModal();
            fetchDisputes();
        } catch (err) {
            flash('error', err.response?.data?.message || 'Failed to update dispute');
        } finally {
            setLoadingAction(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return '-';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '-';
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    if (isInitialLoad) return <AdminDisputesSkeleton />;

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Disputes</h1>
                <p className="text-sm text-gray-600 dark:text-slate-400">Review and resolve buyer-reported issues</p>
            </div>

            {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}
            {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

            <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-4 mb-6 flex flex-wrap items-center gap-3">
                <span className="text-sm text-gray-500 dark:text-slate-400">Filter</span>
                <div className="flex gap-2 flex-wrap">
                    {STATUS_FILTERS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => { setStatus(opt.value); setPage(1); }}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                                status === opt.value
                                    ? 'bg-primary-600 text-white border-primary-600'
                                    : 'bg-gray-50 dark:bg-slate-900 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-600'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
                <div className="ml-auto text-xs text-gray-400 dark:text-slate-500">{pagination.total} dispute{pagination.total !== 1 ? 's' : ''}</div>
            </div>

            <div className={`bg-white dark:bg-slate-800 shadow rounded-lg overflow-hidden transition-opacity duration-200 ${loading ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
                {disputes.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-4xl mb-4">🕊️</div>
                        <p className="text-gray-500 dark:text-slate-400">No disputes found</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                                <thead className="bg-gray-50 dark:bg-slate-900">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Order</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Buyer</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Farmer</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Reason</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Reported</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                    {disputes.map((dispute) => (
                                        <tr key={dispute.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-slate-100">
                                                #{dispute.order_id}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-slate-100">
                                                {dispute.reporter?.name || 'Unknown'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-slate-100">
                                                {dispute.order?.product?.farmer?.name || 'Unknown'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-slate-100">
                                                {dispute.reason_label}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <DisputeStatusBadge status={dispute.status} />
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                                                {dispute.created_at_display}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                <button
                                                    onClick={() => openDispute(dispute)}
                                                    className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 transition"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="px-4 py-4 border-t border-gray-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
                            <div className="text-sm text-gray-700 dark:text-slate-300">
                                Showing {disputes.length} of {pagination.total} disputes
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    disabled={pagination.current_page === 1}
                                    onClick={() => setPage(pagination.current_page - 1)}
                                >
                                    Previous
                                </Button>
                                <span className="px-3 py-1 text-sm text-gray-600 dark:text-slate-400">
                                    Page {pagination.current_page} of {pagination.last_page}
                                </span>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    disabled={pagination.current_page === pagination.last_page}
                                    onClick={() => setPage(pagination.current_page + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {selectedDispute && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Dispute #{selectedDispute.id}</h2>
                            <button onClick={closeModal} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-2">
                                <DisputeStatusBadge status={selectedDispute.status} />
                                <span className="text-sm text-gray-500 dark:text-slate-400">Reported {selectedDispute.created_at_display}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Order</label>
                                    <p className="text-gray-900 dark:text-slate-100">#{selectedDispute.order_id}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Order status</label>
                                    <p className="text-gray-900 dark:text-slate-100">{selectedDispute.order?.status_label}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Buyer</label>
                                    <p className="text-gray-900 dark:text-slate-100">{selectedDispute.reporter?.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Farmer</label>
                                    <p className="text-gray-900 dark:text-slate-100">{selectedDispute.order?.product?.farmer?.name}</p>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Product</label>
                                    <p className="text-gray-900 dark:text-slate-100">{selectedDispute.order?.product?.name}</p>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Reason</label>
                                    <p className="text-gray-900 dark:text-slate-100">{selectedDispute.reason_label}</p>
                                </div>
                                {selectedDispute.description && (
                                    <div className="col-span-2">
                                        <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Details</label>
                                        <p className="text-gray-900 dark:text-slate-100">{selectedDispute.description}</p>
                                    </div>
                                )}
                                {selectedDispute.admin_note && (
                                    <div className="col-span-2">
                                        <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Admin note</label>
                                        <p className="text-gray-900 dark:text-slate-100">{selectedDispute.admin_note}</p>
                                        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                                            By {selectedDispute.reviewer?.name} · {formatDate(selectedDispute.reviewed_at)}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {nextStatuses(selectedDispute.status).length > 0 && (
                                <div className="pt-4 border-t border-gray-100 dark:border-slate-700 space-y-3">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                                        Move to
                                    </label>
                                    <div className="flex gap-2 flex-wrap">
                                        {nextStatuses(selectedDispute.status).map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => setActionStatus(s)}
                                                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                                                    actionStatus === s
                                                        ? 'bg-primary-600 text-white border-primary-600'
                                                        : 'bg-gray-50 dark:bg-slate-900 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700'
                                                }`}
                                            >
                                                {s === 'under_review' ? 'Under review' : s === 'resolved' ? 'Resolved' : 'Rejected'}
                                            </button>
                                        ))}
                                    </div>

                                    {(actionStatus === 'resolved' || actionStatus === 'rejected') && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                                                Admin note *
                                            </label>
                                            <textarea
                                                rows="3"
                                                value={adminNote}
                                                onChange={(e) => setAdminNote(e.target.value)}
                                                placeholder="Explain the outcome for the buyer..."
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            />
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-3">
                                        <Button variant="secondary" onClick={closeModal}>Cancel</Button>
                                        <Button
                                            onClick={handleUpdateStatus}
                                            isLoading={loadingAction}
                                            disabled={
                                                !actionStatus ||
                                                loadingAction ||
                                                (['resolved', 'rejected'].includes(actionStatus) && !adminNote.trim())
                                            }
                                        >
                                            Confirm
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {nextStatuses(selectedDispute.status).length === 0 && (
                                <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-end">
                                    <Button variant="secondary" onClick={closeModal}>Close</Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDisputes;
