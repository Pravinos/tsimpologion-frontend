import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Linking,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import ReviewItem from '../components/ReviewItem';
import StarRating from '../components/StarRating';
import { getFoodSpot, getReviews, createReview } from '../../services/ApiClient';
import { FoodSpot, Review } from '../../types/models';
import colors from '../styles/colors';
import { useAuth } from '../../services/AuthProvider';

const FoodSpotDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { token, user } = useAuth();
  
  const [foodSpot, setFoodSpot] = useState<FoodSpot | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewText, setReviewText] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [isLoadingSpot, setIsLoadingSpot] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFoodSpot();
    fetchReviews();
  }, [id]);

  const fetchFoodSpot = async () => {
    try {
      setIsLoadingSpot(true);
      const response = await getFoodSpot(id);
      // Check if the data is nested inside a data property or directly in the response
      const spotData = response.data?.data || response.data;
      setFoodSpot(spotData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch food spot:', err);
      setError('Failed to load food spot details.');
    } finally {
      setIsLoadingSpot(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setIsLoadingReviews(true);
      const response = await getReviews(id);
      // Handle both paginated and non-paginated responses
      const reviewsData = response.data?.data || response.data;
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      // We don't set the main error state here to still show the food spot details
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!token) {
      Alert.alert('Σύνδεση Απαιτείται', 'Παρακαλώ συνδεθείτε για να αφήσετε αξιολόγηση.');
      navigation.navigate('Profile'); // Direct them to the profile screen to log in
      return;
    }

    if (userRating === 0) {
      Alert.alert('Απαιτείται Βαθμολογία', 'Παρακαλώ επιλέξτε μια βαθμολογία για την αξιολόγησή σας.');
      return;
    }

    if (!reviewText.trim()) {
      Alert.alert('Απαιτείται Σχόλιο', 'Παρακαλώ γράψτε ένα σχόλιο για την αξιολόγησή σας.');
      return;
    }

    try {
      setIsSubmitting(true);
      await createReview(id, {
        rating: userRating as 1 | 2 | 3 | 4 | 5, // Cast to valid rating
        comment: reviewText,
        user_id: user?.id // Make sure user_id is included
      });
      
      // Clear the form and refresh reviews
      setReviewText('');
      setUserRating(0);
      fetchReviews();
      
      Alert.alert('Επιτυχία', 'Η αξιολόγησή σας υποβλήθηκε με επιτυχία!');
    } catch (err) {
      console.error('Failed to submit review:', err);
      const errorMessage = err.response?.data?.message || 'Δεν ήταν δυνατή η υποβολή της αξιολόγησής σας. Παρακαλώ δοκιμάστε ξανά.';
      Alert.alert('Σφάλμα', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openMap = () => {
    // Try to use the info_link from the API first, fallback to a Google Maps search
    if (foodSpot?.info_link) {
      Linking.openURL(foodSpot.info_link);
    } else if (foodSpot?.address) {
      // Create a Google Maps search URL with the address
      const mapUrl = `https://maps.google.com/?q=${encodeURIComponent(
        `${foodSpot.name}, ${foodSpot.address}, ${foodSpot.city}`
      )}`;
      Linking.openURL(mapUrl);
    }
  };

  if (isLoadingSpot) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchFoodSpot}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!foodSpot) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Food spot not found.</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconBackground}>
            <Feather name="map-pin" size={30} color={colors.primary} />
          </View>
          <Text style={styles.name}>{foodSpot.name}</Text>
          <View style={styles.ratingContainer}>
            <StarRating rating={foodSpot.rating || 0} size={18} />
            <Text style={styles.ratingText}>
              {foodSpot.rating ? foodSpot.rating.toFixed(1) : 'No ratings yet'}
            </Text>
          </View>
          <Text style={styles.category}>
            {foodSpot.category} · {foodSpot.city}
          </Text>
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
            <Text style={styles.reviewCount}>{reviews.length} Αξιολογήσεις</Text>
          </View>
          
          {isLoadingReviews ? (
            <View style={styles.loadingReviewsContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Loading reviews...</Text>
            </View>
          ) : reviews.length > 0 ? (
            reviews.map(review => (
              <ReviewItem 
                key={review.id} 
                review={{
                  ...review,
                  // Ensure user property has expected format for ReviewItem
                  user: review.user?.name || 'Unknown User'
                }} 
              />
            ))
          ) : (
            <Text style={styles.noReviewsText}>No reviews yet. Be the first to leave a review!</Text>
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Κάνε την δικιά σου αξιολόγηση</Text>
          
          {!token ? (
            <View style={styles.loginPrompt}>
              <Text style={styles.loginPromptText}>
                Παρακαλώ συνδεθείτε για να αφήσετε αξιολόγηση
              </Text>
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={() => navigation.navigate('Profile')}
              >
                <Text style={styles.loginButtonText}>Σύνδεση</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
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
                editable={!isSubmitting}
              />
              <TouchableOpacity 
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSubmitReview}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.submitButtonText}>ΥΠΟΒΟΛΗ</Text>
                )}
              </TouchableOpacity>
            </>
          )}
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
    borderBottomColor: colors.lightGray,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  iconBackground: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.darkGray,
  },
  category: {
    fontSize: 16,
    color: colors.darkGray,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.black,
  },
  address: {
    fontSize: 16,
    color: colors.black,
    marginBottom: 10,
  },
  mapButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 14,
    color: colors.darkGray,
  },
  ratingSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  ratingLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  reviewInput: {
    height: 100,
    borderWidth: 1,
    borderColor: colors.mediumGray,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  submitButtonDisabled: {
    backgroundColor: colors.mediumGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingReviewsContainer: {
    padding: 20,
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
  noReviewsText: {
    textAlign: 'center',
    fontSize: 16,
    color: colors.darkGray,
    marginTop: 10,
    marginBottom: 10,
  },
  loginPrompt: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
  },
  loginPromptText: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 10,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  loginButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  }
});

export default FoodSpotDetailScreen;