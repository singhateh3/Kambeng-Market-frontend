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
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [generalError, setGeneralError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFieldErrors({});
        setGeneralError(null);
        setIsLoading(true);

        try {
            const response = await login(formData);
            console.log('Login successful:', response);
            
            // Navigate based on role — AuthContext.login() returns the raw
            // backend body, {message, data: {user, token, token_type}}.
            if (response?.data?.user?.role === 'admin') {
                navigate('/app/admin/dashboard');
            } else {
                navigate('/app/dashboard');
            }
        } catch (error) {
            console.error('Login error:', error);
            
            // Check if error has response data
            if (error.response) {
                const status = error.response.status;
                const data = error.response.data;
                
                console.log('Error status:', status);
                console.log('Error data:', data);
                
                // Handle validation errors (422)
                if (status === 422) {
                    if (data.errors) {
                        // Field-specific errors from Laravel
                        const errors = {};
                        Object.keys(data.errors).forEach(key => {
                            errors[key] = data.errors[key][0];
                        });
                        setFieldErrors(errors);
                        setGeneralError('Please fix the errors below.');
                    } else if (data.message) {
                        setGeneralError(data.message);
                    } else {
                        setGeneralError('Validation failed. Please check your inputs.');
                    }
                } 
                // Handle authentication errors (401)
                else if (status === 401) {
                    setGeneralError(data.message || 'Invalid email or password.');
                }
                // Handle forbidden errors (403)
                else if (status === 403) {
                    setGeneralError(data.message || 'You do not have permission to access this account.');
                }
                // Handle not found errors (404)
                else if (status === 404) {
                    setGeneralError('User not found. Please check your email address.');
                }
                // Handle server errors (500)
                else if (status === 500) {
                    setGeneralError('Server error. Please try again later.');
                }
                // Handle other errors
                else {
                    setGeneralError(data.message || 'Login failed. Please try again.');
                }
            } 
            // Handle network errors
            else if (error.request) {
                setGeneralError('Network error. Please check your internet connection.');
            } 
            // Handle other errors
            else {
                setGeneralError(error.message || 'Login failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
        
        // Clear field-specific error when user types
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }
        if (generalError) {
            setGeneralError(null);
        }
    };

    const toggleShowPassword = () => {
        setShowPassword(prev => !prev);
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
                        {/* General Error */}
                        {generalError && (
                            <Alert 
                                type="error" 
                                message={generalError} 
                                onClose={() => setGeneralError(null)}
                            />
                        )}

                        <div className="space-y-4">
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                                        fieldErrors.email ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                    required
                                />
                                {fieldErrors.email && (
                                    <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
                                )}
                            </div>

                            {/* Password with Show/Hide */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                                            fieldErrors.password ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={toggleShowPassword}
                                        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition p-2"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {fieldErrors.password && (
                                    <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
                                )}
                            </div>

                            {/* Remember & Forgot Password */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember"
                                        type="checkbox"
                                        name="remember"
                                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                        checked={formData.remember}
                                        onChange={handleChange}
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