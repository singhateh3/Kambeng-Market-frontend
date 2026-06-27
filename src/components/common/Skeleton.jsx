// src/components/common/Skeleton.jsx
export const Skeleton = ({ className = '' }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

// src/components/common/SkeletonCard.jsx
export const SkeletonCard = ({ count = 1 }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-start space-x-4">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="flex-1 space-y-3">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-1/4" />
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
};

// src/components/common/SkeletonProduct.jsx
export const SkeletonProduct = ({ count = 1 }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow overflow-hidden">
                    <Skeleton className="w-full h-48" />
                    <div className="p-4 space-y-3">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/4" />
                        <div className="flex justify-between items-center pt-2">
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-8 w-24" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// src/components/common/SkeletonTable.jsx
export const SkeletonTable = ({ rows = 5, columns = 4 }) => {
    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
                <Skeleton className="h-6 w-48" />
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {Array.from({ length: columns }).map((_, i) => (
                                <th key={i} className="px-6 py-3 text-left">
                                    <Skeleton className="h-4 w-20" />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {Array.from({ length: rows }).map((_, i) => (
                            <tr key={i}>
                                {Array.from({ length: columns }).map((_, j) => (
                                    <td key={j} className="px-6 py-4">
                                        <Skeleton className="h-4 w-full" />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};