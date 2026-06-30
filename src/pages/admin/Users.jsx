// src/pages/admin/AdminUsers.jsx
import { useEffect, useState } from 'react';
import { Alert } from '../../components/common/Alert';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

 const AdminUsers = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        role: '',
        search: '',
        verified: '',
        page: 1,
    });
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0,
    });
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalAction, setModalAction] = useState('');
    const [loadingAction, setLoadingAction] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, [filters]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                ...filters,
                page: filters.page || 1,
            });
            const response = await api.get(`/admin/users?${params}`);
            setUsers(response.data.data);
            setPagination(response.data.meta);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, role) => {
        try {
            setLoadingAction(true);
            await api.put(`/admin/users/${userId}/role`, { role });
            setSuccess('User role updated successfully');
            fetchUsers();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error updating role:', err);
            setError('Failed to update user role');
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoadingAction(false);
        }
    };

    const handleVerifyFarmer = async (userId) => {
        try {
            setLoadingAction(true);
            await api.post(`/admin/users/${userId}/verify`);
            setSuccess('Farmer verified successfully');
            fetchUsers();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error verifying farmer:', err);
            setError('Failed to verify farmer');
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoadingAction(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        
        try {
            setLoadingAction(true);
            await api.delete(`/admin/users/${userId}`);
            setSuccess('User deleted successfully');
            setShowModal(false);
            fetchUsers();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error deleting user:', err);
            setError('Failed to delete user');
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoadingAction(false);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedUsers.length === 0) {
            setError('Please select users to delete');
            return;
        }
        
        if (!confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) return;
        
        try {
            setLoadingAction(true);
            // Delete each user
            for (const userId of selectedUsers) {
                await api.delete(`/admin/users/${userId}`);
            }
            setSuccess(`${selectedUsers.length} users deleted successfully`);
            setSelectedUsers([]);
            fetchUsers();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error deleting users:', err);
            setError('Failed to delete users');
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoadingAction(false);
        }
    };

    const toggleSelect = (userId) => {
        setSelectedUsers(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedUsers.length === users.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(users.map(u => u.id));
        }
    };

    const openModal = (user, action) => {
        setSelectedUser(user);
        setModalAction(action);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedUser(null);
        setModalAction('');
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
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                    <p className="text-sm text-gray-600">
                        Manage all users on the platform
                    </p>
                </div>
                <div className="flex gap-2">
                    {selectedUsers.length > 0 && (
                        <Button 
                            variant="danger" 
                            size="sm"
                            onClick={handleBulkDelete}
                            isLoading={loadingAction}
                        >
                            Delete Selected ({selectedUsers.length})
                        </Button>
                    )}
                </div>
            </div>

            {/* Success/Error Messages */}
            {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}
            {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

            {/* Filters */}
            <div className="bg-white shadow rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                    />
                    <select
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={filters.role}
                        onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}
                    >
                        <option value="">All Roles</option>
                        <option value="farmer">Farmer</option>
                        <option value="buyer">Buyer</option>
                        <option value="admin">Admin</option>
                    </select>
                    <select
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={filters.verified}
                        onChange={(e) => setFilters({ ...filters, verified: e.target.value, page: 1 })}
                    >
                        <option value="">All</option>
                        <option value="1">Verified</option>
                        <option value="0">Unverified</option>
                    </select>
                    <Button 
                        variant="secondary" 
                        onClick={() => {
                            setFilters({ ...filters, page: 1 });
                            fetchUsers();
                        }}
                    >
                        Apply Filters
                    </Button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                {users.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No users found</p>
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
                                                checked={selectedUsers.length === users.length && users.length > 0}
                                                onChange={toggleSelectAll}
                                                className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
                                            />
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Joined
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {user.id !== currentUser?.id && (
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedUsers.includes(user.id)}
                                                        onChange={() => toggleSelect(user.id)}
                                                        className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
                                                    />
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                                                        {user.name?.[0]?.toUpperCase() || 'U'}
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {user.name}
                                                            {user.id === currentUser?.id && (
                                                                <span className="ml-2 text-xs text-primary-600">(You)</span>
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <select
                                                    className={`px-2 py-1 text-xs rounded border ${
                                                        user.id === currentUser?.id ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'
                                                    }`}
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                    disabled={user.id === currentUser?.id || loadingAction}
                                                >
                                                    <option value="farmer">Farmer</option>
                                                    <option value="buyer">Buyer</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {user.role === 'farmer' && (
                                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                                        user.verified_at 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : user.verification_status === 'pending'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : user.verification_status === 'rejected'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {user.verified_at ? 'Verified' : 
                                                         user.verification_status === 'pending' ? 'Pending' :
                                                         user.verification_status === 'rejected' ? 'Rejected' : 
                                                         'Not Submitted'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-2">
                                                    {user.role === 'farmer' && !user.verified_at && (
                                                        <button
                                                            onClick={() => handleVerifyFarmer(user.id)}
                                                            className="text-green-600 hover:text-green-900 text-xs"
                                                            disabled={loadingAction}
                                                        >
                                                            Verify
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => openModal(user, 'view')}
                                                        className="text-blue-600 hover:text-blue-900 text-xs"
                                                    >
                                                        View
                                                    </button>
                                                    {user.id !== currentUser?.id && (
                                                        <button
                                                            onClick={() => openModal(user, 'delete')}
                                                            className="text-red-600 hover:text-red-900 text-xs"
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-4 py-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2">
                            <div className="text-sm text-gray-700">
                                Showing {users.length} of {pagination.total} users
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    disabled={pagination.current_page === 1}
                                    onClick={() => setFilters({ ...filters, page: pagination.current_page - 1 })}
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
                                    onClick={() => setFilters({ ...filters, page: pagination.current_page + 1 })}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Modal */}
            {showModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                {modalAction === 'delete' ? 'Delete User' : 'User Details'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {modalAction === 'delete' ? (
                            <>
                                <div className="mb-4">
                                    <p className="text-gray-600">
                                        Are you sure you want to delete <strong>{selectedUser.name}</strong>?
                                    </p>
                                    <p className="text-sm text-red-600 mt-2">
                                        This action cannot be undone. All associated data will be permanently removed.
                                    </p>
                                </div>
                                <div className="flex justify-end space-x-4">
                                    <Button variant="secondary" onClick={closeModal}>
                                        Cancel
                                    </Button>
                                    <Button 
                                        variant="danger" 
                                        onClick={() => handleDeleteUser(selectedUser.id)}
                                        isLoading={loadingAction}
                                    >
                                        Delete User
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-medium text-gray-600">
                                        {selectedUser.name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="ml-3">
                                        <div className="font-semibold text-gray-900">{selectedUser.name}</div>
                                        <div className="text-sm text-gray-500">{selectedUser.email}</div>
                                    </div>
                                </div>
                                <div className="border-t pt-3">
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="text-gray-500">Role</div>
                                        <div className="text-gray-900 capitalize">{selectedUser.role}</div>
                                        <div className="text-gray-500">Phone</div>
                                        <div className="text-gray-900">{selectedUser.phone || 'Not provided'}</div>
                                        <div className="text-gray-500">Location</div>
                                        <div className="text-gray-900">{selectedUser.location || 'Not provided'}</div>
                                        <div className="text-gray-500">Joined</div>
                                        <div className="text-gray-900">{new Date(selectedUser.created_at).toLocaleDateString()}</div>
                                        {selectedUser.role === 'farmer' && (
                                            <>
                                                <div className="text-gray-500">Verification</div>
                                                <div className={`font-medium ${
                                                    selectedUser.verified_at ? 'text-green-600' : 'text-yellow-600'
                                                }`}>
                                                    {selectedUser.verified_at ? '✅ Verified' : '⏳ Pending'}
                                                </div>
                                                {selectedUser.farmer_profile && (
                                                    <>
                                                        <div className="text-gray-500">Farm Name</div>
                                                        <div className="text-gray-900">{selectedUser.farmer_profile.farm_name}</div>
                                                        <div className="text-gray-500">Farm Location</div>
                                                        <div className="text-gray-900">{selectedUser.farmer_profile.farm_location}</div>
                                                        <div className="text-gray-500">Bio</div>
                                                        <div className="text-gray-900">{selectedUser.farmer_profile.bio || 'No bio'}</div>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-end pt-3">
                                    <Button variant="secondary" onClick={closeModal}>
                                        Close
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers