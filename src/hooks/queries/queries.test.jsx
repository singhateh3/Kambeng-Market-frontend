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
import { useDeleteAdminProductMutation, useAdminProductsQuery, useAdminDisputesQuery, useUpdateDisputeStatusMutation } from './adminQueries';
import { useCancelOrderMutation, useOrdersQuery } from './orderQueries';
import { useProductsQuery } from './productQueries';
import { useSavedFarmersQuery, useToggleSavedFarmerMutation } from './savedFarmerQueries';

// role: 'admin' so the admin-only query hooks (gated on it) are exercised
// too — none of the non-admin hooks used elsewhere in this file care
// about role, so sharing one mock user across both is safe.
vi.mock('../useAuth', () => ({
    useAuth: () => ({ user: { id: 1, role: 'admin' }, isAuthenticated: true }),
}));

const getMock = vi.fn();
const postMock = vi.fn().mockResolvedValue({});
const deleteMock = vi.fn().mockResolvedValue({});
const patchMock = vi.fn().mockResolvedValue({});

vi.mock('../../services/api', () => ({
    default: {
        get: (...args) => getMock(...args),
        post: (...args) => postMock(...args),
        delete: (...args) => deleteMock(...args),
        patch: (...args) => patchMock(...args),
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

describe('admin product mutation invalidation', () => {
    beforeEach(() => {
        getMock.mockReset();
        deleteMock.mockClear();
    });

    it('deleting a product refetches the admin products list', async () => {
        getMock.mockResolvedValue({ data: { data: [{ id: 9 }], meta: { current_page: 1, last_page: 1, per_page: 20, total: 1 } } });

        const Consumer = () => {
            const { data } = useAdminProductsQuery({ status: '', category: '', search: '', page: 1 });
            const deleteMutation = useDeleteAdminProductMutation();
            return (
                <div>
                    <span>products:{data?.products?.length ?? 'loading'}</span>
                    <button onClick={() => deleteMutation.mutate(9)}>delete</button>
                </div>
            );
        };

        withClient(<Consumer />);

        await waitFor(() => expect(screen.getByText('products:1')).toBeInTheDocument());
        expect(getMock).toHaveBeenCalledTimes(1);

        await userEvent.setup().click(screen.getByText('delete'));

        await waitFor(() => expect(getMock).toHaveBeenCalledTimes(2));
        expect(deleteMock).toHaveBeenCalledWith('/admin/products/9');
    });
});

describe('admin dispute mutation invalidation', () => {
    beforeEach(() => {
        getMock.mockReset();
        patchMock.mockClear();
    });

    it('updating a dispute status refetches the admin disputes list', async () => {
        getMock.mockResolvedValue({ data: { data: [{ id: 4 }], meta: { current_page: 1, last_page: 1, per_page: 20, total: 1 } } });

        const Consumer = () => {
            const { data } = useAdminDisputesQuery({ status: '', page: 1 });
            const updateMutation = useUpdateDisputeStatusMutation();
            return (
                <div>
                    <span>disputes:{data?.disputes?.length ?? 'loading'}</span>
                    <button onClick={() => updateMutation.mutate({ disputeId: 4, status: 'resolved' })}>resolve</button>
                </div>
            );
        };

        withClient(<Consumer />);

        await waitFor(() => expect(screen.getByText('disputes:1')).toBeInTheDocument());
        expect(getMock).toHaveBeenCalledTimes(1);

        await userEvent.setup().click(screen.getByText('resolve'));

        await waitFor(() => expect(getMock).toHaveBeenCalledTimes(2));
        expect(patchMock).toHaveBeenCalledWith('/admin/disputes/4/status', { status: 'resolved' });
    });
});
