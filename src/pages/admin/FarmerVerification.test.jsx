// src/pages/admin/FarmerVerification.test.jsx
//
// Phase 3A P1 fix: bulk-reject switched from a sequential `for...of` loop
// of awaited POSTs to Promise.allSettled — same endpoint/payload per
// farmer (no backend bulk-reject endpoint exists), but concurrent, and
// reporting the actual per-farmer outcome instead of one failure aborting
// the whole operation with no indication of which requests actually went
// through.
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import FarmerVerification from './FarmerVerification';

const refreshUser = vi.fn().mockResolvedValue();

vi.mock('../../hooks/useAuth', () => ({
    useAuth: () => ({ refreshUser }),
}));

const getMock = vi.fn();
const postMock = vi.fn();

vi.mock('../../services/api', () => ({
    default: {
        get: (...args) => getMock(...args),
        post: (...args) => postMock(...args),
    },
}));

const pendingFarmers = [
    { id: 1, name: 'Farmer One', email: 'one@example.com', location: 'Banjul', verification_status: 'pending', verification_requested_at: '2026-01-01T00:00:00.000000Z' },
    { id: 2, name: 'Farmer Two', email: 'two@example.com', location: 'Serrekunda', verification_status: 'pending', verification_requested_at: '2026-01-01T00:00:00.000000Z' },
];

const setupGetMock = () => {
    getMock.mockImplementation((url) => {
        if (url.startsWith('/admin/farmers/verification/statistics')) {
            return Promise.resolve({ data: { data: { pending: 2, approved: 0, rejected: 0 } } });
        }
        if (url.startsWith('/admin/farmers?')) {
            return Promise.resolve({
                data: { data: pendingFarmers, meta: { current_page: 1, last_page: 1, per_page: 20, total: 2 } },
            });
        }
        return Promise.reject(new Error(`Unexpected GET ${url}`));
    });
};

const selectAllPendingFarmers = async () => {
    const rows = screen.getAllByRole('row').slice(1); // drop the header row
    for (const row of rows) {
        await userEvent.setup().click(within(row).getByRole('checkbox'));
    }
};

describe('FarmerVerification bulk reject', () => {
    beforeEach(() => {
        getMock.mockReset();
        postMock.mockReset();
        refreshUser.mockClear();
        setupGetMock();
    });

    it('rejects all selected farmers concurrently and reports full success', async () => {
        postMock.mockResolvedValue({ data: { success: true } });

        render(<FarmerVerification />);

        await waitFor(() => expect(screen.getByText('Farmer One')).toBeInTheDocument());
        await selectAllPendingFarmers();

        await userEvent.setup().click(screen.getByRole('button', { name: /reject selected \(2\)/i }));
        await userEvent.setup().type(screen.getByPlaceholderText('Please provide a reason for rejection...'), 'Incomplete documents');
        await userEvent.setup().click(screen.getByRole('button', { name: /reject all \(2\)/i }));

        await waitFor(() => expect(screen.getByText('2 farmers rejected successfully!')).toBeInTheDocument());

        expect(postMock).toHaveBeenCalledWith('/admin/farmers/verification/1/reject', { reason: 'Incomplete documents' });
        expect(postMock).toHaveBeenCalledWith('/admin/farmers/verification/2/reject', { reason: 'Incomplete documents' });
        expect(postMock).toHaveBeenCalledTimes(2);

        // Selection cleared — the bulk-action buttons disappear.
        expect(screen.queryByRole('button', { name: /reject selected/i })).not.toBeInTheDocument();
    });

    it('reports partial failure instead of a false blanket success or a silent abort', async () => {
        postMock.mockImplementation((url) => {
            if (url === '/admin/farmers/verification/2/reject') {
                return Promise.reject({ response: { data: { message: 'Already reviewed' } } });
            }
            return Promise.resolve({ data: { success: true } });
        });

        render(<FarmerVerification />);

        await waitFor(() => expect(screen.getByText('Farmer One')).toBeInTheDocument());
        await selectAllPendingFarmers();

        await userEvent.setup().click(screen.getByRole('button', { name: /reject selected \(2\)/i }));
        await userEvent.setup().type(screen.getByPlaceholderText('Please provide a reason for rejection...'), 'Incomplete documents');
        await userEvent.setup().click(screen.getByRole('button', { name: /reject all \(2\)/i }));

        // Both requests were still attempted — the failure of one didn't
        // stop the other from firing (the old sequential loop would have
        // stopped at whichever farmer failed first).
        await waitFor(() => expect(postMock).toHaveBeenCalledTimes(2));

        // Reports the real mixed outcome, not "2 farmers rejected successfully!".
        await waitFor(() => expect(screen.getByText(/rejected 1 farmer, but 1 failed/i)).toBeInTheDocument());
        expect(screen.queryByText('2 farmers rejected successfully!')).not.toBeInTheDocument();
    });
});
