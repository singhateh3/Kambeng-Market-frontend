// src/pages/CompleteProfile.jsx
//
// Google/Apple sign-in only ever gives us name + email (see
// SocialAuthService, backend) — phone and location, which the rest of the
// app treats as normal profile fields, are left null on that account until
// the buyer fills them in here. GoogleSignInButton is the only place that
// routes a freshly-authenticated user to this page (see isProfileComplete()
// there); this page re-checks the same condition itself so a direct visit,
// a refresh, or a user who already completed it never gets stuck here.
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

const CompleteProfile = () => {
    const { user, updateProfile } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({ phone: '', location: '' });
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const fallback = user?.role === 'admin' ? '/app/admin/dashboard' : '/app/dashboard';

    // Pre-fill whatever's already on the account (e.g. only one of the two
    // fields is actually missing) as soon as `user` is available.
    useEffect(() => {
        setFormData({ phone: user?.phone || '', location: user?.location || '' });
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGeneralError(null);

        const fieldErrors = {};
        if (!formData.phone.trim()) fieldErrors.phone = 'Phone number is required';
        if (!formData.location.trim()) fieldErrors.location = 'Location is required';
        if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
            return;
        }
        setErrors({});
        setIsLoading(true);

        try {
            await updateProfile({ phone: formData.phone.trim(), location: formData.location.trim() });
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
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <span className="text-4xl">🌾</span>
                    <h1 className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">Kambeng Market</h1>
                    <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-slate-100">Just one more step</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                        {user?.name ? `Welcome, ${user.name}! ` : ''}Add a phone number and location so farmers can reach you and deliver your orders.
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-8">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {generalError && <Alert type="error" message={generalError} onClose={() => setGeneralError(null)} />}

                        <div className="space-y-4">
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
