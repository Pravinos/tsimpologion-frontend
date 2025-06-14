// filepath: c:\\tsimpologion-app\\tsimpologion-frontend\\app\\screens\\FoodSpotDetailScreen.tsx
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

// Components
import { ReviewImagesCarousel, ReviewsSection, ReviewForm } from '../components/Reviews';
import { 
  FoodSpotHeader, 
  FoodSpotDetailsSection, 
  FoodSpotAboutSection, 
  FoodSpotBusinessHoursSection, 
  FoodSpotSocialLinksSection,
  BusinessHourIndicator 
} from '../components/FoodSpot';

// Hooks and utilities
import { useEffect } from 'react';
import { useAuth } from '../../services/AuthProvider';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  toggleReviewLike // Removed checkReviewLikeStatus as it's no longer needed here
} from '../../services/ApiClient';

// Types and styles
import { FoodSpot, Review } from '../../types/models';
import { ScreenProps } from '../types/appTypes';
import colors from '../styles/colors';

// Type for the route parameters
interface FoodSpotDetailParams {
  id: number;
  name?: string;
}

const FoodSpotDetailScreen: React.FC<ScreenProps> = ({ route, navigation }) => {
  const { id } = route.params as unknown as FoodSpotDetailParams;
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
  });

  // React Query for reviews
  const {
    data: reviews = [],
    isLoading: isLoadingReviews,
    isError: isReviewsError,
    refetch: refetchReviews,
  } = useQuery<Review[]>({
    queryKey: ['foodSpotReviews', id, sortOrder], // Include sortOrder in queryKey
    queryFn: async () => {
      let apiParams = {};
      if (sortOrder === 'liked') {
        apiParams = { sort: 'most_liked' };
      } else if (sortOrder === 'recent') {
        apiParams = { sort: 'recent' }; // Updated to use 'recent' for sorting by most recent
      }
      // If your backend defaults to most_recent (or just 'recent') when no sort param is given,
      // and you only want to send a sort param for \'most_liked\', you could adjust logic further.
      // For now, it explicitly sends sort='recent' or sort='most_liked'.

      const response = await getReviews(id, apiParams);
      const reviewsData = response.data?.data || response.data || [];
      return reviewsData.map((review: Review) => ({
        ...review,
        is_liked: review.is_liked ?? false,
        likes_count: review.likes_count ?? 0,
      }));
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // React Query for favorites
  const { 
    data: favourites = [], 
    refetch: refetchFavourites 
  } = useQuery<FoodSpot[]>({
    queryKey: ['favourites'],
    queryFn: async () => {
      const response = await getFavourites();
      return response.data?.data || response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: typeof token === 'string' && !!token,
  });

  // Check if food spot is a favorite
  const isFavourite = Array.isArray(favourites) && 
    foodSpot && 
    favourites.some(f => f.id === foodSpot.id);
  
  // Use custom hook for business hours
  const { isOpen, formattedHours } = useBusinessHours(foodSpot?.business_hours);
  
  // Parse social links
  const socialLinks = parseSocialLinks(foodSpot?.social_links);

  // Check if user already has a review
  const userHasReview = token && reviews.some((review: Review) =>
    review.user_id === user?.id || 
    (typeof review.user === 'object' && review.user?.id === user?.id)
  );

  // Handler to toggle favorite status
  const handleToggleFavourite = async () => {
    if (!token) {
      Alert.alert('Login Required', 'Please log in to add favourites.');
      navigation.navigate('Profile');
      return;
    }
    
    if (!foodSpot) return;
    
    try {
      if (isFavourite) {
        await removeFavourite(foodSpot.id);
      } else {
        await addFavourite(foodSpot.id);
      }
      
      // Invalidate relevant queries
      await queryClient.invalidateQueries({ queryKey: ['favourites'] });
      await queryClient.invalidateQueries({ queryKey: ['foodSpots'] });
    } catch (err) {
      Alert.alert('Error', 'Failed to update favourites.');
    }
  };

  // Handler to submit a new review
  const handleSubmitReview = async (
    rating: number, 
    comment: string, 
    selectedImage: ImagePicker.ImagePickerAsset | null
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
      
      // 2. Upload image if selected
      const reviewId = reviewRes.data?.id || reviewRes.data?.data?.id;
      if (selectedImage && reviewId) {
        setImageUploading(true);
        
        const formData = new FormData();
        const uri = selectedImage.uri;
        let fileName = selectedImage.fileName;
        let fileType = selectedImage.mimeType || selectedImage.type;
        
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

        // Use fetch for upload
        const { API_BASE_URL } = require('../../services/ApiClient');
        const uploadUrl = `${API_BASE_URL}/images/reviews/${reviewId}`;
        
        const fetchRes = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          body: formData,
        });
        
        const uploadRes = await fetchRes.json();
        if (uploadRes.errors) {
          throw new Error(uploadRes.message || 'Image upload failed.');
        }
        
        setImageUploading(false);
      }
        // 3. Refresh data
      await queryClient.invalidateQueries({ queryKey: ['foodSpotReviews', id] });
      await queryClient.invalidateQueries({ queryKey: ['foodSpot', id] });
      // Also invalidate userReviews to update the profile page review count
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
  const handleUpdateReview = async (reviewId: number, data: { rating: number; comment: string }) => {
    try {
      await updateReview(id, reviewId, data);
      await queryClient.invalidateQueries({ queryKey: ['foodSpotReviews', id] });
      await queryClient.invalidateQueries({ queryKey: ['foodSpot', id] });
      // Also invalidate userReviews to update the profile page review count
      await queryClient.invalidateQueries({ queryKey: ['userReviews'] });
      await refetchSpot();
    } catch (err: any) {
      console.error('Failed to update review:', err);
      throw err;
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
      // Optimistic update (optional, but good for UX)
      queryClient.setQueryData<Review[]>(['foodSpotReviews', id, sortOrder], (oldData) => {
        return oldData?.map(review => {
          if (review.id === reviewId) {
            return {
              ...review,
              is_liked: !review.is_liked,
              likes_count: review.is_liked ? (review.likes_count || 1) - 1 : (review.likes_count || 0) + 1,
            };
          }
          return review;
        });
      });

      const response = await toggleReviewLike(reviewId);
      const updatedReviewData = response.data?.review; // Assuming the backend sends back the updated review

      // After the API call, update the cache with the authoritative data from the server
      queryClient.setQueryData<Review[]>(['foodSpotReviews', id, sortOrder], (oldData) => {
        return oldData?.map(review => {
          if (review.id === reviewId) {
            // If backend provides the full updated review, use it
            if (updatedReviewData) {
              return {
                ...review, // keep other parts of the review object from cache if not in updatedReviewData
                ...updatedReviewData, 
                is_liked: updatedReviewData.is_liked ?? review.is_liked, // fallback to optimistic if not present
                likes_count: updatedReviewData.likes_count ?? review.likes_count // fallback to optimistic if not present
              };
            } else {
              // If backend only sends success/failure, we might need to refetch or rely on optimistic update
              // For now, let's assume the optimistic update was correct or refetch if no data came back
              // To be more robust, the toggleReviewLike should ideally return the new like status and count.
              // Based on your description, it does: "The toggle response includes the new like status and count"
              // So, updatedReviewData should contain is_liked and likes_count.
              // If not, we would refetch:
              // queryClient.invalidateQueries({ queryKey: ['foodSpotReviews', id, sortOrder] });
              // return oldData; // or the optimistically updated data
              // For now, assuming updatedReviewData has what we need or optimistic is fine
              return review; // This line would be hit if updatedReviewData is null/undefined
            }
          }
          return review;
        });
      });
      // If you have other queries that depend on review like status (e.g., user's liked reviews), invalidate them too.
      await queryClient.invalidateQueries({ queryKey: ['userReviews'] }); // If user's own reviews list shows likes

    } catch (err: any) {
      Alert.alert('Error', 'Failed to update like status.');
      console.error('Failed to toggle review like:', err);
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['foodSpotReviews', id, sortOrder] });
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

  // Collect all review images for the carousel
  const allReviewImages = (reviews || [])
    .flatMap((r: Review) => (Array.isArray(r.images) ? r.images : []))
    .map((img: any) => getFullImageUrl(img))
    .filter(Boolean);

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
          {/* Header Section */}
          <FoodSpotHeader
            name={foodSpot.name}
            rating={foodSpot.rating}
            category={foodSpot.category}
            price_range={foodSpot.price_range}
            isFavourite={isFavourite}
            onToggleFavourite={handleToggleFavourite}
            showFavourite={!!token}
          />

          {/* Review Images Carousel */}
          {allReviewImages.length > 0 && (
            <ReviewImagesCarousel images={allReviewImages} />
          )}

          {/* Details Card */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            <FoodSpotDetailsSection
              address={foodSpot.address}
              distance={foodSpot.distance}
              phone={foodSpot.phone}
              website={foodSpot.info_link}
            />
          </View>

          {/* About Card */}
          {foodSpot.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <FoodSpotAboutSection about={foodSpot.description} />
            </View>
          )}

          {/* Business Hours Card */}
          {foodSpot.business_hours && (
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Text style={[styles.sectionTitle, styles.sectionTitleWithIndicator]}>
                  Business Hours
                </Text>
                <BusinessHourIndicator isOpen={isOpen} />
              </View>
              <FoodSpotBusinessHoursSection business_hours={formattedHours} />
            </View>
          )}

          {/* Social Links Card */}
          {Object.keys(socialLinks).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Social Links</Text>
              <FoodSpotSocialLinksSection social_links={socialLinks} />
            </View>
          )}

          {/* Reviews Section */}
          <View style={styles.section}>
            <View style={styles.reviewHeader}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              {/* Sort buttons and review count will be moved to ReviewsSection */}
            </View>
            {/* <Text style={styles.reviewCount}>{Array.isArray(reviews) ? reviews.length : 0} Reviews</Text> */}
            
            <ReviewsSection 
              reviews={reviews}
              isLoading={isLoadingReviews}
              userId={user?.id}
              onUpdateReview={handleUpdateReview}
              onDeleteReview={handleDeleteReview}
              onToggleLike={handleToggleReviewLike}
              currentSortOrder={sortOrder} // Pass sortOrder state
              onSortOrderChange={setSortOrder} // Pass setSortOrder function
              totalReviewCount={Array.isArray(reviews) ? reviews.length : 0} // Pass total review count
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
        </ScrollView>
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
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleWithIndicator: {
    flex: 1,
    marginBottom: 0,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  reviewHeader: {
    // flexDirection: 'column', // Keep or adjust as needed, sectionTitle is now alone here
    marginBottom: 15,
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
});

export default FoodSpotDetailScreen;