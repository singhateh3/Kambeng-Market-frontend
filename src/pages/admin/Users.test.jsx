// src/pages/admin/Users.test.jsx
//
// Phase 3B fix: admin user removal is now deactivation, not destructive
// hard deletion. Covers the updated copy/behavior and the bulk operation's
// switch to Promise.allSettled (same pattern already proven for
// FarmerVerification's bulk-reject) — one failure must not silently
// report false success for the whole batch.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Users from './Users';

const renderPage = () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(
        <QueryClientProvider client={queryClient}>
            <Users />
        </QueryClientProvider>
    );
};

vi.mock('../../hooks/useAuth', () => ({
    useAuth: () => ({ user: { id: 99, role: 'admin' }, isAuthenticated: true }),
}));

const getMock = vi.fn();
const deleteMock = vi.fn();

vi.mock('../../services/api', () => ({
    default: {
        get: (...args) => getMock(...args),
        delete: (...args) => deleteMock(...args),
        put: vi.fn(),
        post: vi.fn(),
    },
}));

const users = [
    { id: 1, name: 'Buyer One', email: 'one@example.com', role: 'buyer', created_at: '2026-01-01T00:00:00.000000Z' },
    { id: 2, name: 'Buyer Two', email: 'two@example.com', role: 'buyer', created_at: '2026-01-01T00:00:00.000000Z' },
];

const setupGetMock = () => {
    getMock.mockResolvedValue({
        data: { data: users, meta: { current_page: 1, last_page: 1, per_page: 20, total: users.length } },
    });
};

describe('admin Users — deactivation', () => {
    beforeEach(() => {
        getMock.mockReset();
        deleteMock.mockReset();
        vi.spyOn(window, 'confirm').mockReturnValue(true);
        setupGetMock();
    });

    it('deactivates a single user and shows the server-provided message', async () => {
        deleteMock.mockResolvedValue({ data: { success: true, message: 'User deactivated successfully' } });

        renderPage();

        await waitFor(() => expect(screen.getByText('Buyer One')).toBeInTheDocument());

        const row = screen.getByText('Buyer One').closest('tr');
        await userEvent.setup().click(within(row).getByRole('button', { name: /deactivate/i }));
        await userEvent.setup().click(screen.getByRole('button', { name: /deactivate user/i }));

        expect(deleteMock).toHaveBeenCalledWith('/admin/users/1');
        await waitFor(() => expect(screen.getByText('User deactivated successfully')).toBeInTheDocument());
    });

    it('surfaces a settlement-deferred message from the server without hardcoding it client-side', async () => {
        deleteMock.mockResolvedValue({
            data: {
                success: true,
                message: 'User deactivated successfully. Settlement details were retained because a payout for this farmer is still pending release.',
            },
        });

        renderPage();

        await waitFor(() => expect(screen.getByText('Buyer One')).toBeInTheDocument());
        const row = screen.getByText('Buyer One').closest('tr');
        await userEvent.setup().click(within(row).getByRole('button', { name: /deactivate/i }));
        await userEvent.setup().click(screen.getByRole('button', { name: /deactivate user/i }));

        await waitFor(() => expect(screen.getByText(/pending release/i)).toBeInTheDocument());
    });

    it('bulk-deactivates all selected users concurrently and reports full success', async () => {
        deleteMock.mockResolvedValue({ data: { success: true } });

        renderPage();

        await waitFor(() => expect(screen.getByText('Buyer One')).toBeInTheDocument());

        const checkboxes = screen.getAllByRole('checkbox');
        // First checkbox is "select all" in the header — select the two
        // per-row checkboxes explicitly instead.
        await userEvent.setup().click(checkboxes[1]);
        await userEvent.setup().click(checkboxes[2]);

        await userEvent.setup().click(screen.getByRole('button', { name: /deactivate selected \(2\)/i }));

        expect(deleteMock).toHaveBeenCalledWith('/admin/users/1');
        expect(deleteMock).toHaveBeenCalledWith('/admin/users/2');
        expect(deleteMock).toHaveBeenCalledTimes(2);
        await waitFor(() => expect(screen.getByText('2 users deactivated successfully')).toBeInTheDocument());
    });

    it('reports partial bulk failure instead of a false blanket success', async () => {
        deleteMock.mockImplementation((url) => {
            if (url === '/admin/users/2') {
                return Promise.reject({ response: { data: { message: 'Cannot deactivate' } } });
            }
            return Promise.resolve({ data: { success: true } });
        });

        renderPage();

        await waitFor(() => expect(screen.getByText('Buyer One')).toBeInTheDocument());

        const checkboxes = screen.getAllByRole('checkbox');
        await userEvent.setup().click(checkboxes[1]);
        await userEvent.setup().click(checkboxes[2]);
        await userEvent.setup().click(screen.getByRole('button', { name: /deactivate selected \(2\)/i }));

        // Both attempted — one user's failure didn't stop the other.
        await waitFor(() => expect(deleteMock).toHaveBeenCalledTimes(2));
        await waitFor(() => expect(screen.getByText(/deactivated 1 user, but 1 failed/i)).toBeInTheDocument());
        expect(screen.queryByText('2 users deactivated successfully')).not.toBeInTheDocument();
    });
});
