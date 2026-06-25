// src/components/auth/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Alert } from '../common/Alert';
import { Button } from '../common/Button';

export const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        remember: false,
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
            await login(formData);
            navigate('/home');
        } catch (error) {
            if (error.errors) {
                setErrors(error.errors);
            } else {
                setGeneralError(error.message || 'Login failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                {/* Logo / Brand */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block">
                        <span className="text-4xl">🌾</span>
                        <h1 className="text-2xl font-bold text-green-600 mt-2">Kambeng Market</h1>
                    </Link>
                    <h2 className="mt-6 text-2xl font-bold text-gray-900">Welcome back</h2>
                    <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {generalError && (
                            <Alert type="error" message={generalError} />
                        )}

                        <div className="space-y-4">
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
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

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    placeholder="Enter your password"
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

                            {/* Remember & Forgot Password */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember"
                                        type="checkbox"
                                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                        checked={formData.remember}
                                        onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                                    />
                                    <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                                        Remember me
                                    </label>
                                </div>

                                <Link
                                    to="/forgot-password"
                                    className="text-sm font-medium text-green-600 hover:text-green-700 transition"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            isLoading={isLoading}
                            disabled={isLoading}
                            className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-lg font-semibold"
                        >
                            Sign in
                        </Button>

                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{' '}
                                <Link
                                    to="/register"
                                    className="font-medium text-green-600 hover:text-green-700 transition"
                                >
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Decorative Footer */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-400">
                        By continuing, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>
            </div>
        </div>
    );
};