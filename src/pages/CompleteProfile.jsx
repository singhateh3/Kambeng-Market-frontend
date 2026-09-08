// src/pages/CompleteProfile.jsx
//
// Google/Apple sign-in only ever gives us name + email (see
// SocialAuthService, backend) — phone and location, which the rest of the
// app treats as normal profile fields, are left null on that account until
// filled in here, and the account always starts as role='buyer' (Google has
// no way to tell us someone is actually a farmer). GoogleSignInButton is the
// only place that routes a freshly-authenticated user to this page (see
// isProfileComplete() there); this page re-checks the same condition itself
// so a direct visit, a refresh, or a user who already completed it never
// gets stuck here.
//
// The role toggle below mirrors Register.jsx's own buyer/farmer choice and
// its farmer fields (farm name/location required, bio optional) — the only
// difference is this account already exists, so choosing "Farmer" here is a
// one-time, buyer -> farmer only upgrade rather than a fresh signup choice
// (see AuthController::updateProfile's guard, backend).
//
// Submission reuses the exact same PUT /user/profile endpoint (via
// AuthContext.updateProfile -> authService.updateProfile) that the full
// Profile page uses — no new backend surface, and the backend's existing
// UpdateProfileRequest validation/sanitization is the only thing that ever
// actually authorizes and persists these values, scoped to $request->user()
// so no one can submit another user's data through this form.
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { resolveReturnTo } from '../utils/authRedirect';
import { isProfileComplete } from '../utils/profileCompletion';
import { Alert } from '../components/common/Alert';
import { Button } from '../components/common/Button';
import { ThemeToggle } from '../components/ThemeToggle';

const initialFormData = (user) => ({
    phone: user?.phone || '',
    location: user?.location || '',
    role: user?.role === 'farmer' ? 'farmer' : 'buyer',
    farm_name: user?.farmer_profile?.farm_name || '',
    farm_location: user?.farmer_profile?.farm_location || '',
    bio: user?.farmer_profile?.bio || '',
});

const CompleteProfile = () => {
    const { user, updateProfile } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState(() => initialFormData(user));
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const fallback = user?.role === 'admin' ? '/app/admin/dashboard' : '/app/dashboard';

    // Pre-fill whatever's already on the account (e.g. only one of
    // phone/location is actually missing) as soon as `user` is available.
    useEffect(() => {
        setFormData(initialFormData(user));
    }, [user]);

    // Already complete — direct navigation, a refresh after finishing, or a
    // password user who somehow lands here. Nothing to collect; send them
    // straight to wherever they were headed instead of showing the form.
    useEffect(() => {
        if (isProfileComplete(user)) {
            navigate(resolveReturnTo(location.state, fallback), { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((f) => ({ ...f, [name]: value }));
        if (errors[name]) setErrors((e2) => ({ ...e2, [name]: '' }));
    };

    const selectRole = (role) => {
        setFormData((f) => ({ ...f, role }));
        setErrors((e) => ({ ...e, farm_name: '', farm_location: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGeneralError(null);

        const isFarmer = formData.role === 'farmer';
        const fieldErrors = {};
        if (!formData.phone.trim()) fieldErrors.phone = 'Phone number is required';
        if (!formData.location.trim()) fieldErrors.location = 'Location is required';
        if (isFarmer && !formData.farm_name.trim()) fieldErrors.farm_name = 'Farm name is required';
        if (isFarmer && !formData.farm_location.trim()) fieldErrors.farm_location = 'Farm location is required';
        if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
            return;
        }
        setErrors({});
        setIsLoading(true);

        try {
            const payload = {
                phone: formData.phone.trim(),
                location: formData.location.trim(),
                role: formData.role,
            };
            if (isFarmer) {
                payload.farm_name = formData.farm_name.trim();
                payload.farm_location = formData.farm_location.trim();
                if (formData.bio.trim()) payload.bio = formData.bio.trim();
            }

            await updateProfile(payload);
            navigate(resolveReturnTo(location.state, fallback), { replace: true });
        } catch (error) {
            const backendErrors = error.response?.data?.errors;
            if (backendErrors) {
                const fieldErrs = {};
                Object.keys(backendErrors).forEach((field) => {
                    fieldErrs[field] = backendErrors[field][0];
                });
                setErrors(fieldErrs);
                setGeneralError(error.response?.data?.message || 'Please fix the errors below.');
            } else {
                setGeneralError(error.response?.data?.message || error.message || 'Could not save your details. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = (field) =>
        `w-full px-4 py-3 border rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
            errors[field] ? 'border-red-500 dark:border-red-500' : 'border-gray-200 dark:border-slate-600'
        }`;
    const labelClass = 'block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1';
    const errorClass = 'mt-1 text-sm text-red-600 dark:text-red-400';

    // isProfileComplete(user) is already true on this render when the
    // effect above is about to navigate away — skip flashing the form.
    if (isProfileComplete(user)) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>
            <div className="max-w-2xl w-full">
                <div className="text-center mb-8">
                    <span className="text-4xl">🌾</span>
                    <h1 className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">Kambeng Market</h1>
                    <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-slate-100">Just one more step</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                        {user?.name ? `Welcome, ${user.name}! ` : ''}Tell us a bit more so we can set up your account.
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-8">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {generalError && <Alert type="error" message={generalError} onClose={() => setGeneralError(null)} />}

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className={labelClass}>Phone Number *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="Enter your phone number"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className={inputClass('phone')}
                                    />
                                    {errors.phone && <p className={errorClass}>{errors.phone}</p>}
                                </div>

                                <div>
                                    <label className={labelClass}>Location *</label>
                                    <input
                                        type="text"
                                        name="location"
                                        placeholder="Enter your location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        className={inputClass('location')}
                                    />
                                    {errors.location && <p className={errorClass}>{errors.location}</p>}
                                </div>
                            </div>

                            {/* Role — Google/Apple always creates a buyer account (see
                                SocialAuthService, backend); choosing "Farmer" here is a
                                one-time buyer -> farmer upgrade, same fields Register.jsx
                                collects for a brand-new farmer signup. */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">I am a *</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => selectRole('buyer')}
                                        className={`p-4 border-2 rounded-xl text-center transition-all ${
                                            formData.role === 'buyer'
                                                ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 shadow-sm'
                                                : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-900 dark:text-slate-100'
                                        }`}
                                    >
                                        <span className="block text-3xl mb-1">🛒</span>
                                        <span className="font-semibold">Buyer</span>
                                        <span className="text-xs text-gray-500 dark:text-slate-400 block mt-1">Buy fresh produce</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => selectRole('farmer')}
                                        className={`p-4 border-2 rounded-xl text-center transition-all ${
                                            formData.role === 'farmer'
                                                ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 shadow-sm'
                                                : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-900 dark:text-slate-100'
                                        }`}
                                    >
                                        <span className="block text-3xl mb-1">🌾</span>
                                        <span className="font-semibold">Farmer</span>
                                        <span className="text-xs text-gray-500 dark:text-slate-400 block mt-1">Sell your produce</span>
                                    </button>
                                </div>
                            </div>

                            {formData.role === 'farmer' && (
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-100 dark:border-green-800 space-y-4">
                                    <p className="text-sm font-medium text-green-800 dark:text-green-300">🌾 Farm Details</p>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className={labelClass}>Farm Name *</label>
                                            <input
                                                type="text"
                                                name="farm_name"
                                                placeholder="Enter your farm name"
                                                value={formData.farm_name}
                                                onChange={handleChange}
                                                className={inputClass('farm_name')}
                                            />
                                            {errors.farm_name && <p className={errorClass}>{errors.farm_name}</p>}
                                        </div>

                                        <div>
                                            <label className={labelClass}>Farm Location *</label>
                                            <input
                                                type="text"
                                                name="farm_location"
                                                placeholder="Enter farm location"
                                                value={formData.farm_location}
                                                onChange={handleChange}
                                                className={inputClass('farm_location')}
                                            />
                                            {errors.farm_location && <p className={errorClass}>{errors.farm_location}</p>}
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className={labelClass}>Farm Bio (Optional)</label>
                                            <textarea
                                                name="bio"
                                                rows="2"
                                                placeholder="Tell buyers about your farm..."
                                                value={formData.bio}
                                                onChange={handleChange}
                                                className={inputClass('bio')}
                                            />
                                            {errors.bio && <p className={errorClass}>{errors.bio}</p>}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            isLoading={isLoading}
                            disabled={isLoading}
                            className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-lg font-semibold"
                        >
                            Continue
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CompleteProfile;
