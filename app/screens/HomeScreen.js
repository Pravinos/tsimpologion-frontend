import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity,
  SafeAreaView 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import FoodSpotItem from '../components/FoodSpotItem';
import { foodSpots } from '../data/mockData';
import colors from '../styles/colors';

const HomeScreen = ({ navigation }) => {
  const renderItem = ({ item }) => (
    <FoodSpotItem 
      item={item} 
      onPress={() => navigation.navigate('FoodSpotDetail', { 
        id: item.id,
        name: item.name
      })} 
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>Καλώς Ήρθες στο</Text>
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
          <View style={styles.searchBar}>
            <Feather name="search" size={20} color={colors.darkGray} />
            <Text style={styles.searchPlaceholder}>Αναζήτησε μέρη για φαγητό...</Text>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Feather name="filter" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.sectionTitle}>Δημοφιλή Μέρη για Φαγητό</Text>
        
        <FlatList
          data={foodSpots}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcome: {
    fontSize: 16,
    color: colors.darkGray,
  },
  title: {
    fontSize: 24,
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
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    height: 50,
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  searchPlaceholder: {
    color: colors.darkGray,
    marginLeft: 10,
    fontSize: 16,
  },
  filterButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    backgroundColor: colors.white,
    borderRadius: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default HomeScreen;
