import React, { useState, useMemo, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity,
  ActivityIndicator,
  Image
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Hooks and services
import { useAuth } from '../../services/AuthProvider';
import { getFoodSpots, getFavourites } from '../../services/ApiClient';

// Components
import { FoodSpotItem } from '../components/FoodSpot';
import { FilterModal, SearchBar, ListTypeSelector } from '../components/UI';

// Utilities and styles
import colors from '../styles/colors';
import { getFullImageUrl } from '../utils/getFullImageUrl';

// Types
import { FoodSpot, ScreenProps } from '../types/appTypes';

const SORT_OPTIONS = [
  { label: 'Highest First', value: 'desc' },
  { label: 'Lowest First', value: 'asc' },
];

const LIST_OPTIONS = [
  { label: 'Popular', value: 'popular' },
  { label: 'Favourites', value: 'favourites' },
];

type ListType = 'popular' | 'favourites';

const HomeScreen: React.FC<ScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // UI state
  const [listType, setListType] = useState<ListType>('popular');
  const [searchText, setSearchText] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Query for food spots
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

  // Helper values for current list state
  const currentData = listType === 'favourites' ? favouriteSpots : foodSpots;
  const isLoading = listType === 'favourites' ? loadingFavourites : loadingFoodSpots;
  const isError = listType === 'favourites' ? isFavouritesError : isFoodSpotsError;
  const isFetching = listType === 'favourites' ? isFetchingFavourites : isFetchingFoodSpots;
  const refetch = listType === 'favourites' ? refetchFavourites : refetchFoodSpots;

  // Dynamically extract unique categories from the current list
  const categories = useMemo(() => {
    const set = new Set<string>();
    currentData.forEach((spot: FoodSpot) => {
      if (spot.category) set.add(spot.category);
    });
    return Array.from(set).sort();
  }, [currentData]);

  // Filter and sort food spots based on search, category, and sort direction
  const filteredFoodSpots = useMemo(() => {
    let filtered = currentData.filter((spot: FoodSpot) => {
      const matchesSearch = spot.name.toLowerCase().includes(searchText.toLowerCase());
      const matchesCategory = !selectedCategory || 
        (spot.category && spot.category.trim().toLowerCase() === selectedCategory.trim().toLowerCase());
      return matchesSearch && matchesCategory;
    });
    
    filtered = filtered.sort((a: FoodSpot, b: FoodSpot) => {
      if (sortDirection === 'asc') {
        return (a.rating || 0) - (b.rating || 0);
      } else {
        return (b.rating || 0) - (a.rating || 0);
      }
    });
    
    return filtered;
  }, [currentData, searchText, selectedCategory, sortDirection]);

  const handleRefresh = useCallback(() => {
    if (listType === 'favourites') {
      queryClient.invalidateQueries({ queryKey: ['favourites'] });
    } else {
      queryClient.invalidateQueries({ queryKey: ['foodSpots'] });
    }
  }, [queryClient, listType]);

  const navigateToDetail = useCallback((item: FoodSpot) => {
    navigation.navigate('FoodSpotDetail', { id: item.id, name: item.name });
  }, [navigation]);

  const renderItem = useCallback(({ item }: { item: FoodSpot }) => (
    <FoodSpotItem 
      item={item} 
      onPress={() => navigateToDetail(item)}
    />
  ), [navigateToDetail]);

  const handleListTypeChange = useCallback((value: string) => {
    setListType(value as ListType);
  }, []);

  // Show loading state
  if (isLoading && !isFetching && filteredFoodSpots.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading food spots...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>        
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>
              Welcome{user && user.name ? ` ${user.name}` : ''}
            </Text>
            <Text style={styles.title}>Tsimpologion</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            {user && user.images && user.images.length > 0 && getFullImageUrl(user.images[0]) ? (
              <Image source={{ uri: getFullImageUrl(user.images[0]) }} style={styles.profileImage} />
            ) : (
              <Feather name="user" size={24} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>
        
        <SearchBar 
          searchText={searchText}
          setSearchText={setSearchText}
          onFilterPress={() => setFilterModalVisible(true)}
        />
        
        <ListTypeSelector 
          options={LIST_OPTIONS}
          selectedValue={listType}
          onSelect={handleListTypeChange}
        />
        
        {isError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Failed to load {listType === 'favourites' ? 'favourites' : 'food spots'}. Please try again.
            </Text>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={() => refetch()}
            >
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredFoodSpots}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshing={isFetching}
            onRefresh={handleRefresh}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No {listType === 'favourites' ? 'favourites' : 'food spots'} found.
              </Text>
            }
          />
        )}

        <FilterModal
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          sortDirection={sortDirection}
          setSortDirection={setSortDirection}
          categories={categories}
          sortOptions={SORT_OPTIONS}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcome: {
    fontSize: 16,
    color: colors.darkGray,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 43, 
    height: 43, 
    borderRadius: 20, 
    backgroundColor: colors.white
  },
  listContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.darkGray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: colors.darkGray,
    marginTop: 20,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 18,
    marginHorizontal: 13,
    marginBottom: 18,
    padding: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
});

export default HomeScreen;