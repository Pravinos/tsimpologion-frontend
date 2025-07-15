// filepath: c:\tsimpologion-app\tsimpologion-frontend\app\screens\FoodSpotDetailScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { ScrollView } from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Share,
  TouchableOpacity,
  Linking,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import Animated, { FadeInUp } from 'react-native-reanimated';

// Components
import {
  ReviewsSection,
  ReviewForm,
  UserReviewCard
} from '@/app/components/Reviews';
import { 
  FoodSpotHeader, 
  FoodSpotDetailsSection, 
  FoodSpotAboutSection,
  FoodSpotBusinessHoursSection,
  FoodSpotSocialLinksSection
} from '@/app/components/FoodSpot';
import { ImageCarousel, BusinessHours, CustomStatusBar } from '@/app/components/UI';

// Hooks and utilities
import { useAuth } from '@/services/AuthProvider';
import { useQuery, useQueryClient, useMutation, keepPreviousData } from '@tanstack/react-query';
import { getFullImageUrl } from '@/app/utils/getFullImageUrl';
import { useBusinessHours } from '@/app/hooks/useBusinessHours';
import { parseSocialLinks } from '@/app/utils/parseSocialLinks';
import { uploadMultipleImages } from '@/app/utils/uploadUtils';
import { uploadReviewImages, handleReviewImageUpdates } from '@/app/utils/reviewUtils';

// API client
import {
  getFoodSpot,
  getReviews,
  toggleReviewLike,
  addFavourite,
  removeFavourite,
  createReview,
  updateReview,
  deleteReview,
  deleteImage,
  getFavourites
} from '@/services/ApiClient';

// Types
import { ScreenProps, Review, FoodSpot } from '@/app/types/appTypes';
import colors from '@/app/styles/colors';

// Define FoodSpotDetailParams interface
interface FoodSpotDetailParams {
  foodSpot: FoodSpot;
  id: number;
}

// Define review sort orders
const SORT_RECENT = 'recent';
const SORT_LIKED = 'liked';

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
  const [isDeletingReview, setIsDeletingReview] = useState(false); // NEW: State to track deletion in progress

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

  // NEW: Query for the user's own review for this food spot.
  // This is fetched independently and not affected by sorting.
  const { data: userReview, isLoading: isLoadingUserReview } = useQuery({
    queryKey: ['userReview', id, user?.id],
    queryFn: async () => {
      // We fetch all reviews and then select the user's one.
      // This is because there's no dedicated endpoint to get a single user's review.
      // React Query will cache this, so it's efficient on the client-side.
      if (!user) return null;
      const response = await getReviews(id);
      const allReviews = response.data?.data || response.data || [];
      const foundReview = allReviews.find((review: Review) => review.user_id === user?.id);
      
      if (foundReview) {
        return {
          ...foundReview,
          is_liked: foundReview.is_liked ?? false,
          likes_count: foundReview.likes_count ?? 0,
        };
      }
      return null;
    },
    enabled: !!user, // Only run if a user is logged in.
    staleTime: 1000 * 60 * 5, // User's review is unlikely to change often.
  });

  // MODIFIED: Query for the list of other users' reviews.
  // This query is affected by the sortOrder state.
  const {
    data: reviewsResult,
    isLoading: isLoadingReviews,
    isFetching: isFetchingReviews, // Use this for the loading indicator on the list
    isError: isReviewsError,
    refetch: refetchReviews,
  } = useQuery<{ reviews: Review[]; total: number }>({
    queryKey: ['foodSpotReviews', id, sortOrder], // Depends on sortOrder
    queryFn: async () => {
      const apiParams = {
        sort: sortOrder === 'liked' ? 'most_liked' : 'recent',
      };
      const response = await getReviews(id, apiParams);
      const reviewsData = response.data?.data || response.data || [];
      const totalCount = response.data?.meta?.total ?? response.data?.total ?? foodSpot?.reviews_count ?? reviewsData.length;
      
      // Exclude the user's own review from this list.
      const otherUsersReviews = user 
        ? reviewsData.filter((review: Review) => review.user_id !== user.id)
        : reviewsData;

      // Adjust total count if the user's review was in the fetched list
      const adjustedTotal = (user && userReview && reviewsData.some((r: Review) => r.user_id === user.id))
        ? totalCount - 1
        : totalCount;

      const mappedReviews = otherUsersReviews.map((review: Review) => ({
        ...review,
        is_liked: review.is_liked ?? false,
        likes_count: review.likes_count ?? 0,
      }));
      return { reviews: mappedReviews, total: adjustedTotal };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    placeholderData: keepPreviousData, // Smooth transitions when sorting
  });

  const otherReviews = reviewsResult?.reviews || [];
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

  const otherReviewImages = otherReviews.flatMap((review: Review) => review.images?.map(img => getFullImageUrl(img)) || []);
  const userReviewImages = userReview?.images?.map((img: { id: number; url: string; }) => getFullImageUrl(img)) || [];
  const allReviewImages = [...new Set([...otherReviewImages, ...userReviewImages])].filter(Boolean);

  const userHasReview = !!userReview;

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
    },
  });

  const handleToggleFavourite = () => {
    if (!foodSpot) return;
    toggleFavouriteMutation.mutate(isFavourite);
  };

  const reviewMutation = useMutation({
    mutationFn: async ({ reviewData, reviewId }: { reviewData: any, reviewId?: number }) => {
      setIsSubmitting(true);
      
      // Extract image data from reviewData before sending to API
      const { newImages, deletedImageIds, ...reviewDataForApi } = reviewData;
      
      if (reviewId) {
        return updateReview(id, reviewId, reviewDataForApi);
      } else {
        return createReview(id, reviewDataForApi);
      }
    },
    onSuccess: async (data, variables) => {
      // Get the review ID from the response
      const reviewId = data.data?.id || data.data?.data?.id;
      
      // Handle image updates if there are any and we have a reviewId
      if (reviewId) {
        try {
          setImageUploading(true);
          
          // For updates, handle both image uploads and deletions
          if (variables.reviewId) {
            await handleReviewImageUpdates({
              reviewId: variables.reviewId,
              newImages: variables.reviewData.newImages || [],
              deletedImageIds: variables.reviewData.deletedImageIds || []
            });
          } 
          // For new reviews, just upload new images
          else if (variables.reviewData.newImages && variables.reviewData.newImages.length > 0) {
            await uploadReviewImages(variables.reviewData.newImages, reviewId);
          }
        } catch (error) {
          console.error('Error handling review images:', error);
          Alert.alert('Warning', 'Your review was saved, but there was an issue with some images.');
        } finally {
          setImageUploading(false);
        }
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['foodSpotReviews', id] });
      queryClient.invalidateQueries({ queryKey: ['userReview', id, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['foodSpot', id] });
      queryClient.invalidateQueries({ queryKey: ['spotImages', id] });
      refetchSpot();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred.';
      Alert.alert('Error', `Failed to submit review: ${errorMessage}`);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleReviewSubmit = async (rating: number, comment: string, images: ImagePicker.ImagePickerAsset[]) => {
    if (comment.length < 10) {
      Alert.alert('Comment too short', 'Please provide a more detailed review (at least 10 characters).');
      return;
    }
    if (rating === 0) {
      Alert.alert('No rating selected', 'Please select a rating before submitting.');
      return;
    }

    const reviewData = {
      rating,
      comment,
      // Include selected images for upload after review creation
      newImages: images,
    };

    reviewMutation.mutate({ reviewData });
  };

  const handleReviewUpdate = async (reviewId: number, data: { 
    rating?: number; 
    comment?: string; 
    newImages?: ImagePicker.ImagePickerAsset[];
    deletedImageIds?: number[];
  }) => {
    if (data.comment && data.comment.length < 10) {
      Alert.alert('Comment too short', 'Please provide a more detailed review (at least 10 characters).');
      return;
    }
    if (data.rating === 0) {
      Alert.alert('No rating selected', 'Please select a rating before submitting.');
      return;
    }

    // Prepare review data - core review data for the API call
    const reviewData = {
      rating: data.rating,
      comment: data.comment,
      // Pass new images and deleted image IDs through to the mutation
      newImages: data.newImages || [],
      deletedImageIds: data.deletedImageIds || [],
    };

    reviewMutation.mutate({ reviewData, reviewId });
  };

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: number) => deleteReview(id, reviewId),
    onMutate: () => {
      setIsDeletingReview(true);
    },
    onSuccess: (_, reviewId) => {
      Alert.alert('Success', 'Your review has been deleted.');
      queryClient.setQueryData(['userReview', id, user?.id], null);
      queryClient.setQueryData(['foodSpotReviews', id, sortOrder], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          reviews: oldData.reviews.filter((r: any) => r.id !== reviewId),
          total: Math.max(0, (oldData.total || 1) - 1),
        };
      });
      queryClient.invalidateQueries({ queryKey: ['foodSpotReviews', id] });
      queryClient.invalidateQueries({ queryKey: ['userReview', id, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['foodSpot', id] });
      setIsDeletingReview(false);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred.';
      Alert.alert('Error', `Failed to delete review: ${errorMessage}`);
      setIsDeletingReview(false);
    },
  });

  const handleReviewDeleted = (reviewId: number) => {
    if (isDeletingReview) return; // Prevent double-tap
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete your review?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteReviewMutation.mutate(reviewId),
        },
      ]
    );
  };

  const toggleLikeMutation = useMutation({
    mutationFn: ({ reviewId, isLiked }: { reviewId: number, isLiked: boolean }) => {
      return toggleReviewLike(reviewId);
    },
    onMutate: async ({ reviewId, isLiked }) => {
      // Optimistically update the main reviews list
      await queryClient.cancelQueries({ queryKey: ['foodSpotReviews', id, sortOrder] });
      const previousReviewsData = queryClient.getQueryData<{ reviews: Review[]; total: number }>(['foodSpotReviews', id, sortOrder]);
      if (previousReviewsData) {
        const newReviews = previousReviewsData.reviews.map(r => {
          if (r.id === reviewId) {
            return {
              ...r,
              is_liked: !isLiked,
              likes_count: isLiked ? (r.likes_count ?? 1) - 1 : (r.likes_count ?? 0) + 1,
            };
          }
          return r;
        });
        queryClient.setQueryData(['foodSpotReviews', id, sortOrder], { ...previousReviewsData, reviews: newReviews });
      }

      // Optimistically update the user's own review query
      await queryClient.cancelQueries({ queryKey: ['userReview', id, user?.id] });
      const previousUserReview = queryClient.getQueryData<Review>(['userReview', id, user?.id]);
      if (previousUserReview && previousUserReview.id === reviewId) {
        queryClient.setQueryData<Review>(['userReview', id, user?.id], {
          ...previousUserReview,
          is_liked: !isLiked,
          likes_count: isLiked ? (previousUserReview.likes_count ?? 1) - 1 : (previousUserReview.likes_count ?? 0) + 1,
        });
      }
      
      return { previousReviewsData, previousUserReview };
    },
    onError: (err, variables, context) => {
      if (context?.previousReviewsData) {
        queryClient.setQueryData(['foodSpotReviews', id, sortOrder], context.previousReviewsData);
      }
      if (context?.previousUserReview) {
        queryClient.setQueryData(['userReview', id, user?.id], context.previousUserReview);
      }
      Alert.alert('Error', 'Failed to update like status.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['foodSpotReviews', id, sortOrder] });
      queryClient.invalidateQueries({ queryKey: ['userReview', id, user?.id] });
    },
  });

  const handleToggleLike = (reviewId: number, isLiked: boolean) => {
    toggleLikeMutation.mutate({ reviewId, isLiked });
  };

  const handleImageDelete = async (imageId: number) => {
    try {
      await deleteImage('reviews', userReview.id, imageId);
      Alert.alert('Success', 'Image deleted successfully.');
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['userReview', id, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['spotImages', id] });
    } catch (error) {
      Alert.alert('Error', 'Failed to delete image.');
    }
  };

  const handleViewAllImages = () => {
    if (foodSpot) {
      (navigation.navigate as any)('Gallery', { foodSpotId: foodSpot.id });
    }
  };

  useEffect(() => {
    if ((route.params as any)?.scrollToReviews && scrollViewRef.current) {
      const yOffset = 500; // Approximate position of reviews section
      scrollViewRef.current.scrollTo({ y: yOffset, animated: true });
    }
  }, [(route.params as any)?.scrollToReviews, userHasReview, foodSpot, reviewsResult]);

  if (isLoadingSpot && !foodSpot) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <CustomStatusBar backgroundColor={colors.lightGray} barStyle="dark-content" />
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
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <CustomStatusBar backgroundColor={colors.lightGray} barStyle="dark-content" />
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
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <CustomStatusBar backgroundColor={colors.lightGray} barStyle="dark-content" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Food spot not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <CustomStatusBar backgroundColor={colors.lightGray} barStyle="dark-content" />
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
            {/* Modern Details Card */}
            <Animated.View entering={FadeInUp.duration(500).damping(18)} style={styles.section}>
              <Text style={styles.sectionTitle}>Details</Text>
              <FoodSpotDetailsSection 
                address={foodSpot.address} 
                phone={foodSpot.phone} 
                website={foodSpot.info_link}
                distance={null}
              />
              <FoodSpotSocialLinksSection social_links={socialLinks} />
              {formattedHours && formattedHours.length > 0 && (
                <View>
                  <BusinessHours
                    hours={formattedHours}
                    isOpen={isOpen}
                    showStatus={true}
                  />
                </View>
              )}
            </Animated.View>

            {foodSpot.description && (
              <Animated.View entering={FadeInUp.duration(500).delay(80).damping(18)} style={styles.section}>
                <Text style={styles.sectionTitle}>About</Text>
                <FoodSpotAboutSection about={foodSpot.description} />
              </Animated.View>
            )}
            
            {allReviewImages.length > 0 && (
              <Animated.View entering={FadeInUp.duration(500).delay(240).damping(18)} style={[styles.section, styles.reviewsCard]}>
                <View style={styles.subSection}>
                  <ImageCarousel images={allReviewImages} title="Community Photos" isCard={false} />
                </View>
              </Animated.View>
            )}

            {/* Reviews Section */}
            <Animated.View entering={FadeInUp.duration(500).delay(320).damping(18)} style={styles.section}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <ReviewsSection
                reviews={otherReviews}
                totalReviewCount={totalReviewCount}
                isLoading={isLoadingReviews}
                isRefetching={isFetchingReviews && !isLoadingReviews}
                onSortChange={setSortOrder}
                sortOrder={sortOrder}
                userId={user?.id}
                onToggleLike={handleToggleLike}
              />
            </Animated.View>

            {/* Leave Your Review section - only show if user doesn't have a review yet */}
            <Animated.View entering={FadeInUp.duration(500).delay(400).damping(18)} style={styles.section}>
              <UserReviewCard
                userReview={userReview}
                isLoading={isLoadingUserReview}
                isLoggedIn={!!token}
                isSubmitting={isSubmitting}
                imageUploading={imageUploading}
                isDeleting={isDeletingReview}
                onSubmit={handleReviewSubmit}
                onUpdate={handleReviewUpdate}
                onDelete={handleReviewDeleted}
                onToggleLike={handleToggleLike}
                onNavigateToLogin={() => navigation.navigate('Profile')}
              />
            </Animated.View>
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
    marginHorizontal: 16,
    marginBottom: 16,
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
  businessHoursRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    marginBottom: 4,
  },
  businessHourPill: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 6,
    minWidth: 70,
    alignItems: 'center',
  },
  businessHourPillOpen: {
    backgroundColor: colors.primary,
  },
  businessHourPillClosed: {
    backgroundColor: colors.error,
  },
  businessHourPillText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  businessHourPillOpenText: {
    color: colors.white,
  },
  businessHourPillClosedText: {
    color: colors.white,
  },
});

export default FoodSpotDetailScreen;