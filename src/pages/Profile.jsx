// src/pages/Profile.jsx
import { useEffect, useState } from 'react';
import { Avatar } from '../components/common/Avatar';
import { ProfileSkeleton } from '../components/common/skeletons/ProfileSkeleton';
import { useAuth } from '../hooks/useAuth';

// Client-side check only — a first pass for instant feedback and to avoid
// a wasted upload; the backend (UpdateProfileRequest) is the authoritative
// check and enforces the exact same limits.
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

const Profile = () => {
    const { user, refreshUser, updateProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [avatarError, setAvatarError] = useState(null);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        location: user?.location || '',
        bio: user?.farmer_profile?.bio || '',
        farm_name: user?.farmer_profile?.farm_name || '',
        farm_location: user?.farmer_profile?.farm_location || '',
    });

    useEffect(() => {
        const interval = setInterval(() => {
            if (!isEditing) refreshUser();
        }, 30000);
        return () => clearInterval(interval);
    }, [isEditing, refreshUser]);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user?.name || '',
                phone: user?.phone || '',
                location: user?.location || '',
                bio: user?.farmer_profile?.bio || '',
                farm_name: user?.farmer_profile?.farm_name || '',
                farm_location: user?.farmer_profile?.farm_location || '',
            });
        }
    }, [user]);

    const flash = (type, msg) => {
        if (type === 'success') {
            setSuccess(msg);
            setTimeout(() => setSuccess(null), 5000);
        } else {
            setError(msg);
            setTimeout(() => setError(null), 5000);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refreshUser();
        setIsRefreshing(false);
        flash('success', 'Profile refreshed!');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        setValidationErrors({});

        try {
            // Validate required fields
            if (!formData.name || formData.name.trim() === '') {
                setValidationErrors({ name: 'Name is required' });
                setIsLoading(false);
                return;
            }

            // Prepare the data for submission
            const submitData = new FormData();

            // Add all fields
            submitData.append('name', formData.name.trim());
            submitData.append('phone', formData.phone?.trim() || '');
            submitData.append('location', formData.location?.trim() || '');

            // Add farmer-specific fields
            if (user?.role === 'farmer') {
                submitData.append('bio', formData.bio?.trim() || '');
                submitData.append('farm_name', formData.farm_name?.trim() || '');
                submitData.append('farm_location', formData.farm_location?.trim() || '');
            }

            await updateProfile(submitData);

            flash('success', 'Profile updated successfully!');
            setIsEditing(false);
            await refreshUser();
        } catch (err) {
            console.error('❌ Profile update error:', err);

            // Handle validation errors from backend
            if (err.response?.data?.errors) {
                const backendErrors = err.response.data.errors;
                const formattedErrors = {};
                const errorMessages = [];

                Object.keys(backendErrors).forEach(field => {
                    formattedErrors[field] = backendErrors[field][0];
                    errorMessages.push(`${field}: ${backendErrors[field][0]}`);
                });

                setValidationErrors(formattedErrors);
                flash('error', `Please fix the following errors: ${errorMessages.join('; ')}`);
            } else if (err.response?.data?.message) {
                flash('error', err.response.data.message);
            } else {
                flash('error', err.message || 'Failed to update profile');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Avatar upload/removal is deliberately independent of the "Edit
    // profile" form below — it's a single-purpose action (see the [Avatar]
    // / "Change photo" pattern), not another field to stage and save
    // together with name/phone/location. Reuses the same updateProfile() ->
    // PUT /user/profile path either way.
    const handleAvatarFileSelected = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = ''; // allow re-selecting the same file next time
        if (!file) return;

        setAvatarError(null);
        if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
            setAvatarError('Please upload a JPEG, PNG, or WebP image.');
            return;
        }
        if (file.size > MAX_AVATAR_BYTES) {
            setAvatarError('Image must be smaller than 5MB.');
            return;
        }

        setAvatarLoading(true);
        try {
            const submitData = new FormData();
            submitData.append('avatar', file);
            await updateProfile(submitData);
            flash('success', 'Profile picture updated!');
        } catch (err) {
            setAvatarError(
                err.response?.data?.errors?.avatar?.[0] ||
                err.response?.data?.message ||
                'Could not upload your photo. Please try again.'
            );
        } finally {
            setAvatarLoading(false);
        }
    };

    const handleRemoveAvatar = async () => {
        setAvatarError(null);
        setAvatarLoading(true);
        try {
            await updateProfile({ remove_avatar: true });
            flash('success', 'Profile picture removed.');
        } catch (err) {
            setAvatarError(err.response?.data?.message || 'Could not remove your photo. Please try again.');
        } finally {
            setAvatarLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Clear validation error for this field
        if (validationErrors[name]) {
            setValidationErrors({ ...validationErrors, [name]: null });
        }
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setFormData({
            name: user?.name || '',
            phone: user?.phone || '',
            location: user?.location || '',
            bio: user?.farmer_profile?.bio || '',
            farm_name: user?.farmer_profile?.farm_name || '',
            farm_location: user?.farmer_profile?.farm_location || '',
        });
        setValidationErrors({});
    };

    if (!user) return <ProfileSkeleton />;

    const isFarmer = user?.role === 'farmer';

    const verificationStatus = () => {
        if (user?.farmer_profile?.id_verified || user?.verified_at) {
            return { icon: '✅', label: 'Verified', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800', badge: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300' };
        }
        if (user?.verification_status === 'pending') {
            return { icon: '⏳', label: 'Pending review', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800', badge: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300' };
        }
        if (user?.verification_status === 'rejected') {
            return { icon: '❌', label: 'Rejected', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800', badge: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300' };
        }
        return { icon: '📝', label: 'Not submitted', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700', badge: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' };
    };

    const vs = verificationStatus();

    const inputClass = (field) =>
        `w-full px-3 py-2 border rounded-lg text-sm outline-none transition ${
            validationErrors[field]
                ? 'border-red-300 dark:border-red-700 focus:border-red-400 dark:focus:border-red-600 bg-red-50 dark:bg-red-900/20 text-slate-900 dark:text-slate-100'
                : 'border-slate-200 dark:border-slate-700 focus:border-green-400 dark:focus:border-green-600 focus:bg-white dark:focus:bg-slate-700 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
        }`;

    const labelClass = "block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5";

    const errorClass = "mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1";

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Profile</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your account settings</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer disabled:opacity-50"
                        >
                            <svg className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {isRefreshing ? 'Refreshing...' : 'Refresh'}
                        </button>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition border-none cursor-pointer"
                            >
                                Edit profile
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-6">
                {/* Success Message */}
                {success && (
                    <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 text-sm px-4 py-3 rounded-xl mb-4 animate-in slide-in-from-top duration-300">
                        <span className="flex items-center gap-2">
                            <span>✅</span>
                            <span>{success}</span>
                        </span>
                        <button onClick={() => setSuccess(null)} className="text-green-600 dark:text-green-400 bg-transparent border-none cursor-pointer text-lg leading-none hover:text-green-800 dark:hover:text-green-200">×</button>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="flex items-center justify-between bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-sm px-4 py-3 rounded-xl mb-4 animate-in slide-in-from-top duration-300">
                        <span className="flex items-center gap-2">
                            <span>⚠️</span>
                            <span>{error}</span>
                        </span>
                        <button onClick={() => setError(null)} className="text-red-600 dark:text-red-400 bg-transparent border-none cursor-pointer text-lg leading-none hover:text-red-800 dark:hover:text-red-200">×</button>
                    </div>
                )}

                {/* Validation Errors Summary */}
                {Object.keys(validationErrors).length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4 animate-in slide-in-from-top duration-300">
                        <div className="flex items-start gap-2">
                            <span className="text-red-600 dark:text-red-400 mt-0.5">⚠️</span>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">Please fix the following errors:</p>
                                <ul className="text-sm text-red-700 dark:text-red-300 space-y-0.5 list-disc list-inside">
                                    {Object.entries(validationErrors).map(([field, message]) => (
                                        message && <li key={field} className="capitalize">{field}: {message}</li>
                                    ))}
                                </ul>
                            </div>
                            <button
                                onClick={() => setValidationErrors({})}
                                className="text-red-600 dark:text-red-400 bg-transparent border-none cursor-pointer text-lg leading-none hover:text-red-800 dark:hover:text-red-200"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Avatar card */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center">
                            <div className="relative w-fit mx-auto mb-4">
                                <Avatar src={user?.avatar} name={user?.name} size="xl" />
                                {avatarLoading && (
                                    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                                        <svg className="w-6 h-6 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-0.5">{user?.name}</h2>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">{user?.email}</p>
                            <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                                user?.role === 'farmer' ? 'bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' :
                                user?.role === 'admin'  ? 'bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' :
                                'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                            }`}>
                                {user?.role}
                            </span>

                            <div className="mt-4 flex items-center justify-center gap-3">
                                <label className={`text-xs font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 ${avatarLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                                    {user?.avatar ? 'Change photo' : 'Add photo'}
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleAvatarFileSelected}
                                        disabled={avatarLoading}
                                        className="hidden"
                                    />
                                </label>
                                {user?.avatar && (
                                    <>
                                        <span className="text-slate-300 dark:text-slate-600">·</span>
                                        <button
                                            type="button"
                                            onClick={handleRemoveAvatar}
                                            disabled={avatarLoading}
                                            className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-transparent border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Remove
                                        </button>
                                    </>
                                )}
                            </div>
                            {avatarError && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{avatarError}</p>}
                            <p className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500">JPEG, PNG, or WebP. Max 5MB.</p>
                        </div>

                        {/* Verification card — farmers only */}
                        {isFarmer && (
                            <div className={`bg-white dark:bg-slate-900 border rounded-xl p-4 ${vs.bg}`}>
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">{vs.icon}</span>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-0.5">Verification</p>
                                        <p className={`text-xs font-semibold ${vs.color}`}>{vs.label}</p>
                                        {user?.farmer_profile?.rejection_reason && (
                                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">Reason: {user.farmer_profile.rejection_reason}</p>
                                        )}
                                        {user?.farmer_profile?.verification_notes && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{user.farmer_profile.verification_notes}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Main content */}
                    <div className="lg:col-span-2 space-y-4">
                        {isEditing ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Personal info */}
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-5">Personal information</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>
                                                Full name <span className="text-red-500 dark:text-red-400">*</span>
                                            </label>
                                            <input
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                required
                                                className={inputClass('name')}
                                                placeholder="Enter your full name"
                                            />
                                            {validationErrors.name && (
                                                <p className={errorClass}>
                                                    <span>⚠️</span>
                                                    <span>{validationErrors.name}</span>
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className={labelClass}>Phone number</label>
                                            <input
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className={inputClass('phone')}
                                                placeholder="e.g., +220 700 0000"
                                            />
                                            {validationErrors.phone && (
                                                <p className={errorClass}>
                                                    <span>⚠️</span>
                                                    <span>{validationErrors.phone}</span>
                                                </p>
                                            )}
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className={labelClass}>Location</label>
                                            <input
                                                name="location"
                                                value={formData.location}
                                                onChange={handleInputChange}
                                                className={inputClass('location')}
                                                placeholder="e.g., Serrekunda, Gambia"
                                            />
                                            {validationErrors.location && (
                                                <p className={errorClass}>
                                                    <span>⚠️</span>
                                                    <span>{validationErrors.location}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Farm details — farmers only */}
                                {isFarmer && (
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-5">Farm details</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className={labelClass}>Farm name</label>
                                                <input
                                                    name="farm_name"
                                                    value={formData.farm_name}
                                                    onChange={handleInputChange}
                                                    className={inputClass('farm_name')}
                                                    placeholder="e.g., Green Valley Farm"
                                                />
                                                {validationErrors.farm_name && (
                                                    <p className={errorClass}>
                                                        <span>⚠️</span>
                                                        <span>{validationErrors.farm_name}</span>
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className={labelClass}>Farm location</label>
                                                <input
                                                    name="farm_location"
                                                    value={formData.farm_location}
                                                    onChange={handleInputChange}
                                                    className={inputClass('farm_location')}
                                                    placeholder="e.g., Brikama, Gambia"
                                                />
                                                {validationErrors.farm_location && (
                                                    <p className={errorClass}>
                                                        <span>⚠️</span>
                                                        <span>{validationErrors.farm_location}</span>
                                                    </p>
                                                )}
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className={labelClass}>Bio</label>
                                                <textarea
                                                    name="bio"
                                                    rows={3}
                                                    value={formData.bio}
                                                    onChange={handleInputChange}
                                                    placeholder="Tell buyers about your farm..."
                                                    className={`${inputClass('bio')} resize-none`}
                                                />
                                                {validationErrors.bio && (
                                                    <p className={errorClass}>
                                                        <span>⚠️</span>
                                                        <span>{validationErrors.bio}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50 transition border-none cursor-pointer flex items-center gap-2"
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                </svg>
                                                Saving...
                                            </>
                                        ) : 'Save changes'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={cancelEdit}
                                        className="text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition border-none cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <>
                                {/* Personal info view */}
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-5">Personal information</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        {[
                                            { label: 'Email',    value: user?.email },
                                            { label: 'Phone',    value: user?.phone    || 'Not set' },
                                            { label: 'Location', value: user?.location || 'Not set' },
                                            { label: 'Role',     value: user?.role },
                                        ].map((f, i) => (
                                            <div key={i}>
                                                <p className={labelClass}>{f.label}</p>
                                                <p className="text-sm text-slate-900 dark:text-slate-100 font-medium capitalize">{f.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Farm details view — farmers only */}
                                {isFarmer && user?.farmer_profile && (
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-5">Farm details</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div>
                                                <p className={labelClass}>Farm name</p>
                                                <p className="text-sm text-slate-900 dark:text-slate-100 font-medium">{user.farmer_profile.farm_name || 'Not set'}</p>
                                            </div>
                                            <div>
                                                <p className={labelClass}>Farm location</p>
                                                <p className="text-sm text-slate-900 dark:text-slate-100 font-medium">{user.farmer_profile.farm_location || 'Not set'}</p>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <p className={labelClass}>Bio</p>
                                                <p className="text-sm text-slate-900 dark:text-slate-100 font-medium leading-relaxed">{user.farmer_profile.bio || 'No bio provided'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
