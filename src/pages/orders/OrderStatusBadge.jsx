// src/pages/orders/OrderStatusBadge.jsx
export const OrderStatusBadge = ({ status }) => {
    const getStatusConfig = (status) => {
        const configs = {
            pending: {
                label: 'Pending',
                color: 'bg-yellow-100 text-yellow-800',
                icon: '⏳'
            },
            confirmed: {
                label: 'Confirmed',
                color: 'bg-blue-100 text-blue-800',
                icon: '✅'
            },
            shipped: {
                label: 'Shipped',
                color: 'bg-purple-100 text-purple-800',
                icon: '🚚'
            },
            delivered: {
                label: 'Delivered',
                color: 'bg-green-100 text-green-800',
                icon: '📦'
            },
            cancelled: {
                label: 'Cancelled',
                color: 'bg-red-100 text-red-800',
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