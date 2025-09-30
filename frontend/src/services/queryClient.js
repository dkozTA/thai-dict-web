import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes before data is considered stale
      cacheTime: 10 * 60 * 1000, // Cache data for 10 minutes
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      retry: 1 // Retry failed requests once
    }
  }
});