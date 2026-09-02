// src/lib/queryClient.js
//
// Single shared QueryClient instance. Exported from its own module (rather
// than constructed inline in main.jsx) so AuthContext can import the same
// instance and call queryClient.clear() on every login/logout/token-expiry
// — the mechanism that keeps one user's cached private data (orders,
// saved farmers, dashboard stats, ...) from ever being visible to the next
// user of the same browser tab. See AuthContext.jsx.
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            retry: 1,
        },
    },
});
