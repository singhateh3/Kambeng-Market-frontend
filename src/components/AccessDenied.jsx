// src/components/AccessDenied.jsx
import { Link } from 'react-router-dom';

export const AccessDenied = ({ message = "You don't have permission to view this page." }) => {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
            <div className="bg-white border border-slate-200 rounded-xl p-12 max-w-md w-full text-center">
                <div className="text-6xl mb-4">🚫</div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
                <p className="text-slate-500 text-sm mb-6">{message}</p>
                <Link 
                    to="/app/dashboard" 
                    className="inline-block bg-green-600 text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-green-700 transition"
                >
                    Return to Dashboard
                </Link>
            </div>
        </div>
    );
};