// src/pages/orders/PaymentReturn.jsx
//
// Landing page after ModemPay's hosted checkout — the return_url/cancel_url
// built server-side in OrderController::store point here
// (/app/orders/:orderId/payment-return?status=success|cancelled). The
// query param only reflects what ModemPay told the browser; the order's
// actual payment_status is only ever set by the webhook (see
// PaymentConfirmationService), which can arrive slightly after this page
// loads. So this page polls GET /orders/:orderId for a few seconds rather
// than trusting the query param alone.
import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import api from '../../services/api';

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 10; // ~30s of polling before giving up and asking the buyer to check back

const PaymentReturn = () => {
    const { orderId } = useParams();
    const [searchParams] = useSearchParams();
    const returnStatus = searchParams.get('status'); // 'success' | 'cancelled' (as sent by ModemPay/OrderController)

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pollCount, setPollCount] = useState(0);
    const timerRef = useRef(null);

    const fetchOrder = async () => {
        try {
            const response = await api.get(`/orders/${orderId}`);
            setOrder(response.data?.data || null);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load order status.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
        return () => clearTimeout(timerRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId]);

    // Keep polling only while the order is still genuinely undecided —
    // once the webhook lands, status moves off 'awaiting_payment' for
    // every outcome (paid, failed, expired, cancelled).
    useEffect(() => {
        if (loading || !order) return;
        if (order.status !== 'awaiting_payment') return;
        if (pollCount >= MAX_POLLS) return;

        timerRef.current = setTimeout(async () => {
            await fetchOrder();
            setPollCount((c) => c + 1);
        }, POLL_INTERVAL_MS);

        return () => clearTimeout(timerRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, order, pollCount]);

    const stillWaiting = order?.status === 'awaiting_payment';
    const timedOut = stillWaiting && pollCount >= MAX_POLLS;
    const paid = order && !stillWaiting && order.payment_status === 'paid';
    const notPaid = order && !stillWaiting && order.payment_status !== 'paid';

    const handleRetryCheck = () => {
        setPollCount(0);
        setLoading(true);
        fetchOrder();
    };

    if (loading && !order) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 dark:border-green-400" />
            </div>
        );
    }

    if (error && !order) {
        return (
            <div className="max-w-md mx-auto mt-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center">
                <div className="text-5xl mb-3">⚠️</div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Couldn't load order</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">{error}</p>
                <Link to="/app/orders">
                    <Button variant="secondary">Go to my orders</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto mt-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center">
            {paid && (
                <>
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">✅</span>
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Payment successful!</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                        Your order has been placed and the farmer has been notified.
                    </p>
                    <Link to={`/app/orders/${orderId}`}>
                        <Button variant="primary">View order</Button>
                    </Link>
                </>
            )}

            {stillWaiting && !timedOut && (
                <>
                    <div className="relative w-20 h-20 mx-auto mb-4">
                        <div className="absolute inset-0 border-4 border-slate-100 dark:border-slate-700 rounded-full" />
                        <div className="absolute inset-0 border-4 border-t-green-600 dark:border-t-green-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                    </div>
                    <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                        {returnStatus === 'cancelled' ? 'Checking payment status...' : 'Confirming your payment...'}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        This usually takes a few seconds. Please don't close this page.
                    </p>
                </>
            )}

            {timedOut && (
                <>
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">⏳</span>
                    </div>
                    <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Still confirming</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                        We haven't heard back from ModemPay yet. If you completed payment, it should confirm shortly —
                        check your orders in a minute, or try checking again now.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button variant="secondary" onClick={handleRetryCheck}>Check again</Button>
                        <Link to="/app/orders">
                            <Button variant="primary">Go to my orders</Button>
                        </Link>
                    </div>
                </>
            )}

            {notPaid && (
                <>
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">❌</span>
                    </div>
                    <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                        {returnStatus === 'cancelled' ? 'Payment not completed' : 'Payment unsuccessful'}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                        {order?.product?.id
                            ? "You can go back to the product and try checking out again."
                            : 'You can review your orders and try again.'}
                    </p>
                    <div className="flex gap-3 justify-center">
                        {order?.product?.id && (
                            <Link to={`/app/products/${order.product.id}`}>
                                <Button variant="primary">Back to product</Button>
                            </Link>
                        )}
                        <Link to="/app/orders">
                            <Button variant="secondary">Go to my orders</Button>
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
};

export default PaymentReturn;
