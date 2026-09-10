// src/hooks/queries/publicQueries.js
//
// Public, unauthenticated marketplace-wide statistics (GET /public/statistics)
// used on the Home page's stats strip. Same TanStack Query treatment as
// productQueries.js — a stable query key instead of a raw useEffect+Axios
// call on every mount, so repeat visits/navigations get an instant cached
// value instead of a fresh network round-trip. staleTime is matched to the
// backend's own Cache::remember() TTL (DashboardCache::TTL_SECONDS,
// currently 5 minutes) — no point treating it as fresher client-side than
// the server itself does.
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

export const publicKeys = {
    statistics: ['public', 'statistics'],
};

export const usePublicStatisticsQuery = () =>
    useQuery({
        queryKey: publicKeys.statistics,
        queryFn: async ({ signal }) => {
            const response = await api.get('/public/statistics', { signal });
            return response.data?.data ?? null;
        },
        staleTime: 1000 * 60 * 5,
    });
