import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { setStatusBarStyle } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Constants from 'expo-constants';

// Hooks and services
import { useAuth } from '@/services/AuthProvider';
import { useFoodSpots } from '@/app/hooks/useFoodSpots';

// Components
import { FoodSpotItem } from '../components/FoodSpot';
import { FilterModal, SearchBar, ListTypeSelector } from '@/app/components/UI';

// Utilities and styles
import colors from '../styles/colors';
import { getFullImageUrl } from '../utils/getFullImageUrl';

// Types
import { FoodSpot } from '../types/appTypes';

const SORT_OPTIONS = [
  { label: 'Highest First', value: 'desc' },
  { label: 'Lowest First', value: 'asc' },
];

type ListType = 'trending' | 'all' | 'favourites' | 'mySpots';

// --- Helper Components ---
const LoadingState = () => (
  <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Loading food spots...</Text>
    </View>
  </SafeAreaView>
);

const ErrorState = ({ listType, refetch }: { listType: ListType; refetch: () => void }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorText}>
      Failed to load {listType === 'favourites' ? 'favourites' : listType === 'trending' ? 'trending spots' : 'food spots'}. Please try again.
    </Text>
    <TouchableOpacity style={styles.retryButton} onPress={refetch}>
      <Text style={styles.retryText}>Try Again</Text>
    </TouchableOpacity>
  </View>
);

const EmptyState = ({ listType, isLoading, isFetching }: { listType: ListType; isLoading: boolean; isFetching: boolean }) => {
  // Only show if not loading/fetching
  if (isLoading || isFetching) return null;
  return (
    <View style={styles.emptyContainer}>
      <Feather name="search" size={60} color={colors.primary} style={styles.emptyIcon} />
      <Text style={styles.emptyText}>
        {listType === 'favourites' 
          ? "You haven't saved any favorites yet" 
          : listType === 'mySpots' 
            ? "You haven't added any food spots yet"
            : listType === 'trending'
              ? "No trending spots found"
              : "No food spots found"}
      </Text>
      <Text style={styles.emptySubText}>
        {listType === 'favourites' 
          ? "Browse trending spots and tap the heart icon to add them to your favorites"
          : listType === 'mySpots'
            ? "Add your first food spot to get started!"
            : listType === 'trending'
              ? "Trending spots are based on recent reviews and ratings. Check back later or explore all spots."
              : "Try adjusting your filters or search keywords."}
      </Text>
    </View>
  );
};

// --- Main Component ---
const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();

  // Memoized list options - Updated to include Trending and All Spots
  const LIST_OPTIONS = useMemo(() => {
    const options = [
      { label: 'Trending', value: 'trending' as ListType }, // Shows spots with high engagement and quality scores
      { label: 'All Spots', value: 'all' as ListType }, // Shows all available food spots
      { label: 'Favourites', value: 'favourites' as ListType },
    ];
    if (user?.role === 'spot_owner') {
      options.push({ label: 'My Spots', value: 'mySpots' as ListType });
    }
    return options;
  }, [user]);

  // UI state - Default to trending to showcase the best spots first
  const [listType, setListType] = useState<ListType>('trending');
  const [searchText, setSearchText] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [priceSortDirection, setPriceSortDirection] = useState<'asc' | 'desc' | ''>('');

  // Query for food spots using the custom hook
  const { data: currentData, isLoading, isError, isFetching, refetch } = useFoodSpots(listType);

  // Memoized categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    currentData.forEach((spot: FoodSpot) => {
      if (spot.category) set.add(spot.category);
    });
    return Array.from(set).sort();
  }, [currentData]);

  // Memoized filtered and sorted food spots
  const filteredFoodSpots = useMemo(() => {
    let filtered = currentData.filter((spot: FoodSpot) => {
      const matchesSearch = spot.name.toLowerCase().includes(searchText.toLowerCase());
      const matchesCategory = !selectedCategory || 
        (spot.category && spot.category.trim().toLowerCase() === selectedCategory.trim().toLowerCase());
      const matchesPriceRange = !selectedPriceRange || spot.price_range === selectedPriceRange;
      return matchesSearch && matchesCategory && matchesPriceRange;
    });
    filtered = filtered.sort((a: FoodSpot, b: FoodSpot) => {
      if (priceSortDirection && a.price_range && b.price_range) {
        const priceOrder = ['€', '€€', '€€€'];
        const aPrice = priceOrder.indexOf(a.price_range);
        const bPrice = priceOrder.indexOf(b.price_range);
        return priceSortDirection === 'asc' ? aPrice - bPrice : bPrice - aPrice;
      }
      return sortDirection === 'asc'
        ? (a.rating || 0) - (b.rating || 0)
        : (b.rating || 0) - (a.rating || 0);
    });
    return filtered;
  }, [currentData, searchText, selectedCategory, selectedPriceRange, sortDirection, priceSortDirection]);

  // Memoized food spot name suggestions for the search bar
  const spotSuggestions = useMemo(() => {
    if (!searchText || !currentData) return [];
    return currentData
      .filter((spot: FoodSpot) =>
        spot.name.toLowerCase().startsWith(searchText.toLowerCase())
      )
      .map((spot: FoodSpot) => spot.name)
      .slice(0, 5); // Limit to 5 suggestions
  }, [searchText, currentData]);

  // --- Memoized Callbacks ---
  const handleRefresh = useCallback(() => refetch(), [refetch]);
  const navigateToDetail = useCallback((item: FoodSpot) => {
    navigation.navigate('FoodSpotDetail', { foodSpot: item });
  }, [navigation]);
  const renderItem = useCallback(({ item }: { item: FoodSpot }) => (
    <FoodSpotItem item={item} onPress={() => navigateToDetail(item)} />
  ), [navigateToDetail]);
  const handleListTypeChange = useCallback((value: string) => {
    setListType(value as ListType);
  }, []);

  // Force status bar to dark when HomeScreen is focused
  useFocusEffect(
    React.useCallback(() => {
      // Immediate update
      setStatusBarStyle('dark');
      
      // One delayed update to ensure it sticks
      const timer = setTimeout(() => setStatusBarStyle('dark'), 100);
      
      return () => {
        clearTimeout(timer);
      };
    }, [])
  );

  // --- Render ---
  if (isLoading && !isFetching && filteredFoodSpots.length === 0) {
    return <LoadingState />;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <View style={[styles.statusBar, { backgroundColor: colors.white }]} />
        <View style={styles.container}>
          <Animated.View entering={FadeInDown.duration(1000)} style={styles.header}>
            <View>
              <Text style={styles.welcome}>
                {user?.username ? `Hi ${user.username} 👋` : 'Hi 👋'}
              </Text>
              <Text style={styles.title}>Find the perfect spot</Text>
              <Text style={styles.subtitle}>Explore authentic flavors near you</Text>
            </View>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navigation.navigate('Profile')}
            >
              {(user && Array.isArray(user.images) && user.images.length > 0 && getFullImageUrl(user.images[0])) ? (
                <Image source={{ uri: getFullImageUrl(user.images[0]) }} style={styles.profileImage} />
              ) : (
                <Feather name="user" size={24} color={colors.white} />
              )}
            </TouchableOpacity>
          </Animated.View>
          <SearchBar
            searchText={searchText}
            setSearchText={setSearchText}
            onFilterPress={() => setFilterModalVisible(true)}
            suggestions={spotSuggestions}
            onSelectSuggestion={setSearchText}
          />
          <View style={styles.listTypeSelectorContainer}>
            <ListTypeSelector
              options={LIST_OPTIONS}
              selectedValue={listType}
              onSelect={handleListTypeChange}
            />
          </View>
          {isError ? (
            <ErrorState listType={listType} refetch={refetch} />
          ) : (
            <FlatList
              data={filteredFoodSpots}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              refreshing={isFetching}
              onRefresh={handleRefresh}
              ListEmptyComponent={<EmptyState listType={listType} isLoading={isLoading} isFetching={isFetching} />}
            />
          )}
          <FilterModal
            visible={filterModalVisible}
            onClose={() => setFilterModalVisible(false)}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedPriceRange={selectedPriceRange}
            setSelectedPriceRange={setSelectedPriceRange}
            sortDirection={sortDirection}
            setSortDirection={setSortDirection}
            priceSortDirection={priceSortDirection}
            setPriceSortDirection={setPriceSortDirection}
            categories={categories}
            sortOptions={SORT_OPTIONS}
          />
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16, 
    paddingTop: 16, 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20, 
  },
  welcome: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.black,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.darkGray,
    marginTop: 4,
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
  },
  listTypeSelectorContainer: {
    marginVertical: 10,
    width: '100%',
  },
  listContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 20,
  },  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  retryText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    marginBottom: 20,
    opacity: 0.8,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.darkGray,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: colors.mediumGray,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  statusBar: {
    height: Constants.statusBarHeight,
    marginTop: -10
  },
});

export default HomeScreen;