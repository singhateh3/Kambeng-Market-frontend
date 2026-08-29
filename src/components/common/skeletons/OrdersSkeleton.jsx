// src/components/skeletons/OrdersSkeleton.jsx
import { Skeleton } from './Skeleton';

// Mirrors OrderCard.jsx's real geometry (border card, order#+badge row, a
// 1/2-col info grid, a wrapping action-button cluster) so the loading state
// doesn't visibly jump once real orders arrive. Orders.jsx renders this in
// place of just the order-list region — its header and filter bar stay
// mounted around it.
export const OrdersSkeleton = () => (
    <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-5 w-20 rounded-full" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <Skeleton className="h-3.5 w-32" />
                            <Skeleton className="h-3.5 w-28" />
                            <Skeleton className="h-3.5 w-24" />
                            <Skeleton className="h-3.5 w-20" />
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                        <Skeleton className="h-8 w-24 rounded-lg" />
                        <Skeleton className="h-8 w-20 rounded-lg" />
                    </div>
                </div>
            </div>
        ))}
    </div>
);
