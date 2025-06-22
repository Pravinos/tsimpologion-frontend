// filepath: c:\tsimpologion-app\tsimpologion-frontend\app\screens\FoodSpotDetailScreen.tsx
import React, { useState, useRef } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { ScrollView } from 'react-native';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Components
import { ReviewsSection, ReviewForm } from '../components/Reviews';
import { 
  FoodSpotHeader, 
  FoodSpotDetailsSection, 
  FoodSpotAboutSection, 
  FoodSpotBusinessHoursSection, 
  FoodSpotSocialLinksSection,
  BusinessHourIndicator 
} from '../components/FoodSpot';
import { ImageCarousel } from '../components/UI';

// Hooks and utilities
import { useEffect } from 'react';
import { useAuth } from '../../services/AuthProvider';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { getFullImageUrl } from '../utils/getFullImageUrl';
import { useBusinessHours } from '../hooks/useBusinessHours';
import { parseSocialLinks } from '../utils/parseSocialLinks';

// API services
import { 
  createReview, 
  updateReview, 
  deleteReview, 
  getFoodSpot, 
  getReviews, 
  uploadImage, 
  addFavourite, 
  removeFavourite, 
  getFavourites,
  toggleReviewLike,
  deleteImage,
  viewAllImages
} from '../../services/ApiClient';

// Types and styles
import { FoodSpot, Review, User } from '../../types/models';
import { ScreenProps } from '../types/appTypes';
import colors from '../styles/colors';

// Type for the route parameters
interface FoodSpotDetailParams {
  foodSpot: FoodSpot;
}

const FoodSpotDetailScreen: React.FC<ScreenProps> = ({ route, navigation }) => {
  if (!route) return null; // Add a guard for the route
  const { foodSpot: initialFoodSpot } = route.params as unknown as FoodSpotDetailParams;
  const id = initialFoodSpot.id;
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // State for review submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [sortOrder, setSortOrder] = useState<'recent' | 'liked'>('recent'); // Added

  // React Query for food spot details
  const {
    data: foodSpot,
    isLoading: isLoadingSpot,
    isError: isSpotError,
    refetch: refetchSpot,
  } = useQuery<FoodSpot>({
    queryKey: ['foodSpot', id],
    queryFn: async () => {
      const response = await getFoodSpot(id);
      return response.data?.data || response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    initialData: initialFoodSpot,
  });

  // Dedicated React Query for spot images to allow for separate caching and invalidation
  const { 
    data: spotImages,
  } = useQuery<(string | { url: string })[]>({
    queryKey: ['spotImages', id],
    queryFn: async () => {
      const response = await getFoodSpot(id);
      const spotData = response.data?.data || response.data;
      return spotData?.images || [];
    },
    // No staleTime, so it defaults to 0 and is always considered stale.
  });

  // React Query for reviews
  const {
    data: reviewsResult,
    isLoading: isLoadingReviews,
    isError: isReviewsError,
    refetch: refetchReviews,
  } = useQuery<{ reviews: Review[]; total: number }>({
    queryKey: ['foodSpotReviews', id, sortOrder], // Include sortOrder in queryKey
    queryFn: async () => {
      let apiParams = {};
      if (sortOrder === 'liked') {
        apiParams = { sort: 'most_liked' };
      } else if (sortOrder === 'recent') {
        apiParams = { sort: 'recent' }; // Updated to use 'recent' for sorting by most recent
      }
      const response = await getReviews(id, apiParams);
      const reviewsData = response.data?.data || response.data || [];
      const totalCount = response.data?.meta?.total ?? response.data?.total ?? foodSpot?.reviews_count ?? reviewsData.length;
      const mappedReviews = reviewsData.map((review: Review) => ({
        ...review,
        is_liked: review.is_liked ?? false,
        likes_count: review.likes_count ?? 0,
      }));
      return { reviews: mappedReviews, total: totalCount };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const reviews = reviewsResult?.reviews || [];
  const totalReviewCount = reviewsResult?.total ?? foodSpot?.reviews_count ?? 0;

  // React Query for favorites
  const { 
    data: favourites = [], 
    refetch: refetchFavourites 
  } = useQuery<FoodSpot[]>({
    queryKey: ['favourites'],
    queryFn: async () => {
      const response = await getFavourites();
      return response.data?.data || response.data || []; 
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: typeof token === 'string' && !!token,
  });

  const isFavourite = Array.isArray(favourites) && 
    foodSpot && 
    favourites.some(f => f.id === foodSpot.id);
  
  const { isOpen, formattedHours } = useBusinessHours(foodSpot?.business_hours);
  
  const socialLinks = parseSocialLinks(foodSpot?.social_links);

  const allReviewImages = reviews.flatMap(review => review.images?.map(img => getFullImageUrl(img)) || []);

  const userHasReview = token && reviews.some((review: Review) =>
    review.user_id === user?.id || 
    (typeof review.user === 'object' && review.user?.id === user?.id)
  );

  const toggleFavouriteMutation = useMutation({    
    mutationFn: async (currentIsFavourite: boolean) => {
      if (!foodSpot) throw new Error("Food spot not loaded");
      if (currentIsFavourite) {
        return removeFavourite(foodSpot.id);
      } else {
        return addFavourite(foodSpot.id);
      }
    },
    onMutate: async (currentIsFavourite: boolean) => {
      if (!foodSpot) return;
      await queryClient.cancelQueries({ queryKey: ['favourites'] });
      const previousFavourites = queryClient.getQueryData<FoodSpot[]>(['favourites']);
      queryClient.setQueryData<FoodSpot[]>(['favourites'], (oldFavourites = []) => {
        if (currentIsFavourite) {
          return oldFavourites.filter(fs => fs.id !== foodSpot.id);
        } else {
          return [...oldFavourites, foodSpot];
        }
      });
      return { previousFavourites };
    },
    onError: (err, currentIsFavourite, context) => {
      Alert.alert('Error', 'Failed to update favourites.');
      if (context?.previousFavourites) {
        queryClient.setQueryData(['favourites'], context.previousFavourites);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favourites'] });
      queryClient.invalidateQueries({ queryKey: ['foodSpots'] });
    },
  });

  const handleToggleFavourite = async () => {
    if (!token) {
      Alert.alert('Login Required', 'Please log in to add favourites.');
      navigation.navigate('Profile');
      return;
    }
    if (!foodSpot || typeof isFavourite === 'undefined') return;
    toggleFavouriteMutation.mutate(isFavourite);
  };

  const handleSubmitReview = async (
    rating: number, 
    comment: string, 
    images: ImagePicker.ImagePickerAsset[]
  ) => {
    if (!token) {
      Alert.alert('Login Required', 'Please log in to leave a review.');
      navigation.navigate('Profile');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // 1. Create the review
      const reviewRes = await createReview(id, {
        rating: rating as 1 | 2 | 3 | 4 | 5,
        comment: comment,
        user_id: user?.id
      });
      
      const reviewId = reviewRes.data?.id || reviewRes.data?.data?.id;

      // 2. Upload images if selected
      if (images && images.length > 0 && reviewId) {
        setImageUploading(true);
        
        const formData = new FormData();
        images.forEach(image => {
          const uri = image.uri;
          let fileName = image.fileName;
          let fileType = image.mimeType || image.type;
          
          if (!fileName) {
            const uriParts = uri.split('/');
            fileName = uriParts[uriParts.length - 1] || `review_${Date.now()}.jpg`;
          }
          
          if (!fileType) {
            if (fileName.endsWith('.png')) fileType = 'image/png';
            else fileType = 'image/jpeg';
          }
          
          if (!fileName.match(/\.(jpg|jpeg|png)$/i)) {
            fileName += fileType === 'image/png' ? '.png' : '.jpg';
          }
          
          // @ts-ignore: React Native FormData allows this object for file upload
          formData.append('images[]', { uri, type: fileType, name: fileName });
        });

        await uploadImage('reviews', reviewId, formData);
        setImageUploading(false);
      }

      // 3. Refresh data
      await queryClient.invalidateQueries({ queryKey: ['foodSpotReviews', id, 'recent'] });
      await queryClient.invalidateQueries({ queryKey: ['foodSpotReviews', id, 'liked'] });
      await queryClient.invalidateQueries({ queryKey: ['foodSpot', id] });
      await queryClient.invalidateQueries({ queryKey: ['userReviews'] });
      await refetchSpot();
      
      Alert.alert('Success', 'Your review has been submitted successfully!');
    } catch (err: any) {
      console.error('Failed to submit review:', err, err?.response?.data);
      const errorMessage = err.response?.data?.message || 'Failed to submit your review. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
      setImageUploading(false);
    }
  };

  // Handler to update an existing review
  const handleUpdateReview = async (reviewId: number, data: { 
    rating?: number; 
    comment?: string; 
    newImages?: ImagePicker.ImagePickerAsset[];
    deletedImageIds?: number[];
  }) => {
    try {
      // 1. Update text if it's provided
      if (typeof data.rating === 'number' || typeof data.comment === 'string') {
        await updateReview(id, reviewId, { rating: data.rating, comment: data.comment });
      }

      // 2. Delete images marked for deletion
      if (data.deletedImageIds && data.deletedImageIds.length > 0) {
        await Promise.all(
          data.deletedImageIds.map(imageId => deleteImage('reviews', reviewId, imageId))
        );
      }

      // 3. If there are new images, upload them
      if (data.newImages && data.newImages.length > 0) {
        setImageUploading(true);
        const formData = new FormData();
        
        data.newImages.forEach(image => {
          const uri = image.uri;
          let fileName = image.fileName;
          let fileType = image.mimeType || image.type;

          if (!fileName) {
            const uriParts = uri.split('/');
            fileName = uriParts[uriParts.length - 1] || `review_${Date.now()}.jpg`;
          }

          if (!fileType) {
            if (fileName.endsWith('.png')) fileType = 'image/png';
            else fileType = 'image/jpeg';
          }
          // @ts-ignore
          formData.append('images[]', { uri, type: fileType, name: fileName });
        });

        await uploadImage('reviews', reviewId, formData);
        setImageUploading(false);
      }

      // 4. Invalidate queries to refetch data
      await queryClient.invalidateQueries({ queryKey: ['foodSpotReviews', id, 'recent'] });
      await queryClient.invalidateQueries({ queryKey: ['foodSpotReviews', id, 'liked'] });
      await queryClient.invalidateQueries({ queryKey: ['foodSpot', id] });
      await queryClient.invalidateQueries({ queryKey: ['userReviews'] });
      await refetchSpot();

    } catch (err: any) {
      console.error('Failed to update review:', err);
      throw err; // Re-throw error to be handled by the calling component
    } finally {
      setImageUploading(false);
    }
  };

  // Handler to delete a review
  const handleDeleteReview = async (reviewId: number) => {
    try {
      await deleteReview(id, reviewId);
      await queryClient.invalidateQueries({ queryKey: ['foodSpotReviews', id] });
      await queryClient.invalidateQueries({ queryKey: ['foodSpot', id] });
      // Also invalidate userReviews to update the profile page review count
      await queryClient.invalidateQueries({ queryKey: ['userReviews'] });
      await refetchSpot();
    } catch (err: any) {
      console.error('Failed to delete review:', err);
      throw err;
    }
  };

  // Handler to toggle review like
  const handleToggleReviewLike = async (reviewId: number) => {
    if (!token) {
      Alert.alert('Login Required', 'Please log in to like reviews.');
      navigation.navigate('Profile');
      return;
    }
    try {
      // Optimistic update for the item in the current sort order
      queryClient.setQueryData<{ reviews: Review[]; total: number } | undefined>(
        ['foodSpotReviews', id, sortOrder], 
        (oldData) => {
          if (!oldData) return undefined;
          return {
            ...oldData,
            reviews: oldData.reviews.map(review => {
              if (review.id === reviewId) {
                return {
                  ...review,
                  is_liked: !review.is_liked,
                  likes_count: review.is_liked ? (review.likes_count || 1) - 1 : (review.likes_count || 0) + 1,
                };
              }
              return review;
            }),
          };
        }
      );

      const response = await toggleReviewLike(reviewId);
      const updatedReviewData = response.data?.review; 

      // After the API call, update the cache with the authoritative data from the server for the current sort order
      queryClient.setQueryData<{ reviews: Review[]; total: number } | undefined>(
        ['foodSpotReviews', id, sortOrder], 
        (oldData) => {
          if (!oldData) return undefined;
          return {
            ...oldData,
            reviews: oldData.reviews.map(review => {
              if (review.id === reviewId) {
                if (updatedReviewData) {
                  return {
                    ...review,
                    ...updatedReviewData, 
                    is_liked: updatedReviewData.is_liked ?? review.is_liked, // Fallback to optimistic
                    likes_count: updatedReviewData.likes_count ?? review.likes_count // Fallback to optimistic
                  };
                }
                return review; 
              }
              return review;
            }),
          };
        }
      );

      // Invalidate both sort orders to ensure fresh data and correct sorting for both.
      // This is simpler and more robust than trying to conditionally update/invalidate only one.
      // When the user switches sort order, they will get fresh, correctly sorted data.
      await queryClient.invalidateQueries({ queryKey: ['foodSpotReviews', id, 'liked'] });
      await queryClient.invalidateQueries({ queryKey: ['foodSpotReviews', id, 'recent'] });
      
      // Also invalidate user-specific reviews if they show like counts/status
      await queryClient.invalidateQueries({ queryKey: ['userReviews'] });

    } catch (err: any) {
      Alert.alert('Error', 'Failed to update like status.');
      console.error('Failed to toggle review like:', err);
      // Revert optimistic update on error by invalidating all relevant review queries
      queryClient.invalidateQueries({ queryKey: ['foodSpotReviews', id, 'liked'] });
      queryClient.invalidateQueries({ queryKey: ['foodSpotReviews', id, 'recent'] });
      queryClient.invalidateQueries({ queryKey: ['userReviews'] });
    }
  };


  // Loading state
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

  // Error state
  if (isSpotError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load food spot details.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetchSpot()}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Not found state
  if (!foodSpot) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Food spot not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          style={styles.container}
          keyboardShouldPersistTaps="handled"
          ref={scrollViewRef}
        >
          <FoodSpotHeader
            name={foodSpot.name}
            rating={foodSpot.average_rating ? parseFloat(foodSpot.average_rating) : foodSpot.rating}
            category={foodSpot.category}
            price_range={foodSpot.price_range}
            isFavourite={isFavourite} 
            onToggleFavourite={handleToggleFavourite} 
            showFavourite={true}
          />

          {spotImages && spotImages.length > 0 && (
            <ImageCarousel images={spotImages} title="Spot Photos" />
          )}

          <View style={styles.mainContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Details</Text>
              <FoodSpotDetailsSection 
                address={foodSpot.address} 
                phone={foodSpot.phone} 
                website={foodSpot.info_link}
                distance={null}
              />
            </View>

            {foodSpot.description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>About</Text>
                <FoodSpotAboutSection about={foodSpot.description} />
              </View>
            )}

            {formattedHours.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <Text style={[styles.sectionTitle, styles.sectionTitleWithIndicator]}>Business Hours</Text>
                  <BusinessHourIndicator isOpen={isOpen} />
                </View>
                <FoodSpotBusinessHoursSection business_hours={formattedHours} />
              </View>
            )}

            {Object.keys(socialLinks).length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Social Links</Text>
                <FoodSpotSocialLinksSection social_links={socialLinks} />
              </View>
            )}

            <View style={[styles.section, styles.reviewsCard]}>
              {allReviewImages.length > 0 && (
                <View style={styles.subSection}>
                  <ImageCarousel images={allReviewImages} title="Community Photos" isCard={false} />
                </View>
              )}
            </View>

            {/* Reviews Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reviews</Text>
         
              <ReviewsSection 
                reviews={reviews}
                isLoading={isLoadingReviews}
                userId={user?.id}
                onUpdateReview={handleUpdateReview}
                onDeleteReview={handleDeleteReview}
                onToggleLike={handleToggleReviewLike}
                currentSortOrder={sortOrder} // Pass sortOrder state
                onSortOrderChange={setSortOrder} // Pass setSortOrder function
                totalReviewCount={totalReviewCount}
              />
            </View>
            

            {/* Leave Your Review section - only show if user doesn't have a review yet */}
            {!userHasReview && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Leave Your Review</Text>
                
                <ReviewForm
                  isLoggedIn={!!token}
                  isSubmitting={isSubmitting}
                  imageUploading={imageUploading}
                  onSubmit={handleSubmitReview}
                  onNavigateToLogin={() => navigation.navigate('Profile')}
                />
              </View>
            )}
          </View>
        </ScrollView>
        {user?.role === 'spot_owner' && user?.id === (foodSpot?.user?.id || foodSpot?.user_id || foodSpot?.owner_id) && (
            <TouchableOpacity 
                style={styles.fab}
                onPress={() => navigation.navigate('EditFoodSpot', { foodSpotId: foodSpot.id })}
            >
                <MaterialCommunityIcons name="pencil-outline" size={24} color={colors.white} />
            </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
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
    backgroundColor: '#f4f5f7',
  },
  mainContent: {
    paddingBottom: 20,
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
  reviewsCard: {
    padding: 0, // Remove padding to allow subsections to control it
  },
  subSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.darkGray,
    marginBottom: 15,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitleWithIndicator: {
    flex: 1,
    marginBottom: 0,
    color: colors.darkGray,
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
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: colors.primary,
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default FoodSpotDetailScreen;