import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

/**
 * Polling mechanism (5s) to simulate Neural Pulse from the IoT Bracelet.
 * GET /children/{childId}
 */
export const useBraceletSync = (childId: string | null) => {
  return useQuery({
    queryKey: ['braceletSync', childId],
    queryFn: async () => {
      if (!childId) return null;
      const response = await apiClient.get(`/children/${childId}`);
      return response.data;
    },
    enabled: !!childId,
    refetchInterval: 5000, // 5 seconds polling
    refetchIntervalInBackground: true, // Continue polling if backgrounded
  });
};
