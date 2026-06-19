import { useState } from 'react';
import { Alert } from '../components/common/Alert';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useAuth } from '../hooks/useAuth';

export const Profile = () => {
    const { user, updateProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        location: user?.location || '',
        bio: user?.farmer_profile?.bio || '',
        farm_name: user?.farmer_profile?.farm_name || '',
        farm_location: user?.farmer_profile?.farm_location || '',
        avatar: null,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsLoading(true);

        try {
            await updateProfile(formData);
            setSuccess('Profile updated successfully!');
            setIsEditing(false);
        } catch (err) {
            setError(err.message || 'Failed to update profile');
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

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                {!isEditing && (
                    <Button onClick={() => setIsEditing(true)}>
                        Edit Profile
                    </Button>
                )}
            </div>

            {success && (
                <Alert type="success" message={success} onClose={() => setSuccess(null)} />
            )}
            {error && (
                <Alert type="error" message={error} onClose={() => setError(null)} />
            )}

            <div className="flex items-center space-x-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-3xl">
                    {user?.avatar_url ? (
                        <img src={user.avatar_url} alt={user.name} className="w-20 h-20 rounded-full object-cover" />
                    ) : (
                        user?.name?.charAt(0) || 'U'
                    )}
                </div>
                <div>
                    <h2 className="text-xl font-semibold">{user?.name}</h2>
                    <p className="text-gray-600">{user?.email}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        user?.role === 'farmer' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                        {user?.role}
                    </span>
                </div>
            </div>

            {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Input
                            label="Full Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <Input
                            label="Phone Number"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>

                    <Input
                        label="Location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />

                    {user?.role === 'farmer' && (
                        <>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Input
                                    label="Farm Name"
                                    value={formData.farm_name}
                                    onChange={(e) => setFormData({ ...formData, farm_name: e.target.value })}
                                />
                                <Input
                                    label="Farm Location"
                                    value={formData.farm_location}
                                    onChange={(e) => setFormData({ ...formData, farm_location: e.target.value })}
                                />
                            </div>
                            <Input
                                label="Farm Bio"
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            />
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
                                    <p className="text-gray-900">{user.farmer_profile.farm_name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Farm Location</label>
                                    <p className="text-gray-900">{user.farmer_profile.farm_location}</p>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="text-sm font-medium text-gray-500">Bio</label>
                                    <p className="text-gray-900">{user.farmer_profile.bio || 'No bio provided'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Verification Status</label>
                                    <p className={`font-medium ${
                                        user.farmer_profile.is_verified ? 'text-green-600' : 'text-yellow-600'
                                    }`}>
                                        {user.farmer_profile.is_verified ? '✓ Verified' : 'Pending Verification'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};