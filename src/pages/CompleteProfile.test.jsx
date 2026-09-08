// src/pages/CompleteProfile.test.jsx
//
// Covers the post-Google-sign-in profile-completion gate: a user missing
// phone/location sees the form (pre-filled with whatever's already on the
// account), submitting it goes through the same PUT /user/profile path the
// full Profile page uses, and afterward the user lands wherever they were
// actually headed — including back at checkout, not just the dashboard. A
// user who already has both fields never sees the form at all.
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/test-utils';
import CompleteProfile from './CompleteProfile';

vi.mock('../services/authService', () => ({
    authService: {
        getUser: vi.fn(),
        updateProfile: vi.fn(),
    },
}));

import { authService } from '../services/authService';

const renderAt = (route) =>
    renderWithProviders(
        <Routes>
            <Route path="/complete-profile" element={<CompleteProfile />} />
            <Route path="/app/dashboard" element={<p>dashboard</p>} />
            <Route path="/app/place-order/:productId" element={<p>place order page</p>} />
        </Routes>,
        { route }
    );

const signedInAs = (user) => {
    localStorage.setItem('authToken', 'tok123');
    authService.getUser.mockResolvedValue({ data: user });
};

describe('CompleteProfile', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('shows the form, empty, for a user missing both phone and location', async () => {
        signedInAs({ id: 1, name: 'New Buyer', email: 'new@example.com', role: 'buyer', phone: null, location: null });

        renderAt('/complete-profile');

        await waitFor(() => expect(screen.getByPlaceholderText('Enter your phone number')).toHaveValue(''));
        expect(screen.getByPlaceholderText('Enter your location')).toHaveValue('');
    });

    it('pre-fills whichever of phone/location is already on the account', async () => {
        signedInAs({ id: 1, name: 'Partial', email: 'p@example.com', role: 'buyer', phone: '+2207000000', location: null });

        renderAt('/complete-profile');

        await waitFor(() => expect(screen.getByPlaceholderText('Enter your phone number')).toHaveValue('+2207000000'));
        expect(screen.getByPlaceholderText('Enter your location')).toHaveValue('');
    });

    it('requires both fields and never calls the backend with either blank', async () => {
        signedInAs({ id: 1, name: 'New Buyer', email: 'new@example.com', role: 'buyer', phone: null, location: null });

        const user = userEvent.setup();
        renderAt('/complete-profile');
        await waitFor(() => expect(screen.getByPlaceholderText('Enter your phone number')).toBeInTheDocument());

        await user.click(screen.getByRole('button', { name: 'Continue' }));

        expect(await screen.findByText('Phone number is required')).toBeInTheDocument();
        expect(screen.getByText('Location is required')).toBeInTheDocument();
        expect(authService.updateProfile).not.toHaveBeenCalled();
    });

    it('saves phone/location via the normal profile-update endpoint and returns to the dashboard', async () => {
        signedInAs({ id: 1, name: 'New Buyer', email: 'new@example.com', role: 'buyer', phone: null, location: null });
        authService.updateProfile.mockResolvedValue({
            data: { id: 1, name: 'New Buyer', email: 'new@example.com', role: 'buyer', phone: '+2207000000', location: 'Serrekunda' },
        });

        const user = userEvent.setup();
        renderAt('/complete-profile');
        await waitFor(() => expect(screen.getByPlaceholderText('Enter your phone number')).toBeInTheDocument());

        await user.type(screen.getByPlaceholderText('Enter your phone number'), '+2207000000');
        await user.type(screen.getByPlaceholderText('Enter your location'), 'Serrekunda');
        await user.click(screen.getByRole('button', { name: 'Continue' }));

        expect(authService.updateProfile).toHaveBeenCalledWith({ phone: '+2207000000', location: 'Serrekunda' });
        await waitFor(() => expect(screen.getByText('dashboard')).toBeInTheDocument());
    });

    it('returns to checkout instead of the dashboard when that was the saved destination', async () => {
        signedInAs({ id: 1, name: 'New Buyer', email: 'new@example.com', role: 'buyer', phone: null, location: null });
        authService.updateProfile.mockResolvedValue({
            data: { id: 1, name: 'New Buyer', email: 'new@example.com', role: 'buyer', phone: '+2207000000', location: 'Serrekunda' },
        });

        const user = userEvent.setup();
        renderAt({ pathname: '/complete-profile', state: { from: { pathname: '/app/place-order/9', search: '' } } });
        await waitFor(() => expect(screen.getByPlaceholderText('Enter your phone number')).toBeInTheDocument());

        await user.type(screen.getByPlaceholderText('Enter your phone number'), '+2207000000');
        await user.type(screen.getByPlaceholderText('Enter your location'), 'Serrekunda');
        await user.click(screen.getByRole('button', { name: 'Continue' }));

        await waitFor(() => expect(screen.getByText('place order page')).toBeInTheDocument());
    });

    it('surfaces backend validation errors instead of navigating away', async () => {
        signedInAs({ id: 1, name: 'New Buyer', email: 'new@example.com', role: 'buyer', phone: null, location: null });
        authService.updateProfile.mockRejectedValue({
            response: { data: { message: 'Please fix the errors below.', errors: { phone: ['The phone field must not be greater than 20 characters.'] } } },
        });

        const user = userEvent.setup();
        renderAt('/complete-profile');
        await waitFor(() => expect(screen.getByPlaceholderText('Enter your phone number')).toBeInTheDocument());

        await user.type(screen.getByPlaceholderText('Enter your phone number'), '012345678901234567890');
        await user.type(screen.getByPlaceholderText('Enter your location'), 'Serrekunda');
        await user.click(screen.getByRole('button', { name: 'Continue' }));

        expect(await screen.findByText('The phone field must not be greater than 20 characters.')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter your phone number')).toBeInTheDocument();
    });

    it('skips the form entirely for a user who already has phone + location', async () => {
        signedInAs({ id: 1, name: 'Complete', email: 'c@example.com', role: 'buyer', phone: '+2207000000', location: 'Serrekunda' });

        renderAt('/complete-profile');

        await waitFor(() => expect(screen.getByText('dashboard')).toBeInTheDocument());
        expect(screen.queryByPlaceholderText('Enter your phone number')).not.toBeInTheDocument();
    });
});
