import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../services/AuthProvider';
import { getFoodSpots } from '../../services/ApiClient';
import FoodSpotItem from '../components/FoodSpotItem';
import colors from '../styles/colors';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [foodSpots, setFoodSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchFoodSpots();
  }, []);

  const fetchFoodSpots = async () => {
    try {
      setLoading(true);
      const response = await getFoodSpots();
      // Check API response structure and adjust accordingly
      const spots = response.data.data || response.data;
      setFoodSpots(spots);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch food spots:', err);
      setError('Failed to load food spots. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFoodSpots();
  };

  const navigateToDetail = (item) => {
    navigation.navigate('FoodSpotDetail', { id: item.id, name: item.name });
  };

  const renderItem = ({ item }) => (
    <FoodSpotItem 
      item={item} 
      onPress={() => navigateToDetail(item)}
    />
  );

  if (loading && !refreshing && foodSpots.length === 0) {
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
            <Text style={styles.welcome}>Καλώς Ήρθες{user ? ` ${user.name}` : ''}</Text>
            <Text style={styles.title}>Τσιμπολόγιον</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Feather name="user" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchContainer}>
          <TouchableOpacity 
            style={styles.searchBar}
            onPress={() => navigation.navigate('Search')}
          >
            <Feather name="search" size={20} color={colors.darkGray} />
            <Text style={styles.searchPlaceholder}>Αναζήτησε μέρη για φαγητό...</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => navigation.navigate('Filter')}
          >
            <Feather name="filter" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.sectionTitle}>Δημοφιλή Μέρη για Φαγητό</Text>
        
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchFoodSpots}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={foodSpots}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No food spots found.</Text>
            }
          />
        )}
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
    width: 40,
    height: 40,
    borderRadius: 20,
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
  searchPlaceholder: {
    marginLeft: 8,
    color: colors.darkGray,
    fontSize: 14,
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
});

export default HomeScreen;