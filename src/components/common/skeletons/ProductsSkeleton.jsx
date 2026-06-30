// src/components/skeletons/ProductsSkeleton.jsx
import { Skeleton } from './Skeleton';

export const ProductsSkeleton = () => (
    <div className="bg-slate-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
            <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
                <div>
                    <Skeleton className="h-7 w-40 mb-2" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-9 w-28 rounded-lg" />
            </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-6">
            {/* Filter bar */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 flex gap-3">
                <Skeleton className="h-9 flex-1 rounded-lg" />
                <Skeleton className="h-9 w-48 rounded-lg" />
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <Skeleton className="w-full h-36" />
                        <div className="p-3">
                            <Skeleton className="h-3 w-16 mb-1" />
                            <Skeleton className="h-4 w-3/4 mb-1" />
                            <Skeleton className="h-3 w-28 mb-3" />
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-5 w-16" />
                                <div className="flex gap-1">
                                    <Skeleton className="w-7 h-7 rounded-lg" />
                                    <Skeleton className="w-10 h-7 rounded-lg" />
                                    <Skeleton className="w-7 h-7 rounded-lg" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);
