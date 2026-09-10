// src/services/api.test.js
//
// Covers the Axios 401 interceptor in api.js — previously untested. Rather
// than reach for a network-mocking library (none is installed, and this
// task doesn't add one), this grabs the actual registered interceptor
// functions from the real `api` instance and invokes them directly with a
// synthetic error/config — the same functions axios would call on a real
// 401, just without a real network round trip. This tests the interceptor's
// real, observable side effects (localStorage, the query cache, the
// registered navigate()), not axios's own internal request/response
// machinery.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from './api';
import { queryClient } from '../lib/queryClient';
import { setNavigate } from '../utils/navigationRef';

// The 401 handler is the second response interceptor api.js registers
// (the first only tracks the global loading indicator) — always read it
// fresh rather than caching the reference, in case interceptor
// registration order ever changes.
const getResponseRejectedHandler = () => {
    const handlers = api.interceptors.response.handlers;
    return handlers[handlers.length - 1].rejected;
};

const make401Error = (url) => ({
    response: { status: 401 },
    config: { url },
});

describe('api 401 interceptor', () => {
    let navigateMock;

    beforeEach(() => {
        localStorage.clear();
        window.history.pushState({}, '', '/');
        navigateMock = vi.fn();
        setNavigate(navigateMock);
    });

    it('clears the token, clears the query cache, and redirects with return-state on a protected-endpoint 401', async () => {
        localStorage.setItem('authToken', 'expired-token');
        const clearSpy = vi.spyOn(queryClient, 'clear');

        window.history.pushState({}, '', '/app/place-order/7?qty=2');

        const rejected = getResponseRejectedHandler();
        await expect(rejected(make401Error('/orders'))).rejects.toBeDefined();

        expect(localStorage.getItem('authToken')).toBeNull();
        expect(clearSpy).toHaveBeenCalled();
        // Preserves the app's existing return-path shape (see
        // utils/authRedirect.js) so Login.jsx can resolveReturnTo() back
        // here after re-authenticating — this is the whole point of the
        // fix over the previous window.location.href hard redirect.
        expect(navigateMock).toHaveBeenCalledWith('/login', {
            state: { from: { pathname: '/app/place-order/7', search: '?qty=2' } },
            replace: true,
        });
    });

    it.each(['/login', '/register', '/forgot-password'])(
        'does not clear the token or redirect on a 401 from the auth endpoint %s',
        async (url) => {
            localStorage.setItem('authToken', 'some-token');

            const rejected = getResponseRejectedHandler();
            await expect(rejected(make401Error(url))).rejects.toBeDefined();

            expect(localStorage.getItem('authToken')).toBe('some-token');
            expect(navigateMock).not.toHaveBeenCalled();
        }
    );

    it('does not redirect when already on /login', async () => {
        window.history.pushState({}, '', '/login');
        localStorage.setItem('authToken', 'some-token');

        const rejected = getResponseRejectedHandler();
        await expect(rejected(make401Error('/user'))).rejects.toBeDefined();

        expect(navigateMock).not.toHaveBeenCalled();
        // Already on /login — the whole handling block (including the
        // token clear) is skipped, not just the redirect, since there's
        // nothing further to do from this page.
        expect(localStorage.getItem('authToken')).toBe('some-token');
    });

    it('behaves sensibly on a 401 with no token ever stored', async () => {
        localStorage.removeItem('authToken');

        const rejected = getResponseRejectedHandler();
        await expect(rejected(make401Error('/orders'))).rejects.toBeDefined();

        // Nothing to remove, but a 401 from a protected endpoint still
        // means "you need to log in" regardless of whether a (now
        // rejected) token happened to be present.
        expect(localStorage.getItem('authToken')).toBeNull();
        expect(navigateMock).toHaveBeenCalledWith('/login', expect.objectContaining({ replace: true }));
    });

    it('does not attach an Authorization header when no token is stored', () => {
        localStorage.removeItem('authToken');
        const fulfilled = api.interceptors.request.handlers[0].fulfilled;

        const config = fulfilled({ headers: {} });

        expect(config.headers.Authorization).toBeUndefined();
    });

    it('attaches the stored token as a Bearer Authorization header', () => {
        localStorage.setItem('authToken', 'abc123');
        const fulfilled = api.interceptors.request.handlers[0].fulfilled;

        const config = fulfilled({ headers: {} });

        expect(config.headers.Authorization).toBe('Bearer abc123');
    });
});
