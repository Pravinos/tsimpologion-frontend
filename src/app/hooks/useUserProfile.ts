import { useQuery } from '@tanstack/react-query';
import { getCurrentUser, getUserReviews } from '@/services/ApiClient';
import { useAuth } from '@/services/AuthProvider';
import { User, Review } from '@/app/types/appTypes';

export const useUserProfile = () => {
  const { token } = useAuth();

  const {
    data: userProfile,
    isLoading: isProfileLoading,
    isError: isProfileError,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery<User, Error>({
    queryKey: ['userProfile', token],
    queryFn: async () => {
      try {
        const response = await getCurrentUser();
        return response.data?.data || response.data;
      } catch (err) {
        const error = err as any;
        if (error.response?.status !== 401) {
          console.error('Profile query error:', error.response ? error.response.data : error);
        }
        throw err;
      }
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });

  const {
    data: userReviews = [],
    isLoading: areReviewsLoading,
    isError: isReviewsError,
    refetch: refetchReviews,
  } = useQuery<Review[], Error>({
    queryKey: ['userReviews', userProfile?.id],
    queryFn: async () => {
      if (!userProfile?.id) return [];
      const response = await getUserReviews(userProfile.id);
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        return [];
      }
    },
    enabled: !!userProfile?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  return {
    userProfile,
    isProfileLoading,
    isProfileError,
    profileError,
    refetchProfile,
    userReviews,
    areReviewsLoading,
    isReviewsError,
    refetchReviews,
  };
};
