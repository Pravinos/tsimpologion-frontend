import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../services/AuthProvider';
import { getCurrentUser, getUserReviews } from '../../services/ApiClient';
import { User, Review } from '../../types/models';

interface UseProfileResult {
  userProfile: User | null;
  userReviews: Review[];
  isProfileLoading: boolean;
  isReviewsLoading: boolean;
  isProfileError: boolean;
  isReviewsError: boolean;
  refetchProfile: () => Promise<any>;
  refetchReviews: () => Promise<any>;
  displayName: string;
  displayEmail: string;
  displayJoinDate: string;
  displayReviewsCount: number;
  displayRole: string;  isBusinessOwner: boolean;
}

const useProfile = (): UseProfileResult => {
  const { user: authUser, token } = useAuth();
  
  // React Query for user profile
  const {
    data: userProfile,
    isLoading: isProfileLoading,
    isError: isProfileError,
    refetch: refetchProfile,
  } = useQuery<User | null>({
    queryKey: ['userProfile', token],
    queryFn: async () => {
      try {
        const response = await getCurrentUser();
        return response.data?.data || response.data;
      } catch (err) {
        const error = err as any;
        // Only log error if not 401 (Unauthenticated)
        if (error.response?.status !== 401) {
          console.error('Profile query error:', error.response ? error.response.data : error);
        }
        throw err;
      }
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
  // React Query for user reviews
  const {
    data: userReviews = [],
    isLoading: isReviewsLoading,
    isError: isReviewsError,
    refetch: refetchReviews,
  } = useQuery<Review[]>({
    queryKey: ['userReviews', userProfile?.id],
    queryFn: async () => {
      if (!userProfile?.id) return [];
      
      try {
        const response = await getUserReviews(userProfile.id);
        
        // Handle different response structures
        if (response.data?.data && Array.isArray(response.data.data)) {
          // This handles the case where the API returns { data: [...] }
          return response.data.data;
        } else if (Array.isArray(response.data)) {
          // This handles the case where the API returns an array directly
          return response.data;
        } else if (typeof response.data === 'object' && response.data !== null) {
          // This handles nested structures that might exist
          const possibleReviews = Object.values(response.data).find(value => 
            Array.isArray(value) && value.length > 0 && value[0]?.rating !== undefined
          );
          
          if (Array.isArray(possibleReviews)) {
            return possibleReviews;
          }
          
          console.warn('Unexpected reviews response format:', response.data);
          return [];
        } else {
          console.warn('Unexpected reviews response format:', response.data);
          return [];
        }
      } catch (error) {
        console.error('Error fetching user reviews:', error);
        throw error;
      }
    },
    enabled: !!userProfile?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Derived values
  const displayName = userProfile?.name || authUser?.name || 'User';
  const displayEmail = userProfile?.email || authUser?.email || 'No email';
  const displayJoinDate = userProfile?.created_at 
    ? new Date(userProfile.created_at).toLocaleDateString() 
    : 'N/A';
  const displayReviewsCount = userReviews.length || 0;
  
  const displayRole = userProfile?.role 
    ? userProfile.role === 'foodie' 
      ? 'Food Explorer' 
      : userProfile.role === 'spot_owner' 
        ? 'Business Owner' 
        : 'Administrator'
    : 'Food Explorer';
    
  const isBusinessOwner = userProfile?.role === 'spot_owner';

    return {
    userProfile: userProfile || null,
    userReviews,
    isProfileLoading,
    isReviewsLoading,
    isProfileError,
    isReviewsError,
    refetchProfile,
    refetchReviews,
    displayName,
    displayEmail,
    displayJoinDate,
    displayReviewsCount,
    displayRole,
    isBusinessOwner
  };
};

export default useProfile;
