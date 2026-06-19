// src/components/auth/ForgotPassword.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Alert } from '../common/Alert';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

export const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await authService.forgotPassword(email);
            setSuccess('Password reset link sent to your email. Please check your inbox.');
            setEmail('');
        } catch (err) {
            setError(err.message || 'Failed to send reset link. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Reset your password
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {success && (
                        <Alert type="success" message={success} />
                    )}
                    {error && (
                        <Alert type="error" message={error} />
                    )}

                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <Button
                        type="submit"
                        fullWidth
                        isLoading={isLoading}
                        disabled={isLoading}
                    >
                        Send Reset Link
                    </Button>

                    <div className="text-center">
                        <Link
                            to="/login"
                            className="text-sm font-medium text-primary-600 hover:text-primary-500"
                        >
                            Back to sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};