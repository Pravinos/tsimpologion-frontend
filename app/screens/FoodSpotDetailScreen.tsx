// filepath: c:\tsimpologion-app\tsimpologion-frontend\app\screens\FoodSpotDetailScreen.tsx
import React, { useState, useRef } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { ScrollView, FlatList } from 'react-native';
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
  getFavourites 
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
    queryKey: ['foodSpotReviews', id],
    queryFn: async () => {
      const response = await getReviews(id);
      return response.data?.data || response.data;
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
              <Text style={styles.reviewCount}>{reviews.length} Reviews</Text>
            </View>
            
            <ReviewsSection 
              reviews={reviews}
              isLoading={isLoadingReviews}
              userId={user?.id}
              onUpdateReview={handleUpdateReview}
              onDeleteReview={handleDeleteReview}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  reviewCount: {
    fontSize: 14,
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
});

export default FoodSpotDetailScreen;