// src/components/auth/AppleSignInButton.test.jsx
//
// Mirrors GoogleSignInButton.test.jsx: covers the same profile-completion
// branch, added identically here since Apple has the exact same gap
// (SocialAuthService never gets phone/location from either provider). A
// user missing phone/location is sent to /complete-profile (carrying along
// whatever return-to state the page was rendered with — e.g. an
// in-progress checkout) instead of straight to their normal destination; a
// user with a complete profile keeps the pre-existing behavior untouched.
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';

vi.mock('../../services/authService', () => ({
    authService: {
        getUser: vi.fn().mockRejectedValue(new Error('no session')),
        loginWithApple: vi.fn(),
    },
}));

vi.mock('../../utils/loadExternalScript', () => ({
    loadExternalScript: vi.fn().mockResolvedValue(undefined),
}));

// SERVICES_ID/REDIRECT_URI are read from import.meta.env at module load
// time — stubbed before the component module is imported, hence the
// dynamic import inside beforeAll rather than a static top-level import.
let AppleSignInButton;
let authService;

beforeAll(async () => {
    vi.stubEnv('VITE_APPLE_SERVICES_ID', 'test-apple-services-id');
    vi.stubEnv('VITE_APPLE_REDIRECT_URI', 'https://kambeng-market-frontend.vercel.app/apple/callback');
    ({ AppleSignInButton } = await import('./AppleSignInButton'));
    ({ authService } = await import('../../services/authService'));
});

const renderAt = (route) =>
    renderWithProviders(
        <Routes>
            <Route path="/login" element={<AppleSignInButton />} />
            <Route path="/complete-profile" element={<p>complete profile page</p>} />
            <Route path="/app/dashboard" element={<p>dashboard</p>} />
            <Route path="/app/admin/dashboard" element={<p>admin dashboard</p>} />
        </Routes>,
        { route }
    );

const clickAppleButton = async (user) => {
    const button = await screen.findByRole('button', { name: /Continue with Apple/i });
    await waitFor(() => expect(button).toBeEnabled());
    await user.click(button);
};

describe('AppleSignInButton — profile completion', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
        window.AppleID = {
            auth: {
                init: vi.fn(),
                signIn: vi.fn(),
            },
        };
    });

    it('sends a new Apple user missing phone/location to /complete-profile', async () => {
        window.AppleID.auth.signIn.mockResolvedValue({ authorization: { id_token: 'fake-apple-id-token' } });
        authService.loginWithApple.mockResolvedValue({
            data: {
                user: { id: 1, email: 'new@example.com', role: 'buyer', phone: null, location: null },
                token: 'tok123',
                token_type: 'Bearer',
            },
        });

        const user = userEvent.setup();
        renderAt('/login');
        await clickAppleButton(user);

        await waitFor(() => expect(screen.getByText('complete profile page')).toBeInTheDocument());
    });

    it('preserves the checkout return-to state when redirecting to /complete-profile', async () => {
        window.AppleID.auth.signIn.mockResolvedValue({ authorization: { id_token: 'fake-apple-id-token' } });
        authService.loginWithApple.mockResolvedValue({
            data: {
                user: { id: 1, email: 'new@example.com', role: 'buyer', phone: null, location: null },
                token: 'tok123',
                token_type: 'Bearer',
            },
        });

        const user = userEvent.setup();
        renderAt({ pathname: '/login', state: { from: { pathname: '/app/place-order/7', search: '' } } });
        await clickAppleButton(user);

        await waitFor(() => expect(screen.getByText('complete profile page')).toBeInTheDocument());
    });

    it('sends an Apple user with a complete profile straight to the dashboard, unchanged from before', async () => {
        window.AppleID.auth.signIn.mockResolvedValue({ authorization: { id_token: 'fake-apple-id-token' } });
        authService.loginWithApple.mockResolvedValue({
            data: {
                user: { id: 2, email: 'existing@example.com', role: 'buyer', phone: '+2207000000', location: 'Serrekunda' },
                token: 'tok456',
                token_type: 'Bearer',
            },
        });

        const user = userEvent.setup();
        renderAt('/login');
        await clickAppleButton(user);

        await waitFor(() => expect(screen.getByText('dashboard')).toBeInTheDocument());
    });

    it('sends a complete-profile admin straight to the admin dashboard, unchanged from before', async () => {
        window.AppleID.auth.signIn.mockResolvedValue({ authorization: { id_token: 'fake-apple-id-token' } });
        authService.loginWithApple.mockResolvedValue({
            data: {
                user: { id: 3, email: 'admin@example.com', role: 'admin', phone: '+2207000000', location: 'Banjul' },
                token: 'tok789',
                token_type: 'Bearer',
            },
        });

        const user = userEvent.setup();
        renderAt('/login');
        await clickAppleButton(user);

        await waitFor(() => expect(screen.getByText('admin dashboard')).toBeInTheDocument());
    });

    it('silently ignores a user-cancelled popup instead of navigating anywhere', async () => {
        window.AppleID.auth.signIn.mockRejectedValue({ error: 'popup_closed_by_user' });

        const user = userEvent.setup();
        renderAt('/login');
        await clickAppleButton(user);

        expect(authService.loginWithApple).not.toHaveBeenCalled();
        expect(screen.queryByText('complete profile page')).not.toBeInTheDocument();
        expect(screen.queryByText('dashboard')).not.toBeInTheDocument();
    });
});
