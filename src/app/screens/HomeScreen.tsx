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
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

// Hooks and services
import { useAuth } from '@/services/AuthProvider';
import { useFoodSpots } from '@/app/hooks/useFoodSpots';

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

type ListType = 'popular' | 'favourites' | 'mySpots';

const HomeScreen: React.FC<ScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  
  const LIST_OPTIONS = useMemo(() => {
    const options = [
      { label: 'Popular', value: 'popular' as ListType },
      { label: 'Favourites', value: 'favourites' as ListType },
    ];
    if (user?.role === 'spot_owner') {
      options.push({ label: 'My Spots', value: 'mySpots' as ListType });
    }
    return options;
  }, [user]);

  // UI state
  const [listType, setListType] = useState<ListType>('popular');
  const [searchText, setSearchText] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState(''); // Added price range state
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [priceSortDirection, setPriceSortDirection] = useState<'asc' | 'desc' | ''>(''); // Added price sort state

  // Query for food spots using the custom hook
  const { data: currentData, isLoading, isError, isFetching, refetch } = useFoodSpots(listType);

  // Dynamically extract unique categories from the current list
  const categories = useMemo(() => {
    const set = new Set<string>();
    currentData.forEach((spot: FoodSpot) => {
      if (spot.category) set.add(spot.category);
    });
    return Array.from(set).sort();
  }, [currentData]);

  // Filter and sort food spots based on search, category, price range, and sort direction
  const filteredFoodSpots = useMemo(() => {
    let filtered = currentData.filter((spot: FoodSpot) => {
      const matchesSearch = spot.name.toLowerCase().includes(searchText.toLowerCase());
      const matchesCategory = !selectedCategory || 
        (spot.category && spot.category.trim().toLowerCase() === selectedCategory.trim().toLowerCase());
      const matchesPriceRange = !selectedPriceRange || spot.price_range === selectedPriceRange; // Added price range filter
      return matchesSearch && matchesCategory && matchesPriceRange;
    });
      filtered = filtered.sort((a: FoodSpot, b: FoodSpot) => {
      // Price sorting takes priority if selected
      if (priceSortDirection && a.price_range && b.price_range) {
        const priceOrder = ['€', '€€', '€€€'];
        const aPrice = priceOrder.indexOf(a.price_range);
        const bPrice = priceOrder.indexOf(b.price_range);
        
        if (priceSortDirection === 'asc') {
          return aPrice - bPrice; // Cheapest first
        } else {
          return bPrice - aPrice; // Most expensive first
        }
      }
      
      // Default to rating sorting
      if (sortDirection === 'asc') {
        return (a.rating || 0) - (b.rating || 0);
      } else {
        return (b.rating || 0) - (a.rating || 0);
      }
    });
      return filtered;
  }, [currentData, searchText, selectedCategory, selectedPriceRange, sortDirection, priceSortDirection]); // Added priceSortDirection to dependencies

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const navigateToDetail = useCallback((item: FoodSpot) => {
    navigation.navigate('FoodSpotDetail', { foodSpot: item });
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.container}>
          <Animated.View entering={FadeInDown.duration(1000)} style={styles.header}>
            <View>
              <Text style={styles.welcome}>
                {user && user.name ? `Hi ${user.name} 👋` : 'Hi 👋'}
              </Text>
              <Text style={styles.title}>Find the perfect spot</Text>
              <Text style={styles.subtitle}>Explore authentic flavors near you</Text>
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
          </Animated.View>
          <SearchBar
            searchText={searchText}
            setSearchText={setSearchText}
            onFilterPress={() => setFilterModalVisible(true)}
          />
          <View style={styles.listTypeSelectorContainer}>
            <ListTypeSelector
              options={LIST_OPTIONS}
              selectedValue={listType}
              onSelect={handleListTypeChange}
            />
          </View>
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
                <View style={styles.emptyContainer}>
                  <Feather name="search" size={60} color={colors.primary} style={styles.emptyIcon} />
                  <Text style={styles.emptyText}>
                    {listType === 'favourites' 
                      ? "You haven't saved any favorites yet" 
                      : listType === 'mySpots' 
                        ? "You haven't added any food spots yet"
                        : "No food spots found"}
                  </Text>
                  <Text style={styles.emptySubText}>
                    {listType === 'favourites' 
                      ? "Browse popular spots and tap the heart icon to add them to your favorites"
                      : listType === 'mySpots'}
                  </Text>
                </View>
              }
            />
          )}
          <FilterModal
            visible={filterModalVisible}
            onClose={() => setFilterModalVisible(false)}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedPriceRange={selectedPriceRange} // Added price range props
            setSelectedPriceRange={setSelectedPriceRange} // Added price range props
            sortDirection={sortDirection}
            setSortDirection={setSortDirection}
            priceSortDirection={priceSortDirection} // Added price sort props
            setPriceSortDirection={setPriceSortDirection} // Added price sort props
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
    // Removed background color, assuming image will cover or use transparent
  },
  listTypeSelectorContainer: {
    marginTop: 6,
    marginBottom: 6,
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