// src/pages/buyer/PlaceOrder.checkout-flow.test.jsx
//
// Task 12 review — the full anonymous checkout round trip: guest fills the
// form, submits, gets bounced to /login with the form stashed instead of
// hitting the API, "authenticates," returns to a pre-filled form, and only
// actually places the order on an explicit second submit.
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '../../hooks/useAuth';
import { readPendingCheckout } from '../../utils/pendingCheckout';
import { renderWithProviders } from '../../test/test-utils';
import PlaceOrder from './PlaceOrder';

const product = {
    id: 7,
    name: 'Fresh Mangoes',
    category: 'Fruits',
    price: 25,
    price_formatted: 'GMD 25',
    unit: 'kg',
    quantity: 10,
    is_available: true,
    farmer: { id: 3, name: 'Amie Farms', location: 'Brikama' },
};

const getMock = vi.fn((url) => {
    if (url === '/products/7') return Promise.resolve({ data: { data: product } });
    return Promise.reject(new Error(`Unexpected GET ${url}`));
});
const postMock = vi.fn((url) => {
    if (url === '/orders') {
        return Promise.resolve({
            data: { success: true, data: { order_id: 99, payment_link: 'https://pay.modempay.com/intent/abc123', status: 'awaiting_payment' } },
        });
    }
    return Promise.reject(new Error(`Unexpected POST ${url}`));
});

vi.mock('../../services/api', () => ({
    default: {
        get: (...args) => getMock(...args),
        post: (...args) => postMock(...args),
    },
}));

vi.mock('../../services/authService', () => ({
    authService: {
        getUser: vi.fn().mockRejectedValue(new Error('no session')),
        login: vi.fn().mockResolvedValue({
            data: { user: { id: 1, email: 'buyer@example.com', role: 'buyer' }, token: 'tok123', token_type: 'Bearer' },
        }),
        register: vi.fn(),
        logout: vi.fn().mockResolvedValue({}),
    },
}));

// Minimal stand-in for /login — exercises the same buildReturnState/
// resolveReturnTo mechanism the real Login.jsx uses, without pulling in
// its full form/validation surface (already covered by authRedirect.test.js
// and Login.jsx's own behavior).
const StubLoginPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleFakeLogin = async () => {
        await login({ email: 'buyer@example.com', password: 'x' });
        const fallback = '/app/dashboard';
        const from = location.state?.from;
        navigate(from ? `${from.pathname}${from.search || ''}` : fallback);
    };

    return (
        <div>
            <p>login page</p>
            <p data-testid="return-to">{location.state?.from?.pathname || 'none'}</p>
            <button onClick={handleFakeLogin}>simulate successful login</button>
        </div>
    );
};

const renderCheckoutFlow = () =>
    renderWithProviders(
        <Routes>
            <Route path="/app/place-order/:productId" element={<PlaceOrder />} />
            <Route path="/login" element={<StubLoginPage />} />
        </Routes>,
        { route: '/app/place-order/7' }
    );

describe('Anonymous checkout round trip', () => {
    beforeEach(() => {
        localStorage.clear();
        getMock.mockClear();
        postMock.mockClear();
        // jsdom doesn't implement real navigation — stub location.href so
        // the ModemPay redirect (window.location.href = payment_link) is
        // just an assignment we can assert on, not a "not implemented" error.
        delete window.location;
        window.location = { href: '' };
    });

    it('stashes the form, redirects to login, restores on return, and only submits on an explicit second click', async () => {
        const user = userEvent.setup();
        renderCheckoutFlow();

        await waitFor(() => expect(screen.getByRole('heading', { name: 'Fresh Mangoes' })).toBeInTheDocument());

        const instructions = screen.getByPlaceholderText(/any notes for the farmer/i);
        await user.type(instructions, 'Leave at the gate please');

        await user.click(screen.getByRole('button', { name: 'Place order' }));

        // 1) Never called the API while anonymous.
        expect(postMock).not.toHaveBeenCalled();

        // 2) Pending checkout was saved with what was typed.
        const pending = readPendingCheckout('7');
        expect(pending).not.toBeNull();
        expect(pending.special_instructions).toBe('Leave at the gate please');

        // 3) Navigated to /login with a safe internal return location.
        await waitFor(() => expect(screen.getByText('login page')).toBeInTheDocument());
        expect(screen.getByTestId('return-to').textContent).toBe('/app/place-order/7');

        // 4) Simulate successful authentication.
        await user.click(screen.getByRole('button', { name: /simulate successful login/i }));

        // 5) Back on PlaceOrder, with the product re-fetched/current and the
        //    form restored — and still no automatic order submission.
        await waitFor(() => expect(screen.getByRole('heading', { name: 'Fresh Mangoes' })).toBeInTheDocument());
        expect(getMock).toHaveBeenCalledWith('/products/7', expect.anything());
        await waitFor(() =>
            expect(screen.getByPlaceholderText(/any notes for the farmer/i)).toHaveValue('Leave at the gate please')
        );
        expect(postMock).not.toHaveBeenCalled();

        // 6) Only now, on an explicit click, does the real order get placed.
        await user.click(screen.getByRole('button', { name: 'Place order' }));

        await waitFor(() => expect(postMock).toHaveBeenCalledTimes(1));
        expect(postMock).toHaveBeenCalledWith(
            '/orders',
            expect.objectContaining({ product_id: 7, special_instructions: 'Leave at the gate please' })
        );

        // 7) Pending checkout state is cleared after the order is created.
        expect(readPendingCheckout('7')).toBeNull();

        // 8) Buyer is sent straight to ModemPay's hosted checkout — no
        //    "order placed" screen, since the order isn't real until paid.
        await waitFor(() => expect(window.location.href).toBe('https://pay.modempay.com/intent/abc123'));
    });
});
