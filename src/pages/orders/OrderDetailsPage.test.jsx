// src/pages/orders/OrderDetailsPage.test.jsx
//
// Phase 3A P1 fix: OrderDetailsPage migrated from a raw useEffect +
// api.get (with mutation handlers manually re-calling fetchOrderDetails())
// to useOrderQuery/useUpdateOrderStatusMutation/useCancelOrderMutation/
// useConfirmOrderMutation (src/hooks/queries/orderQueries.js). These tests
// cover: the query hook loading the order, the loading state, the error
// state, and that a mutation causes a refetch via cache invalidation
// (the same "count the GET calls" proof queries.test.jsx already uses for
// useCancelOrderMutation) instead of a manual re-fetch call.
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import OrderDetailsPage from './OrderDetailsPage';

const buyer = { id: 1, role: 'buyer', name: 'Test Buyer' };

vi.mock('../../hooks/useAuth', () => ({
    useAuth: () => ({ user: buyer, isAuthenticated: true }),
}));

const getMock = vi.fn();
const postMock = vi.fn();
const patchMock = vi.fn();

vi.mock('../../services/api', () => ({
    default: {
        get: (...args) => getMock(...args),
        post: (...args) => postMock(...args),
        patch: (...args) => patchMock(...args),
    },
}));

const pendingOrder = {
    id: 10,
    status: 'pending',
    payment_method: 'modempay',
    payment_status: 'paid',
    payout_status: 'not_applicable',
    quantity: 2,
    total_price: 50,
    total_price_formatted: 'GMD 50.00',
    delivery_method: 'pickup',
    order_date: '2026-01-01T00:00:00.000000Z',
    buyer_id: buyer.id,
    product_id: 7,
    special_instructions: null,
    review: null,
    dispute: null,
    buyer: { id: buyer.id, name: 'Test Buyer', email: 'buyer@example.com' },
    product: {
        id: 7,
        name: 'Fresh Tomatoes',
        category: 'Vegetables',
        unit: 'kg',
        price: 25,
        photos: [],
        farmer: { id: 3, name: 'Amie Farms', farmer_id: 3, location: 'Brikama' },
        farmer_id: 3,
    },
};

const renderPage = (orderId = 10) => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[`/app/orders/${orderId}`]}>
                <Routes>
                    <Route path="/app/orders/:orderId" element={<OrderDetailsPage />} />
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>
    );
};

describe('OrderDetailsPage', () => {
    beforeEach(() => {
        getMock.mockReset();
        postMock.mockReset();
        patchMock.mockReset();
    });

    it('loads the order through useOrderQuery and renders it', async () => {
        getMock.mockResolvedValue({ data: { data: pendingOrder } });

        renderPage();

        await waitFor(() => expect(screen.getByText('Order #10')).toBeInTheDocument());
        expect(screen.getByText('Fresh Tomatoes')).toBeInTheDocument();
        expect(getMock).toHaveBeenCalledWith('/orders/10', expect.any(Object));
    });

    it('shows a loading state before the order resolves', () => {
        getMock.mockReturnValue(new Promise(() => {})); // never resolves within this test

        const { container } = renderPage();

        expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('falls back to the access-denied panel without crashing when the order fails to load', async () => {
        // Matches pre-migration behavior: canViewOrder() returns false
        // whenever `order` is falsy, so a fetch failure renders the same
        // "Access Denied" panel a genuine 403 would — the component
        // early-returns before ever reaching the JSX that would show an
        // error Alert, so no such banner is visible here either way. This
        // test only proves the migration didn't turn a fetch failure into
        // a crash or an infinite loading spinner.
        getMock.mockRejectedValue(new Error('network error'));

        renderPage();

        await waitFor(() => expect(screen.getByText(/access denied|order not found/i)).toBeInTheDocument());
    });

    it('cancelling an order refetches the order detail query instead of manually re-fetching', async () => {
        getMock.mockResolvedValue({ data: { data: pendingOrder } });
        postMock.mockResolvedValue({ data: { success: true } });

        renderPage();

        await waitFor(() => expect(screen.getByText('Order #10')).toBeInTheDocument());
        expect(getMock).toHaveBeenCalledTimes(1);

        await userEvent.setup().click(screen.getByRole('button', { name: /cancel order/i }));
        await userEvent.setup().click(screen.getByRole('button', { name: /yes, cancel order/i }));

        expect(postMock).toHaveBeenCalledWith('/orders/10/cancel');
        // The mutation's onSuccess invalidates orderKeys.all(user.id), which
        // covers this order's detail query too (nested under the same
        // prefix) — a second GET is the observable proof of that refetch.
        await waitFor(() => expect(getMock).toHaveBeenCalledTimes(2));
        await waitFor(() => expect(screen.getByText('Order cancelled successfully')).toBeInTheDocument());
    });

    it('reports mutation failure without silently claiming success', async () => {
        getMock.mockResolvedValue({ data: { data: pendingOrder } });
        postMock.mockRejectedValue({ response: { data: { message: 'Order already shipped' } } });

        renderPage();

        await waitFor(() => expect(screen.getByText('Order #10')).toBeInTheDocument());

        await userEvent.setup().click(screen.getByRole('button', { name: /cancel order/i }));
        await userEvent.setup().click(screen.getByRole('button', { name: /yes, cancel order/i }));

        await waitFor(() => expect(screen.getByText('Order already shipped')).toBeInTheDocument());
        expect(screen.queryByText('Order cancelled successfully')).not.toBeInTheDocument();
    });
});
