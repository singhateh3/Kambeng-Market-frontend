import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Avatar, getInitials } from './Avatar';

describe('getInitials', () => {
    it('takes first+last initial for a full name', () => {
        expect(getInitials('Ebrima Singhateh')).toBe('ES');
    });

    it('takes just the first letter for a single name', () => {
        expect(getInitials('Fatou')).toBe('F');
    });

    it('handles a middle name by using first and last only', () => {
        expect(getInitials('Ebrima Singhateh Jallow')).toBe('EJ');
    });

    it('returns empty for no usable name', () => {
        expect(getInitials('')).toBe('');
        expect(getInitials(null)).toBe('');
        expect(getInitials('   ')).toBe('');
    });
});

describe('Avatar', () => {
    it('renders the image when a src is provided', () => {
        render(<Avatar src="https://example.com/photo.jpg" name="Ebrima Singhateh" />);

        const img = screen.getByRole('img', { name: "Ebrima Singhateh's avatar" });
        expect(img.tagName).toBe('IMG');
        expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg');
    });

    it('shows initials when there is no src', () => {
        render(<Avatar name="Ebrima Singhateh" />);

        expect(screen.getByText('ES')).toBeInTheDocument();
    });

    it('shows a single initial for a one-word name', () => {
        render(<Avatar name="Fatou" />);

        expect(screen.getByText('F')).toBeInTheDocument();
    });

    it('falls back to a neutral icon when no usable name exists', () => {
        render(<Avatar />);

        expect(screen.getByText('👤')).toBeInTheDocument();
    });

    it('falls back to initials when the image URL is broken', () => {
        render(<Avatar src="https://example.com/broken.jpg" name="Ebrima Singhateh" />);

        const img = screen.getByRole('img', { name: "Ebrima Singhateh's avatar" });
        fireEvent.error(img);

        expect(screen.getByText('ES')).toBeInTheDocument();
        expect(document.querySelector('img')).not.toBeInTheDocument();
    });

    it('recovers from a broken image when src changes to a working one', () => {
        const { rerender } = render(<Avatar src="https://example.com/broken.jpg" name="Ebrima Singhateh" />);
        fireEvent.error(screen.getByRole('img'));
        expect(screen.getByText('ES')).toBeInTheDocument();

        rerender(<Avatar src="https://example.com/working.jpg" name="Ebrima Singhateh" />);

        expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/working.jpg');
    });

    it('gives the same name a stable color across separate renders', () => {
        const { container: first } = render(<Avatar name="Ebrima Singhateh" />);
        const { container: second } = render(<Avatar name="Ebrima Singhateh" />);

        expect(first.firstChild.className).toBe(second.firstChild.className);
    });

    it('gives different names different colors (not all the same fallback)', () => {
        const { container: a } = render(<Avatar name="Ebrima Singhateh" />);
        const { container: b } = render(<Avatar name="Zainab Touray" />);

        expect(a.firstChild.className).not.toBe(b.firstChild.className);
    });
});
