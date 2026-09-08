import { describe, expect, it } from 'vitest';
import { isProfileComplete } from './profileCompletion';

describe('isProfileComplete', () => {
    it('is false when both phone and location are missing (a fresh Google user)', () => {
        expect(isProfileComplete({ phone: null, location: null })).toBe(false);
    });

    it('is false when only phone is missing', () => {
        expect(isProfileComplete({ phone: null, location: 'Serrekunda' })).toBe(false);
    });

    it('is false when only location is missing', () => {
        expect(isProfileComplete({ phone: '+2207000000', location: null })).toBe(false);
    });

    it('is false for whitespace-only values', () => {
        expect(isProfileComplete({ phone: '   ', location: '  ' })).toBe(false);
    });

    it('is true when both phone and location are set', () => {
        expect(isProfileComplete({ phone: '+2207000000', location: 'Serrekunda' })).toBe(true);
    });

    it('is false for a null/undefined user', () => {
        expect(isProfileComplete(null)).toBe(false);
        expect(isProfileComplete(undefined)).toBe(false);
    });
});
