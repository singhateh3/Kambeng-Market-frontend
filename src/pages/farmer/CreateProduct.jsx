// src/pages/farmer/CreateProduct.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../../components/common/Alert';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingOverlay, Spinner } from '../../components/common/Spinner';
import api from '../../services/api';

// Define category options with emojis
const CATEGORIES = {
    'Vegetables': '🥬',
    'Fruits': '🍎',
    'Grains': '🌾',
    'Herbs': '🌿',
    'Spices': '🌶️',
    'Dairy': '🥛',
    'Meat': '🥩',
    'Fish': '🐟',
    'Poultry': '🐔',
    'Eggs': '🥚',
    'Rice': '🍚',
    'Groundnuts': '🥜',
    'Cereals': '🌾',
    'Legumes': '🫘',
    'Roots': '🥔',
    'Tubers': '🍠'
};

export const CreateProduct = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        variety: '',
        quantity: '',
        unit: 'kg',
        price: '',
        harvest_date: '',
        expiry_date: '',
        description: '',
        photos: [],
    });
    const [photoPreviews, setPhotoPreviews] = useState([]);
    const [errors, setErrors] = useState({});

    const units = ['kg', 'bunch', 'pile', 'bag'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 5) {
            setError('Maximum 5 photos allowed');
            setTimeout(() => setError(null), 3000);
            return;
        }

        setFormData(prev => ({ ...prev, photos: files }));
        
        // Create previews
        const previews = files.map(file => URL.createObjectURL(file));
        setPhotoPreviews(previews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setErrors({});

        try {
            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'photos') {
                    formData.photos.forEach(file => {
                        formDataToSend.append('photos[]', file);
                    });
                } else {
                    formDataToSend.append(key, formData[key]);
                }
            });

            const response = await api.post('/products', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setSuccess('Product listed successfully!');
            setTimeout(() => {
                navigate('/products');
            }, 2000);
        } catch (err) {
            console.error('Error creating product:', err);
            if (err.errors) {
                setErrors(err.errors);
            } else {
                setError(err.message || 'Failed to create product');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white shadow rounded-lg p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">List New Product</h1>

                {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}
                {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Loading Overlay */}
                    <LoadingOverlay loading={loading}>
                        <div className="space-y-4">
                            {/* Product Name */}
                            <Input
                                label="Product Name *"
                                name="name"
                                type="text"
                                placeholder="e.g., Fresh Tomatoes"
                                value={formData.name}
                                onChange={handleChange}
                                error={errors.name}
                                required
                            />
                            {/* Product Variety */}

                            <Input
                                label="Product Variety (Optional)"
                                name="variety"
                                type="text"
                                placeholder="e.g., Roma, Cherry, Beefsteak"
                                value={formData.variety}
                                onChange={handleChange}
                                error={errors.variety}
                            />

                            {/* Category Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category *
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    required
                                >
                                    <option value="">Select a category</option>
                                    {Object.entries(CATEGORIES).map(([category, emoji]) => (
                                        <option key={category} value={category}>
                                            {emoji} {category}
                                        </option>
                                    ))}
                                </select>
                                {errors.category && (
                                    <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                                )}
                            </div>

                            {/* Quantity and Unit */}
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Quantity *"
                                    name="quantity"
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    error={errors.quantity}
                                    step="0.01"
                                    min="0.01"
                                    required
                                />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Unit *
                                    </label>
                                    <select
                                        name="unit"
                                        value={formData.unit}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        {units.map(unit => (
                                            <option key={unit} value={unit}>{unit}</option>
                                        ))}
                                    </select>
                                    {errors.unit && (
                                        <p className="mt-1 text-sm text-red-600">{errors.unit}</p>
                                    )}
                                </div>
                            </div>

                            {/* Price */}
                            <Input
                                label="Price (GMD) *"
                                name="price"
                                type="number"
                                placeholder="0.00"
                                value={formData.price}
                                onChange={handleChange}
                                error={errors.price}
                                step="0.01"
                                min="0.01"
                                required
                            />

                            {/* Harvest and Expiry Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Harvest Date *"
                                    name="harvest_date"
                                    type="date"
                                    value={formData.harvest_date}
                                    onChange={handleChange}
                                    error={errors.harvest_date}
                                    required
                                />
                                <Input
                                    label="Expiry Date *"
                                    name="expiry_date"
                                    type="date"
                                    value={formData.expiry_date}
                                    onChange={handleChange}
                                    error={errors.expiry_date}
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description (Optional)
                                </label>
                                <textarea
                                    name="description"
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="Describe your product..."
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                )}
                            </div>

                            {/* Photos */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Photos (Max 5)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                                />
                                {errors.photos && (
                                    <p className="mt-1 text-sm text-red-600">{errors.photos}</p>
                                )}
                                
                                {/* Photo Previews */}
                                {photoPreviews.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {photoPreviews.map((preview, index) => (
                                            <div key={index} className="relative w-20 h-20">
                                                <img
                                                    src={preview}
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-20 h-20 object-cover rounded-lg border"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </LoadingOverlay>

                    {/* Submit Buttons */}
                    <div className="flex space-x-4 pt-4 border-t">
                        <Button
                            type="submit"
                            isLoading={loading}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Spinner size="sm" color="white" />
                                    <span className="ml-2">Listing Product...</span>
                                </>
                            ) : (
                                'List Product'
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => navigate('/products')}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};