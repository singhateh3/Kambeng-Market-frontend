// src/components/skeletons/OrdersSkeleton.jsx
import { Skeleton } from './Skeleton';

export const OrdersSkeleton = () => (
    <div className="bg-slate-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
            <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
                <div>
                    <Skeleton className="h-7 w-28 mb-2" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-9 w-32 rounded-lg" />
            </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-6">
            {/* Filter pills */}
            <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 mb-5 flex items-center gap-3 flex-wrap">
                <Skeleton className="h-4 w-12" />
                {[1,2,3,4,5,6].map(i => (
                    <Skeleton key={i} className="h-7 w-20 rounded-full" />
                ))}
            </div>

            {/* Order rows */}
            <div className="space-y-3">
                {[1,2,3,4,5].map(i => (
                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
                            <div>
                                <Skeleton className="h-4 w-40 mb-1.5" />
                                <Skeleton className="h-3 w-28 mb-1" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <Skeleton className="h-6 w-20 rounded-full" />
                            <Skeleton className="h-8 w-24 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);
