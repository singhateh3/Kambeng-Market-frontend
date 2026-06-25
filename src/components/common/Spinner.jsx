// src/components/common/Spinner.jsx

export const Spinner = ({ 
    size = 'md', 
    color = 'primary',
    className = '',
    label = '',
    fullScreen = false,
}) => {
    const sizes = {
        sm: 'w-5 h-5 border-2',
        md: 'w-10 h-10 border-3',
        lg: 'w-16 h-16 border-4',
        xl: 'w-24 h-24 border-4',
    };

    const colors = {
        primary: 'border-primary-600',
        white: 'border-white',
        gray: 'border-gray-600',
        green: 'border-green-600',
        blue: 'border-blue-600',
        purple: 'border-purple-600',
        red: 'border-red-600',
    };

    const sizeClasses = sizes[size] || sizes.md;
    const colorClasses = colors[color] || colors.primary;

    const spinner = (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <div className="relative">
                {/* Main spinner */}
                <div 
                    className={`${sizeClasses} ${colorClasses} rounded-full animate-spin`}
                    style={{
                        borderTopColor: 'transparent',
                        borderRightColor: 'transparent',
                        animationDuration: '0.8s',
                    }}
                />
                
                {/* Pulsing ring effect */}
                <div 
                    className={`absolute inset-0 ${sizeClasses} ${colorClasses} rounded-full animate-ping opacity-20`}
                    style={{
                        borderTopColor: 'transparent',
                        borderRightColor: 'transparent',
                        animationDuration: '1.5s',
                    }}
                />
            </div>
            {label && (
                <p className={`mt-3 text-sm font-medium text-gray-600 animate-pulse`}>
                    {label}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
                {spinner}
            </div>
        );
    }

    return spinner;
};

// Loading overlay component for form submissions
export const LoadingOverlay = ({ loading, children }) => {
    if (!loading) return children;

    return (
        <div className="relative">
            <div className="opacity-50 pointer-events-none">
                {children}
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60 rounded-lg">
                <Spinner size="md" label="Loading..." />
            </div>
        </div>
    );
};

// Skeleton loader for product cards
export const ProductSkeleton = ({ count = 4 }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200" />
                    <div className="p-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                        <div className="flex justify-between">
                            <div className="h-4 bg-gray-200 rounded w-1/3" />
                            <div className="h-4 bg-gray-200 rounded w-1/4" />
                        </div>
                        <div className="h-8 bg-gray-200 rounded w-full" />
                    </div>
                </div>
            ))}
        </div>
    );
};