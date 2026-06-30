// src/pages/farmer/CreateProduct.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CATEGORIES = {
    'Vegetables': '🥬', 'Fruits': '🍎', 'Grains': '🌾',
    'Herbs': '🌿', 'Spices': '🌶️', 'Dairy': '🥛',
    'Meat': '🥩', 'Fish': '🐟', 'Poultry': '🐔',
    'Eggs': '🥚', 'Rice': '🍚', 'Groundnuts': '🥜',
    'Cereals': '🌾', 'Legumes': '🫘', 'Roots': '🥔', 'Tubers': '🍠',
};

const UNITS = ['kg', 'bunch', 'pile', 'bag'];

const CreateProduct = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [photoPreviews, setPhotoPreviews] = useState([]);
    const [formData, setFormData] = useState({
        name: '', category: '', variety: '', quantity: '',
        unit: 'kg', price: '', harvest_date: '', expiry_date: '',
        description: '', photos: [],
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(f => ({ ...f, [name]: value }));
        if (fieldErrors[name]) setFieldErrors(f => ({ ...f, [name]: '' }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 5) {
            setError('Maximum 5 photos allowed');
            setTimeout(() => setError(null), 3000);
            return;
        }
        setFormData(f => ({ ...f, photos: files }));
        setPhotoPreviews(files.map(file => URL.createObjectURL(file)));
    };

    const removePhoto = (index) => {
        const newPreviews = photoPreviews.filter((_, i) => i !== index);
        const newPhotos = formData.photos.filter((_, i) => i !== index);
        setPhotoPreviews(newPreviews);
        setFormData(f => ({ ...f, photos: newPhotos }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setFieldErrors({});

        try {
            const fd = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'photos') {
                    formData.photos.forEach(file => fd.append('photos[]', file));
                } else {
                    fd.append(key, formData[key]);
                }
            });

            await api.post('/products', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setSuccess('Product listed successfully!');
            setTimeout(() => navigate('/app/products'), 1500);
        } catch (err) {
            console.error('Error creating product:', err);
            if (err.errors) setFieldErrors(err.errors);
            else setError(err.message || 'Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = (field) =>
        `w-full px-3 py-2.5 border rounded-lg text-sm outline-none transition bg-slate-50 text-slate-900 ${
            fieldErrors[field]
                ? 'border-red-300 focus:border-red-400 bg-red-50'
                : 'border-slate-200 focus:border-green-400 focus:bg-white'
        }`;

    const labelClass = "block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5";

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">List a product</h1>
                        <p className="text-sm text-slate-500 mt-0.5">Fill in the details to list your produce</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/app/products')}
                        className="text-sm text-slate-500 hover:text-slate-700 border border-slate-200 bg-white px-4 py-2 rounded-lg font-medium transition cursor-pointer"
                    >
                        ← Back
                    </button>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-6 py-8">
                {/* Alerts */}
                {success && (
                    <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-xl mb-6">
                        <span className="text-lg">✅</span>
                        <span>{success}</span>
                    </div>
                )}
                {error && (
                    <div className="flex items-center justify-between bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 rounded-xl mb-6">
                        <span>⚠️ {error}</span>
                        <button onClick={() => setError(null)} className="text-red-600 bg-transparent border-none cursor-pointer text-lg leading-none">×</button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Basic info */}
                    <div className="bg-white border border-slate-200 rounded-xl p-6">
                        <h2 className="text-sm font-bold text-slate-900 mb-5">Product details</h2>
                        <div className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className={labelClass}>Product name <span className="text-red-500">*</span></label>
                                <input
                                    name="name" type="text" required
                                    placeholder="e.g. Fresh Tomatoes"
                                    value={formData.name} onChange={handleChange}
                                    className={inputClass('name')}
                                />
                                {fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
                            </div>

                            {/* Variety */}
                            <div>
                                <label className={labelClass}>Variety <span className="text-slate-400 normal-case font-normal">(optional)</span></label>
                                <input
                                    name="variety" type="text"
                                    placeholder="e.g. Roma, Cherry"
                                    value={formData.variety} onChange={handleChange}
                                    className={inputClass('variety')}
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className={labelClass}>Category <span className="text-red-500">*</span></label>
                                <select
                                    name="category" required
                                    value={formData.category} onChange={handleChange}
                                    className={inputClass('category') + ' cursor-pointer'}
                                >
                                    <option value="">Select a category</option>
                                    {Object.entries(CATEGORIES).map(([cat, emoji]) => (
                                        <option key={cat} value={cat}>{emoji} {cat}</option>
                                    ))}
                                </select>
                                {fieldErrors.category && <p className="mt-1 text-xs text-red-600">{fieldErrors.category}</p>}
                            </div>

                            {/* Description */}
                            <div>
                                <label className={labelClass}>Description <span className="text-slate-400 normal-case font-normal">(optional)</span></label>
                                <textarea
                                    name="description" rows={3}
                                    placeholder="Describe your product — freshness, growing method, etc."
                                    value={formData.description} onChange={handleChange}
                                    className={`${inputClass('description')} resize-none`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Quantity & Pricing */}
                    <div className="bg-white border border-slate-200 rounded-xl p-6">
                        <h2 className="text-sm font-bold text-slate-900 mb-5">Quantity & pricing</h2>
                        <div className="space-y-4">
                            {/* Quantity + Unit */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Quantity <span className="text-red-500">*</span></label>
                                    <input
                                        name="quantity" type="number" required
                                        placeholder="0.00" step="0.01" min="0.01"
                                        value={formData.quantity} onChange={handleChange}
                                        className={inputClass('quantity')}
                                    />
                                    {fieldErrors.quantity && <p className="mt-1 text-xs text-red-600">{fieldErrors.quantity}</p>}
                                </div>
                                <div>
                                    <label className={labelClass}>Unit <span className="text-red-500">*</span></label>
                                    <select
                                        name="unit"
                                        value={formData.unit} onChange={handleChange}
                                        className={inputClass('unit') + ' cursor-pointer'}
                                    >
                                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Price */}
                            <div>
                                <label className={labelClass}>Price (GMD) <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">GMD</span>
                                    <input
                                        name="price" type="number" required
                                        placeholder="0.00" step="0.01" min="0.01"
                                        value={formData.price} onChange={handleChange}
                                        className={`${inputClass('price')} pl-12`}
                                    />
                                </div>
                                {fieldErrors.price && <p className="mt-1 text-xs text-red-600">{fieldErrors.price}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="bg-white border border-slate-200 rounded-xl p-6">
                        <h2 className="text-sm font-bold text-slate-900 mb-5">Dates</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Harvest date <span className="text-red-500">*</span></label>
                                <input
                                    name="harvest_date" type="date" required
                                    value={formData.harvest_date} onChange={handleChange}
                                    className={inputClass('harvest_date')}
                                />
                                {fieldErrors.harvest_date && <p className="mt-1 text-xs text-red-600">{fieldErrors.harvest_date}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>Expiry date <span className="text-red-500">*</span></label>
                                <input
                                    name="expiry_date" type="date" required
                                    value={formData.expiry_date} onChange={handleChange}
                                    className={inputClass('expiry_date')}
                                />
                                {fieldErrors.expiry_date && <p className="mt-1 text-xs text-red-600">{fieldErrors.expiry_date}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Photos */}
                    <div className="bg-white border border-slate-200 rounded-xl p-6">
                        <h2 className="text-sm font-bold text-slate-900 mb-1">Photos <span className="text-slate-400 font-normal">(up to 5)</span></h2>
                        <p className="text-xs text-slate-400 mb-4">Good photos help buyers trust your listing</p>

                        {/* Upload zone */}
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl py-8 px-4 cursor-pointer hover:border-green-400 hover:bg-green-50 transition group">
                            <span className="text-3xl mb-2">📷</span>
                            <span className="text-sm font-semibold text-slate-600 group-hover:text-green-700">Click to upload photos</span>
                            <span className="text-xs text-slate-400 mt-1">JPG, PNG up to 5MB each</span>
                            <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                        </label>

                        {/* Previews */}
                        {photoPreviews.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-3">
                                {photoPreviews.map((preview, i) => (
                                    <div key={i} className="relative group">
                                        <img src={preview} alt={`Preview ${i + 1}`} className="w-20 h-20 object-cover rounded-xl border border-slate-200" />
                                        <button
                                            type="button"
                                            onClick={() => removePhoto(i)}
                                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition border-none cursor-pointer leading-none"
                                        >×</button>
                                    </div>
                                ))}
                                {photoPreviews.length < 5 && (
                                    <label className="w-20 h-20 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-green-400 hover:bg-green-50 transition text-slate-400 hover:text-green-600">
                                        <span className="text-2xl">+</span>
                                        <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                                    </label>
                                )}
                            </div>
                        )}
                        {fieldErrors.photos && <p className="mt-2 text-xs text-red-600">{fieldErrors.photos}</p>}
                    </div>

                    {/* Submit */}
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-green-600 text-white text-sm font-bold py-3 rounded-xl hover:bg-green-700 disabled:opacity-60 transition border-none cursor-pointer flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Listing product...
                                </>
                            ) : 'List product'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/app/products')}
                            disabled={loading}
                            className="px-6 text-sm font-semibold text-slate-600 bg-white border border-slate-200 py-3 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>

            {/* Full-page loading overlay */}
            {loading && (
                <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                    <svg className="w-10 h-10 animate-spin text-green-600 mb-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <p className="text-sm font-semibold text-slate-700">Uploading your product...</p>
                    <p className="text-xs text-slate-400 mt-1">This may take a moment</p>
                </div>
            )}
        </div>
    );
};

export default CreateProduct;
