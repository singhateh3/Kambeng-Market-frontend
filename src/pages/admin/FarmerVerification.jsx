// src/pages/admin/FarmerVerification.jsx
import { useEffect, useState } from 'react';
import { Alert } from '../../components/common/Alert';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/Modal';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

 const FarmerVerification = () => {
    const { refreshUser } = useAuth();
    const [farmers, setFarmers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedFarmers, setSelectedFarmers] = useState([]);
    const [filters, setFilters] = useState({
        status: 'pending',
        search: '',
        page: 1,
    });
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0,
    });
    const [showModal, setShowModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showBulkRejectModal, setShowBulkRejectModal] = useState(false);
    const [selectedFarmer, setSelectedFarmer] = useState(null);
    const [modalAction, setModalAction] = useState('');
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmData, setConfirmData] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [bulkRejectionReason, setBulkRejectionReason] = useState('');
    const [notes, setNotes] = useState('');
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [loadingAction, setLoadingAction] = useState(false);

    useEffect(() => {
        fetchFarmers();
        fetchStats();
    }, [filters]);

    const fetchFarmers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                status: filters.status,
                search: filters.search,
                page: filters.page || 1,
                per_page: filters.per_page || 20,
            });

            const response = await api.get(`/admin/farmers?${params}`);

            if (response.data && Array.isArray(response.data.data)) {
                setFarmers(response.data.data);
                setPagination(response.data.meta || {
                    current_page: 1,
                    last_page: 1,
                    per_page: 20,
                    total: 0,
                });
            } else {
                setFarmers([]);
            }
        } catch (err) {
            console.error('Error fetching farmers:', err);
            setError('Failed to load farmers');
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/farmers/verification/statistics');
            setStats(response.data.data);
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const handleApprove = async (farmerId) => {
        try {
            setLoadingAction(true);
            await api.post(`/admin/farmers/verification/${farmerId}/approve`, { notes });
            setSuccess('Farmer approved successfully!');
            setShowModal(false);
            setShowConfirmModal(false);
            setSelectedFarmer(null);
            setNotes('');
            setSelectedFarmers([]);
            setConfirmAction(null);
            setConfirmData(null);

            // Refresh the current user's data if they are the one being approved
            await refreshUser();

            fetchFarmers();
            fetchStats();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error approving farmer:', err);
            setError('Failed to approve farmer');
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoadingAction(false);
        }
    };

    const handleReject = async (farmerId) => {
        if (!rejectionReason.trim()) {
            setError('Please provide a reason for rejection');
            setTimeout(() => setError(null), 3000);
            return;
        }

        try {
            setLoadingAction(true);
            await api.post(`/admin/farmers/verification/${farmerId}/reject`, {
                reason: rejectionReason
            });
            setSuccess('Farmer rejected successfully!');
            setShowModal(false);
            setShowConfirmModal(false);
            setSelectedFarmer(null);
            setRejectionReason('');
            setSelectedFarmers([]);
            setConfirmAction(null);
            setConfirmData(null);

            // Refresh the current user's data if they are the one being rejected
            await refreshUser();

            fetchFarmers();
            fetchStats();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error rejecting farmer:', err);
            setError('Failed to reject farmer');
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoadingAction(false);
        }
    };

    const handleBulkReject = async () => {
        if (selectedFarmers.length === 0) {
            setError('Please select farmers to reject');
            setTimeout(() => setError(null), 3000);
            return;
        }

        if (!bulkRejectionReason.trim()) {
            setError('Please provide a reason for rejection');
            setTimeout(() => setError(null), 3000);
            return;
        }

        try {
            setLoadingAction(true);
            // Reject each selected farmer
            for (const farmerId of selectedFarmers) {
                await api.post(`/admin/farmers/verification/${farmerId}/reject`, {
                    reason: bulkRejectionReason
                });
            }
            setSuccess(`${selectedFarmers.length} farmers rejected successfully!`);
            setSelectedFarmers([]);
            setBulkRejectionReason('');
            setShowBulkRejectModal(false);

            // Refresh user data
            await refreshUser();

            fetchFarmers();
            fetchStats();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error bulk rejecting:', err);
            setError('Failed to reject farmers');
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoadingAction(false);
        }
    };

    const handleBulkApprove = async () => {
        if (selectedFarmers.length === 0) {
            setError('Please select farmers to approve');
            setTimeout(() => setError(null), 3000);
            return;
        }

        try {
            setLoadingAction(true);
            await api.post('/admin/farmers/verification/bulk-approve', {
                farmer_ids: selectedFarmers,
            });
            setSuccess(`${selectedFarmers.length} farmers approved successfully!`);
            setSelectedFarmers([]);
            setShowConfirmModal(false);
            setConfirmAction(null);
            setConfirmData(null);

            // Refresh user data
            await refreshUser();

            fetchFarmers();
            fetchStats();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error bulk approving:', err);
            setError('Failed to approve farmers');
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoadingAction(false);
        }
    };

    const toggleSelect = (farmerId) => {
        setSelectedFarmers(prev => {
            if (prev.includes(farmerId)) {
                return prev.filter(id => id !== farmerId);
            } else {
                return [...prev, farmerId];
            }
        });
    };

    const toggleSelectAll = () => {
        const pendingFarmers = farmers.filter(f => f.verification_status === 'pending');
        const pendingIds = pendingFarmers.map(f => f.id);
        const allSelected = pendingIds.length > 0 && pendingIds.every(id => selectedFarmers.includes(id));

        if (allSelected) {
            setSelectedFarmers(selectedFarmers.filter(id => !pendingIds.includes(id)));
        } else {
            const newSelection = [...selectedFarmers];
            pendingIds.forEach(id => {
                if (!newSelection.includes(id)) {
                    newSelection.push(id);
                }
            });
            setSelectedFarmers(newSelection);
        }
    };

    const openModal = (farmer, action) => {
        setSelectedFarmer({ ...farmer, action });
        setModalAction(action);
        setShowModal(true);
        setRejectionReason('');
        setNotes('');
    };

    const openConfirmModal = (action, data) => {
        setConfirmAction(action);
        setConfirmData(data);
        setShowConfirmModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedFarmer(null);
        setModalAction('');
        setRejectionReason('');
        setNotes('');
    };

    const closeConfirmModal = () => {
        setShowConfirmModal(false);
        setConfirmAction(null);
        setConfirmData(null);
    };

    const closeBulkRejectModal = () => {
        setShowBulkRejectModal(false);
        setBulkRejectionReason('');
    };

    const handlePageChange = (newPage) => {
        setFilters({ ...filters, page: newPage });
    };

    const handleConfirmAction = () => {
        if (confirmAction === 'approve') {
            handleApprove(confirmData.id);
        } else if (confirmAction === 'reject') {
            handleReject(confirmData.id);
        } else if (confirmAction === 'bulkApprove') {
            handleBulkApprove();
        }
    };

    const pendingFarmers = farmers.filter(f => f.verification_status === 'pending');
    const allPendingSelected = pendingFarmers.length > 0 && pendingFarmers.every(f => selectedFarmers.includes(f.id));

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Farmer Verification</h1>
                    <p className="text-sm text-gray-600 dark:text-slate-400">Review and verify farmer registrations</p>
                </div>
                <div className="flex gap-2">
                    {selectedFarmers.length > 0 && (
                        <>
                            <Button
                                variant="primary"
                                onClick={() => openConfirmModal('bulkApprove', { count: selectedFarmers.length })}
                                isLoading={loadingAction}
                            >
                                Approve Selected ({selectedFarmers.length})
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() => setShowBulkRejectModal(true)}
                                isLoading={loadingAction}
                            >
                                Reject Selected ({selectedFarmers.length})
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Success/Error Messages */}
            {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}
            {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 mb-6">
                    <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-4">
                        <p className="text-sm text-gray-600 dark:text-slate-400">Total Farmers</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{stats.total_farmers || 0}</p>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 shadow rounded-lg p-4 border-l-4 border-yellow-400 dark:border-yellow-600">
                        <p className="text-sm text-yellow-800 dark:text-yellow-300">Pending</p>
                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending || 0}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 shadow rounded-lg p-4 border-l-4 border-green-400 dark:border-green-600">
                        <p className="text-sm text-green-800 dark:text-green-300">Approved</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approved || 0}</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 shadow rounded-lg p-4 border-l-4 border-red-400 dark:border-red-600">
                        <p className="text-sm text-red-800 dark:text-red-300">Rejected</p>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejected || 0}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-800 shadow rounded-lg p-4 border-l-4 border-gray-400 dark:border-slate-600">
                        <p className="text-sm text-gray-800 dark:text-slate-300">Not Submitted</p>
                        <p className="text-2xl font-bold text-gray-600 dark:text-slate-300">{stats.not_submitted || 0}</p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <select
                        className="px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                    >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="">All</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Search farmers..."
                        className="px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                    />
                    <Button variant="secondary" onClick={() => fetchFarmers()}>
                        Apply Filters
                    </Button>
                </div>
            </div>

            {/* Farmers Table */}
            <div className="bg-white dark:bg-slate-800 shadow rounded-lg overflow-hidden">
                {farmers.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-4xl mb-4">👨‍🌾</div>
                        <p className="text-gray-500 dark:text-slate-400">No farmers found</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                                <thead className="bg-gray-50 dark:bg-slate-900">
                                    <tr>
                                        <th className="px-4 py-3 text-left">
                                            <input
                                                type="checkbox"
                                                checked={allPendingSelected}
                                                onChange={toggleSelectAll}
                                                className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
                                                disabled={pendingFarmers.length === 0}
                                            />
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                                            Farmer
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                                            Farm
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                                            Requested
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                    {farmers.map((farmer) => {
                                        const isPending = farmer.verification_status === 'pending';
                                        const isChecked = selectedFarmers.includes(farmer.id);

                                        return (
                                            <tr key={farmer.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => {
                                                            if (isPending) {
                                                                toggleSelect(farmer.id);
                                                            }
                                                        }}
                                                        className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
                                                        disabled={!isPending}
                                                    />
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-slate-300">
                                                            {farmer.name?.[0]?.toUpperCase() || 'U'}
                                                        </div>
                                                        <div className="ml-3">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                                                                {farmer.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500 dark:text-slate-400">
                                                                {farmer.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                                                        {farmer.farmer_profile?.farm_name || '-'}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-slate-400">
                                                        {farmer.farmer_profile?.farm_location || '-'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                                                    {farmer.location || '-'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                                        farmer.verification_status === 'approved'
                                                            ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
                                                            : farmer.verification_status === 'pending'
                                                            ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300'
                                                            : farmer.verification_status === 'rejected'
                                                            ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'
                                                            : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-300'
                                                    }`}>
                                                        {farmer.verification_status_label || farmer.verification_status || 'Not Submitted'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                                                    {farmer.verification_requested_at
                                                        ? new Date(farmer.verification_requested_at).toLocaleDateString()
                                                        : '-'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => openModal(farmer, 'view')}
                                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                                                            title="View"
                                                        >
                                                            👁️
                                                        </button>
                                                        {isPending && (
                                                            <>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedFarmer(farmer);
                                                                        setModalAction('approve');
                                                                        setNotes('');
                                                                        openConfirmModal('approve', { id: farmer.id });
                                                                    }}
                                                                    className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                                                                    title="Approve"
                                                                    disabled={loadingAction}
                                                                >
                                                                    ✅
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedFarmer(farmer);
                                                                        setModalAction('reject');
                                                                        setRejectionReason('');
                                                                        setShowModal(true);
                                                                    }}
                                                                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                                                    title="Reject"
                                                                    disabled={loadingAction}
                                                                >
                                                                    ❌
                                                                </button>
                                                            </>
                                                        )}
                                                        {farmer.verification_status === 'approved' && (
                                                            <span className="text-green-600 dark:text-green-400 text-sm font-medium">Verified</span>
                                                        )}
                                                        {farmer.verification_status === 'rejected' && (
                                                            <span className="text-red-600 dark:text-red-400 text-sm font-medium">Rejected</span>
                                                        )}
                                                        {!farmer.verification_status && (
                                                            <span className="text-gray-400 dark:text-slate-500 text-sm">Not requested</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-4 py-4 border-t border-gray-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
                            <div className="text-sm text-gray-700 dark:text-slate-300">
                                Showing {farmers.length} of {pagination.total} farmers
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
                                <span className="px-3 py-1 text-sm text-gray-600 dark:text-slate-400">
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

            {/* View Modal — read-only, mirrors Users.jsx's View modal pattern.
                Built only from fields UserResource actually serializes today
                (name/email/phone/location/avatar/verification status+dates,
                farmer_profile's farm_name/farm_location/bio/id_verified/
                verification_notes/rejection_reason/rejected_at). The backend
                has an uploadDocument endpoint that stores verification_document/
                business_license/id_document paths on the farmer profile, but
                UserResource never includes those fields in the API response —
                so no documents/images section is rendered here; that data
                genuinely isn't available to the frontend yet. */}
            <Modal
                isOpen={showModal && !!selectedFarmer && modalAction === 'view'}
                onClose={closeModal}
                title="Farmer Details"
                maxWidth="max-w-lg"
            >
                {selectedFarmer && (
                    <div className="p-6 space-y-5">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xl font-medium text-slate-600 dark:text-slate-300 flex-shrink-0 overflow-hidden">
                                {selectedFarmer.avatar ? (
                                    <img
                                        src={selectedFarmer.avatar}
                                        alt={selectedFarmer.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                ) : (
                                    selectedFarmer.name?.[0]?.toUpperCase() || 'U'
                                )}
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-semibold text-slate-900 dark:text-slate-100 break-words">{selectedFarmer.name}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 break-words">{selectedFarmer.email}</p>
                            </div>
                        </div>

                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            selectedFarmer.verification_status === 'approved'
                                ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
                                : selectedFarmer.verification_status === 'pending'
                                ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300'
                                : selectedFarmer.verification_status === 'rejected'
                                ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300'
                        }`}>
                            {selectedFarmer.verification_status_label || selectedFarmer.verification_status || 'Not Submitted'}
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-t border-slate-100 dark:border-slate-700 pt-4">
                            <div className="min-w-0">
                                <p className="text-slate-500 dark:text-slate-400">Phone</p>
                                <p className="text-slate-900 dark:text-slate-100 font-medium break-words">{selectedFarmer.phone || 'Not provided'}</p>
                            </div>
                            <div className="min-w-0">
                                <p className="text-slate-500 dark:text-slate-400">Location</p>
                                <p className="text-slate-900 dark:text-slate-100 font-medium break-words">{selectedFarmer.location || 'Not provided'}</p>
                            </div>
                            <div className="min-w-0">
                                <p className="text-slate-500 dark:text-slate-400">Farm name</p>
                                <p className="text-slate-900 dark:text-slate-100 font-medium break-words">{selectedFarmer.farmer_profile?.farm_name || 'Not provided'}</p>
                            </div>
                            <div className="min-w-0">
                                <p className="text-slate-500 dark:text-slate-400">Farm location</p>
                                <p className="text-slate-900 dark:text-slate-100 font-medium break-words">{selectedFarmer.farmer_profile?.farm_location || 'Not provided'}</p>
                            </div>
                            <div className="sm:col-span-2 min-w-0">
                                <p className="text-slate-500 dark:text-slate-400">Bio</p>
                                <p className="text-slate-900 dark:text-slate-100 font-medium break-words">{selectedFarmer.farmer_profile?.bio || 'No bio provided'}</p>
                            </div>
                            <div className="min-w-0">
                                <p className="text-slate-500 dark:text-slate-400">Requested</p>
                                <p className="text-slate-900 dark:text-slate-100 font-medium">
                                    {selectedFarmer.verification_requested_at
                                        ? new Date(selectedFarmer.verification_requested_at).toLocaleDateString()
                                        : '-'}
                                </p>
                            </div>
                            {selectedFarmer.verified_at && (
                                <div className="min-w-0">
                                    <p className="text-slate-500 dark:text-slate-400">Verified</p>
                                    <p className="text-slate-900 dark:text-slate-100 font-medium">
                                        {new Date(selectedFarmer.verified_at).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                            {selectedFarmer.farmer_profile?.rejected_at && (
                                <div className="min-w-0">
                                    <p className="text-slate-500 dark:text-slate-400">Rejected</p>
                                    <p className="text-slate-900 dark:text-slate-100 font-medium">
                                        {new Date(selectedFarmer.farmer_profile.rejected_at).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                        </div>

                        {selectedFarmer.farmer_profile?.verification_notes && (
                            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-700 min-w-0">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Verification notes</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300 break-words">{selectedFarmer.farmer_profile.verification_notes}</p>
                            </div>
                        )}
                        {selectedFarmer.farmer_profile?.rejection_reason && (
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-100 dark:border-red-800 min-w-0">
                                <p className="text-xs text-red-500 dark:text-red-400 mb-1">Rejection reason</p>
                                <p className="text-sm text-red-700 dark:text-red-300 break-words">{selectedFarmer.farmer_profile.rejection_reason}</p>
                            </div>
                        )}

                        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-700">
                            <Button variant="secondary" onClick={closeModal}>
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Reject Modal (Single) */}
            <Modal
                isOpen={showModal && !!selectedFarmer && modalAction === 'reject'}
                onClose={closeModal}
                title="Reject Farmer"
                maxWidth="max-w-md"
            >
                {selectedFarmer && (
                    <div className="p-6">
                        <div className="mb-4">
                            <div className="flex items-center mb-4 min-w-0">
                                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-lg font-medium text-gray-600 dark:text-slate-300 flex-shrink-0">
                                    {selectedFarmer.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="ml-4 min-w-0">
                                    <h3 className="font-semibold text-gray-900 dark:text-slate-100 break-words">{selectedFarmer.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-slate-400 break-words">{selectedFarmer.farmer_profile?.farm_name || 'No farm name'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                                Rejection Reason *
                            </label>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                rows="3"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Please provide a reason for rejection..."
                            />
                        </div>

                        <div className="flex justify-end space-x-4">
                            <Button variant="secondary" onClick={closeModal}>
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() => {
                                    if (selectedFarmer) {
                                        openConfirmModal('reject', { id: selectedFarmer.id });
                                    }
                                }}
                                disabled={!rejectionReason.trim() || loadingAction}
                            >
                                Reject Farmer
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Bulk Reject Modal */}
            <Modal
                isOpen={showBulkRejectModal}
                onClose={closeBulkRejectModal}
                title="Bulk Reject Farmers"
                maxWidth="max-w-md"
            >
                <div className="p-6">
                    <div className="mb-4">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center text-2xl">
                                ❌
                            </div>
                            <div className="ml-4">
                                <h3 className="font-semibold text-gray-900 dark:text-slate-100">Reject {selectedFarmers.length} Farmers</h3>
                                <p className="text-sm text-gray-500 dark:text-slate-400">Provide a reason for rejecting these farmers</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                            Rejection Reason *
                        </label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            rows="3"
                            value={bulkRejectionReason}
                            onChange={(e) => setBulkRejectionReason(e.target.value)}
                            placeholder="Please provide a reason for rejection..."
                        />
                    </div>

                    <div className="flex justify-end space-x-4">
                        <Button variant="secondary" onClick={closeBulkRejectModal}>
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleBulkReject}
                            disabled={!bulkRejectionReason.trim() || loadingAction}
                            isLoading={loadingAction}
                        >
                            Reject All ({selectedFarmers.length})
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Confirm Modal */}
            <Modal
                isOpen={showConfirmModal}
                onClose={closeConfirmModal}
                title="Confirm Action"
                maxWidth="max-w-md"
            >
                <div className="p-6">
                            <div className="mb-4">
                                {confirmAction === 'approve' && (
                                    <>
                                        <div className="flex items-center justify-center mb-4">
                                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center text-3xl">
                                                ✅
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 text-center mb-2">
                                            Approve Farmer
                                        </h3>
                                        <p className="text-gray-600 dark:text-slate-300 text-center">
                                            Are you sure you want to approve <strong>{selectedFarmer?.name}</strong>?
                                        </p>
                                        {notes && (
                                            <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 text-center">
                                                Notes: {notes}
                                            </p>
                                        )}
                                    </>
                                )}
                                {confirmAction === 'reject' && (
                                    <>
                                        <div className="flex items-center justify-center mb-4">
                                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center text-3xl">
                                                ❌
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 text-center mb-2">
                                            Reject Farmer
                                        </h3>
                                        <p className="text-gray-600 dark:text-slate-300 text-center">
                                            Are you sure you want to reject <strong>{selectedFarmer?.name}</strong>?
                                        </p>
                                        {rejectionReason && (
                                            <p className="text-sm text-red-600 dark:text-red-400 mt-2 text-center">
                                                Reason: {rejectionReason}
                                            </p>
                                        )}
                                    </>
                                )}
                                {confirmAction === 'bulkApprove' && (
                                    <>
                                        <div className="flex items-center justify-center mb-4">
                                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center text-3xl">
                                                ✅
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 text-center mb-2">
                                            Bulk Approve Farmers
                                        </h3>
                                        <p className="text-gray-600 dark:text-slate-300 text-center">
                                            Are you sure you want to approve <strong>{confirmData?.count}</strong> farmers?
                                        </p>
                                    </>
                                )}
                            </div>

                            <div className="flex justify-end space-x-4">
                                <Button variant="secondary" onClick={closeConfirmModal}>
                                    Cancel
                                </Button>
                                <Button
                                    variant={confirmAction === 'reject' ? 'danger' : 'primary'}
                                    onClick={handleConfirmAction}
                                    isLoading={loadingAction}
                                    disabled={loadingAction}
                                >
                                    {confirmAction === 'approve' ? 'Approve' :
                                     confirmAction === 'reject' ? 'Reject' :
                                     'Approve'}
                                    {confirmAction === 'bulkApprove' && ' All'}
                                </Button>
                            </div>
                </div>
            </Modal>
        </div>
    );
};

export default FarmerVerification
