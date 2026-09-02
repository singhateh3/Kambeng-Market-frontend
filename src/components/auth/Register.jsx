// src/components/auth/Register.jsx
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { resolveReturnTo } from '../../utils/authRedirect';
import { Alert } from '../common/Alert';
import { AppleSignInButton } from './AppleSignInButton';
import { Button } from '../common/Button';
import { GoogleSignInButton } from './GoogleSignInButton';
import { ThemeToggle } from '../ThemeToggle';

const SOCIAL_AUTH_CONFIGURED = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.VITE_APPLE_SERVICES_ID);

export const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        location: '',
        role: 'buyer',
        password: '',
        password_confirmation: '',
        farm_name: '',
        farm_location: '',
        bio: '',
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [generalError, setGeneralError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setGeneralError(null);
        setIsLoading(true);

        try {
            await register(formData);
            navigate(resolveReturnTo(location.state, '/app/dashboard'));
        } catch (error) {
            const backendErrors = error.response?.data?.errors;
            if (backendErrors) {
                // Laravel returns {field: [messages]} — extract the first
                // message per field so it's a plain string the JSX can render.
                const fieldErrors = {};
                Object.keys(backendErrors).forEach((field) => {
                    fieldErrors[field] = backendErrors[field][0];
                });
                setErrors(fieldErrors);
                setGeneralError(error.response?.data?.message || 'Please fix the errors below.');
            } else {
                setGeneralError(error.response?.data?.message || error.message || 'Registration failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = (field) =>
        `w-full px-4 py-3 border rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
            errors[field] ? 'border-red-500 dark:border-red-500' : 'border-gray-200 dark:border-slate-600'
        }`;
    const labelClass = 'block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1';
    const errorClass = 'mt-1 text-sm text-red-600 dark:text-red-400';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>
            <div className="max-w-2xl w-full">
                {/* Logo / Brand */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block">
                        <span className="text-4xl">🌾</span>
                        <h1 className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">Kambeng Market</h1>
                    </Link>
                    <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-slate-100">Create your account</h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">Join Kambeng Market today</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-8">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {generalError && (
                            <Alert type="error" message={generalError} />
                        )}

                        <div className="space-y-4">
                            {/* Name & Email */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className={labelClass}>
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className={inputClass('name')}
                                        required
                                    />
                                    {errors.name && (
                                        <p className={errorClass}>{errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className={inputClass('email')}
                                        required
                                    />
                                    {errors.email && (
                                        <p className={errorClass}>{errors.email}</p>
                                    )}
                                </div>
                            </div>

                            {/* Phone & Location */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className={labelClass}>
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="Enter your phone number"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className={inputClass('phone')}
                                        required
                                    />
                                    {errors.phone && (
                                        <p className={errorClass}>{errors.phone}</p>
                                    )}
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Location *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter your location"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className={inputClass('location')}
                                        required
                                    />
                                    {errors.location && (
                                        <p className={errorClass}>{errors.location}</p>
                                    )}
                                </div>
                            </div>

                            {/* Role Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                    I am a *
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        className={`p-4 border-2 rounded-xl text-center transition-all ${
                                            formData.role === 'buyer'
                                                ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 shadow-sm'
                                                : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-900 dark:text-slate-100'
                                        }`}
                                        onClick={() => setFormData({ ...formData, role: 'buyer', farm_name: '', farm_location: '' })}
                                    >
                                        <span className="block text-3xl mb-1">🛒</span>
                                        <span className="font-semibold">Buyer</span>
                                        <span className="text-xs text-gray-500 dark:text-slate-400 block mt-1">Buy fresh produce</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`p-4 border-2 rounded-xl text-center transition-all ${
                                            formData.role === 'farmer'
                                                ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 shadow-sm'
                                                : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-900 dark:text-slate-100'
                                        }`}
                                        onClick={() => setFormData({ ...formData, role: 'farmer' })}
                                    >
                                        <span className="block text-3xl mb-1">🌾</span>
                                        <span className="font-semibold">Farmer</span>
                                        <span className="text-xs text-gray-500 dark:text-slate-400 block mt-1">Sell your produce</span>
                                    </button>
                                </div>
                                {errors.role && (
                                    <p className={`mt-2 ${errorClass}`}>{errors.role}</p>
                                )}
                            </div>

                            {/* Farmer Fields */}
                            {formData.role === 'farmer' && (
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-100 dark:border-green-800 space-y-4">
                                    <p className="text-sm font-medium text-green-800 dark:text-green-300">🌾 Farm Details</p>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className={labelClass}>
                                                Farm Name *
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Enter your farm name"
                                                value={formData.farm_name}
                                                onChange={(e) => setFormData({ ...formData, farm_name: e.target.value })}
                                                className={inputClass('farm_name')}
                                                required
                                            />
                                            {errors.farm_name && (
                                                <p className={errorClass}>{errors.farm_name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className={labelClass}>
                                                Farm Location *
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Enter farm location"
                                                value={formData.farm_location}
                                                onChange={(e) => setFormData({ ...formData, farm_location: e.target.value })}
                                                className={inputClass('farm_location')}
                                                required
                                            />
                                            {errors.farm_location && (
                                                <p className={errorClass}>{errors.farm_location}</p>
                                            )}
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className={labelClass}>
                                                Farm Bio (Optional)
                                            </label>
                                            <textarea
                                                rows="2"
                                                placeholder="Tell buyers about your farm..."
                                                value={formData.bio}
                                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                className={inputClass('bio')}
                                            />
                                            {errors.bio && (
                                                <p className={errorClass}>{errors.bio}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Password */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className={labelClass}>
                                        Password *
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="Create a password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className={inputClass('password')}
                                        required
                                    />
                                    {errors.password && (
                                        <p className={errorClass}>{errors.password}</p>
                                    )}
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Confirm Password *
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="Confirm your password"
                                        value={formData.password_confirmation}
                                        onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                        className={inputClass('password_confirmation')}
                                        required
                                    />
                                    {errors.password_confirmation && (
                                        <p className={errorClass}>{errors.password_confirmation}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            isLoading={isLoading}
                            disabled={isLoading}
                            className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-lg font-semibold"
                        >
                            Create Account
                        </Button>

                        {SOCIAL_AUTH_CONFIGURED && (
                            <>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
                                    <span className="text-xs text-gray-400 dark:text-slate-500">or</span>
                                    <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
                                </div>
                                <div className="space-y-3">
                                    <GoogleSignInButton />
                                    <AppleSignInButton />
                                </div>
                            </>
                        )}

                        <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-slate-400">
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                    state={location.state}
                                    className="font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
