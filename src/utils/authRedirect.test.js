// src/utils/authRedirect.test.js
import { describe, expect, it } from 'vitest';
import { buildReturnState, resolveReturnTo } from './authRedirect';

describe('authRedirect', () => {
    describe('buildReturnState', () => {
        it('captures pathname and search from a location', () => {
            const state = buildReturnState({ pathname: '/app/browse', search: '?category=Fruits' });
            expect(state).toEqual({ from: { pathname: '/app/browse', search: '?category=Fruits' } });
        });
    });

    describe('resolveReturnTo', () => {
        it('returns the fallback when there is no stored state', () => {
            expect(resolveReturnTo(undefined, '/app/dashboard')).toBe('/app/dashboard');
            expect(resolveReturnTo(null, '/app/dashboard')).toBe('/app/dashboard');
            expect(resolveReturnTo({}, '/app/dashboard')).toBe('/app/dashboard');
        });

        it('returns the stored internal path plus its search string', () => {
            const state = { from: { pathname: '/app/place-order/7', search: '' } };
            expect(resolveReturnTo(state, '/app/dashboard')).toBe('/app/place-order/7');
        });

        it('preserves a query string on the stored path', () => {
            const state = { from: { pathname: '/app/browse', search: '?category=Fruits' } };
            expect(resolveReturnTo(state, '/app/dashboard')).toBe('/app/browse?category=Fruits');
        });

        // Never trust arbitrary external redirect targets — only an
        // internal, root-relative path is ever navigated to.
        it('falls back for a protocol-relative path (open-redirect attempt)', () => {
            const state = { from: { pathname: '//evil.example.com', search: '' } };
            expect(resolveReturnTo(state, '/app/dashboard')).toBe('/app/dashboard');
        });

        it('falls back for an absolute external URL', () => {
            const state = { from: { pathname: 'https://evil.example.com', search: '' } };
            expect(resolveReturnTo(state, '/app/dashboard')).toBe('/app/dashboard');
        });

        it('falls back for a relative (non-rooted) path', () => {
            const state = { from: { pathname: 'evil.example.com', search: '' } };
            expect(resolveReturnTo(state, '/app/dashboard')).toBe('/app/dashboard');
        });
    });
});
