// src/components/auth/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Alert } from '../common/Alert';
import { Button } from '../common/Button';

export const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
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
            navigate('/home');
        } catch (error) {
            if (error.errors) {
                setErrors(error.errors);
            } else {
                setGeneralError(error.message || 'Registration failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full">
                {/* Logo / Brand */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block">
                        <span className="text-4xl">🌾</span>
                        <h1 className="text-2xl font-bold text-green-600 mt-2">Kambeng Market</h1>
                    </Link>
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">Create your account</h2>
                    <p className="mt-2 text-sm text-gray-500">Join Kambeng Market today</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {generalError && (
                            <Alert type="error" message={generalError} />
                        )}

                        <div className="space-y-4">
                            {/* Name & Email */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                                            errors.name ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                        required
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                                            errors.email ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                        required
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>
                            </div>

                            {/* Phone & Location */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="Enter your phone number"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                                            errors.phone ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                        required
                                    />
                                    {errors.phone && (
                                        <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Location *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter your location"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                                            errors.location ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                        required
                                    />
                                    {errors.location && (
                                        <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                                    )}
                                </div>
                            </div>

                            {/* Role Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    I am a *
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        className={`p-4 border-2 rounded-xl text-center transition-all ${
                                            formData.role === 'buyer'
                                                ? 'border-green-500 bg-green-50 text-green-700 shadow-sm'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                        onClick={() => setFormData({ ...formData, role: 'buyer', farm_name: '', farm_location: '' })}
                                    >
                                        <span className="block text-3xl mb-1">🛒</span>
                                        <span className="font-semibold">Buyer</span>
                                        <span className="text-xs text-gray-500 block mt-1">Buy fresh produce</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`p-4 border-2 rounded-xl text-center transition-all ${
                                            formData.role === 'farmer'
                                                ? 'border-green-500 bg-green-50 text-green-700 shadow-sm'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                        onClick={() => setFormData({ ...formData, role: 'farmer' })}
                                    >
                                        <span className="block text-3xl mb-1">🌾</span>
                                        <span className="font-semibold">Farmer</span>
                                        <span className="text-xs text-gray-500 block mt-1">Sell your produce</span>
                                    </button>
                                </div>
                                {errors.role && (
                                    <p className="mt-2 text-sm text-red-600">{errors.role}</p>
                                )}
                            </div>

                            {/* Farmer Fields */}
                            {formData.role === 'farmer' && (
                                <div className="bg-green-50 rounded-xl p-4 border border-green-100 space-y-4">
                                    <p className="text-sm font-medium text-green-800">🌾 Farm Details</p>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Farm Name *
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Enter your farm name"
                                                value={formData.farm_name}
                                                onChange={(e) => setFormData({ ...formData, farm_name: e.target.value })}
                                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                                                    errors.farm_name ? 'border-red-500' : 'border-gray-200'
                                                }`}
                                                required
                                            />
                                            {errors.farm_name && (
                                                <p className="mt-1 text-sm text-red-600">{errors.farm_name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Farm Location *
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Enter farm location"
                                                value={formData.farm_location}
                                                onChange={(e) => setFormData({ ...formData, farm_location: e.target.value })}
                                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                                                    errors.farm_location ? 'border-red-500' : 'border-gray-200'
                                                }`}
                                                required
                                            />
                                            {errors.farm_location && (
                                                <p className="mt-1 text-sm text-red-600">{errors.farm_location}</p>
                                            )}
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Farm Bio (Optional)
                                            </label>
                                            <textarea
                                                rows="2"
                                                placeholder="Tell buyers about your farm..."
                                                value={formData.bio}
                                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                                                    errors.bio ? 'border-red-500' : 'border-gray-200'
                                                }`}
                                            />
                                            {errors.bio && (
                                                <p className="mt-1 text-sm text-red-600">{errors.bio}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Password */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Password *
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="Create a password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                                            errors.password ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                        required
                                    />
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm Password *
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="Confirm your password"
                                        value={formData.password_confirmation}
                                        onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                                            errors.password_confirmation ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                        required
                                    />
                                    {errors.password_confirmation && (
                                        <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
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

                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                    className="font-medium text-green-600 hover:text-green-700 transition"
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