// src/pages/Browse.test.jsx
//
// Task 12 — confirms an anonymous visitor can render and use the
// marketplace list without being redirected to /login.
import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/test-utils';
import Browse from './Browse';

vi.mock('../services/api', () => ({
    default: {
        get: vi.fn((url) => {
            if (url.startsWith('/products?')) {
                return Promise.resolve({
                    data: {
                        data: [{
                            id: 1,
                            name: 'Fresh Mangoes',
                            category: 'Fruits',
                            price: 25,
                            unit: 'kg',
                            quantity: 10,
                            is_available: true,
                            farmer: { name: 'Amie Farms' },
                        }],
                        meta: { current_page: 1, last_page: 1, per_page: 20, total: 1 },
                    },
                });
            }
            if (url === '/products/categories') return Promise.resolve({ data: { data: ['Fruits'] } });
            if (url === '/products/regions') return Promise.resolve({ data: { data: ['West Coast'] } });
            return Promise.reject(new Error(`Unexpected GET ${url}`));
        }),
    },
}));

describe('Browse (anonymous visitor)', () => {
    it('renders the product list without redirecting to login', async () => {
        renderWithProviders(<Browse />, { route: '/app/browse' });

        await waitFor(() => expect(screen.getByText('Fresh Mangoes')).toBeInTheDocument());

        // Anonymous visitors get the same order entry point a buyer would.
        expect(screen.getByRole('button', { name: /place order/i })).toBeInTheDocument();
    });
});
