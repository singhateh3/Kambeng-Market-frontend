// src/components/common/ImageWithFallback.jsx
//
// Wraps an <img> with a graceful fallback for both "no photo available" and
// "photo failed to load" — same visual result (an icon on a neutral
// background, same footprint as the image would have had) instead of the
// inconsistent pattern found across the app of either hiding a failed <img>
// (leaving an empty box) or having no onError handler at all. className
// should carry the sizing (w-*/h-*), which applies to the fallback box too
// so layout dimensions never shift.
import { useEffect, useState } from 'react';

export const ImageWithFallback = ({
    src,
    alt = '',
    className = '',
    icon = '🌾',
    iconClassName = 'text-2xl',
    ...props
}) => {
    const [failed, setFailed] = useState(false);

    // Re-attempt loading whenever the source itself changes. Without this,
    // a component instance that outlives a single `src` — e.g. ProductDetail's
    // main image, which swaps `src` on the same instance as the active
    // thumbnail changes — would get stuck showing the fallback forever after
    // one bad photo, even once switched to a different, perfectly valid one.
    useEffect(() => {
        setFailed(false);
    }, [src]);

    if (!src || failed) {
        // Spreads the same props (onClick, etc.) as the <img> branch below,
        // so callers that need the element interactive — e.g. a clickable
        // thumbnail — keep working the same way whether the image loaded or not.
        // aria-hidden since the icon is a decorative stand-in with no photo
        // content to describe; alt text on the real <img> below still covers
        // the accessible name when a photo is actually showing.
        return (
            <div className={`flex items-center justify-center bg-slate-100 dark:bg-slate-800 ${className}`} aria-hidden="true" {...props}>
                <span className={iconClassName}>{icon}</span>
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={() => setFailed(true)}
            {...props}
        />
    );
};
