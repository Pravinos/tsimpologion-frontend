import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  Modal,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { setStatusBarStyle } from 'expo-status-bar';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Constants from 'expo-constants';

// Components
import { FoodSpotItem } from '../components/FoodSpot';
import { SearchBar, FilterModal } from '@/app/components/UI';

import { useFoodSpots } from '../hooks/useFoodSpots';
import colors from '../styles/colors';
import { getIconForCategory } from '../utils/categoryIcons';

// Types
import { FoodSpot } from '../types/appTypes';

// Category Selection Modal Component
const CategorySelectionModal = ({ 
  visible, 
  onClose, 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: {
  visible: boolean;
  onClose: () => void;
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
  >
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color={colors.darkGray} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Category</Text>
            <FlatList
              data={categories}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryOption,
                    selectedCategory === item && styles.selectedCategoryOption
                  ]}
                  onPress={() => {
                    onSelectCategory(item);
                    onClose();
                  }}
                >
                  <View style={styles.categoryOptionContent}>
                    <MaterialCommunityIcons 
                      name={getIconForCategory(item)} 
                      size={24} 
                      color={selectedCategory === item ? colors.white : colors.primary} 
                    />
                    <Text style={[
                      styles.categoryOptionText,
                      selectedCategory === item && styles.selectedCategoryOptionText
                    ]}>
                      {item}
                    </Text>
                  </View>
                  {selectedCategory === item && (
                    <MaterialCommunityIcons name="check" size={20} color={colors.white} />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
);

// --- Helper Components ---
const LoadingState = () => (
  <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Loading food spots...</Text>
    </View>
  </SafeAreaView>
);

const ErrorState = ({ category, refetch }: { category: string; refetch: () => void }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorText}>
      Failed to load {category.toLowerCase()} spots. Please try again.
    </Text>
    <TouchableOpacity style={styles.retryButton} onPress={refetch}>
      <Text style={styles.retryText}>Try Again</Text>
    </TouchableOpacity>
  </View>
);

const EmptyState = ({ category, isLoading, isFetching }: { category: string; isLoading: boolean; isFetching: boolean }) => {
  // Only show if not loading/fetching
  if (isLoading || isFetching) return null;
  return (
    <View style={styles.emptyContainer}>
      <Feather name="search" size={60} color={colors.primary} style={styles.emptyIcon} />
      <Text style={styles.emptyText}>No {category.toLowerCase()} spots found</Text>
      <Text style={styles.emptySubText}>Try adjusting your filters or search keywords.</Text>
    </View>
  );
};

function CategorizedFoodSpotsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { category } = route.params as { category: string };

  // UI state - simplified, no category filtering in modal
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(category); // Pre-select the passed category
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  
  // Filter state for the filter modal (excluding category since it's handled separately)
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [priceSortDirection, setPriceSortDirection] = useState<'asc' | 'desc' | ''>('');

  // Query for food spots using the same hook as HomeScreen
  const { data: currentData, isLoading, isError, isFetching, refetch } = useFoodSpots('all');

  // Sort options for the filter modal
  const sortOptions = [
    { label: 'Highest Rated', value: 'desc' },
    { label: 'Lowest Rated', value: 'asc' },
  ];

  // Memoized categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    currentData.forEach((spot: FoodSpot) => {
      if (spot.category) set.add(spot.category);
    });
    return Array.from(set).sort();
  }, [currentData]);

  // Memoized filtered food spots - category, search, price range, and sorting
  const filteredFoodSpots = useMemo(() => {
    let filtered = currentData.filter((spot: FoodSpot) => {
      const matchesSearch = spot.name.toLowerCase().includes(searchText.toLowerCase());
      const matchesCategory = !selectedCategory || 
        (spot.category && spot.category.trim().toLowerCase() === selectedCategory.trim().toLowerCase());
      const matchesPriceRange = !selectedPriceRange || spot.price_range === selectedPriceRange;
      return matchesSearch && matchesCategory && matchesPriceRange;
    });

    // Apply sorting
    if (priceSortDirection) {
      // Sort by price range (€, €€, €€€, €€€€)
      const priceOrder = ['€', '€€', '€€€', '€€€€'];
      filtered = filtered.sort((a: FoodSpot, b: FoodSpot) => {
        const aIndex = priceOrder.indexOf(a.price_range || '');
        const bIndex = priceOrder.indexOf(b.price_range || '');
        if (priceSortDirection === 'asc') {
          return aIndex - bIndex;
        } else {
          return bIndex - aIndex;
        }
      });
    } else {
      // Sort by rating (default or when no price sorting)
      filtered = filtered.sort((a: FoodSpot, b: FoodSpot) => {
        if (sortDirection === 'asc') {
          return (a.rating || 0) - (b.rating || 0);
        } else {
          return (b.rating || 0) - (a.rating || 0);
        }
      });
    }
    
    return filtered;
  }, [currentData, searchText, selectedCategory, selectedPriceRange, sortDirection, priceSortDirection]);

  // Memoized food spot name suggestions
  const spotSuggestions = useMemo(() => {
    if (!searchText || !currentData) return [];
    return currentData
      .filter((spot: FoodSpot) =>
        spot.name.toLowerCase().startsWith(searchText.toLowerCase())
      )
      .map((spot: FoodSpot) => spot.name)
      .slice(0, 5);
  }, [searchText, currentData]);

  // --- Memoized Callbacks ---
  const handleRefresh = useCallback(() => refetch(), [refetch]);
  const navigateToDetail = useCallback((item: FoodSpot) => {
    (navigation as any).navigate('FoodSpotDetail', { foodSpot: item });
  }, [navigation]);
  const renderItem = useCallback(({ item }: { item: FoodSpot }) => (
    <FoodSpotItem item={item} onPress={() => navigateToDetail(item)} />
  ), [navigateToDetail]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleGoHome = useCallback(() => {
    (navigation as any).navigate('HomeTabs', { screen: 'Home' });
  }, [navigation]);

  const handleCategoryPress = useCallback(() => {
    setCategoryModalVisible(true);
  }, []);

  const handleSelectCategory = useCallback((newCategory: string) => {
    setSelectedCategory(newCategory);
  }, []);

  // Force status bar to dark when screen is focused
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('dark');
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
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.categoryInfo} onPress={handleCategoryPress}>
              <View style={styles.categoryIconContainer}>
                <MaterialCommunityIcons 
                  name={getIconForCategory(selectedCategory)} 
                  size={24} 
                  color={colors.primary} 
                />
              </View>
              <Text style={styles.categoryTitle}>{selectedCategory}</Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color={colors.mediumGray} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
              <Feather name="home" size={24} color={colors.white} />
            </TouchableOpacity>
          </Animated.View>
          
          <View style={{ marginBottom: 6 }}>
            <SearchBar
              searchText={searchText}
              setSearchText={setSearchText}
              onFilterPress={() => setFilterModalVisible(true)}
              suggestions={spotSuggestions}
              onSelectSuggestion={(name) => setSearchText(name)}
            />
          </View>
          
          {isError ? (
            <ErrorState category={selectedCategory} refetch={refetch} />
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
                isError ? null : <EmptyState category={selectedCategory} isLoading={isLoading} isFetching={isFetching} />
              }
            />
          )}
          
          <CategorySelectionModal
            visible={categoryModalVisible}
            onClose={() => setCategoryModalVisible(false)}
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
          />
          
          <FilterModal
            visible={filterModalVisible}
            onClose={() => setFilterModalVisible(false)}
            selectedCategory="" // Not used since we handle category separately
            setSelectedCategory={() => {}} // Not used
            selectedPriceRange={selectedPriceRange}
            setSelectedPriceRange={setSelectedPriceRange}
            sortDirection={sortDirection}
            setSortDirection={setSortDirection}
            priceSortDirection={priceSortDirection}
            setPriceSortDirection={setPriceSortDirection}
            categories={[]} // Empty array to hide category section
            sortOptions={sortOptions}
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
    textTransform: 'capitalize',
  },
  homeButton: {
    width: 50,
    height: 50,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
    textAlign: 'center',
    marginBottom: 24,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: colors.lightGray,
  },
  selectedCategoryOption: {
    backgroundColor: colors.primary,
  },
  categoryOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.black,
    textTransform: 'capitalize',
  },
  selectedCategoryOptionText: {
    color: colors.white,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 12,
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    zIndex: 1,
  },
  closeButtonText: {
    color: colors.darkGray,
    fontWeight: '600',
    fontSize: 16,
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
  },
  retryButton: {
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

export default CategorizedFoodSpotsScreen;
