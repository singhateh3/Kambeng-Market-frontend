// src/components/auth/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Alert } from '../common/Alert';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

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
            navigate('/dashboard');
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Welcome to Kambeng Market
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Sign in to your account
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {generalError && (
                        <Alert type="error" message={generalError} />
                    )}

                    <div className="space-y-4">
                        <Input
                            label="Email address"
                            type="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            error={errors.email}
                            required
                        />

                        <Input
                            label="Password"
                            type="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            error={errors.password}
                            required
                        />

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                    checked={formData.remember}
                                    onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                                />
                                <label htmlFor="remember" className="ml-2 block text-sm text-gray-900">
                                    Remember me
                                </label>
                            </div>

                            <Link
                                to="/forgot-password"
                                className="text-sm font-medium text-primary-600 hover:text-primary-500"
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
                    >
                        Sign in
                    </Button>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                className="font-medium text-primary-600 hover:text-primary-500"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};