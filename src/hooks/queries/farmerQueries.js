// src/hooks/queries/farmerQueries.js
//
// Public farmer profile — GET /farmers/{userId}/profile is unauthenticated
// per the backend's PublicFarmerProfileResource, so this is shared/public
// server state like the product queries, not scoped per viewer.
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

export const farmerKeys = {
    publicProfile: (userId) => ['farmers', 'public-profile', userId],
};

export const usePublicFarmerProfileQuery = (userId) =>
    useQuery({
        queryKey: farmerKeys.publicProfile(userId),
        queryFn: async ({ signal }) => {
            const response = await api.get(`/farmers/${userId}/profile`, { signal });
            return response.data?.data ?? response.data;
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
    });
