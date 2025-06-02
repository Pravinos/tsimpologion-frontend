import React, { useState } from 'react';
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
import UserReviewItem from '../components/UserReviewItem';
import StarRating from '../components/StarRating';
import { createReview, updateReview, deleteReview, getFoodSpot, getReviews } from '../../services/ApiClient';
import { FoodSpot, Review } from '../../types/models';
import colors from '../styles/colors';
import { useAuth } from '../../services/AuthProvider';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getFullImageUrl } from '../utils/getFullImageUrl';

const FoodSpotDetailScreen = ({ route, navigation }: { route: any; navigation: any }) => {
  const { id } = route.params;
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  
  // Replace foodSpot state/effect with React Query
  const {
    data: foodSpot,
    isLoading: isLoadingSpot,
    isError: isSpotError,
    refetch: refetchSpot,
  } = useQuery({
    queryKey: ['foodSpot', id],
    queryFn: async () => {
      const response = await getFoodSpot(id);
      return response.data?.data || response.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  // Replace reviews state/effect with React Query
  const {
    data: reviews = [],
    isLoading: isLoadingReviews,
    isError: isReviewsError,
    refetch: refetchReviews,
  } = useQuery({
    queryKey: ['foodSpotReviews', id],
    queryFn: async () => {
      const response = await getReviews(id);
      return response.data?.data || response.data;
    },
    staleTime: 1000 * 60 * 2,
  });

  const [reviewText, setReviewText] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitReview = async () => {
    if (!token) {
      Alert.alert('Login Required', 'Please log in to leave a review.');
      navigation.navigate('Profile'); // Direct them to the profile screen to log in
      return;
    }

    if (userRating === 0) {
      Alert.alert('Rating Required', 'Please select a rating for your review.');
      return;
    }

    if (!reviewText.trim()) {
      Alert.alert('Comment Required', 'Please write a comment for your review.');
      return;
    }

    try {
      setIsSubmitting(true);
      await createReview(id, {
        rating: userRating as 1 | 2 | 3 | 4 | 5, // Cast to valid rating
        comment: reviewText,
        user_id: user?.id // Make sure user_id is included
      });
      setReviewText('');
      setUserRating(0);
      await queryClient.invalidateQueries({ queryKey: ['foodSpotReviews', id] });
      Alert.alert('Success', 'Your review has been submitted successfully!');
    } catch (err: any) {
      console.error('Failed to submit review:', err);
      const errorMessage = err.response?.data?.message || 'Failed to submit your review. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateReview = async (reviewId: number, data: { rating: number; comment: string }) => {
    try {
      await updateReview(id, reviewId, data);
      await queryClient.invalidateQueries({ queryKey: ['foodSpotReviews', id] });
    } catch (err: any) {
      console.error('Failed to update review:', err);
      throw err; // Re-throw to let UserReviewItem handle the error display
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    try {
      await deleteReview(id, reviewId);
      await queryClient.invalidateQueries({ queryKey: ['foodSpotReviews', id] });
    } catch (err: any) {
      console.error('Failed to delete review:', err);
      throw err; // Re-throw to let UserReviewItem handle the error display
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
          <TouchableOpacity style={styles.retryButton} onPress={() => refetchSpot()}>
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
            <StarRating 
              rating={foodSpot.rating || 0} 
              size={18} 
              selectable={false} 
              onRatingChange={() => {}} 
            />
            <Text style={styles.ratingText}>
              {foodSpot.rating ? foodSpot.rating.toFixed(1) : 'No ratings yet'}
            </Text>
          </View>
          <Text style={styles.category}>
            {foodSpot.category} · {foodSpot.city}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{foodSpot.description}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.address}>{foodSpot.address}</Text>
          <TouchableOpacity style={styles.mapButton} onPress={openMap}>
            <Feather name="map" size={16} color={colors.white} />
            <Text style={styles.mapButtonText}>View on Google Maps</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <View style={styles.reviewHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <Text style={styles.reviewCount}>{reviews.length} Reviews</Text>
          </View>
          
          {isLoadingReviews ? (
            <View style={styles.loadingReviewsContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Loading reviews...</Text>
            </View>
          ) : (
            <>
              {/* User's own review section */}
              {(() => {
                const userReview = reviews.find((review: Review) =>
                  review.user_id === user?.id || 
                  (typeof review.user === 'object' && review.user?.id === user?.id)
                );
                
                if (userReview && token) {
                  return (
                    <View style={styles.userReviewSection}>
                      <Text style={styles.userReviewTitle}>Your Review</Text>
                      <UserReviewItem 
                        key={userReview.id}
                        review={userReview}
                        onUpdate={handleUpdateReview}
                        onDelete={handleDeleteReview}
                      />
                    </View>
                  );
                }
                return null;
              })()}
              
              {/* Other users' reviews section */}
              {(() => {
                const otherReviews = reviews.filter((review: Review) =>
                  review.user_id !== user?.id && 
                  !(typeof review.user === 'object' && review.user?.id === user?.id)
                );
                
                if (otherReviews.length > 0) {
                  return (
                    <View style={styles.otherReviewsSection}>
                      {token && reviews.some((review: Review) =>
                        review.user_id === user?.id || 
                        (typeof review.user === 'object' && review.user?.id === user?.id)
                      ) && (
                        <Text style={styles.otherReviewsTitle}>Other Reviews</Text>
                      )}
                      {otherReviews.map((review: Review) => (
                        <ReviewItem 
                          key={review.id} 
                          review={{
                            ...review,
                            // Ensure user property has expected format for ReviewItem
                            user: review.user?.name || 'Unknown User'
                          }} 
                        />
                      ))}
                    </View>
                  );
                }
                
                // Show message if no other reviews exist
                if (reviews.length === 0 || 
                    (reviews.length === 1 && (
                      reviews[0].user_id === user?.id || 
                      (typeof reviews[0].user === 'object' && reviews[0].user?.id === user?.id)
                    ))) {
                  return (
                    <Text style={styles.noReviewsText}>
                      {reviews.length === 0 
                        ? "No reviews yet. Be the first to leave a review!" 
                        : "No other reviews yet."}
                    </Text>
                  );
                }
                
                return null;
              })()}
            </>
          )}
        </View>
        
        {/* Leave Your Review section - only show if user doesn't have a review yet */}
        {(() => {
          const userHasReview = token && reviews.some((review: Review) =>
            review.user_id === user?.id || 
            (typeof review.user === 'object' && review.user?.id === user?.id)
          );
          
          if (userHasReview) {
            return null; // Don't show the form if user already has a review
          }
          
          return (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Leave Your Review</Text>
              
              {!token ? (
                <View style={styles.loginPrompt}>
                  <Text style={styles.loginPromptText}>
                    Please log in to leave a review
                  </Text>
                  <TouchableOpacity 
                    style={styles.loginButton}
                    onPress={() => navigation.navigate('Profile')}
                  >
                    <Text style={styles.loginButtonText}>Log In</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View style={styles.ratingSelector}>
                    <Text style={styles.ratingLabel}>Rating:</Text>
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
                      <Text style={styles.submitButtonText}>SUBMIT</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          );
        })()}
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
  },
  userReviewSection: {
    marginBottom: 20,
  },
  userReviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.primary,
  },
  otherReviewsSection: {
    marginTop: 10,
  },
  otherReviewsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.black,
  },
});

export default FoodSpotDetailScreen;