import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  getUserStats, 
  getDictionaryStats, 
  getSuggestionStats, 
  getRecentWords,
  getRecentUsers,
  getReports,
  getUserSuggestions,
  approveSuggestion,
  rejectSuggestion
} from '../services/adminApi';
import { queryClient } from '../services/queryClient';

// User stats query hook - V5 FORMAT
export const useUserStats = (enabled = true) => {
  return useQuery({
    queryKey: ['userStats'],
    queryFn: getUserStats,
    enabled,
    staleTime: 2 * 60 * 1000 // 2 minutes
  });
};

// Dictionary stats query hook
export const useDictionaryStats = (enabled = true) => {
  return useQuery({
    queryKey: ['dictionaryStats'],
    queryFn: getDictionaryStats,
    enabled,
    staleTime: 5 * 60 * 1000
  });
};

// Suggestion stats query hook
export const useSuggestionStats = (enabled = true) => {
  return useQuery({
    queryKey: ['suggestionStats'],
    queryFn: getSuggestionStats,
    enabled
  });
};

// Recent words query hook
export const useRecentWords = (limit = 5, enabled = true) => {
  return useQuery({
    queryKey: ['recentWords', limit],
    queryFn: () => getRecentWords(limit),
    enabled
  });
};

// Recent users query hook
export const useRecentUsers = (limit = 5, enabled = true) => {
  return useQuery({
    queryKey: ['recentUsers', limit],
    queryFn: () => getRecentUsers(limit),
    enabled
  });
};

// Reports query hook
export const useReports = (timeRange = 'week', enabled = true) => {
  return useQuery({
    queryKey: ['reports', timeRange],
    queryFn: () => getReports(timeRange),
    enabled
  });
};

// User suggestions query hook
export const useUserSuggestions = (enabled = true) => {
  return useQuery({
    queryKey: ['userSuggestions'],
    queryFn: getUserSuggestions,
    enabled
  });
};

// Approve suggestion mutation hook
export const useApproveSuggestion = () => {
  return useMutation({
    mutationFn: approveSuggestion,
    onSuccess: () => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({queryKey: ['userSuggestions']});
      queryClient.invalidateQueries({queryKey: ['suggestionStats']});
    }
  });
};

// Reject suggestion mutation hook
export const useRejectSuggestion = () => {
  return useMutation({
    mutationFn: rejectSuggestion,
    onSuccess: () => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({queryKey: ['userSuggestions']});
      queryClient.invalidateQueries({queryKey: ['suggestionStats']});
    }
  });
};