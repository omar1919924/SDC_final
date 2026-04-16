import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { UserRole } from '@/types';

/**
 * Hook to fetch dashboard data based on role.
 * Example: GET /children for teachers, GET /parents/{id} for parents.
 */
export const useDashboardData = (role: UserRole | null, id?: string) => {
  return useQuery({
    queryKey: ['dashboardData', role, id],
    queryFn: async () => {
      if (!role) return null;

      let endpoint = '';
      switch (role) {
        case 'teacher':
          endpoint = '/children';
          break;
        case 'parent':
          endpoint = `/parents/${id}`;
          break;
        case 'student':
        case 'enfant' as UserRole: // Backend uses 'enfant'
          endpoint = `/children/${id}`;
          break;

        default:
          return null;
      }

      try {
        const response = await apiClient.get(endpoint);
        return response.data;
      } catch (err: unknown) {
        const error = err as { response?: { status?: number } };
        // If the profile doesn't exist yet, just return null instead of throwing an angry 404 console error
        if (error.response?.status === 404) {
          return null;
        }
        throw err;
      }
    },
    enabled: !!role,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
};

/**
 * Hook to fetch Clinical History (Historique Table).
 */
export const useHistory = (entityId?: string) => {
  return useQuery({
    queryKey: ['clinicalHistory', entityId],
    queryFn: async () => {
      const endpoint = entityId ? `/history?entity_id=${entityId}` : '/history';
      const response = await apiClient.get(endpoint);
      return response.data;
    },
    enabled: true, // Fetch all history if no ID
  });
};

/**
 * Hook to fetch specific Profile details (Bracelet ID, Location, etc.)
 */
export const useProfile = (role: UserRole | null, id?: string) => {
  return useQuery({
    queryKey: ['userProfile', role, id],
    queryFn: async () => {
      if (!role || !id) return null;
      const response = await apiClient.get(`/profiles/${id}`);
      return response.data;
    },
    enabled: !!role && !!id,
  });
};
