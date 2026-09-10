// src/pages/Home.test.jsx
//
// Covers the fix for the audit finding that Home made a raw, uncached
// Axios request to /public/statistics from a useEffect on every mount.
// Statistics now goes through TanStack Query (usePublicStatisticsQuery)
// with a stable key, so (a) it must not block the static/product content
// from rendering, and (b) a second mount sharing the same QueryClient
// must reuse the cached response instead of firing a new network call.
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import Home from './Home';

const statisticsResponse = {
    data: {
        data: {
            products: { active: 42 },
            users: { farmers: 7 },
            orders: { total: 99 },
            reviews: { average_rating: 4.7 },
        },
    },
};

vi.mock('../services/api', () => ({
    default: {
        get: vi.fn((url) => {
            if (url === '/public/statistics') return Promise.resolve(statisticsResponse);
            if (url.startsWith('/products?')) return Promise.resolve({ data: { data: [] } });
            if (url === '/products/categories') return Promise.resolve({ data: { data: [] } });
            return Promise.reject(new Error(`Unexpected GET ${url}`));
        }),
    },
}));

import api from '../services/api';

const renderHome = (queryClient) =>
    render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/']}>
                <ThemeProvider>
                    <AuthProvider>
                        <Home />
                    </AuthProvider>
                </ThemeProvider>
            </MemoryRouter>
        </QueryClientProvider>
    );

describe('Home statistics', () => {
    beforeEach(() => {
        api.get.mockClear();
    });

    it('renders the static hero/featured content without waiting on statistics', async () => {
        const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
        renderHome(queryClient);

        // The hero heading is static and must not be gated behind the
        // statistics fetch — it only depends on products/categories.
        await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/no middlemen/i));
    });

    it('does not issue a fresh statistics request on a second mount sharing the query cache', async () => {
        const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

        const { unmount } = renderHome(queryClient);
        await waitFor(() => expect(api.get).toHaveBeenCalledWith('/public/statistics', expect.anything()));
        const callsAfterFirstMount = api.get.mock.calls.filter(([url]) => url === '/public/statistics').length;
        expect(callsAfterFirstMount).toBe(1);

        unmount();
        renderHome(queryClient);

        await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/no middlemen/i));
        const callsAfterSecondMount = api.get.mock.calls.filter(([url]) => url === '/public/statistics').length;
        // Cached (staleTime not yet elapsed) — no second network call.
        expect(callsAfterSecondMount).toBe(1);
    });
});
