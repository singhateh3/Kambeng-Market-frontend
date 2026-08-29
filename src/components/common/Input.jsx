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
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
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
                        bg-white dark:bg-slate-800
                        text-slate-900 dark:text-slate-100
                        placeholder:text-slate-400 dark:placeholder:text-slate-500
                        focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                        ${icon ? 'pl-10' : ''}
                        ${error
                            ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                            : 'border-slate-300 dark:border-slate-600 focus:border-primary-500 dark:focus:border-primary-400'}
                        ${className}
                    `}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
        </div>
    );
};