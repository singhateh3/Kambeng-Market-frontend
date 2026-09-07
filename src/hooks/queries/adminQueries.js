// src/hooks/queries/adminQueries.js
//
// Admin products/users/disputes lists — private, admin-only server state.
// Same user-scoped-key + queryClient.clear()-on-auth-change isolation
// pattern used throughout the other private query hooks (see
// orderQueries.js). Every query is also gated on user?.role === 'admin' —
// defense in depth on top of the route/middleware guards that already
// restrict these pages and endpoints.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../useAuth';
import api from '../../services/api';

const adminGuard = (user, isAuthenticated) => isAuthenticated && user?.role === 'admin';

// ---- Products ----

export const adminProductKeys = {
    all: (userId) => ['admin', 'products', userId],
    list: (userId, filters) => [...adminProductKeys.all(userId), 'list', filters],
};

export const useAdminProductsQuery = (filters) => {
    const { user, isAuthenticated } = useAuth();

    return useQuery({
        queryKey: adminProductKeys.list(user?.id, filters),
        queryFn: async ({ signal }) => {
            const params = new URLSearchParams({
                status: filters.status || '',
                category: filters.category || '',
                search: filters.search || '',
                expiring_soon: filters.expiring_soon ? 'true' : '',
                expired: filters.expired ? 'true' : '',
                page: String(filters.page || 1),
                per_page: '20',
            });
            const response = await api.get(`/admin/products?${params}`, { signal });
            return {
                products: response.data.data || [],
                pagination: response.data.meta || { current_page: 1, last_page: 1, per_page: 20, total: 0 },
            };
        },
        enabled: adminGuard(user, isAuthenticated),
        staleTime: 1000 * 20,
        placeholderData: (previousData) => previousData,
    });
};

export const useDeleteAdminProductMutation = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    return useMutation({
        mutationFn: (productId) => api.delete(`/admin/products/${productId}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: adminProductKeys.all(user?.id) }),
    });
};

export const useBulkDeleteAdminProductsMutation = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    return useMutation({
        mutationFn: (productIds) => api.post('/admin/products/bulk-delete', { product_ids: productIds }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: adminProductKeys.all(user?.id) }),
    });
};

// ---- Users ----

export const adminUserKeys = {
    all: (userId) => ['admin', 'users', userId],
    list: (userId, filters) => [...adminUserKeys.all(userId), 'list', filters],
};

export const useAdminUsersQuery = (filters) => {
    const { user, isAuthenticated } = useAuth();

    return useQuery({
        queryKey: adminUserKeys.list(user?.id, filters),
        queryFn: async ({ signal }) => {
            const params = new URLSearchParams({
                role: filters.role || '',
                search: filters.search || '',
                verified: filters.verified || '',
                page: String(filters.page || 1),
            });
            const response = await api.get(`/admin/users?${params}`, { signal });
            return {
                users: response.data.data || [],
                pagination: response.data.meta || { current_page: 1, last_page: 1, per_page: 20, total: 0 },
            };
        },
        enabled: adminGuard(user, isAuthenticated),
        staleTime: 1000 * 20,
        placeholderData: (previousData) => previousData,
    });
};

export const useUpdateUserRoleMutation = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    return useMutation({
        mutationFn: ({ userId, role }) => api.put(`/admin/users/${userId}/role`, { role }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: adminUserKeys.all(user?.id) }),
    });
};

export const useVerifyFarmerMutation = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    return useMutation({
        mutationFn: (userId) => api.post(`/admin/users/${userId}/verify`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: adminUserKeys.all(user?.id) }),
    });
};

export const useDeleteUserMutation = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    return useMutation({
        mutationFn: (userId) => api.delete(`/admin/users/${userId}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: adminUserKeys.all(user?.id) }),
    });
};

// ---- Disputes ----

export const adminDisputeKeys = {
    all: (userId) => ['admin', 'disputes', userId],
    list: (userId, filters) => [...adminDisputeKeys.all(userId), 'list', filters],
};

export const useAdminDisputesQuery = (filters) => {
    const { user, isAuthenticated } = useAuth();

    return useQuery({
        queryKey: adminDisputeKeys.list(user?.id, filters),
        queryFn: async ({ signal }) => {
            const params = new URLSearchParams({
                status: String(filters.status ?? ''),
                page: String(filters.page),
                per_page: '20',
            });
            const response = await api.get(`/admin/disputes?${params}`, { signal });
            return {
                disputes: response.data.data || [],
                pagination: response.data.meta || { current_page: 1, last_page: 1, per_page: 20, total: 0 },
            };
        },
        enabled: adminGuard(user, isAuthenticated),
        staleTime: 1000 * 20,
        placeholderData: (previousData) => previousData,
    });
};

export const useUpdateDisputeStatusMutation = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    return useMutation({
        mutationFn: ({ disputeId, status, adminNote }) =>
            api.patch(`/admin/disputes/${disputeId}/status`, {
                status,
                ...(adminNote ? { admin_note: adminNote } : {}),
            }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: adminDisputeKeys.all(user?.id) }),
    });
};
