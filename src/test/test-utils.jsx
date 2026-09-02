// src/test/test-utils.jsx
//
// Shared render helper for component tests — wraps a component in the same
// provider stack main.jsx does (QueryClientProvider, AuthProvider, Router),
// using a fresh QueryClient per render so tests never share cache state.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';

export const renderWithProviders = (ui, { route = '/' } = {}) => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });

    return {
        queryClient,
        ...render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={[route]}>
                    <AuthProvider>{ui}</AuthProvider>
                </MemoryRouter>
            </QueryClientProvider>
        ),
    };
};
