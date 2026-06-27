// src/components/common/LoadingScreen.jsx
export const LoadingScreen = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
                <p className="text-gray-600 font-medium">Loading...</p>
                <p className="text-sm text-gray-400">Please wait while we prepare your experience</p>
            </div>
        </div>
    );
};