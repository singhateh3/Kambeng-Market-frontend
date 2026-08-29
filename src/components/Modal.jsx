// src/components/Modal.jsx
//
// Shared modal shell extracted from the hand-rolled backdrop+panel markup
// that was duplicated across Orders, Users, FarmerVerification, farmer
// Products, and Notifications. Two usage modes:
//
//  - Pass `title` to get a standard header (title + close button) above
//    your content, matching the pattern most existing modals already used.
//  - Omit `title` ("headless" mode) to render only the panel shell around
//    your own children untouched — for modals that build their own custom
//    header/close-button layout (e.g. an image with an overlaid close
//    button) rather than the standard title row.
//
// The panel always gets max-h-[90vh] + overflow-y-auto so long content
// scrolls inside the modal instead of overflowing the viewport.
import { useEffect, useId } from 'react';

export const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = 'max-w-md',
    closeOnBackdrop = true,
    closeOnEscape = true,
    zIndex = 'z-50',
}) => {
    const titleId = useId();

    useEffect(() => {
        if (!isOpen || !closeOnEscape) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, closeOnEscape, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className={`fixed inset-0 bg-black/50 flex items-center justify-center ${zIndex} p-4 animate-in fade-in duration-200`}
            onClick={closeOnBackdrop ? onClose : undefined}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? titleId : undefined}
                onClick={(e) => e.stopPropagation()}
                className={`bg-white rounded-xl shadow-xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200`}
            >
                {title && (
                    <div className="flex justify-between items-center p-6 border-b border-gray-100">
                        <h2 id={titleId} className="text-xl font-bold text-gray-900">{title}</h2>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close"
                            className="text-gray-400 hover:text-gray-600 transition bg-transparent border-none cursor-pointer"
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}
                {children}
            </div>
        </div>
    );
};
