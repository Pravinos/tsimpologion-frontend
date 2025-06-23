import { useQuery } from '@tanstack/react-query';
import { getFoodSpots, getFavourites, getUserFoodSpots } from '@/services/ApiClient';
import { FoodSpot } from '@/app/types/appTypes';
import { useAuth } from '@/services/AuthProvider';

type ListType = 'popular' | 'favourites' | 'mySpots';

export const useFoodSpots = (listType: ListType) => {
  const { user } = useAuth();

  const {
    data: foodSpots = [],
    isLoading: loadingFoodSpots,
    isError: isFoodSpotsError,
    refetch: refetchFoodSpots,
    isFetching: isFetchingFoodSpots,
  } = useQuery<FoodSpot[], Error>({
    queryKey: ['foodSpots'],
    queryFn: async () => {
      const response = await getFoodSpots();
      return response.data?.data || response.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: listType === 'popular',
  });

  const {
    data: favouriteSpots = [],
    isLoading: loadingFavourites,
    isError: isFavouritesError,
    refetch: refetchFavourites,
    isFetching: isFetchingFavourites,
  } = useQuery<FoodSpot[], Error>({
    queryKey: ['favourites'],
    queryFn: async () => {
      const response = await getFavourites();
      return response.data?.data || response.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: listType === 'favourites',
  });

  const {
    data: mySpots = [],
    isLoading: loadingMySpots,
    isError: isMySpotsError,
    refetch: refetchMySpots,
    isFetching: isFetchingMySpots,
  } = useQuery<FoodSpot[], Error>({
    queryKey: ['mySpots', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await getUserFoodSpots(user.id);
      return response.data?.data || response.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: listType === 'mySpots' && !!user?.id,
  });

  if (listType === 'favourites') {
    return {
      data: favouriteSpots,
      isLoading: loadingFavourites,
      isError: isFavouritesError,
      isFetching: isFetchingFavourites,
      refetch: refetchFavourites,
    };
  }

  if (listType === 'mySpots') {
    return {
      data: mySpots,
      isLoading: loadingMySpots,
      isError: isMySpotsError,
      isFetching: isFetchingMySpots,
      refetch: refetchMySpots,
    };
  }

  return {
    data: foodSpots,
    isLoading: loadingFoodSpots,
    isError: isFoodSpotsError,
    isFetching: isFetchingFoodSpots,
    refetch: refetchFoodSpots,
  };
};


export default useFoodSpots;
