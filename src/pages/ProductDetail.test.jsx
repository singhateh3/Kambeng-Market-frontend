// src/pages/ProductDetail.test.jsx
//
// Task 12 — confirms an anonymous visitor can view a product detail page
// without ever being redirected to /login, and gets the same
// "place order" entry point a buyer would (per the approved product
// decision: browsing and starting checkout require no account).
import { screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/test-utils';
import ProductDetail from './ProductDetail';

vi.mock('../services/api', () => ({
    default: {
        get: vi.fn((url) => {
            if (url.startsWith('/products/')) {
                return Promise.resolve({
                    data: {
                        data: {
                            id: 7,
                            name: 'Fresh Mangoes',
                            category: 'Fruits',
                            price: 25,
                            unit: 'kg',
                            quantity: 10,
                            is_available: true,
                            farmer: { id: 3, name: 'Amie Farms', location: 'Brikama' },
                        },
                    },
                });
            }
            return Promise.reject(new Error(`Unexpected GET ${url}`));
        }),
    },
}));

describe('ProductDetail (anonymous visitor)', () => {
    it('renders product details without redirecting to login', async () => {
        renderWithProviders(
            <Routes>
                <Route path="/app/products/:productId" element={<ProductDetail />} />
            </Routes>,
            { route: '/app/products/7' }
        );

        await waitFor(() => expect(screen.getByText('Fresh Mangoes')).toBeInTheDocument());

        expect(screen.queryByText(/login to order/i)).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /place order/i })).toBeInTheDocument();
    });
});
