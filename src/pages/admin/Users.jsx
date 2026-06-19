import { useEffect, useState } from 'react';
import { Button } from '../../components/common/Button';
import api from '../../services/api';

export const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        role: '',
        search: '',
        verified: '',
        unverified: '',
    });
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0,
    });

    useEffect(() => {
        fetchUsers();
    }, [filters]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams(filters);
            const response = await api.get(`/admin/users?${params}`);
            setUsers(response.data.data);
            setPagination(response.data.meta);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyFarmer = async (userId) => {
        if (!confirm('Are you sure you want to verify this farmer?')) return;
        try {
            await api.post(`/admin/users/${userId}/verify`);
            fetchUsers();
        } catch (error) {
            console.error('Error verifying farmer:', error);
        }
    };

    const handleRoleChange = async (userId, role) => {
        try {
            await api.put(`/admin/users/${userId}/role`, { role });
            fetchUsers();
        } catch (error) {
            console.error('Error updating role:', error);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/admin/users/${userId}`);
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
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
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            </div>

            {/* Filters */}
            <div className="bg-white shadow rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                    <select
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={filters.role}
                        onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                    >
                        <option value="">All Roles</option>
                        <option value="farmer">Farmer</option>
                        <option value="buyer">Buyer</option>
                        <option value="admin">Admin</option>
                    </select>
                    <select
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={filters.verified}
                        onChange={(e) => setFilters({ ...filters, verified: e.target.value })}
                    >
                        <option value="">All</option>
                        <option value="1">Verified</option>
                        <option value="0">Unverified</option>
                    </select>
                    <Button onClick={fetchUsers}>Apply Filters</Button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Joined
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                            {user.name?.[0]}
                                        </div>
                                        <div className="ml-3">
                                            <div className="text-sm font-medium text-gray-900">
                                                {user.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                        user.role === 'farmer' ? 'bg-green-100 text-green-800' :
                                        'bg-blue-100 text-blue-800'
                                    }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {user.role === 'farmer' && (
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            user.verified_at ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {user.verified_at ? 'Verified' : 'Pending'}
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <select
                                        className="mr-2 px-2 py-1 border border-gray-300 rounded"
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                    >
                                        <option value="farmer">Farmer</option>
                                        <option value="buyer">Buyer</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    {user.role === 'farmer' && !user.verified_at && (
                                        <button
                                            onClick={() => handleVerifyFarmer(user.id)}
                                            className="mr-2 text-green-600 hover:text-green-900"
                                        >
                                            Verify
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDeleteUser(user.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
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
            </div>
        </div>
    );
};