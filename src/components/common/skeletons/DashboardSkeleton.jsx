// src/components/skeletons/DashboardSkeleton.jsx
import { Skeleton } from './Skeleton';

export const DashboardSkeleton = () => (
    <div className="bg-slate-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
            <div className="max-w-6xl mx-auto px-6 py-5 flex items-start justify-between">
                <div>
                    <Skeleton className="h-7 w-52 mb-2" />
                    <Skeleton className="h-4 w-36" />
                </div>
                <Skeleton className="h-9 w-24 rounded-lg" />
            </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-6">
            {/* Stat cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                {[1,2,3,4].map(i => (
                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-5">
                        <Skeleton className="h-7 w-7 mb-3" />
                        <Skeleton className="h-8 w-16 mb-1" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                ))}
            </div>

            {/* Action cards */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                {[1,2,3].map(i => (
                    <div key={i} className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
                        <div className="flex-1">
                            <Skeleton className="h-4 w-28 mb-1.5" />
                            <Skeleton className="h-3 w-36" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Panels */}
            <div className="grid grid-cols-2 gap-4">
                {[1,2].map(i => (
                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                        {[1,2,3,4,5].map(j => (
                            <div key={j} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                                <div>
                                    <Skeleton className="h-4 w-32 mb-1" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    </div>
);
