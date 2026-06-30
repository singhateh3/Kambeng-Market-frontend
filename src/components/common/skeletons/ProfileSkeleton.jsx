// src/components/skeletons/ProfileSkeleton.jsx
import { Skeleton } from './Skeleton';

export const ProfileSkeleton = () => (
    <div className="bg-slate-50 min-h-screen">
        <div className="bg-white border-b border-slate-200">
            <div className="max-w-6xl mx-auto px-6 py-5">
                <Skeleton className="h-7 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
            </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="grid grid-cols-3 gap-6">
                {/* Sidebar */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 text-center h-fit">
                    <Skeleton className="w-20 h-20 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-5 w-32 mx-auto mb-2" />
                    <Skeleton className="h-4 w-24 mx-auto mb-4" />
                    <Skeleton className="h-5 w-16 rounded-full mx-auto mb-6" />
                    <Skeleton className="h-9 w-full rounded-lg" />
                </div>

                {/* Main content */}
                <div className="col-span-2 space-y-4">
                    <div className="bg-white border border-slate-200 rounded-xl p-6">
                        <Skeleton className="h-5 w-36 mb-5" />
                        <div className="grid grid-cols-2 gap-4">
                            {[1,2,3,4,5,6].map(i => (
                                <div key={i}>
                                    <Skeleton className="h-3 w-20 mb-2" />
                                    <Skeleton className="h-10 w-full rounded-lg" />
                                </div>
                            ))}
                        </div>
                        <Skeleton className="h-10 w-32 rounded-lg mt-5" />
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-6">
                        <Skeleton className="h-5 w-36 mb-5" />
                        <div className="space-y-4">
                            {[1,2].map(i => (
                                <div key={i}>
                                    <Skeleton className="h-3 w-24 mb-2" />
                                    <Skeleton className="h-10 w-full rounded-lg" />
                                </div>
                            ))}
                        </div>
                        <Skeleton className="h-10 w-36 rounded-lg mt-5" />
                    </div>
                </div>
            </div>
        </div>
    </div>
);
