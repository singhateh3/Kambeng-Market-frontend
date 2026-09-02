// src/pages/buyer/SavedFarmers.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Footer } from '../../components/Footer';
import { useSavedFarmersQuery, useToggleSavedFarmerMutation } from '../../hooks/queries/savedFarmerQueries';

const SavedFarmers = () => {
    const [page, setPage] = useState(1);
    const [removingId, setRemovingId] = useState(null);

    const { data, isLoading: isInitialLoad, isFetching: loading, error, refetch } = useSavedFarmersQuery(page);
    const savedFarmers = data?.savedFarmers || [];
    const pagination = data?.pagination || { current_page: 1, last_page: 1, per_page: 20, total: 0 };

    const toggleMutation = useToggleSavedFarmerMutation();

    const handleRemove = async (farmerId) => {
        try {
            setRemovingId(farmerId);
            await toggleMutation.mutateAsync({ farmerId, save: false });
        } catch (err) {
            console.error('Error removing saved farmer:', err);
        } finally {
            setRemovingId(null);
        }
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-4xl mx-auto px-6 py-5">
                    <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Saved farmers</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Farmers you've saved for quick access</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-6">
                {isInitialLoad ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 animate-pulse">
                                <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 rounded-xl text-center py-20">
                        <div className="text-5xl mb-3">⚠️</div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">Something went wrong</h3>
                        <p className="text-sm text-slate-400 dark:text-slate-500 mb-5">Failed to load saved farmers. Please try again.</p>
                        <button
                            onClick={() => refetch()}
                            className="bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-green-700 transition border-none cursor-pointer"
                        >
                            Try again
                        </button>
                    </div>
                ) : savedFarmers.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-center py-20">
                        <div className="text-5xl mb-3">🌾</div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">No saved farmers yet</h3>
                        <p className="text-sm text-slate-400 dark:text-slate-500 mb-5">Save farmers for quick ordering.</p>
                        <Link to="/app/browse" className="bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg no-underline hover:bg-green-700 transition">
                            Browse farmers
                        </Link>
                    </div>
                ) : (
                    <div className={`transition-opacity duration-200 ${loading ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
                        <div className="space-y-3">
                            {savedFarmers.map((sf) => {
                                const farmer = sf.farmer || {};
                                const farmerProfile = farmer.farmer_profile || {};
                                const displayName = farmerProfile.farm_name || farmer.name || 'Unknown Farmer';

                                return (
                                    <div
                                        key={sf.id}
                                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap"
                                    >
                                        <Link
                                            to={`/app/farmers/${farmer.id}`}
                                            className="flex items-center gap-3 min-w-0 flex-1 no-underline hover:opacity-80 transition"
                                        >
                                            <div className="w-11 h-11 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-base font-bold text-green-700 dark:text-green-300 flex-shrink-0">
                                                {displayName?.[0]?.toUpperCase() || 'F'}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{displayName}</p>
                                                    {farmerProfile.id_verified && (
                                                        <span className="text-xs font-semibold text-green-600 dark:text-green-400">✅</span>
                                                    )}
                                                </div>
                                                {farmer.location && (
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">📍 {farmer.location}</p>
                                                )}
                                            </div>
                                        </Link>
                                        <button
                                            onClick={() => handleRemove(farmer.id)}
                                            disabled={removingId === farmer.id}
                                            aria-label={`Remove ${displayName} from saved farmers`}
                                            className="px-3.5 py-1.5 text-xs font-semibold text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-900/40 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/60 transition border-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex-shrink-0"
                                        >
                                            {removingId === farmer.id ? 'Removing...' : 'Remove'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {pagination.last_page > 1 && (
                            <nav
                                aria-label="Saved farmers pagination"
                                className="mt-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3.5 flex items-center justify-between flex-wrap gap-3"
                            >
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    Showing {savedFarmers.length} of {pagination.total} saved farmers
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        disabled={loading || pagination.current_page <= 1}
                                        onClick={() => setPage(pagination.current_page - 1)}
                                        className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                    >← Previous</button>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 px-1">
                                        Page {pagination.current_page} of {pagination.last_page}
                                    </span>
                                    <button
                                        type="button"
                                        disabled={loading || pagination.current_page >= pagination.last_page}
                                        onClick={() => setPage(pagination.current_page + 1)}
                                        className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                    >Next →</button>
                                </div>
                            </nav>
                        )}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default SavedFarmers;
