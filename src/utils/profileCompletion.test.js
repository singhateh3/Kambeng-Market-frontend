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

    it('is true for a buyer once phone and location are set', () => {
        expect(isProfileComplete({ role: 'buyer', phone: '+2207000000', location: 'Serrekunda' })).toBe(true);
    });

    it('is false for a null/undefined user', () => {
        expect(isProfileComplete(null)).toBe(false);
        expect(isProfileComplete(undefined)).toBe(false);
    });

    describe('farmers', () => {
        it('is false when phone/location are set but farm_name/farm_location are missing', () => {
            expect(isProfileComplete({
                role: 'farmer', phone: '+2207000000', location: 'Serrekunda', farmer_profile: null,
            })).toBe(false);
        });

        it('is false when only one of farm_name/farm_location is set', () => {
            expect(isProfileComplete({
                role: 'farmer', phone: '+2207000000', location: 'Serrekunda',
                farmer_profile: { farm_name: 'Green Valley Farm', farm_location: null },
            })).toBe(false);
        });

        it('is true once phone, location, farm_name, and farm_location are all set (bio stays optional)', () => {
            expect(isProfileComplete({
                role: 'farmer', phone: '+2207000000', location: 'Serrekunda',
                farmer_profile: { farm_name: 'Green Valley Farm', farm_location: 'Brikama', bio: null },
            })).toBe(true);
        });
    });
});
