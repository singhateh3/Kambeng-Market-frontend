// src/pages/Profile.test.jsx
//
// Covers the profile-picture section: initials fallback vs. an uploaded
// photo, the upload/remove controls, client-side validation, the loading
// state during an upload, and error/success feedback. Reuses the same
// updateProfile() -> PUT /user/profile path as the rest of the profile
// form (see AuthContext), mocked the same way CompleteProfile.test.jsx
// mocks authService.
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/test-utils';
import Profile from './Profile';

vi.mock('../services/authService', () => ({
    authService: {
        getUser: vi.fn(),
        updateProfile: vi.fn(),
    },
}));

import { authService } from '../services/authService';

const signedInAs = (user) => {
    localStorage.setItem('authToken', 'tok123');
    authService.getUser.mockResolvedValue({ data: user });
};

const baseUser = {
    id: 1,
    name: 'Ebrima Singhateh',
    email: 'ebrima@example.com',
    role: 'buyer',
    phone: '+2207000000',
    location: 'Serrekunda',
    avatar: null,
};

const getFileInput = () => document.querySelector('input[type="file"]');

describe('Profile avatar', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('shows initials when the user has no avatar', async () => {
        signedInAs(baseUser);
        renderWithProviders(<Profile />);

        await waitFor(() => expect(screen.getByText('Add photo')).toBeInTheDocument());
        expect(screen.getByText('ES')).toBeInTheDocument();
        expect(document.querySelector('img')).not.toBeInTheDocument();
        // Nothing to remove yet.
        expect(screen.queryByText('Remove')).not.toBeInTheDocument();
    });

    it('shows the avatar image when the user has one', async () => {
        signedInAs({ ...baseUser, avatar: 'https://example.com/photo.jpg' });
        renderWithProviders(<Profile />);

        await waitFor(() =>
            expect(screen.getByRole('img', { name: /avatar/i })).toHaveAttribute('src', 'https://example.com/photo.jpg')
        );
        expect(screen.getByText('Change photo')).toBeInTheDocument();
        expect(screen.getByText('Remove')).toBeInTheDocument();
    });

    it('falls back to initials when the avatar URL is broken', async () => {
        signedInAs({ ...baseUser, avatar: 'https://example.com/broken.jpg' });
        renderWithProviders(<Profile />);

        const img = await screen.findByRole('img', { name: /avatar/i });
        fireEvent.error(img);

        expect(await screen.findByText('ES')).toBeInTheDocument();
    });

    it('uploads a selected photo via the same profile-update endpoint and reflects the new avatar', async () => {
        signedInAs(baseUser);
        authService.updateProfile.mockResolvedValue({
            data: { ...baseUser, avatar: 'https://example.com/new.jpg' },
        });

        renderWithProviders(<Profile />);
        await waitFor(() => expect(screen.getByText('Add photo')).toBeInTheDocument());

        const file = new File(['fake-image-bytes'], 'avatar.jpg', { type: 'image/jpeg' });
        const user = userEvent.setup();
        await user.upload(getFileInput(), file);

        expect(authService.updateProfile).toHaveBeenCalledTimes(1);
        const sentFormData = authService.updateProfile.mock.calls[0][0];
        expect(sentFormData).toBeInstanceOf(FormData);
        expect(sentFormData.get('avatar')).toBe(file);

        await waitFor(() =>
            expect(screen.getByRole('img', { name: /avatar/i })).toHaveAttribute('src', 'https://example.com/new.jpg')
        );
        expect(await screen.findByText('Profile picture updated!')).toBeInTheDocument();
    });

    it('shows a loading state while the upload is in flight', async () => {
        signedInAs(baseUser);
        let resolveUpload;
        authService.updateProfile.mockReturnValue(new Promise((resolve) => { resolveUpload = resolve; }));

        renderWithProviders(<Profile />);
        await waitFor(() => expect(screen.getByText('Add photo')).toBeInTheDocument());

        const file = new File(['fake'], 'avatar.jpg', { type: 'image/jpeg' });
        const user = userEvent.setup();
        await user.upload(getFileInput(), file);

        await waitFor(() => expect(getFileInput()).toBeDisabled());

        resolveUpload({ data: { ...baseUser, avatar: 'https://example.com/new.jpg' } });
        await waitFor(() => expect(screen.getByText('Change photo')).toBeInTheDocument());
        expect(getFileInput()).not.toBeDisabled();
    });

    it('rejects an oversized file client-side without calling the API', async () => {
        signedInAs(baseUser);
        renderWithProviders(<Profile />);
        await waitFor(() => expect(screen.getByText('Add photo')).toBeInTheDocument());

        const bigFile = new File([new ArrayBuffer(6 * 1024 * 1024)], 'big.jpg', { type: 'image/jpeg' });
        const user = userEvent.setup();
        await user.upload(getFileInput(), bigFile);

        expect(await screen.findByText('Image must be smaller than 5MB.')).toBeInTheDocument();
        expect(authService.updateProfile).not.toHaveBeenCalled();
    });

    it('rejects an unsupported file type client-side', async () => {
        signedInAs(baseUser);
        renderWithProviders(<Profile />);
        await waitFor(() => expect(screen.getByText('Add photo')).toBeInTheDocument());

        // userEvent.upload() itself respects the input's `accept` attribute
        // and silently refuses a mismatched file — fireEvent bypasses that
        // browser-level filtering so this test actually reaches (and
        // verifies) the component's own JS validation, not just the HTML
        // attribute.
        const gif = new File(['fake'], 'avatar.gif', { type: 'image/gif' });
        fireEvent.change(getFileInput(), { target: { files: [gif] } });

        expect(await screen.findByText('Please upload a JPEG, PNG, or WebP image.')).toBeInTheDocument();
        expect(authService.updateProfile).not.toHaveBeenCalled();
    });

    it('shows an API error message when the upload fails', async () => {
        signedInAs(baseUser);
        authService.updateProfile.mockRejectedValue({
            response: { data: { message: 'Could not upload your photo right now. Please try again.' } },
        });

        renderWithProviders(<Profile />);
        await waitFor(() => expect(screen.getByText('Add photo')).toBeInTheDocument());

        const file = new File(['fake'], 'avatar.jpg', { type: 'image/jpeg' });
        const user = userEvent.setup();
        await user.upload(getFileInput(), file);

        expect(await screen.findByText('Could not upload your photo right now. Please try again.')).toBeInTheDocument();
    });

    it('removes the avatar when Remove is clicked', async () => {
        signedInAs({ ...baseUser, avatar: 'https://example.com/photo.jpg' });
        authService.updateProfile.mockResolvedValue({ data: { ...baseUser, avatar: null } });

        renderWithProviders(<Profile />);
        await waitFor(() => expect(screen.getByText('Remove')).toBeInTheDocument());

        const user = userEvent.setup();
        await user.click(screen.getByText('Remove'));

        expect(authService.updateProfile).toHaveBeenCalledWith({ remove_avatar: true });
        await waitFor(() => expect(screen.getByText('Add photo')).toBeInTheDocument());
        expect(await screen.findByText('Profile picture removed.')).toBeInTheDocument();
    });
});
