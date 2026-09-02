// src/context/AuthContext.test.jsx
//
// Task 12 — the single most important test in this pass: confirms
// AuthContext actually calls queryClient.clear() on login and logout, the
// mechanism that keeps one user's cached private data (orders, saved
// farmers, dashboard stats, ...) from ever being readable by the next
// user of the same browser tab.
import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import { queryClient } from '../lib/queryClient';
import { authService } from '../services/authService';

vi.mock('../services/authService', () => ({
    authService: {
        getUser: vi.fn(),
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
    },
}));

function Probe() {
    const { user, isLoading, login, logout } = useAuth();
    return (
        <div>
            <span data-testid="loading">{String(isLoading)}</span>
            <span data-testid="email">{user?.email || 'anon'}</span>
            <button onClick={() => login({ email: 'a@b.com', password: 'x' })}>login</button>
            <button onClick={() => logout()}>logout</button>
        </div>
    );
}

describe('AuthContext cache isolation', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('clears the query cache on login, and again on logout', async () => {
        authService.login.mockResolvedValue({
            token: 'tok123',
            user: { id: 1, email: 'a@b.com', role: 'buyer' },
        });
        authService.logout.mockResolvedValue({});

        render(
            <AuthProvider>
                <Probe />
            </AuthProvider>
        );

        // Let the mount-time refreshUser() (no token — resolves immediately,
        // no network call) settle before spying, so its own bookkeeping
        // isn't mistaken for the login/logout clears under test.
        await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));

        const clearSpy = vi.spyOn(queryClient, 'clear');

        await act(async () => {
            screen.getByText('login').click();
        });

        expect(clearSpy).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('email').textContent).toBe('a@b.com');
        expect(localStorage.getItem('authToken')).toBe('tok123');

        clearSpy.mockClear();

        await act(async () => {
            screen.getByText('logout').click();
        });

        expect(clearSpy).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('email').textContent).toBe('anon');
        expect(localStorage.getItem('authToken')).toBeNull();
    });
});
