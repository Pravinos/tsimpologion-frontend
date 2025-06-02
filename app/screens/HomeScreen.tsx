import React, { useState, useMemo, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  TextInput,
  Image
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../services/AuthProvider';
import { getFoodSpots } from '../../services/ApiClient';
import FoodSpotItem from '../components/FoodSpotItem';
import colors from '../styles/colors';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getFullImageUrl } from '../utils/getFullImageUrl';

const SORT_OPTIONS = [
  { label: 'Highest First', value: 'desc' },
  { label: 'Lowest First', value: 'asc' },
];

interface FoodSpot {
  id: number;
  name: string;
  category: string;
  city: string;
  rating?: number;
  images?: any[];
}

interface HomeScreenProps {
  navigation: any;
}

const FilterModal = ({
  visible,
  onClose,
  selectedCategory,
  setSelectedCategory,
  sortDirection,
  setSortDirection,
  categories,
  sortOptions
}: {
  visible: boolean;
  onClose: () => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (dir: 'asc' | 'desc') => void;
  categories: string[];
  sortOptions: { label: string; value: string }[];
}) => (
  <Modal
    visible={visible}
    animationType="slide"
    transparent={true}
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Filter & Sort</Text>
        <Text style={styles.modalLabel}>Category</Text>
        <View style={styles.buttonListRow}>
          <TouchableOpacity
            style={[styles.optionButton, selectedCategory === '' && styles.optionButtonSelected]}
            onPress={() => setSelectedCategory('')}
          >
            <Text style={[styles.optionButtonText, selectedCategory === '' && styles.optionButtonTextSelected]}>All</Text>
          </TouchableOpacity>
          {categories.map((cat: string) => (
            <TouchableOpacity
              key={cat}
              style={[styles.optionButton, selectedCategory === cat && styles.optionButtonSelected]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.optionButtonText, selectedCategory === cat && styles.optionButtonTextSelected]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.modalLabel}>Sort by Rating</Text>
        <View style={styles.buttonListRow}>
          {sortOptions.map((opt: any) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.optionButton, sortDirection === opt.value && styles.optionButtonSelected]}
              onPress={() => setSortDirection(opt.value)}
            >
              <Text style={[styles.optionButtonText, sortDirection === opt.value && styles.optionButtonTextSelected]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={onClose}
          >
            <Text style={styles.modalButtonText}>Apply</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: colors.error }]}
            onPress={() => { setSelectedCategory(''); setSortDirection('desc'); onClose(); }}
          >
            <Text style={styles.modalButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
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
  });

  // Dynamically extract unique categories from foodSpots and format them
  const categories = useMemo(() => {
    const set = new Set<string>();
    (foodSpots as FoodSpot[]).forEach(spot => {
      if (spot.category) set.add(spot.category);
    });
    // Format: capitalize first letter, replace _ with space
    return Array.from(set)
      .map(cat => cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))
      .sort();
  }, [foodSpots]);

  const [searchText, setSearchText] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filter and sort food spots based on search, category, and sort direction
  const filteredFoodSpots = useMemo(() => {
    let spots = (foodSpots as FoodSpot[]).filter((spot: FoodSpot) => {
      const matchesSearch = spot.name.toLowerCase().includes(searchText.toLowerCase());
      const matchesCategory = !selectedCategory || spot.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    spots = spots.sort((a: FoodSpot, b: FoodSpot) => {
      if (sortDirection === 'asc') {
        return (a.rating || 0) - (b.rating || 0);
      } else {
        return (b.rating || 0) - (a.rating || 0);
      }
    });
    return spots;
  }, [foodSpots, searchText, selectedCategory, sortDirection]);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['foodSpots'] });
  }, [queryClient]);

  const navigateToDetail = useCallback((item: FoodSpot) => {
    navigation.navigate('FoodSpotDetail', { id: item.id, name: item.name });
  }, [navigation]);

  const renderItem = useCallback(({ item }: { item: FoodSpot }) => (
    <FoodSpotItem 
      item={item} 
      onPress={() => navigateToDetail(item)}
    />
  ), [navigateToDetail]);

  if (loading && !isFetching && (foodSpots as FoodSpot[]).length === 0) {
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
    <SafeAreaView style={styles.safeArea}>
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
              <Image source={{ uri: getFullImageUrl(user.images[0]) }} style={{ width: 43, height: 43, borderRadius: 20, backgroundColor: colors.white }} />
            ) : (
              <Feather name="user" size={24} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Feather name="search" size={20} color={colors.darkGray} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for food places..."
              placeholderTextColor={colors.darkGray}
              value={searchText}
              onChangeText={setSearchText}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Feather name="filter" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.sectionTitle}>Popular Food Places</Text>
        
        {isError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load food spots. Please try again.</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
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
              <Text style={styles.emptyText}>No food spots found.</Text>
            }
          />
        )}

        {/* Filter Modal */}
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
    paddingTop: 10, // Add extra padding to push content down from the top
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8, // Add margin to push header down from status bar
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
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  searchBar: {
    flex: 1,
    height: 46,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: colors.darkGray,
    fontSize: 14,
    height: 46,
  },
  filterButton: {
    width: 46,
    height: 46,
    backgroundColor: colors.white,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 350,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalLabel: {
    alignSelf: 'flex-start',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4,
    color: colors.primary,
  },
  buttonListRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 12,
    width: '100%',
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    marginRight: 8,
    marginBottom: 8,
  },
  optionButtonSelected: {
    backgroundColor: colors.primary,
  },
  optionButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  optionButtonTextSelected: {
    color: colors.white,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default HomeScreen;