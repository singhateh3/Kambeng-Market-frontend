// src/components/auth/AppleSignInButton.jsx
//
// "Sign in with Apple" via Apple's own JS SDK, loaded on demand — nothing
// renders unless VITE_APPLE_SERVICES_ID and VITE_APPLE_REDIRECT_URI are
// both configured (they aren't yet; see the Task 12 final report). Uses
// Apple's popup flow so there's no full-page redirect; the SDK hands back
// a signed identity token, which — same as Google — is the only thing
// that establishes identity server-side (independently re-verified there).
//
// Apple returns the user's given/family name as a SEPARATE `user` object
// in the sign-in result, present ONLY on that user's very first
// authorization for this app — never recoverable on any later sign-in.
// When present, it's forwarded alongside the identity token so the
// backend can use it for a brand-new account's initial display name (it
// carries no authority on its own; see SocialAuthService).
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { resolveReturnTo } from '../../utils/authRedirect';
import { loadExternalScript } from '../../utils/loadExternalScript';

const SERVICES_ID = import.meta.env.VITE_APPLE_SERVICES_ID;
const REDIRECT_URI = import.meta.env.VITE_APPLE_REDIRECT_URI;

export const AppleSignInButton = () => {
    const { loginWithApple } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (!SERVICES_ID || !REDIRECT_URI) return;

        let cancelled = false;
        loadExternalScript('https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js')
            .then(() => {
                if (cancelled || !window.AppleID?.auth) return;
                window.AppleID.auth.init({
                    clientId: SERVICES_ID,
                    scope: 'name email',
                    redirectURI: REDIRECT_URI,
                    usePopup: true,
                });
                setReady(true);
            })
            .catch((err) => {
                if (!cancelled) {
                    console.error(err);
                    setError('Could not load Sign in with Apple.');
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const handleClick = async () => {
        setError(null);
        try {
            const result = await window.AppleID.auth.signIn();
            const idToken = result?.authorization?.id_token;
            if (!idToken) throw new Error('Apple did not return an identity token.');

            // Only present on first authorization — undefined on every
            // later sign-in, which loginWithApple/the backend both handle
            // as the normal "no name to capture" case.
            const name = result?.user?.name;

            const response = await loginWithApple(idToken, name);
            const fallback = response?.data?.user?.role === 'admin' ? '/app/admin/dashboard' : '/app/dashboard';
            navigate(resolveReturnTo(location.state, fallback));
        } catch (err) {
            // Apple rejects the signIn() promise on user cancel too — that's
            // not an error worth surfacing.
            if (err?.error === 'popup_closed_by_user') return;
            console.error('Apple sign-in error:', err);
            setError(err.response?.data?.message || 'Could not sign in with Apple. Please try again.');
        }
    };

    if (!SERVICES_ID || !REDIRECT_URI) return null;

    return (
        <div>
            <button
                type="button"
                onClick={handleClick}
                disabled={!ready}
                className="w-full flex items-center justify-center gap-2 bg-black text-white text-sm font-semibold py-3 rounded-xl hover:bg-slate-800 transition disabled:opacity-60 disabled:cursor-not-allowed border-none cursor-pointer"
            >
                <span></span>
                <span>Continue with Apple</span>
            </button>
            {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}
        </div>
    );
};
