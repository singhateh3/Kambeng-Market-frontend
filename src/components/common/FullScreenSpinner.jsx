// src/components/common/FullScreenSpinner.jsx
import { Spinner } from './Spinner';

export const FullScreenSpinner = ({ message = 'Loading...' }) => {
    return (
        <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
            <div className="relative">
                {/* Outer ring */}
                <div className="w-20 h-20 border-4 border-primary-200 rounded-full animate-pulse" />
                
                {/* Spinner */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <Spinner size="lg" color="primary" />
                </div>
                
                {/* Inner dot */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 bg-primary-600 rounded-full animate-ping" />
                </div>
            </div>
            
            {message && (
                <p className="mt-6 text-lg font-medium text-gray-700 animate-pulse">
                    {message}
                </p>
            )}
            
            {/* Decorative dots */}
            <div className="flex space-x-2 mt-4">
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
        </div>
    );
};