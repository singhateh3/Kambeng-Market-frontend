// src/pages/orders/PaymentStatusBadge.jsx
export const PaymentStatusBadge = ({ status }) => {
    const getStatusConfig = (status) => {
        // Same dark tint + light text convention as OrderStatusBadge —
        // paid/failed/cancelled/refunded must stay visually distinct from
        // each other, not converge into one muted "done" look.
        const configs = {
            pending: {
                label: 'Payment pending',
                color: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
                icon: '💵'
            },
            paid: {
                label: 'Paid',
                color: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300',
                icon: '✅'
            },
            failed: {
                label: 'Payment failed',
                color: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300',
                icon: '⚠️'
            },
            cancelled: {
                label: 'Payment cancelled',
                color: 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400',
                icon: '❌'
            },
            refunded: {
                label: 'Refunded',
                color: 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300',
                icon: '↩️'
            }
        };
        // Defaults to "pending" for older/cached order objects fetched
        // before this field existed, or any unrecognized value — never
        // renders blank.
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
