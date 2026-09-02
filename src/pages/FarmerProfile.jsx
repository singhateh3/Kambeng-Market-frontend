// src/pages/FarmerProfile.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { SaveFarmerButton } from '../components/SaveFarmerButton';
import { useAuth } from '../hooks/useAuth';
import { usePublicFarmerProfileQuery } from '../hooks/queries/farmerQueries';
import api from '../services/api';

const FarmerProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { data: profile, isLoading: loading, error } = usePublicFarmerProfileQuery(userId);
    const [farmerSaved, setFarmerSaved] = useState(false);

    const isBuyer = user?.role === 'buyer';
    const errorMessage = error
        ? (error.response?.status === 404 ? 'Farmer not found' : 'Failed to load farmer profile')
        : null;

    useEffect(() => {
        if (!isBuyer || !userId) return;
        let cancelled = false;
        api.get(`/saved-farmers?farmer_id=${userId}&per_page=1`)
            .then((response) => {
                if (!cancelled) setFarmerSaved((response.data.data || []).length > 0);
            })
            .catch((err) => console.error('Error checking saved farmer status:', err));
        return () => { cancelled = true; };
    }, [userId, isBuyer]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 dark:border-green-400"></div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-12 text-center max-w-2xl mx-auto">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">Farmer Not Found</h3>
                <p className="text-gray-500 dark:text-slate-400">{errorMessage || "This farmer's profile doesn't exist."}</p>
                <Button className="mt-4" onClick={() => navigate('/app/browse')}>
                    Browse Products
                </Button>
            </div>
        );
    }

    const farmerUser = profile.user || {};
    const displayName = profile.farm_name || farmerUser.name || 'Unknown Farm';

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100 flex items-center transition"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="p-6 md:p-8">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-2xl font-bold text-green-700 dark:text-green-300 flex-shrink-0">
                                {displayName?.[0]?.toUpperCase() || 'F'}
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100 truncate">{displayName}</h1>
                                    {profile.is_verified && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300">
                                            ✅ Verified
                                        </span>
                                    )}
                                </div>
                                {farmerUser.name && profile.farm_name && (
                                    <p className="text-sm text-gray-500 dark:text-slate-400">{farmerUser.name}</p>
                                )}
                                {profile.farm_location && (
                                    <p className="text-sm text-gray-500 dark:text-slate-400">📍 {profile.farm_location}</p>
                                )}
                            </div>
                        </div>
                        {isBuyer && (
                            <SaveFarmerButton
                                farmerId={userId}
                                initialSaved={farmerSaved}
                                onChange={setFarmerSaved}
                            />
                        )}
                    </div>

                    {profile.bio && (
                        <p className="mt-5 text-gray-600 dark:text-slate-400 text-sm leading-relaxed">{profile.bio}</p>
                    )}

                    <div className="mt-6 grid grid-cols-3 gap-3 border-t border-gray-100 dark:border-slate-700 pt-5">
                        <div className="text-center">
                            <p className="text-lg font-bold text-gray-900 dark:text-slate-100">
                                {profile.average_rating != null ? Number(profile.average_rating).toFixed(1) : '—'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">⭐ Rating</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold text-gray-900 dark:text-slate-100">
                                {profile.active_products_count ?? 0}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">Active listings</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold text-gray-900 dark:text-slate-100">
                                {profile.products_sold_count ?? 0}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">Products sold</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FarmerProfile;
