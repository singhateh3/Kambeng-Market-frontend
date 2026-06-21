// src/pages/admin/FarmerVerification.jsx
import { useEffect, useState } from 'react';
import { Alert } from '../../components/common/Alert';
import { Button } from '../../components/common/Button';
import api from '../../services/api';

export const FarmerVerification = () => {
    const [farmers, setFarmers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedFarmers, setSelectedFarmers] = useState([]);
    const [filter, setFilter] = useState('pending');
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0,
    });
    const [selectedFarmer, setSelectedFarmer] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [notes, setNotes] = useState('');
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFarmers();
        fetchStats();
    }, [filter, search]);

    const fetchFarmers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                status: filter,
                search: search,
            });
            
            const response = await api.get(`/admin/farmers?${params}`);
            setFarmers(response.data.data);
            setPagination(response.data.meta);
        } catch (err) {
            console.error('Error fetching farmers:', err);
            setError('Failed to load farmers');
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
        if (!confirm('Are you sure you want to approve this farmer?')) return;
        
        try {
            await api.post(`/admin/farmers/verification/${farmerId}/approve`, { notes });
            setSuccess('Farmer approved successfully!');
            fetchFarmers();
            fetchStats();
            setShowModal(false);
            setSelectedFarmer(null);
            setNotes('');
            
            // Clear success after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error approving farmer:', err);
            setError('Failed to approve farmer');
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleReject = async (farmerId) => {
        if (!rejectionReason.trim()) {
            setError('Please provide a reason for rejection');
            return;
        }
        
        if (!confirm('Are you sure you want to reject this farmer?')) return;
        
        try {
            await api.post(`/admin/farmers/verification/${farmerId}/reject`, { 
                reason: rejectionReason 
            });
            setSuccess('Farmer rejected successfully!');
            fetchFarmers();
            fetchStats();
            setShowModal(false);
            setSelectedFarmer(null);
            setRejectionReason('');
            
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error rejecting farmer:', err);
            setError('Failed to reject farmer');
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleBulkApprove = async () => {
        if (selectedFarmers.length === 0) {
            setError('Please select farmers to approve');
            return;
        }
        
        if (!confirm(`Approve ${selectedFarmers.length} farmers?`)) return;
        
        try {
            await api.post('/admin/farmers/verification/bulk-approve', {
                farmer_ids: selectedFarmers,
            });
            setSuccess(`${selectedFarmers.length} farmers approved successfully!`);
            setSelectedFarmers([]);
            fetchFarmers();
            fetchStats();
            
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error bulk approving:', err);
            setError('Failed to approve farmers');
            setTimeout(() => setError(null), 3000);
        }
    };

    const toggleSelect = (farmerId) => {
        setSelectedFarmers(prev => 
            prev.includes(farmerId) 
                ? prev.filter(id => id !== farmerId)
                : [...prev, farmerId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedFarmers.length === farmers.length) {
            setSelectedFarmers([]);
        } else {
            setSelectedFarmers(farmers.map(f => f.id));
        }
    };

    const openModal = (farmer, action) => {
        setSelectedFarmer({ ...farmer, action });
        setShowModal(true);
        setRejectionReason('');
        setNotes('');
    };

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
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Farmer Verification</h1>
                <Button 
                    onClick={handleBulkApprove}
                    disabled={selectedFarmers.length === 0}
                >
                    Approve Selected ({selectedFarmers.length})
                </Button>
            </div>

            {/* Success/Error Messages */}
            {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}
            {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-5 mb-6">
                    <div className="bg-white shadow rounded-lg p-4">
                        <p className="text-sm text-gray-600">Total Farmers</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total_farmers}</p>
                    </div>
                    <div className="bg-yellow-50 shadow rounded-lg p-4 border-l-4 border-yellow-400">
                        <p className="text-sm text-yellow-800">Pending</p>
                        <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    </div>
                    <div className="bg-green-50 shadow rounded-lg p-4 border-l-4 border-green-400">
                        <p className="text-sm text-green-800">Approved</p>
                        <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                    </div>
                    <div className="bg-red-50 shadow rounded-lg p-4 border-l-4 border-red-400">
                        <p className="text-sm text-red-800">Rejected</p>
                        <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                    </div>
                    <div className="bg-gray-50 shadow rounded-lg p-4 border-l-4 border-gray-400">
                        <p className="text-sm text-gray-800">Not Submitted</p>
                        <p className="text-2xl font-bold text-gray-600">{stats.not_submitted}</p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white shadow rounded-lg p-4 mb-6">
                <div className="flex flex-wrap gap-4">
                    <select
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="">All</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Search farmers..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button variant="secondary" onClick={fetchFarmers}>Apply Filters</Button>
                </div>
            </div>

            {/* Farmers Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left">
                                <input
                                    type="checkbox"
                                    checked={selectedFarmers.length === farmers.length && farmers.length > 0}
                                    onChange={toggleSelectAll}
                                    className="h-4 w-4 text-primary-600 rounded"
                                />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Farmer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Farm
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Location
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Requested
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {farmers.map((farmer) => (
                            <tr key={farmer.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {farmer.verification_status === 'pending' && (
                                        <input
                                            type="checkbox"
                                            checked={selectedFarmers.includes(farmer.id)}
                                            onChange={() => toggleSelect(farmer.id)}
                                            className="h-4 w-4 text-primary-600 rounded"
                                        />
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                            {farmer.name?.[0]}
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
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {farmer.farmer_profile?.farm_name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {farmer.farmer_profile?.farm_location}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {farmer.location}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        farmer.verification_status === 'approved' 
                                            ? 'bg-green-100 text-green-800' 
                                            : farmer.verification_status === 'pending'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : farmer.verification_status === 'rejected'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {farmer.verification_status_label}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {farmer.verification_requested_at 
                                        ? new Date(farmer.verification_requested_at).toLocaleDateString()
                                        : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {farmer.verification_status === 'pending' && (
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => openModal(farmer, 'approve')}
                                                className="text-green-600 hover:text-green-900"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => openModal(farmer, 'reject')}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                    {farmer.verification_status === 'approved' && (
                                        <span className="text-green-600">✓ Verified</span>
                                    )}
                                    {farmer.verification_status === 'rejected' && (
                                        <span className="text-red-600">✗ Rejected</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        Showing {farmers.length} of {pagination.total} farmers
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            disabled={pagination.current_page === 1}
                            onClick={() => setFilter(prev => ({ ...prev, page: pagination.current_page - 1 }))}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            disabled={pagination.current_page === pagination.last_page}
                            onClick={() => setFilter(prev => ({ ...prev, page: pagination.current_page + 1 }))}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>

            {/* Modal for Approve/Reject */}
            {showModal && selectedFarmer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            {selectedFarmer.action === 'approve' ? 'Approve' : 'Reject'} Farmer
                        </h2>
                        
                        <div className="mb-4">
                            <p className="text-sm text-gray-600">
                                <strong>Name:</strong> {selectedFarmer.name}
                            </p>
                            <p className="text-sm text-gray-600">
                                <strong>Farm:</strong> {selectedFarmer.farmer_profile?.farm_name}
                            </p>
                            <p className="text-sm text-gray-600">
                                <strong>Email:</strong> {selectedFarmer.email}
                            </p>
                        </div>

                        {selectedFarmer.action === 'approve' ? (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    rows="3"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add verification notes..."
                                />
                            </div>
                        ) : (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Rejection Reason *
                                </label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    rows="3"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Please provide a reason for rejection..."
                                />
                            </div>
                        )}

                        <div className="flex space-x-4">
                            {selectedFarmer.action === 'approve' ? (
                                <Button onClick={() => handleApprove(selectedFarmer.id)}>
                                    Approve Farmer
                                </Button>
                            ) : (
                                <Button 
                                    variant="danger" 
                                    onClick={() => handleReject(selectedFarmer.id)}
                                    disabled={!rejectionReason.trim()}
                                >
                                    Reject Farmer
                                </Button>
                            )}
                            <Button 
                                variant="secondary" 
                                onClick={() => {
                                    setShowModal(false);
                                    setSelectedFarmer(null);
                                    setRejectionReason('');
                                    setNotes('');
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};