// src/components/common/Avatar.jsx
//
// Shared identity avatar — an uploaded photo when one exists, otherwise
// initials on a color derived deterministically from the name, so the same
// user always looks the same across renders/sessions (never a random color
// per render). Used everywhere a user's photo appears: navbar, Profile,
// farmer profiles, product detail's "Sold by", reviews, order buyer/farmer
// sections.
//
// A broken image URL (deleted Cloudinary asset, network hiccup, ad blocker)
// falls back to the initials circle instead of a broken-image icon — same
// onError + reset-on-src-change pattern as ImageWithFallback.jsx, which
// this doesn't replace: that one is for product photos (icon fallback, no
// initials concept), this one is for people.
import { useEffect, useState } from 'react';

const SIZE_CLASSES = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-20 h-20 text-3xl',
};

// Same pale-bg/dark-tint-on-dark tonal language as Layout.jsx's roleColors
// and Alert.jsx's variants — just extended to a wider rotating set so
// initials avatars aren't all the same color.
const PALETTE = [
    'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
    'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
];

export const getInitials = (name) => {
    const parts = (name || '').trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Simple deterministic string hash (no crypto needed — just needs to be
// stable, not secure) picks the same palette entry for the same name every
// time, on every device, with no stored state.
const colorFor = (name) => {
    const key = name?.trim();
    if (!key) return PALETTE[0];
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    }
    return PALETTE[hash % PALETTE.length];
};

export const Avatar = ({ src, name, size = 'md', className = '' }) => {
    const [broken, setBroken] = useState(false);

    useEffect(() => {
        setBroken(false);
    }, [src]);

    const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
    const label = name ? `${name}'s avatar` : 'User avatar';

    if (src && !broken) {
        return (
            <img
                src={src}
                alt={label}
                onError={() => setBroken(true)}
                className={`${sizeClass} rounded-full object-cover flex-shrink-0 ${className}`}
            />
        );
    }

    const initials = getInitials(name);

    return (
        <div
            role="img"
            aria-label={label}
            title={label}
            className={`${sizeClass} rounded-full flex items-center justify-center font-bold flex-shrink-0 select-none ${colorFor(name)} ${className}`}
        >
            {initials || '👤'}
        </div>
    );
};
