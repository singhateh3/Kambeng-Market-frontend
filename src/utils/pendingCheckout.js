// src/utils/pendingCheckout.js
//
// Lets an anonymous visitor fill out the PlaceOrder form, get bounced to
// /login (or /register) to authenticate, and come back to a pre-filled
// form instead of losing what they typed. Deliberately does NOT persist a
// price or total — only the fields the buyer entered — since the backend
// re-fetches and re-validates the product (and its live price/availability)
// on return; nothing here is ever trusted as the order's price or as proof
// of identity.
//
// Scoped to a single product per pending entry, expires after ~30 minutes,
// and is meant to be consumed (cleared) by the very next successful order
// or explicit abandonment — it is not a general-purpose draft store.

const STORAGE_KEY = 'kambeng_pending_checkout';
const EXPIRY_MS = 30 * 60 * 1000;

export const savePendingCheckout = (productId, formData) => {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ productId: String(productId), formData, savedAt: Date.now() })
        );
    } catch {
        // localStorage unavailable (private browsing, quota, etc.) — the
        // anonymous-resume convenience just won't work; not fatal.
    }
};

export const readPendingCheckout = (productId) => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;

        const parsed = JSON.parse(raw);
        if (!parsed || String(parsed.productId) !== String(productId)) return null;

        if (Date.now() - parsed.savedAt > EXPIRY_MS) {
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }

        return parsed.formData ?? null;
    } catch {
        return null;
    }
};

export const clearPendingCheckout = () => {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        // noop
    }
};
