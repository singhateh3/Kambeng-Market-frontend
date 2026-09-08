// src/components/auth/GoogleSignInButton.test.jsx
//
// Covers the profile-completion branch added to the Google credential
// handler: a user missing phone/location is sent to /complete-profile
// (carrying along whatever return-to state the page was rendered with —
// e.g. an in-progress checkout) instead of straight to their normal
// destination; a user with a complete profile keeps the pre-existing
// behavior untouched.
import { act, screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';

vi.mock('../../services/authService', () => ({
    authService: {
        getUser: vi.fn().mockRejectedValue(new Error('no session')),
        loginWithGoogle: vi.fn(),
    },
}));

vi.mock('../../utils/loadExternalScript', () => ({
    loadExternalScript: vi.fn().mockResolvedValue(undefined),
}));

// CLIENT_ID is read from import.meta.env at module load time — it has to be
// stubbed before the component module is imported, hence the dynamic
// import inside beforeAll rather than a static top-level import.
let GoogleSignInButton;
let authService;

beforeAll(async () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-google-client-id');
    ({ GoogleSignInButton } = await import('./GoogleSignInButton'));
    ({ authService } = await import('../../services/authService'));
});

const triggerGoogleCredential = async (credential = 'fake-id-token') => {
    await waitFor(() => expect(window.google.accounts.id.initialize).toHaveBeenCalled());
    const { callback } = window.google.accounts.id.initialize.mock.calls[0][0];
    await act(async () => {
        await callback({ credential });
    });
};

const renderAt = (route) =>
    renderWithProviders(
        <Routes>
            <Route path="/login" element={<GoogleSignInButton />} />
            <Route path="/complete-profile" element={<p>complete profile page</p>} />
            <Route path="/app/dashboard" element={<p>dashboard</p>} />
            <Route path="/app/admin/dashboard" element={<p>admin dashboard</p>} />
        </Routes>,
        { route }
    );

describe('GoogleSignInButton — profile completion', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
        window.google = {
            accounts: {
                id: {
                    initialize: vi.fn(),
                    renderButton: vi.fn(),
                },
            },
        };
    });

    it('sends a new Google user missing phone/location to /complete-profile', async () => {
        authService.loginWithGoogle.mockResolvedValue({
            data: {
                user: { id: 1, email: 'new@example.com', role: 'buyer', phone: null, location: null },
                token: 'tok123',
                token_type: 'Bearer',
            },
        });

        renderAt('/login');
        await triggerGoogleCredential();

        await waitFor(() => expect(screen.getByText('complete profile page')).toBeInTheDocument());
    });

    it('preserves the checkout return-to state when redirecting to /complete-profile', async () => {
        authService.loginWithGoogle.mockResolvedValue({
            data: {
                user: { id: 1, email: 'new@example.com', role: 'buyer', phone: null, location: null },
                token: 'tok123',
                token_type: 'Bearer',
            },
        });

        // Location captured by the effect is a snapshot at mount, matching
        // the pre-existing eslint-disabled `[]` dependency array — this is
        // exactly the state PlaceOrder hands /login when an anonymous
        // buyer is bounced there mid-checkout (see authRedirect.js).
        renderAt({ pathname: '/login', state: { from: { pathname: '/app/place-order/7', search: '' } } });
        await triggerGoogleCredential();

        await waitFor(() => expect(screen.getByText('complete profile page')).toBeInTheDocument());
    });

    it('sends a Google user with a complete profile straight to the dashboard, unchanged from before', async () => {
        authService.loginWithGoogle.mockResolvedValue({
            data: {
                user: { id: 2, email: 'existing@example.com', role: 'buyer', phone: '+2207000000', location: 'Serrekunda' },
                token: 'tok456',
                token_type: 'Bearer',
            },
        });

        renderAt('/login');
        await triggerGoogleCredential();

        await waitFor(() => expect(screen.getByText('dashboard')).toBeInTheDocument());
    });

    it('sends a complete-profile admin straight to the admin dashboard, unchanged from before', async () => {
        authService.loginWithGoogle.mockResolvedValue({
            data: {
                user: { id: 3, email: 'admin@example.com', role: 'admin', phone: '+2207000000', location: 'Banjul' },
                token: 'tok789',
                token_type: 'Bearer',
            },
        });

        renderAt('/login');
        await triggerGoogleCredential();

        await waitFor(() => expect(screen.getByText('admin dashboard')).toBeInTheDocument());
    });

    it('returns a complete Google user directly to checkout, bypassing /complete-profile', async () => {
        authService.loginWithGoogle.mockResolvedValue({
            data: {
                user: { id: 2, email: 'existing@example.com', role: 'buyer', phone: '+2207000000', location: 'Serrekunda' },
                token: 'tok456',
                token_type: 'Bearer',
            },
        });

        renderAt({ pathname: '/login', state: { from: { pathname: '/app/dashboard', search: '' } } });
        await triggerGoogleCredential();

        await waitFor(() => expect(screen.getByText('dashboard')).toBeInTheDocument());
        expect(screen.queryByText('complete profile page')).not.toBeInTheDocument();
    });
});
