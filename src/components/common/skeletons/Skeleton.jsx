// src/components/common/Skeleton.jsx
// rounded-lg per the radius convention (compact elements use rounded-lg,
// cards/panels use rounded-xl) — this was the app's one rounded-md outlier.
export const Skeleton = ({ className = '' }) => (
    <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg ${className}`} />
);
