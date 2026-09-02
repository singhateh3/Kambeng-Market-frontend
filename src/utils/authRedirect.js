// src/utils/authRedirect.js
//
// Reusable "return to where the user was" mechanism for auth redirects
// (ProtectedRoute -> /login, anonymous checkout -> /login, etc). The
// destination travels as React Router `state` — part of the browser's
// history entry, never the URL — so there is no query-string/redirect
// parameter for anything external to construct, and only ever contains a
// location object this app itself produced.
//
// `resolveReturnTo` additionally re-validates that the stored pathname is
// an internal, root-relative path before ever navigating to it, so even a
// malformed or tampered history entry can't send the browser anywhere
// outside the app.

const isSafeInternalPath = (path) =>
    typeof path === 'string' && path.startsWith('/') && !path.startsWith('//');

export const buildReturnState = (location) => ({
    from: { pathname: location.pathname, search: location.search },
});

export const resolveReturnTo = (locationState, fallback) => {
    const from = locationState?.from;
    if (from && isSafeInternalPath(from.pathname)) {
        return `${from.pathname}${from.search || ''}`;
    }
    return fallback;
};
