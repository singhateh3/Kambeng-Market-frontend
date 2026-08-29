// src/pages/orders/OrderStatusBadge.jsx
export const OrderStatusBadge = ({ status }) => {
    const getStatusConfig = (status) => {
        // Each status keeps its own hue in dark mode (dark tint + light text,
        // same pattern as Alert.jsx) rather than converging to one muted
        // look — pending/confirmed/shipped/delivered/cancelled must stay
        // distinguishable from each other at a glance.
        const configs = {
            pending: {
                label: 'Pending',
                color: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300',
                icon: '⏳'
            },
            confirmed: {
                label: 'Confirmed',
                color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300',
                icon: '✅'
            },
            shipped: {
                label: 'Shipped',
                color: 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300',
                icon: '🚚'
            },
            delivered: {
                label: 'Delivered',
                color: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300',
                icon: '📦'
            },
            cancelled: {
                label: 'Cancelled',
                color: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300',
                icon: '❌'
            }
        };
        return configs[status] || configs.pending;
    };

    const config = getStatusConfig(status);

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            <span className="mr-1">{config.icon}</span>
            {config.label}
        </span>
    );
};