// src/pages/admin/FarmerVerification.jsx
import { useEffect, useState } from 'react';
import { Alert } from '../../components/common/Alert';
import { Button } from '../../components/common/Button';
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Farmer Verification</h1>
                    <p className="text-sm text-gray-600">Review and verify farmer registrations</p>
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
                    <div className="bg-white shadow rounded-lg p-4">
                        <p className="text-sm text-gray-600">Total Farmers</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total_farmers || 0}</p>
                    </div>
                    <div className="bg-yellow-50 shadow rounded-lg p-4 border-l-4 border-yellow-400">
                        <p className="text-sm text-yellow-800">Pending</p>
                        <p className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</p>
                    </div>
                    <div className="bg-green-50 shadow rounded-lg p-4 border-l-4 border-green-400">
                        <p className="text-sm text-green-800">Approved</p>
                        <p className="text-2xl font-bold text-green-600">{stats.approved || 0}</p>
                    </div>
                    <div className="bg-red-50 shadow rounded-lg p-4 border-l-4 border-red-400">
                        <p className="text-sm text-red-800">Rejected</p>
                        <p className="text-2xl font-bold text-red-600">{stats.rejected || 0}</p>
                    </div>
                    <div className="bg-gray-50 shadow rounded-lg p-4 border-l-4 border-gray-400">
                        <p className="text-sm text-gray-800">Not Submitted</p>
                        <p className="text-2xl font-bold text-gray-600">{stats.not_submitted || 0}</p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white shadow rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <select
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                    />
                    <Button variant="secondary" onClick={() => fetchFarmers()}>
                        Apply Filters
                    </Button>
                </div>
            </div>

            {/* Farmers Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                {farmers.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-4xl mb-4">👨‍🌾</div>
                        <p className="text-gray-500">No farmers found</p>
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
                                                checked={allPendingSelected}
                                                onChange={toggleSelectAll}
                                                className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
                                                disabled={pendingFarmers.length === 0}
                                            />
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Farmer
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Farm
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Requested
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {farmers.map((farmer) => {
                                        const isPending = farmer.verification_status === 'pending';
                                        const isChecked = selectedFarmers.includes(farmer.id);
                                        
                                        return (
                                            <tr key={farmer.id} className="hover:bg-gray-50">
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
                                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                                                            {farmer.name?.[0]?.toUpperCase() || 'U'}
                                                        </div>
                                                        <div className="ml-3">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {farmer.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {farmer.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {farmer.farmer_profile?.farm_name || '-'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {farmer.farmer_profile?.farm_location || '-'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                    {farmer.location || '-'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                                        farmer.verification_status === 'approved' 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : farmer.verification_status === 'pending'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : farmer.verification_status === 'rejected'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {farmer.verification_status_label || farmer.verification_status || 'Not Submitted'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                    {farmer.verification_requested_at 
                                                        ? new Date(farmer.verification_requested_at).toLocaleDateString()
                                                        : '-'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => openModal(farmer, 'view')}
                                                            className="text-blue-600 hover:text-blue-900"
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
                                                                    className="text-green-600 hover:text-green-900"
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
                                                                    className="text-red-600 hover:text-red-900"
                                                                    title="Reject"
                                                                    disabled={loadingAction}
                                                                >
                                                                    ❌
                                                                </button>
                                                            </>
                                                        )}
                                                        {farmer.verification_status === 'approved' && (
                                                            <span className="text-green-600 text-sm font-medium">Verified</span>
                                                        )}
                                                        {farmer.verification_status === 'rejected' && (
                                                            <span className="text-red-600 text-sm font-medium">Rejected</span>
                                                        )}
                                                        {!farmer.verification_status && (
                                                            <span className="text-gray-400 text-sm">Not requested</span>
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
                        <div className="px-4 py-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2">
                            <div className="text-sm text-gray-700">
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

            {/* Reject Modal (Single) */}
            {showModal && selectedFarmer && modalAction === 'reject' && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-900">Reject Farmer</h2>
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
                            <div className="mb-4">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-medium text-gray-600">
                                        {selectedFarmer.name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="font-semibold text-gray-900">{selectedFarmer.name}</h3>
                                        <p className="text-sm text-gray-500">{selectedFarmer.farmer_profile?.farm_name || 'No farm name'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Rejection Reason *
                                </label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
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
                    </div>
                </div>
            )}

            {/* Bulk Reject Modal */}
            {showBulkRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-900">Bulk Reject Farmers</h2>
                            <button
                                onClick={closeBulkRejectModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="mb-4">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl">
                                        ❌
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="font-semibold text-gray-900">Reject {selectedFarmers.length} Farmers</h3>
                                        <p className="text-sm text-gray-500">Provide a reason for rejecting these farmers</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Rejection Reason *
                                </label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
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
                    </div>
                </div>
            )}

            {/* Confirm Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-900">Confirm Action</h2>
                            <button
                                onClick={closeConfirmModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="mb-4">
                                {confirmAction === 'approve' && (
                                    <>
                                        <div className="flex items-center justify-center mb-4">
                                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl">
                                                ✅
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                                            Approve Farmer
                                        </h3>
                                        <p className="text-gray-600 text-center">
                                            Are you sure you want to approve <strong>{selectedFarmer?.name}</strong>?
                                        </p>
                                        {notes && (
                                            <p className="text-sm text-gray-500 mt-2 text-center">
                                                Notes: {notes}
                                            </p>
                                        )}
                                    </>
                                )}
                                {confirmAction === 'reject' && (
                                    <>
                                        <div className="flex items-center justify-center mb-4">
                                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-3xl">
                                                ❌
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                                            Reject Farmer
                                        </h3>
                                        <p className="text-gray-600 text-center">
                                            Are you sure you want to reject <strong>{selectedFarmer?.name}</strong>?
                                        </p>
                                        {rejectionReason && (
                                            <p className="text-sm text-red-600 mt-2 text-center">
                                                Reason: {rejectionReason}
                                            </p>
                                        )}
                                    </>
                                )}
                                {confirmAction === 'bulkApprove' && (
                                    <>
                                        <div className="flex items-center justify-center mb-4">
                                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl">
                                                ✅
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                                            Bulk Approve Farmers
                                        </h3>
                                        <p className="text-gray-600 text-center">
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
                    </div>
                </div>
            )}
        </div>
    );
};

export default FarmerVerification