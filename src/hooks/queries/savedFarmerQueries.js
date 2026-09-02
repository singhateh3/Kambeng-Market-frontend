// src/hooks/queries/savedFarmerQueries.js
//
// Saved farmers are private, per-buyer server state — same user-scoped-key
// + queryClient.clear()-on-auth-change pattern as orderQueries.js. See the
// note there for why the key alone isn't the isolation guarantee.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../useAuth';
import api from '../../services/api';

export const savedFarmerKeys = {
    all: (userId) => ['saved-farmers', userId],
    list: (userId, page) => [...savedFarmerKeys.all(userId), 'list', page],
};

export const useSavedFarmersQuery = (page) => {
    const { user, isAuthenticated } = useAuth();

    return useQuery({
        queryKey: savedFarmerKeys.list(user?.id, page),
        queryFn: async ({ signal }) => {
            const response = await api.get(`/saved-farmers?page=${page}&per_page=20`, { signal });
            return {
                savedFarmers: response.data.data || [],
                pagination: response.data.meta || { current_page: 1, last_page: 1, per_page: 20, total: 0 },
            };
        },
        enabled: isAuthenticated && !!user,
        staleTime: 1000 * 60,
    });
};

// Shared by the SavedFarmers list page's "Remove" action and
// SaveFarmerButton (used on ProductDetail/FarmerProfile) — one mutation,
// one invalidation path, so saving/unsaving from anywhere keeps the list
// page correctly in sync instead of each call site tracking it separately.
export const useToggleSavedFarmerMutation = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: ({ farmerId, save }) =>
            save ? api.post(`/saved-farmers/${farmerId}`) : api.delete(`/saved-farmers/${farmerId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: savedFarmerKeys.all(user?.id) });
        },
    });
};
