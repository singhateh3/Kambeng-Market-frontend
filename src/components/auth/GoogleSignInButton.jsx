// src/components/auth/GoogleSignInButton.jsx
//
// Renders Google's own native "Sign in with Google" button via the Google
// Identity Services SDK, loaded on demand — nothing is bundled, and
// nothing renders at all unless VITE_GOOGLE_CLIENT_ID is actually
// configured (it isn't yet; see the Task 12 final report for what's
// needed). The SDK hands back a signed ID token directly in the browser;
// that token — not any claim we read ourselves — is all that's ever sent
// to the backend, which independently re-verifies it.
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { resolveReturnTo } from '../../utils/authRedirect';
import { loadExternalScript } from '../../utils/loadExternalScript';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export const GoogleSignInButton = () => {
    const { loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const buttonRef = useRef(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!CLIENT_ID) return;

        let cancelled = false;

        const handleCredentialResponse = async (googleResponse) => {
            setError(null);
            try {
                const response = await loginWithGoogle(googleResponse.credential);
                const fallback = response?.data?.user?.role === 'admin' ? '/app/admin/dashboard' : '/app/dashboard';
                navigate(resolveReturnTo(location.state, fallback));
            } catch (err) {
                console.error('Google sign-in error:', err);
                setError(err.response?.data?.message || 'Could not sign in with Google. Please try again.');
            }
        };

        loadExternalScript('https://accounts.google.com/gsi/client')
            .then(() => {
                if (cancelled || !window.google?.accounts?.id) return;
                window.google.accounts.id.initialize({
                    client_id: CLIENT_ID,
                    callback: handleCredentialResponse,
                });
                if (buttonRef.current) {
                    window.google.accounts.id.renderButton(buttonRef.current, {
                        theme: 'outline',
                        size: 'large',
                        width: 320,
                        text: 'continue_with',
                    });
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    console.error(err);
                    setError('Could not load Google Sign-In.');
                }
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!CLIENT_ID) return null;

    return (
        <div>
            <div ref={buttonRef} className="flex justify-center" />
            {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}
        </div>
    );
};
