// src/pages/orders/DisputeStatusBadge.jsx
export const DisputeStatusBadge = ({ status }) => {
    const getStatusConfig = (status) => {
        const configs = {
            open: {
                label: 'Issue reported',
                color: 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300',
                icon: '⚠️'
            },
            under_review: {
                label: 'Under review',
                color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300',
                icon: '🔍'
            },
            resolved: {
                label: 'Resolved',
                color: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300',
                icon: '✅'
            },
            rejected: {
                label: 'Rejected',
                color: 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400',
                icon: '❌'
            }
        };
        return configs[status] || configs.open;
    };

    const config = getStatusConfig(status);

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            <span className="mr-1">{config.icon}</span>
            {config.label}
        </span>
    );
};
