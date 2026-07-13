import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getFoodSpot, getReviews, getFavourites, unwrap } from '@/services/ApiClient';
import { FoodSpot, Review } from '@/app/types/appTypes';
import { useAuth } from '@/services/AuthProvider';

interface UseFoodSpotDetailDataOptions {
  id: number;
  initialFoodSpot: FoodSpot;
  sortOrder: 'recent' | 'liked';
}

/**
 * Every read query needed by FoodSpotDetailScreen, extracted out of the
 * screen component so it isn't a ~700-line God component mixing data
 * fetching with rendering.
 */
export function useFoodSpotDetailData({ id, initialFoodSpot, sortOrder }: UseFoodSpotDetailDataOptions) {
  const { token, user } = useAuth();

  const {
    data: foodSpot,
    isLoading: isLoadingSpot,
    isError: isSpotError,
    refetch: refetchSpot,
  } = useQuery<FoodSpot>({
    queryKey: ['foodSpot', id],
    queryFn: async () => unwrap(await getFoodSpot(id)),
    initialData: initialFoodSpot,
  });

  // Images live on the food spot resource itself; derive them instead of
  // issuing a second identical `getFoodSpot` request on every screen visit.
  const spotImages = foodSpot?.images ?? [];

  // Fetched independently of `foodSpotReviews` below so sorting/pagination
  // of other users' reviews never affects the "my review" card.
  const { data: userReview, isLoading: isLoadingUserReview } = useQuery<Review | null>({
    queryKey: ['userReview', id, user?.id],
    queryFn: async () => {
      // NOTE: there's no dedicated "my review" endpoint, so this fetches the
      // full review list just to find the current user's entry. If the
      // backend adds a `?mine=true` filter or a `/reviews/mine` route, swap
      // this for a lighter direct fetch instead of the full list.
      if (!user) return null;
      const response = await getReviews(id);
      const allReviews: Review[] = unwrap(response) || [];
      const foundReview = allReviews.find((review) => review.user_id === user?.id);
      if (!foundReview) return null;
      return {
        ...foundReview,
        is_liked: foundReview.is_liked ?? false,
        likes_count: foundReview.likes_count ?? 0,
      };
    },
    enabled: !!user,
  });

  const {
    data: reviewsResult,
    isLoading: isLoadingReviews,
    isFetching: isFetchingReviews,
    isError: isReviewsError,
    refetch: refetchReviews,
  } = useQuery<{ reviews: Review[]; total: number }>({
    queryKey: ['foodSpotReviews', id, sortOrder],
    queryFn: async () => {
      const apiParams = { sort: sortOrder === 'liked' ? 'most_liked' : 'recent' };
      const response = await getReviews(id, apiParams);
      const reviewsData: Review[] = unwrap(response) || [];
      const totalCount = response.data?.meta?.total ?? response.data?.total ?? foodSpot?.reviews_count ?? reviewsData.length;

      // Exclude the user's own review from this list — it's shown separately.
      const otherUsersReviews = user
        ? reviewsData.filter((review) => review.user_id !== user.id)
        : reviewsData;

      const adjustedTotal = (user && userReview && reviewsData.some((r) => r.user_id === user.id))
        ? totalCount - 1
        : totalCount;

      const mappedReviews = otherUsersReviews.map((review) => ({
        ...review,
        is_liked: review.is_liked ?? false,
        likes_count: review.likes_count ?? 0,
      }));
      return { reviews: mappedReviews, total: adjustedTotal };
    },
    staleTime: 1000 * 60 * 2, // reviews change more often than the global default
    placeholderData: keepPreviousData, // smooth transitions when changing sortOrder
  });

  const otherReviews = reviewsResult?.reviews || [];
  const totalReviewCount = reviewsResult?.total ?? foodSpot?.reviews_count ?? 0;

  const { data: favourites = [], refetch: refetchFavourites } = useQuery<FoodSpot[]>({
    queryKey: ['favourites'],
    queryFn: async () => unwrap(await getFavourites()) || [],
    enabled: typeof token === 'string' && !!token,
  });

  const isFavourite = Array.isArray(favourites) &&
    !!foodSpot &&
    favourites.some((f) => f.id === foodSpot.id);

  return {
    foodSpot,
    isLoadingSpot,
    isSpotError,
    refetchSpot,
    spotImages,
    userReview,
    isLoadingUserReview,
    otherReviews,
    totalReviewCount,
    isLoadingReviews,
    isFetchingReviews,
    isReviewsError,
    refetchReviews,
    favourites,
    refetchFavourites,
    isFavourite,
  };
}

export default useFoodSpotDetailData;
