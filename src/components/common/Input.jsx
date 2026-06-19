// src/components/common/Input.jsx

export const Input = ({
    label,
    error,
    icon,
    className = '',
    ...props
}) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {icon}
                    </div>
                )}
                <input
                    className={`
                        w-full px-4 py-2 border rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-primary-500
                        ${icon ? 'pl-10' : ''}
                        ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary-500'}
                        ${className}
                    `}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};