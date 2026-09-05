// src/hooks/queries/orderQueries.js
//
// Orders are private, per-user server state. Query keys are scoped by
// user id for correct cache identity (two buyers' order lists are
// genuinely different data), but that is NOT what keeps User A's orders
// from ever being read by User B on a shared browser tab — that guarantee
// comes from AuthContext calling queryClient.clear() on every login/
// logout/token-expiry (see AuthContext.jsx). The user-scoped key here is
// defense in depth on top of that, not a substitute for it.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../useAuth';
import api from '../../services/api';

export const orderKeys = {
    all: (userId) => ['orders', userId],
    lists: (userId) => [...orderKeys.all(userId), 'list'],
    list: (userId, filters) => [...orderKeys.lists(userId), filters],
};

export const useOrdersQuery = (filters) => {
    const { user, isAuthenticated } = useAuth();

    return useQuery({
        queryKey: orderKeys.list(user?.id, filters),
        queryFn: async ({ signal }) => {
            const params = new URLSearchParams({
                status: String(filters.status ?? ''),
                page: String(filters.page ?? 1),
                per_page: String(filters.per_page ?? 20),
            });
            const response = await api.get(`/orders?${params}`, { signal });
            return {
                orders: response.data.data || [],
                pagination: response.data.meta || { current_page: 1, last_page: 1, per_page: 20, total: 0 },
            };
        },
        // Orders are meaningless (and inaccessible — auth:sanctum) without
        // a signed-in user; don't fire the request otherwise.
        enabled: isAuthenticated && !!user,
        staleTime: 1000 * 30,
    });
};

export const useUpdateOrderStatusMutation = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: ({ orderId, status }) => api.patch(`/orders/${orderId}/status`, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orderKeys.all(user?.id) });
        },
    });
};

export const useCancelOrderMutation = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (orderId) => api.post(`/orders/${orderId}/cancel`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orderKeys.all(user?.id) });
        },
    });
};

// Buyer confirms a delivered order — releases the farmer's payout
// immediately instead of waiting for the 3-day auto-release
// (see OrderController::confirm / PayoutReleaseService on the backend).
export const useConfirmOrderMutation = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (orderId) => api.post(`/orders/${orderId}/confirm`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orderKeys.all(user?.id) });
        },
    });
};
