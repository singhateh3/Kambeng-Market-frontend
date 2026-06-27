// src/components/common/LoadingOverlay.jsx
import { Spinner } from './Spinner';

export const LoadingOverlay = ({ loading, children, message = 'Loading...' }) => {
    if (!loading) return children;

    return (
        <div className="relative">
            <div className="opacity-50 pointer-events-none">
                {children}
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                <div className="flex flex-col items-center space-y-2">
                    <Spinner size="lg" />
                    <p className="text-gray-600">{message}</p>
                </div>
            </div>
        </div>
    );
};