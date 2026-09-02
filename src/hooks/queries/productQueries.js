// src/hooks/queries/productQueries.js
//
// TanStack Query hooks for the public marketplace — products, categories,
// regions. All public, backend-confirmed unauthenticated-safe endpoints
// (see routes/api.php), so these are shared across every viewer with no
// per-user scoping needed, unlike the private-data hooks that will follow
// in a later migration pass.
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

// Query keys are structured so a filter/page change naturally produces a
// distinct key — the correct way to represent "this is different server
// state" — instead of one shared ['products'] key every variation would
// collide into.
export const productKeys = {
    all: ['products'],
    lists: () => [...productKeys.all, 'list'],
    list: (filters) => [...productKeys.lists(), filters],
    details: () => [...productKeys.all, 'detail'],
    detail: (id) => [...productKeys.details(), id],
    categories: () => [...productKeys.all, 'categories'],
    regions: () => [...productKeys.all, 'regions'],
    featured: (params) => [...productKeys.all, 'featured', params],
};

// Product list/search/filter. Moderate staleTime — price/availability can
// change, but filtering/paging shouldn't be re-fetching every keystroke.
// placeholderData keeps the previous page's results on screen while the
// next page/filter loads instead of flashing an empty grid.
export const useProductsQuery = (filters) =>
    useQuery({
        queryKey: productKeys.list(filters),
        queryFn: async ({ signal }) => {
            const params = new URLSearchParams({
                category: String(filters.category ?? ''),
                region: String(filters.region ?? ''),
                search: String(filters.search ?? ''),
                page: String(filters.page ?? 1),
                per_page: String(filters.per_page ?? 20),
            });
            const response = await api.get(`/products?${params}`, { signal });
            return {
                products: response.data.data || [],
                pagination: response.data.meta || { current_page: 1, last_page: 1, per_page: 20, total: 0 },
            };
        },
        staleTime: 1000 * 60 * 2,
        placeholderData: (previousData) => previousData,
    });

export const useProductQuery = (productId) =>
    useQuery({
        queryKey: productKeys.detail(productId),
        queryFn: async ({ signal }) => {
            const response = await api.get(`/products/${productId}`, { signal });
            return response.data?.data ?? response.data;
        },
        enabled: !!productId,
        staleTime: 1000 * 60 * 2,
    });

// Categories/regions change rarely — long staleTime.
export const useCategoriesQuery = () =>
    useQuery({
        queryKey: productKeys.categories(),
        queryFn: async ({ signal }) => {
            const response = await api.get('/products/categories', { signal });
            return response.data.data || [];
        },
        staleTime: 1000 * 60 * 15,
    });

export const useRegionsQuery = () =>
    useQuery({
        queryKey: productKeys.regions(),
        queryFn: async ({ signal }) => {
            const response = await api.get('/products/regions', { signal });
            return response.data.data || [];
        },
        staleTime: 1000 * 60 * 15,
    });

// "Featured" on the home page has always meant "most recently listed" —
// GET /products sorted by created_at desc — not the separate
// GET /products/featured backend route. Preserved exactly as-is here
// rather than switched to the other endpoint, which would be a behavior
// change outside this migration's scope.
export const useFeaturedProductsQuery = (params = { per_page: 8, sort_by: 'created_at', sort_order: 'desc' }) =>
    useQuery({
        queryKey: productKeys.featured(params),
        queryFn: async ({ signal }) => {
            const query = new URLSearchParams(
                Object.fromEntries(Object.entries(params).map(([key, value]) => [key, String(value)]))
            );
            const response = await api.get(`/products?${query}`, { signal });
            return response.data?.data || [];
        },
        staleTime: 1000 * 60 * 2,
    });
