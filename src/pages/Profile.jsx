// src/pages/Profile.jsx
import { useEffect, useState } from 'react';
import { Alert } from '../components/common/Alert';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useAuth } from '../hooks/useAuth';

export const Profile = () => {
    const { user, refreshUser, updateProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        location: user?.location || '',
        bio: user?.farmer_profile?.bio || '',
        farm_name: user?.farmer_profile?.farm_name || '',
        farm_location: user?.farmer_profile?.farm_location || '',
        avatar: null,
    });

    // Auto-refresh user data every 30 seconds to check for status changes
    useEffect(() => {
        const interval = setInterval(() => {
            if (!isEditing) {
                refreshUser();
            }
        }, 30000); // Refresh every 30 seconds

        return () => clearInterval(interval);
    }, [isEditing, refreshUser]);

    // Update form data when user changes
    useEffect(() => {
        if (user) {
            setFormData({
                name: user?.name || '',
                phone: user?.phone || '',
                location: user?.location || '',
                bio: user?.farmer_profile?.bio || '',
                farm_name: user?.farmer_profile?.farm_name || '',
                farm_location: user?.farmer_profile?.farm_location || '',
                avatar: null,
            });
        }
    }, [user]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refreshUser();
        setIsRefreshing(false);
        setSuccess('Profile refreshed successfully!');
        setTimeout(() => setSuccess(null), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsLoading(true);

        try {
            await updateProfile(formData);
            setSuccess('Profile updated successfully!');
            setIsEditing(false);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.message || 'Failed to update profile');
            setTimeout(() => setError(null), 3000);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, avatar: file });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                    >
                        <svg className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                    {!isEditing && (
                        <Button onClick={() => setIsEditing(true)}>
                            Edit Profile
                        </Button>
                    )}
                </div>
            </div>

            {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}
            {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

            {/* Profile Avatar */}
            <div className="flex items-center space-x-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-3xl text-primary-700">
                    {user?.avatar_url ? (
                        <img src={user.avatar_url} alt={user.name} className="w-20 h-20 rounded-full object-cover" />
                    ) : (
                        user?.name?.charAt(0)?.toUpperCase() || 'U'
                    )}
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
                    <p className="text-gray-600">{user?.email}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        user?.role === 'farmer' ? 'bg-green-100 text-green-800' : 
                        user?.role === 'admin' ? 'bg-red-100 text-red-800' : 
                        'bg-blue-100 text-blue-800'
                    }`}>
                        {user?.role}
                    </span>
                </div>
            </div>

            {/* Verification Status Card */}
            {user?.role === 'farmer' && (
                <div className={`mb-6 p-4 rounded-lg border ${
                    user?.farmer_profile?.id_verified || user?.verified_at 
                        ? 'bg-green-50 border-green-200' 
                        : user?.verification_status === 'pending'
                        ? 'bg-yellow-50 border-yellow-200'
                        : user?.verification_status === 'rejected'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-gray-50 border-gray-200'
                }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <span className="text-2xl mr-3">
                                {user?.farmer_profile?.id_verified || user?.verified_at 
                                    ? '✅' 
                                    : user?.verification_status === 'pending'
                                    ? '⏳'
                                    : user?.verification_status === 'rejected'
                                    ? '❌'
                                    : '📝'}
                            </span>
                            <div>
                                <h3 className="font-semibold text-gray-900">Verification Status</h3>
                                <p className={`font-medium ${
                                    user?.farmer_profile?.id_verified || user?.verified_at 
                                        ? 'text-green-600' 
                                        : user?.verification_status === 'pending'
                                        ? 'text-yellow-600'
                                        : user?.verification_status === 'rejected'
                                        ? 'text-red-600'
                                        : 'text-gray-600'
                                }`}>
                                    {user?.farmer_profile?.id_verified || user?.verified_at 
                                        ? '✅ Verified' 
                                        : user?.verification_status === 'pending'
                                        ? '⏳ Pending Verification'
                                        : user?.verification_status === 'rejected'
                                        ? '❌ Rejected'
                                        : 'Not Submitted'}
                                </p>
                                {user?.farmer_profile?.rejection_reason && (
                                    <p className="text-sm text-red-600 mt-1">
                                        Reason: {user.farmer_profile.rejection_reason}
                                    </p>
                                )}
                                {user?.farmer_profile?.verification_notes && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        Notes: {user.farmer_profile.verification_notes}
                                    </p>
                                )}
                            </div>
                        </div>
                        {user?.verification_status === 'pending' && (
                            <span className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-full">
                                Awaiting Review
                            </span>
                        )}
                        {user?.farmer_profile?.id_verified && (
                            <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                                Verified ✓
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Profile Form */}
            {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Input
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                        <Input
                            label="Phone Number"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                        />
                    </div>

                    <Input
                        label="Location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                    />

                    {user?.role === 'farmer' && (
                        <>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Input
                                    label="Farm Name"
                                    name="farm_name"
                                    value={formData.farm_name}
                                    onChange={handleInputChange}
                                />
                                <Input
                                    label="Farm Location"
                                    name="farm_location"
                                    value={formData.farm_location}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Farm Bio
                                </label>
                                <textarea
                                    name="bio"
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    placeholder="Tell buyers about your farm..."
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Profile Picture
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <div className="flex space-x-4 pt-4">
                        <Button type="submit" isLoading={isLoading}>
                            Save Changes
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                setIsEditing(false);
                                setFormData({
                                    name: user?.name || '',
                                    phone: user?.phone || '',
                                    location: user?.location || '',
                                    bio: user?.farmer_profile?.bio || '',
                                    farm_name: user?.farmer_profile?.farm_name || '',
                                    farm_location: user?.farmer_profile?.farm_location || '',
                                    avatar: null,
                                });
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Email</label>
                            <p className="text-gray-900">{user?.email}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Phone</label>
                            <p className="text-gray-900">{user?.phone || 'Not set'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Location</label>
                            <p className="text-gray-900">{user?.location || 'Not set'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Role</label>
                            <p className="text-gray-900 capitalize">{user?.role}</p>
                        </div>
                    </div>

                    {user?.role === 'farmer' && user?.farmer_profile && (
                        <div className="border-t pt-4 mt-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Farm Details</h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Farm Name</label>
                                    <p className="text-gray-900">{user.farmer_profile.farm_name || 'Not set'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Farm Location</label>
                                    <p className="text-gray-900">{user.farmer_profile.farm_location || 'Not set'}</p>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="text-sm font-medium text-gray-500">Bio</label>
                                    <p className="text-gray-900">{user.farmer_profile.bio || 'No bio provided'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};