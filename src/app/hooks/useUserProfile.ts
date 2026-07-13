import { useQuery } from '@tanstack/react-query';
import { getCurrentUser, getUserReviews, unwrap } from '@/services/ApiClient';
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
        return unwrap(response);
      } catch (err) {
        const error = err as any;
        if (error.response?.status !== 401) {
          console.error('Profile query error:', error.response ? error.response.data : error);
        }
        throw err;
      }
    },
    enabled: !!token,
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
      const data = unwrap(response);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!userProfile?.id,
    staleTime: 1000 * 60 * 2, // shorter than the global default: reviews change more often
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

export default useUserProfile;