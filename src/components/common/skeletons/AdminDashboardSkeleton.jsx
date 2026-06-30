// src/components/skeletons/AdminDashboardSkeleton.jsx
import { Skeleton } from './Skeleton';

export const AdminDashboardSkeleton = () => (
    <div className="bg-slate-50 min-h-screen">
        <div className="bg-white border-b border-slate-200">
            <div className="max-w-6xl mx-auto px-6 py-5">
                <Skeleton className="h-7 w-48 mb-2" />
                <Skeleton className="h-4 w-36" />
            </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-6">
            {/* Stat cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                {[1,2,3,4].map(i => (
                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-5">
                        <Skeleton className="h-7 w-7 mb-3" />
                        <Skeleton className="h-8 w-20 mb-1" />
                        <Skeleton className="h-3 w-28" />
                    </div>
                ))}
            </div>

            {/* Chart panels */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                {[1,2].map(i => (
                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-5">
                        <Skeleton className="h-5 w-32 mb-4" />
                        <div className="space-y-3">
                            {[1,2,3,4,5].map(j => (
                                <div key={j} className="flex items-center gap-3">
                                    <Skeleton className="h-3 w-20 flex-shrink-0" />
                                    <Skeleton className="h-1.5 flex-1 rounded-full" />
                                    <Skeleton className="h-3 w-5" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick actions */}
            <div className="mb-6">
                <Skeleton className="h-5 w-28 mb-3" />
                <div className="grid grid-cols-4 gap-3">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="bg-white border border-slate-200 rounded-xl px-4 py-4 flex items-center gap-3">
                            <Skeleton className="w-9 h-9 rounded-lg flex-shrink-0" />
                            <div>
                                <Skeleton className="h-4 w-20 mb-1" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent orders */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
                <Skeleton className="h-5 w-32 mb-4" />
                {[1,2,3,4,5].map(i => (
                    <div key={i} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                        <div className="flex gap-2">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-4 w-36" />
                        </div>
                        <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    </div>
);
