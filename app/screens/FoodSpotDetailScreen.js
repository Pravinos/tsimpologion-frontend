import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import ReviewItem from '../components/ReviewItem';
import StarRating from '../components/StarRating';
import { foodSpots, reviews } from '../data/mockData';
import colors from '../styles/colors';

const FoodSpotDetailScreen = ({ route }) => {
  const { id } = route.params;
  const foodSpot = foodSpots.find(spot => spot.id === id);
  const spotReviews = reviews[id] || [];
  
  const [reviewText, setReviewText] = useState('');
  const [userRating, setUserRating] = useState(0);

  const openMap = () => {
    // This would open Google Maps with the location
    Linking.openURL(foodSpot.googleMapsLink);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconBackground}>
            <Feather name="map-pin" size={30} color={colors.primary} />
          </View>
          <Text style={styles.name}>{foodSpot.name}</Text>
          <View style={styles.ratingContainer}>
            <StarRating rating={foodSpot.rating} size={18} />
            <Text style={styles.ratingText}>{foodSpot.rating.toFixed(1)}</Text>
          </View>
          <Text style={styles.category}>{foodSpot.category} · {foodSpot.city}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Σχετικά</Text>
          <Text style={styles.description}>{foodSpot.description}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Τοποθεσία</Text>
          <Text style={styles.address}>{foodSpot.address}</Text>
          <TouchableOpacity style={styles.mapButton} onPress={openMap}>
            <Feather name="map" size={16} color={colors.white} />
            <Text style={styles.mapButtonText}>Δες το στο Google Maps</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <View style={styles.reviewHeader}>
            <Text style={styles.sectionTitle}>Αξιολογήσεις</Text>
            <Text style={styles.reviewCount}>{spotReviews.length} Αξιολογήσεις</Text>
          </View>
          
          {spotReviews.map(review => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Κάνε την δικιά σου αξιολόγηση</Text>
          <View style={styles.ratingSelector}>
            <Text style={styles.ratingLabel}>Βαθμολογία:</Text>
            <StarRating 
              rating={userRating} 
              size={24} 
              selectable={true}
              onRatingChange={setUserRating} 
            />
          </View>
          <TextInput
            style={styles.reviewInput}
            placeholder="Share your experience..."
            multiline
            value={reviewText}
            onChangeText={setReviewText}
          />
          <TouchableOpacity style={styles.submitButton}>
            <Text style={styles.submitButtonText}>ΥΠΟΒΟΛΗ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
  },
  iconBackground: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.black,
    textAlign: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.darkGray,
  },
  category: {
    fontSize: 16,
    color: colors.darkGray,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: colors.black,
    lineHeight: 24,
  },
  address: {
    fontSize: 16,
    color: colors.black,
    marginBottom: 10,
  },
  mapButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  mapButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  reviewCount: {
    fontSize: 16,
    color: colors.darkGray,
  },
  ratingSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  ratingLabel: {
    fontSize: 16,
    color: colors.black,
    marginRight: 10,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: colors.mediumGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default FoodSpotDetailScreen;
