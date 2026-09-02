// src/hooks/queries/queries.test.jsx
//
// Task 12 review — minimum useful coverage for TanStack Query behavior:
// public-query deduplication, and mutation-driven invalidation for orders
// and saved farmers. Cache clearing on login/logout is covered separately
// in src/context/AuthContext.test.jsx (that's where the actual
// queryClient.clear() call lives).
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCancelOrderMutation, useOrdersQuery } from './orderQueries';
import { useProductsQuery } from './productQueries';
import { useSavedFarmersQuery, useToggleSavedFarmerMutation } from './savedFarmerQueries';

vi.mock('../useAuth', () => ({
    useAuth: () => ({ user: { id: 1 }, isAuthenticated: true }),
}));

const getMock = vi.fn();
const postMock = vi.fn().mockResolvedValue({});
const deleteMock = vi.fn().mockResolvedValue({});

vi.mock('../../services/api', () => ({
    default: {
        get: (...args) => getMock(...args),
        post: (...args) => postMock(...args),
        delete: (...args) => deleteMock(...args),
    },
}));

const withClient = (ui) => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return { queryClient, ...render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>) };
};

describe('public query deduplication', () => {
    beforeEach(() => getMock.mockReset());

    it('does not issue a second request for two consumers of the same query key', async () => {
        getMock.mockResolvedValue({ data: { data: [], meta: { current_page: 1, last_page: 1, per_page: 20, total: 0 } } });

        const filters = { category: '', region: '', search: '', page: 1, per_page: 20 };
        const ConsumerA = () => { useProductsQuery(filters); return <span>a</span>; };
        const ConsumerB = () => { useProductsQuery(filters); return <span>b</span>; };

        withClient(
            <>
                <ConsumerA />
                <ConsumerB />
            </>
        );

        await waitFor(() => expect(screen.getByText('a')).toBeInTheDocument());
        await waitFor(() => expect(getMock).toHaveBeenCalled());

        expect(getMock).toHaveBeenCalledTimes(1);
    });
});

describe('order mutation invalidation', () => {
    beforeEach(() => {
        getMock.mockReset();
        postMock.mockClear();
    });

    it('cancelling an order refetches the orders list', async () => {
        getMock.mockResolvedValue({ data: { data: [{ id: 5 }], meta: { current_page: 1, last_page: 1, per_page: 20, total: 1 } } });

        const Consumer = () => {
            const { data } = useOrdersQuery({ status: '', page: 1, per_page: 20 });
            const cancelMutation = useCancelOrderMutation();
            return (
                <div>
                    <span>orders:{data?.orders?.length ?? 'loading'}</span>
                    <button onClick={() => cancelMutation.mutate(5)}>cancel</button>
                </div>
            );
        };

        withClient(<Consumer />);

        await waitFor(() => expect(screen.getByText('orders:1')).toBeInTheDocument());
        expect(getMock).toHaveBeenCalledTimes(1);

        await userEvent.setup().click(screen.getByText('cancel'));

        // The mutation's onSuccess invalidates the orders query, and since
        // it's still mounted/active, TanStack Query automatically refetches
        // it — a second GET is the observable proof invalidation happened.
        await waitFor(() => expect(getMock).toHaveBeenCalledTimes(2));
    });
});

describe('saved-farmer mutation invalidation', () => {
    beforeEach(() => {
        getMock.mockReset();
        deleteMock.mockClear();
    });

    it('unsaving a farmer refetches the saved-farmers list', async () => {
        getMock.mockResolvedValue({
            data: { data: [{ id: 1, farmer_id: 3 }], meta: { current_page: 1, last_page: 1, per_page: 20, total: 1 } },
        });

        const Consumer = () => {
            const { data } = useSavedFarmersQuery(1);
            const toggleMutation = useToggleSavedFarmerMutation();
            return (
                <div>
                    <span>saved:{data?.savedFarmers?.length ?? 'loading'}</span>
                    <button onClick={() => toggleMutation.mutate({ farmerId: 3, save: false })}>unsave</button>
                </div>
            );
        };

        withClient(<Consumer />);

        await waitFor(() => expect(screen.getByText('saved:1')).toBeInTheDocument());
        expect(getMock).toHaveBeenCalledTimes(1);

        await userEvent.setup().click(screen.getByText('unsave'));

        await waitFor(() => expect(getMock).toHaveBeenCalledTimes(2));
        expect(deleteMock).toHaveBeenCalledWith('/saved-farmers/3');
    });
});
