import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getFoodSpots, getFavourites } from '@/services/ApiClient';
import { FoodSpot } from '@/app/types/appTypes';

export type ListType = 'popular' | 'favourites';

interface UseListDataResult {
  data: FoodSpot[];
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  refetch: () => void;
  handleRefresh: () => void;
}

// Export both as named and default
export const useListData = (listType: ListType): UseListDataResult => {
  const queryClient = useQueryClient();

  // Query for food spots
  const {
    data: foodSpots = [],
    isLoading: loading,
    isError,
    refetch,
    isFetching,
  } = useQuery<FoodSpot[], Error>({
    queryKey: ['foodSpots'],
    queryFn: async () => {
      const response = await getFoodSpots();
      return response.data.data || response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: listType === 'popular',
  });

  // Query for favourites
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
      return response.data.data || response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: listType === 'favourites',
  });

  const handleRefresh = () => {
    if (listType === 'favourites') {
      queryClient.invalidateQueries({ queryKey: ['favourites'] });
    } else {
      queryClient.invalidateQueries({ queryKey: ['foodSpots'] });
    }
  };

  if (listType === 'favourites') {
    return {
      data: favouriteSpots,
      isLoading: loadingFavourites,
      isError: isFavouritesError,
      isFetching: isFetchingFavourites,
      refetch: refetchFavourites,
      handleRefresh,
    };
  }

  return {
    data: foodSpots,
    isLoading: loading,
    isError,
    isFetching,
    refetch,
    handleRefresh,
  };
};

// Add default export
export default useListData;
