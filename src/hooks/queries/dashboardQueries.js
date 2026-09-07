// src/hooks/queries/dashboardQueries.js
//
// Farmer/buyer dashboard and admin dashboard stats — private, per-user
// server state. Same user-scoped-key + queryClient.clear()-on-auth-change
// pattern as orderQueries.js/savedFarmerQueries.js (see those files for
// why the key alone isn't the isolation guarantee). staleTime is
// deliberately short (these are "always basically fresh" summary views,
// not long-lived catalog data) — the main win here is instant paint from
// cache plus a single shared in-flight request, not long staleness
// tolerance.
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../useAuth';
import api from '../../services/api';

export const dashboardKeys = {
    farmer: (userId) => ['dashboard', 'farmer', userId],
    buyer: (userId) => ['dashboard', 'buyer', userId],
    adminStats: () => ['dashboard', 'admin', 'stats'],
};

const EMPTY_STATS = {
    total_products: 0, active_products: 0, total_orders: 0,
    pending_orders: 0, total_revenue: 0, orders_placed: 0,
    average_rating: 0, total_reviews: 0,
};

export const useFarmerDashboardQuery = () => {
    const { user, isAuthenticated } = useAuth();

    return useQuery({
        queryKey: dashboardKeys.farmer(user?.id),
        queryFn: async ({ signal }) => {
            const [statsRes, ordersRes, productsRes] = await Promise.all([
                api.get('/farmer/profile/statistics', { signal }).catch(() => ({ data: { data: {} } })),
                api.get('/orders?per_page=5', { signal }).catch(() => ({ data: { data: [] } })),
                api.get('/my-products?per_page=5', { signal }).catch(() => ({ data: { data: [] } })),
            ]);
            const s = statsRes.data.data || {};
            return {
                stats: {
                    ...EMPTY_STATS,
                    total_products: s.total_products || 0,
                    active_products: s.active_products || 0,
                    total_orders: s.total_orders || 0,
                    pending_orders: s.pending_orders || 0,
                    total_revenue: s.total_revenue || 0,
                    // Coerce to Number defensively — Laravel avg()/withAvg()
                    // aggregates can come back as strings on some DB
                    // drivers, and this value gets .toFixed()'d further down.
                    average_rating: Number(s.average_rating ?? 0) || 0,
                    total_reviews: s.total_reviews || 0,
                },
                recentOrders: ordersRes.data.data || [],
                recentProducts: productsRes.data.data || [],
                savedFarmers: [],
            };
        },
        enabled: isAuthenticated && user?.role === 'farmer',
        staleTime: 1000 * 20,
    });
};

export const useBuyerDashboardQuery = () => {
    const { user, isAuthenticated } = useAuth();

    return useQuery({
        queryKey: dashboardKeys.buyer(user?.id),
        queryFn: async ({ signal }) => {
            const [ordersRes, savedFarmersRes] = await Promise.all([
                api.get('/orders?per_page=5', { signal }).catch(() => ({ data: { data: [], meta: { total: 0 } } })),
                api.get('/saved-farmers?per_page=3', { signal }).catch(() => ({ data: { data: [], meta: { total: 0 } } })),
            ]);
            return {
                stats: {
                    ...EMPTY_STATS,
                    total_orders: ordersRes.data.meta?.total || 0,
                    pending_orders: (ordersRes.data.data || []).filter((o) => o.status === 'pending').length,
                    orders_placed: ordersRes.data.meta?.total || 0,
                },
                recentOrders: ordersRes.data.data || [],
                recentProducts: [],
                savedFarmers: savedFarmersRes.data.data || [],
            };
        },
        enabled: isAuthenticated && user?.role === 'buyer',
        staleTime: 1000 * 20,
    });
};

export const useAdminDashboardStatsQuery = () => {
    const { user, isAuthenticated } = useAuth();

    return useQuery({
        queryKey: dashboardKeys.adminStats(),
        queryFn: async ({ signal }) => {
            const response = await api.get('/admin/dashboard/statistics', { signal });
            // The backend's actual shape is {data: {...}}; defensively accept
            // a couple of other shapes the original bespoke-cache code
            // guarded against too.
            const body = response.data;
            return body?.data ?? (body?.users || body?.orders || body?.products ? body : {});
        },
        enabled: isAuthenticated && user?.role === 'admin',
        staleTime: 1000 * 30,
    });
};
