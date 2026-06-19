// src/components/auth/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Alert } from '../common/Alert';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

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
            navigate('/dashboard');
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
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Join Kambeng Market today
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {generalError && (
                        <Alert type="error" message={generalError} />
                    )}

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Input
                                label="Full Name"
                                type="text"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                error={errors.name}
                                required
                            />

                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                error={errors.email}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Input
                                label="Phone Number"
                                type="tel"
                                placeholder="Enter your phone number"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                error={errors.phone}
                                required
                            />

                            <Input
                                label="Location"
                                type="text"
                                placeholder="Enter your location"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                error={errors.location}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                I am a
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    className={`p-3 border-2 rounded-lg text-center transition-colors ${
                                        formData.role === 'buyer'
                                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                    onClick={() => setFormData({ ...formData, role: 'buyer', farm_name: '', farm_location: '' })}
                                >
                                    <span className="block text-lg">🛒</span>
                                    <span className="font-medium">Buyer</span>
                                    <span className="text-xs text-gray-500 block">Buy fresh produce</span>
                                </button>
                                <button
                                    type="button"
                                    className={`p-3 border-2 rounded-lg text-center transition-colors ${
                                        formData.role === 'farmer'
                                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                    onClick={() => setFormData({ ...formData, role: 'farmer' })}
                                >
                                    <span className="block text-lg">🌾</span>
                                    <span className="font-medium">Farmer</span>
                                    <span className="text-xs text-gray-500 block">Sell your produce</span>
                                </button>
                            </div>
                            {errors.role && (
                                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                            )}
                        </div>

                        {formData.role === 'farmer' && (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Input
                                    label="Farm Name"
                                    type="text"
                                    placeholder="Enter your farm name"
                                    value={formData.farm_name}
                                    onChange={(e) => setFormData({ ...formData, farm_name: e.target.value })}
                                    error={errors.farm_name}
                                    required
                                />

                                <Input
                                    label="Farm Location"
                                    type="text"
                                    placeholder="Enter farm location"
                                    value={formData.farm_location}
                                    onChange={(e) => setFormData({ ...formData, farm_location: e.target.value })}
                                    error={errors.farm_location}
                                    required
                                />

                                <div className="sm:col-span-2">
                                    <Input
                                        label="Farm Bio (Optional)"
                                        type="text"
                                        placeholder="Tell buyers about your farm"
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        error={errors.bio}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Input
                                label="Password"
                                type="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                error={errors.password}
                                required
                            />

                            <Input
                                label="Confirm Password"
                                type="password"
                                placeholder="Confirm your password"
                                value={formData.password_confirmation}
                                onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                error={errors.password_confirmation}
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        fullWidth
                        isLoading={isLoading}
                        disabled={isLoading}
                    >
                        Create Account
                    </Button>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="font-medium text-primary-600 hover:text-primary-500"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};