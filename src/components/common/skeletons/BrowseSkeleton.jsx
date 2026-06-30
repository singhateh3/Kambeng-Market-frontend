// src/components/skeletons/BrowseSkeleton.jsx
import { Skeleton } from './Skeleton';

export const BrowseSkeleton = () => (
    <div className="bg-slate-50 min-h-screen">
        <div className="bg-white border-b border-slate-200">
            <div className="max-w-6xl mx-auto px-6 py-5">
                <Skeleton className="h-7 w-40 mb-2" />
                <Skeleton className="h-4 w-56" />
            </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-6">
            {/* Search + filters */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 flex gap-3 flex-wrap">
                <Skeleton className="h-9 flex-1 min-w-[200px] rounded-lg" />
                <Skeleton className="h-9 w-40 rounded-lg" />
                <Skeleton className="h-9 w-40 rounded-lg" />
            </div>

            {/* Category pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 mb-6">
                {[1,2,3,4,5,6,7].map(i => (
                    <Skeleton key={i} className="h-8 w-24 rounded-full flex-shrink-0" />
                ))}
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <Skeleton className="w-full h-36" />
                        <div className="p-3">
                            <Skeleton className="h-3 w-20 mb-1" />
                            <Skeleton className="h-4 w-3/4 mb-1.5" />
                            <div className="flex items-center justify-between mb-2.5">
                                <Skeleton className="h-5 w-16" />
                                <Skeleton className="h-3 w-12" />
                            </div>
                            <Skeleton className="h-8 w-full rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);
