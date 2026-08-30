// src/pages/farmer/EditProduct.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';

const CATEGORIES = {
    'Vegetables': '🥬', 'Fruits': '🍎', 'Grains': '🌾',
    'Herbs': '🌿', 'Spices': '🌶️', 'Dairy': '🥛',
    'Meat': '🥩', 'Fish': '🐟', 'Poultry': '🐔',
    'Eggs': '🥚', 'Rice': '🍚', 'Groundnuts': '🥜',
    'Cereals': '🌾', 'Legumes': '🫘', 'Roots': '🥔', 'Tubers': '🍠',
};

const UNITS = ['kg', 'bunch', 'pile', 'bag'];
const MAX_PHOTOS = 5;

const EditProduct = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [forbidden, setForbidden] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    const [formData, setFormData] = useState({
        name: '', category: '', variety: '', quantity: '',
        unit: 'kg', price: '', harvest_date: '', expiry_date: '',
        description: '',
    });

    // Photos are tracked as three separate pieces so unrelated edits never
    // touch them: photos already on the product (removable individually),
    // the subset of those the farmer marked for removal, and brand new
    // files to upload. Nothing here is sent to the server until submit —
    // editing a text field can never accidentally drop a photo.
    const [existingPhotos, setExistingPhotos] = useState([]);
    const [photosToRemove, setPhotosToRemove] = useState([]);
    const [newPhotos, setNewPhotos] = useState([]);
    const [newPhotoPreviews, setNewPhotoPreviews] = useState([]);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                setLoading(true);
                const response = await api.get(`/products/${productId}`);
                const product = response.data?.data;
                if (cancelled || !product) return;

                // The read endpoint is public (any product can be viewed),
                // so ownership is checked here purely for a clean "access
                // denied" screen instead of a confusing pre-filled form for
                // someone else's listing. The real enforcement is server
                // side: the update request itself is rejected with 403 for
                // a non-owner regardless of what the frontend shows.
                if (product.farmer?.id && user?.id && product.farmer.id !== user.id) {
                    setForbidden(true);
                    return;
                }

                setFormData({
                    name: product.name || '',
                    category: product.category || '',
                    variety: product.variety || '',
                    quantity: product.quantity ?? '',
                    unit: product.unit || 'kg',
                    price: product.price ?? '',
                    harvest_date: product.harvest_date ? product.harvest_date.slice(0, 10) : '',
                    expiry_date: product.expiry_date ? product.expiry_date.slice(0, 10) : '',
                    description: product.description || '',
                });
                setExistingPhotos(product.photos || []);
            } catch (err) {
                if (!cancelled) setNotFound(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [productId, user?.id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(f => ({ ...f, [name]: value }));
        if (fieldErrors[name]) setFieldErrors(f => ({ ...f, [name]: '' }));
    };

    const totalPhotoCount = existingPhotos.length + newPhotos.length;

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const availableSlots = MAX_PHOTOS - totalPhotoCount;

        if (availableSlots <= 0) {
            setError(`You can have up to ${MAX_PHOTOS} photos total.`);
            setTimeout(() => setError(null), 3000);
            e.target.value = '';
            return;
        }

        const accepted = files.slice(0, availableSlots);
        if (files.length > accepted.length) {
            setError(`Only ${availableSlots} more photo${availableSlots === 1 ? '' : 's'} can be added (max ${MAX_PHOTOS} total).`);
            setTimeout(() => setError(null), 3000);
        }

        setNewPhotos(prev => [...prev, ...accepted]);
        setNewPhotoPreviews(prev => [...prev, ...accepted.map(file => URL.createObjectURL(file))]);
        e.target.value = '';
    };

    const removeExistingPhoto = (url) => {
        setExistingPhotos(prev => prev.filter(p => p !== url));
        setPhotosToRemove(prev => [...prev, url]);
    };

    const removeNewPhoto = (index) => {
        setNewPhotos(prev => prev.filter((_, i) => i !== index));
        setNewPhotoPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return; // guard against double submission
        setSubmitting(true);
        setError(null);
        setFieldErrors({});

        try {
            const fd = new FormData();
            // PUT with a multipart body isn't parsed by PHP — send a real
            // POST with a spoofed _method, same pattern authService.js
            // already uses for the profile/avatar update.
            fd.append('_method', 'PUT');

            // Send every field on every submit — not just the ones the
            // farmer touched. The form was pre-filled from the current
            // product, so "unchanged" fields are simply resent with their
            // existing value, which sidesteps a real validation gotcha:
            // expiry_date's after:harvest_date rule fails if harvest_date
            // is missing from the request, so an edit that only touches
            // expiry_date can't safely omit harvest_date anyway.
            Object.entries(formData).forEach(([key, value]) => {
                fd.append(key, value ?? '');
            });

            newPhotos.forEach(file => fd.append('photos[]', file));
            photosToRemove.forEach(url => fd.append('remove_photos[]', url));

            await api.post(`/products/${productId}`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setSuccess('Product updated successfully!');
            setTimeout(() => {
                navigate('/app/products', { state: { refresh: true } });
            }, 1200);
        } catch (err) {
            const backendErrors = err.response?.data?.errors;
            if (backendErrors) {
                const errors = {};
                Object.keys(backendErrors).forEach((field) => {
                    errors[field] = backendErrors[field][0];
                });
                setFieldErrors(errors);
                setError(err.response?.data?.message || 'Please fix the errors below.');
            } else if (err.response?.status === 403) {
                setError('You do not have permission to edit this product.');
            } else {
                setError(err.response?.data?.message || err.message || 'Failed to update product');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass = (field) =>
        `w-full px-3 py-2.5 border rounded-lg text-sm outline-none transition bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 ${
            fieldErrors[field]
                ? 'border-red-300 dark:border-red-700 focus:border-red-400 dark:focus:border-red-600 bg-red-50 dark:bg-red-900/20'
                : 'border-slate-200 dark:border-slate-700 focus:border-green-400 dark:focus:border-green-600 focus:bg-white dark:focus:bg-slate-800'
        }`;

    const labelClass = "block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5";

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Edit product</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Update your listing's details</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/app/products')}
                        className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg font-medium transition cursor-pointer"
                    >
                        ← Back
                    </button>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-6 py-8">
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 dark:border-green-400" />
                    </div>
                ) : forbidden ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-center py-16">
                        <div className="text-5xl mb-3">🔒</div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">Access denied</h3>
                        <p className="text-sm text-slate-400 dark:text-slate-500 mb-5">You can only edit your own product listings.</p>
                        <button
                            onClick={() => navigate('/app/products')}
                            className="bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-green-700 transition border-none cursor-pointer"
                        >
                            Back to my products
                        </button>
                    </div>
                ) : notFound ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-center py-16">
                        <div className="text-5xl mb-3">❌</div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">Product not found</h3>
                        <p className="text-sm text-slate-400 dark:text-slate-500 mb-5">This listing may have been deleted.</p>
                        <button
                            onClick={() => navigate('/app/products')}
                            className="bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-green-700 transition border-none cursor-pointer"
                        >
                            Back to my products
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Alerts */}
                        {success && (
                            <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 text-sm px-4 py-3 rounded-xl mb-6">
                                <span className="text-lg">✅</span>
                                <span>{success}</span>
                            </div>
                        )}
                        {error && (
                            <div className="flex items-center justify-between bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-sm px-4 py-3 rounded-xl mb-6">
                                <span>⚠️ {error}</span>
                                <button onClick={() => setError(null)} className="text-red-600 dark:text-red-400 bg-transparent border-none cursor-pointer text-lg leading-none">×</button>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Basic info */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-5">Product details</h2>
                                <div className="space-y-4">
                                    {/* Name */}
                                    <div>
                                        <label htmlFor="edit-name" className={labelClass}>Product name <span className="text-red-500 dark:text-red-400">*</span></label>
                                        <input
                                            id="edit-name"
                                            name="name" type="text" required
                                            placeholder="e.g. Fresh Tomatoes"
                                            value={formData.name} onChange={handleChange}
                                            className={inputClass('name')}
                                        />
                                        {fieldErrors.name && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.name}</p>}
                                    </div>

                                    {/* Variety */}
                                    <div>
                                        <label htmlFor="edit-variety" className={labelClass}>Variety <span className="text-slate-400 dark:text-slate-500 normal-case font-normal">(optional)</span></label>
                                        <input
                                            id="edit-variety"
                                            name="variety" type="text"
                                            placeholder="e.g. Roma, Cherry"
                                            value={formData.variety} onChange={handleChange}
                                            className={inputClass('variety')}
                                        />
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <label htmlFor="edit-category" className={labelClass}>Category <span className="text-red-500 dark:text-red-400">*</span></label>
                                        <select
                                            id="edit-category"
                                            name="category" required
                                            value={formData.category} onChange={handleChange}
                                            className={inputClass('category') + ' cursor-pointer'}
                                        >
                                            <option value="">Select a category</option>
                                            {Object.entries(CATEGORIES).map(([cat, emoji]) => (
                                                <option key={cat} value={cat}>{emoji} {cat}</option>
                                            ))}
                                        </select>
                                        {fieldErrors.category && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.category}</p>}
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label htmlFor="edit-description" className={labelClass}>Description <span className="text-slate-400 dark:text-slate-500 normal-case font-normal">(optional)</span></label>
                                        <textarea
                                            id="edit-description"
                                            name="description" rows={3}
                                            placeholder="Describe your product — freshness, growing method, etc."
                                            value={formData.description} onChange={handleChange}
                                            className={`${inputClass('description')} resize-none`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Quantity & Pricing */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-5">Quantity & pricing</h2>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="edit-quantity" className={labelClass}>Quantity <span className="text-red-500 dark:text-red-400">*</span></label>
                                            <input
                                                id="edit-quantity"
                                                name="quantity" type="number" required
                                                placeholder="0.00" step="0.01" min="0.01"
                                                value={formData.quantity} onChange={handleChange}
                                                className={inputClass('quantity')}
                                            />
                                            {fieldErrors.quantity && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.quantity}</p>}
                                        </div>
                                        <div>
                                            <label htmlFor="edit-unit" className={labelClass}>Unit <span className="text-red-500 dark:text-red-400">*</span></label>
                                            <select
                                                id="edit-unit"
                                                name="unit"
                                                value={formData.unit} onChange={handleChange}
                                                className={inputClass('unit') + ' cursor-pointer'}
                                            >
                                                {/* Some older listings were created with a unit no longer
                                                    in the standard set (e.g. "dozen", "piece") — keep it
                                                    selectable so leaving this field untouched doesn't
                                                    fail validation on save. Changing it only offers the
                                                    current standard units. */}
                                                {!UNITS.includes(formData.unit) && formData.unit && (
                                                    <option value={formData.unit}>{formData.unit} (legacy)</option>
                                                )}
                                                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                            </select>
                                            {fieldErrors.unit && (
                                                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                                    {fieldErrors.unit} Please choose a current unit to save this product.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="edit-price" className={labelClass}>Price (GMD) <span className="text-red-500 dark:text-red-400">*</span></label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 dark:text-slate-500">GMD</span>
                                            <input
                                                id="edit-price"
                                                name="price" type="number" required
                                                placeholder="0.00" step="0.01" min="0.01"
                                                value={formData.price} onChange={handleChange}
                                                className={`${inputClass('price')} pl-12`}
                                            />
                                        </div>
                                        {fieldErrors.price && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.price}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-5">Dates</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="edit-harvest_date" className={labelClass}>Harvest date <span className="text-red-500 dark:text-red-400">*</span></label>
                                        <input
                                            id="edit-harvest_date"
                                            name="harvest_date" type="date" required
                                            value={formData.harvest_date} onChange={handleChange}
                                            className={`${inputClass('harvest_date')} dark:[color-scheme:dark]`}
                                        />
                                        {fieldErrors.harvest_date && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.harvest_date}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="edit-expiry_date" className={labelClass}>Expiry date <span className="text-red-500 dark:text-red-400">*</span></label>
                                        <input
                                            id="edit-expiry_date"
                                            name="expiry_date" type="date" required
                                            value={formData.expiry_date} onChange={handleChange}
                                            className={`${inputClass('expiry_date')} dark:[color-scheme:dark]`}
                                        />
                                        {fieldErrors.expiry_date && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.expiry_date}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Photos */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">Photos <span className="text-slate-400 dark:text-slate-500 font-normal">(up to {MAX_PHOTOS})</span></h2>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Good photos help buyers trust your listing</p>

                                {(existingPhotos.length > 0 || newPhotoPreviews.length > 0) && (
                                    <div className="flex flex-wrap gap-3 mb-4">
                                        {existingPhotos.map((url) => (
                                            <div key={url} className="relative group">
                                                <ImageWithFallback
                                                    src={getImageUrl(url)}
                                                    alt="Product photo"
                                                    className="w-20 h-20 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                                                    iconClassName="text-2xl"
                                                />
                                                <button
                                                    type="button"
                                                    aria-label="Remove photo"
                                                    onClick={() => removeExistingPhoto(url)}
                                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition border-none cursor-pointer leading-none"
                                                >×</button>
                                            </div>
                                        ))}
                                        {newPhotoPreviews.map((preview, i) => (
                                            <div key={preview} className="relative group">
                                                <img src={preview} alt={`New photo ${i + 1}`} className="w-20 h-20 object-cover rounded-xl border border-slate-200 dark:border-slate-700" />
                                                <button
                                                    type="button"
                                                    aria-label="Remove new photo"
                                                    onClick={() => removeNewPhoto(i)}
                                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition border-none cursor-pointer leading-none"
                                                >×</button>
                                                <span className="absolute bottom-0 inset-x-0 bg-green-600/90 text-white text-[9px] font-semibold text-center py-0.5 rounded-b-xl">New</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {totalPhotoCount < MAX_PHOTOS ? (
                                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl py-8 px-4 cursor-pointer hover:border-green-400 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition group">
                                        <span className="text-3xl mb-2">📷</span>
                                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 group-hover:text-green-700 dark:group-hover:text-green-400">Click to add photos</span>
                                        <span className="text-xs text-slate-400 dark:text-slate-500 mt-1">JPG, PNG up to 5MB each</span>
                                        <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                                    </label>
                                ) : (
                                    <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-3">
                                        Maximum of {MAX_PHOTOS} photos reached — remove one to add another.
                                    </p>
                                )}
                                {fieldErrors.photos && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{fieldErrors.photos}</p>}
                            </div>

                            {/* Submit */}
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 bg-green-600 text-white text-sm font-bold py-3 rounded-xl hover:bg-green-700 disabled:opacity-60 transition border-none cursor-pointer flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                            </svg>
                                            Saving changes...
                                        </>
                                    ) : 'Save changes'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/app/products')}
                                    disabled={submitting}
                                    className="px-6 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default EditProduct;
