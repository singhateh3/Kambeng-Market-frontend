// src/utils/pendingCheckout.test.js
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearPendingCheckout, readPendingCheckout, savePendingCheckout } from './pendingCheckout';

describe('pendingCheckout', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.useRealTimers();
    });

    it('saves and restores form data for the same product', () => {
        savePendingCheckout('42', { quantity: 3, delivery_method: 'pickup' });

        expect(readPendingCheckout('42')).toEqual({ quantity: 3, delivery_method: 'pickup' });
    });

    it('does not restore data saved for a different product', () => {
        savePendingCheckout('42', { quantity: 3 });

        expect(readPendingCheckout('99')).toBeNull();
    });

    it('returns null when nothing has been saved', () => {
        expect(readPendingCheckout('42')).toBeNull();
    });

    it('clear() removes the pending entry', () => {
        savePendingCheckout('42', { quantity: 3 });
        clearPendingCheckout();

        expect(readPendingCheckout('42')).toBeNull();
    });

    it('expires entries older than ~30 minutes', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
        savePendingCheckout('42', { quantity: 3 });

        vi.setSystemTime(new Date('2026-01-01T00:31:00Z'));
        expect(readPendingCheckout('42')).toBeNull();
    });

    it('still restores an entry saved 29 minutes ago', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
        savePendingCheckout('42', { quantity: 3 });

        vi.setSystemTime(new Date('2026-01-01T00:29:00Z'));
        expect(readPendingCheckout('42')).toEqual({ quantity: 3 });
    });

    it('never throws if localStorage access fails', () => {
        const original = window.localStorage.setItem;
        window.localStorage.setItem = () => {
            throw new Error('quota exceeded');
        };

        expect(() => savePendingCheckout('42', { quantity: 3 })).not.toThrow();

        window.localStorage.setItem = original;
    });
});
