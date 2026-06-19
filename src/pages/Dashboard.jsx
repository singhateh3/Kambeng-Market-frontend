import { useAuth } from '../hooks/useAuth';

export const Dashboard = () => {
    const { user } = useAuth();

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600">
                You are logged in as a {user?.role}.
            </p>
            
            {user?.role === 'farmer' && (
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="bg-primary-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-primary-800">Total Products</h3>
                        <p className="text-2xl font-bold text-primary-600">0</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-blue-800">Total Orders</h3>
                        <p className="text-2xl font-bold text-blue-600">0</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-green-800">Revenue</h3>
                        <p className="text-2xl font-bold text-green-600">GMD 0</p>
                    </div>
                </div>
            )}
            
            {user?.role === 'buyer' && (
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="bg-primary-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-primary-800">Orders Placed</h3>
                        <p className="text-2xl font-bold text-primary-600">0</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-blue-800">Favorite Farmers</h3>
                        <p className="text-2xl font-bold text-blue-600">0</p>
                    </div>
                </div>
            )}
        </div>
    );
};