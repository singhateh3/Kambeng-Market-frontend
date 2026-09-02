// src/components/SaveFarmerButton.jsx
import { useEffect, useState } from 'react';
import { useToggleSavedFarmerMutation } from '../hooks/queries/savedFarmerQueries';

// Self-contained save/unsave toggle — owns its own local "saved" display
// state, same pattern as ReviewForm/ReportIssueForm ("give me an id, I
// handle my own mutation") rather than pushing the API call up to the
// parent page. The actual request goes through the shared
// useToggleSavedFarmerMutation so the SavedFarmers list page's cache stays
// correct no matter where a save/unsave happens (here, or its own page).
export const SaveFarmerButton = ({ farmerId, initialSaved = false, onChange, size = 'md' }) => {
    const [saved, setSaved] = useState(initialSaved);
    const toggleMutation = useToggleSavedFarmerMutation();

    // initialSaved often arrives after an async "is this already saved?"
    // check resolves post-mount (see ProductDetail.jsx) — sync to it
    // whenever it changes, not just on first render.
    useEffect(() => {
        setSaved(initialSaved);
    }, [initialSaved]);

    const handleToggle = async (e) => {
        e.stopPropagation();
        if (toggleMutation.isPending) return;

        const next = !saved;
        try {
            await toggleMutation.mutateAsync({ farmerId, save: next });
            setSaved(next);
            onChange?.(next);
        } catch (err) {
            console.error('Error toggling saved farmer:', err);
        }
    };

    const sizes = {
        sm: 'w-7 h-7 text-sm',
        md: 'w-9 h-9 text-base',
    };

    return (
        <button
            type="button"
            onClick={handleToggle}
            disabled={toggleMutation.isPending}
            aria-pressed={saved}
            aria-label={saved ? 'Remove farmer from saved list' : 'Save farmer'}
            title={saved ? 'Saved — click to remove' : 'Save this farmer'}
            className={`inline-flex items-center justify-center rounded-full border transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${sizes[size]} ${
                saved
                    ? 'bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/60'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500 hover:border-red-300 dark:hover:border-red-700 hover:text-red-500 dark:hover:text-red-400'
            }`}
        >
            {saved ? '❤️' : '🤍'}
        </button>
    );
};
