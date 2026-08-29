// src/components/PublicLayout.jsx
import { Outlet } from 'react-router-dom';
import { Footer } from './Footer';

// Wraps public, unauthenticated marketing pages so they share one Footer
// instance instead of each page importing/rendering it separately. Mirrors
// the existing authenticated Layout's Outlet pattern. Login/Register/
// ForgotPassword are deliberately NOT nested here — they're focused
// single-task auth forms, not marketing content, and never had a footer.
export const PublicLayout = () => (
    <>
        <Outlet />
        <Footer />
    </>
);
