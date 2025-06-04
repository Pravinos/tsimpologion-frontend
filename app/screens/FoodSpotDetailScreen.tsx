
import React, { useState, useRef } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Dimensions, ScrollView, Image } from 'react-native';
import ReviewImagesCarousel from '../components/ReviewImagesCarousel';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Linking,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import ReviewItem from '../components/ReviewItem';
import UserReviewItem from '../components/UserReviewItem';
import StarRating from '../components/StarRating';
import { createReview, updateReview, deleteReview, getFoodSpot, getReviews, uploadImage } from '../../services/ApiClient';
import { FoodSpot, Review } from '../../types/models';
import colors from '../styles/colors';
import { useAuth } from '../../services/AuthProvider';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getFullImageUrl } from '../utils/getFullImageUrl';

const FoodSpotDetailScreen = ({ route, navigation }: { route: any; navigation: any }) => {
  const { id } = route.params;
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const scrollViewRef = useRef<ScrollView>(null);
  
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

// DEBUG: Print the full reviews array to inspect image structure
// (must be inside the component, after reviews is defined)
React.useEffect(() => {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('FULL REVIEWS:', JSON.stringify(reviews, null, 2));
  }
}, [reviews]);

  const [reviewText, setReviewText] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Use correct type for selectedImage
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Permission to access media library is required!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0] as ImagePicker.ImagePickerAsset);
    }
  };

  const handleRemoveImage = () => setSelectedImage(null);

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
      // 1. Create the review (no image field at all)
      const reviewRes = await createReview(id, {
        rating: userRating as 1 | 2 | 3 | 4 | 5,
        comment: reviewText,
        user_id: user?.id
        // Do NOT send images field at all
      });
      // 2. Upload image if selected, using the correct endpoint and robust logic
      const reviewId = reviewRes.data?.id || reviewRes.data?.data?.id;
      let uploadedImageUrl = null;
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

        // Use fetch for upload, not axios
        const { API_BASE_URL } = require('../../services/ApiClient');
        const uploadUrl = `${API_BASE_URL}/images/reviews/${reviewId}`;
        const authToken = token;
        const fetchRes = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
          },
          body: formData,
        });
        const uploadRes = await fetchRes.json();
        if (uploadRes.errors) {
          throw new Error(uploadRes.message || 'Image upload failed.');
        }
        // Try to extract the uploaded image URL or path
        if (uploadRes.data?.data && Array.isArray(uploadRes.data.data)) {
          uploadedImageUrl = uploadRes.data.data[0];
        } else if (uploadRes.data?.data) {
          uploadedImageUrl = uploadRes.data.data;
        } else if (uploadRes.data?.images && Array.isArray(uploadRes.data.images)) {
          uploadedImageUrl = uploadRes.data.images[0];
        }
        setImageUploading(false);
      }
      setReviewText('');
      setUserRating(0);
      setSelectedImage(null);
      await queryClient.invalidateQueries({ queryKey: ['foodSpotReviews', id] });
      await queryClient.invalidateQueries({ queryKey: ['foodSpot', id] });
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

  // DEBUG: Print review images structure
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('Review images:', JSON.stringify((reviews || []).map((r: any) => r.images)));
  }
  // Collect all review images for the carousel (ensure all are URLs)
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
                {foodSpot.rating != null ? foodSpot.rating.toFixed(1) : 'No ratings yet'}
              </Text>
            </View>
            <Text style={styles.category}>
              {foodSpot.category} {foodSpot.price_range ? `· ${foodSpot.price_range}` : ''}
            </Text>
          </View>

          {/* Review Images Carousel */}
          {allReviewImages.length > 0 && (
            <ReviewImagesCarousel images={allReviewImages} />
          )}

          {/* Address & Info Link & Phone */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            {/* Address Row */}
            {foodSpot.address && (
              <View style={styles.detailRow}>
                <MaterialIcons name="location-on" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.address}>{foodSpot.address}</Text>
              </View>
            )}
            {/* Phone Row */}
            {foodSpot.phone && (
              <TouchableOpacity style={styles.detailRow} onPress={() => Linking.openURL(`tel:${foodSpot.phone}`)}>
                <MaterialIcons name="phone" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={[styles.address, { color: colors.primary, textDecorationLine: 'underline' }]}>{foodSpot.phone}</Text>
              </TouchableOpacity>
            )}
            {/* Info Link Row (See location on map) */}
            {(foodSpot.info_link || foodSpot.address) && (
              <TouchableOpacity style={styles.detailRow} onPress={openMap}>
                <MaterialIcons name="map" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={[styles.address, { color: colors.primary, textDecorationLine: 'underline' }]}>See location on map</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Description */}
          {foodSpot.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.description}>{foodSpot.description}</Text>
            </View>
          )}

          {/* Business Hours */}
          {foodSpot.business_hours && (
            <View style={styles.section}>
              <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
                <Text style={[styles.sectionTitle, {flex: 1, marginBottom: 0}]}>Business Hours</Text>
                {(() => {
                  let hours = foodSpot.business_hours;
                  if (typeof hours === 'string') {
                    try { hours = JSON.parse(hours); } catch {}
                  }
                  // Determine open/closed
                  let isOpen = false;
                  const todayIdx = new Date().getDay();
                  const todayKey = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][todayIdx];
                  let todayRange = null;
                  if (typeof hours === 'object' && hours !== null) {
                    const dayMap: Record<string, string> = {
                      'mon': 'monday', 'tue': 'tuesday', 'wed': 'wednesday', 'thu': 'thursday', 'fri': 'friday', 'sat': 'saturday', 'sun': 'sunday'
                    };
                    const dayOrder = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
                    const dayHours: Record<string, string> = {};
                    Object.entries(hours).forEach(([key, value]) => {
                      if (key.includes('-')) {
                        // Range like mon-fri
                        const [start, end] = key.split('-');
                        const startIdx = dayOrder.indexOf(dayMap[start.slice(0,3)] as string);
                        const endIdx = dayOrder.indexOf(dayMap[end.slice(0,3)] as string);
                        for (let i = startIdx; i <= endIdx; i++) {
                          dayHours[dayOrder[i]] = value as string;
                        }
                      } else {
                        // Single day
                        const d = dayMap[key.slice(0,3)] || key;
                        dayHours[d] = value as string;
                      }
                    });
                    todayRange = dayHours[todayKey];
                    // Open/closed logic for today
                    if (todayRange) {
                      const now = new Date();
                      const hour = now.getHours();
                      const minute = now.getMinutes();
                      const [from, to] = todayRange.split('-');
                      const [fromH, fromM] = from.split(':').map(Number);
                      const [toH, toM] = to.split(':').map(Number);
                      const nowMins = hour * 60 + minute;
                      const fromMins = fromH * 60 + fromM;
                      let toMins = toH * 60 + toM;
                      if (toMins <= fromMins) toMins += 24 * 60;
                      if (nowMins >= fromMins && nowMins < toMins) isOpen = true;
                      if (!isOpen && toMins > 24 * 60 && nowMins < (toMins - 24 * 60)) isOpen = true;
                    }
                    return (
                      <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: 10}}>
                        <View style={{width: 10, height: 10, borderRadius: 5, backgroundColor: isOpen ? '#2ecc40' : '#e74c3c', marginRight: 6}} />
                        <Text style={{color: isOpen ? '#2ecc40' : '#e74c3c', fontWeight: 'bold'}}>{isOpen ? 'Open now' : 'Closed'}</Text>
                      </View>
                    );
                  }
                  return null;
                })()}
              </View>
              {(() => {
                let hours = foodSpot.business_hours;
                if (typeof hours === 'string') {
                  try { hours = JSON.parse(hours); } catch {}
                }
                if (typeof hours === 'object' && hours !== null) {
                  const dayMap: Record<string, string> = {
                    'mon': 'monday', 'tue': 'tuesday', 'wed': 'wednesday', 'thu': 'thursday', 'fri': 'friday', 'sat': 'saturday', 'sun': 'sunday'
                  };
                  const dayOrder = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
                  const dayHours: Record<string, string> = {};
                  Object.entries(hours).forEach(([key, value]) => {
                    if (key.includes('-')) {
                      // Range like mon-fri
                      const [start, end] = key.split('-');
                      const startIdx = dayOrder.indexOf(dayMap[start.slice(0,3)] as string);
                      const endIdx = dayOrder.indexOf(dayMap[end.slice(0,3)] as string);
                      for (let i = startIdx; i <= endIdx; i++) {
                        dayHours[dayOrder[i]] = value as string;
                      }
                    } else {
                      // Single day
                      const d = dayMap[key.slice(0,3)] || key;
                      dayHours[d] = value as string;
                    }
                  });
                  const todayIdx = new Date().getDay();
                  const todayKey = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][todayIdx];
                  return (
                    <View style={styles.hoursCard}>
                      {dayOrder.map((day) => (
                        <View key={day} style={[styles.hoursRow, todayKey === day && styles.hoursRowToday]}> 
                          <Text style={[styles.hoursDay, todayKey === day && styles.hoursDayToday]}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
                          <Text style={styles.hoursTime}>{dayHours[day] ? dayHours[day] : 'Closed'}</Text>
                        </View>
                      ))}
                    </View>
                  );
                }
                return null;
              })()}
            </View>
          )}

          {/* Social Links */}
          {foodSpot.social_links && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Social Links</Text>
              {(() => {
                let links = foodSpot.social_links;
                if (typeof links === 'string') {
                  try { links = JSON.parse(links); } catch {}
                }
                if (typeof links === 'object' && links !== null) {
                  return Object.entries(links).map(([key, value]) => (
                    <TouchableOpacity key={key} onPress={() => Linking.openURL(String(value))} style={{flexDirection: 'row', alignItems: 'center', marginBottom: 6}}>
                      <Feather name={key === 'facebook' ? 'facebook' : key === 'instagram' ? 'instagram' : 'link'} size={16} color={colors.primary} />
                      <Text style={{color: colors.primary, marginLeft: 6, textDecorationLine: 'underline'}}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                    </TouchableOpacity>
                  ));
                }
                return null;
              })()}
            </View>
          )}

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
                      editable={!isSubmitting && !imageUploading}
                      onFocus={() => {
                        setTimeout(() => {
                          if (scrollViewRef.current) {
                            scrollViewRef.current.scrollToEnd({ animated: true });
                          }
                        }, 200);
                      }}
                    />
                    {/* Image Picker */}
                    <View style={{ marginBottom: 15 }}>
                      {selectedImage ? (
                        <View style={{ alignItems: 'center' }}>
                          <Image
                            source={{ uri: selectedImage.uri }}
                            style={{ width: 120, height: 120, borderRadius: 10, marginBottom: 8 }}
                          />
                          <TouchableOpacity onPress={handleRemoveImage} style={{ marginBottom: 8 }}>
                            <Text style={{ color: colors.error, fontWeight: 'bold' }}>Remove Photo</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity onPress={handlePickImage} style={{ backgroundColor: colors.lightGray, padding: 10, borderRadius: 8, alignItems: 'center' }}>
                          <Feather name="camera" size={20} color={colors.primary} />
                          <Text style={{ color: colors.primary, marginTop: 4 }}>Add a photo</Text>
                        </TouchableOpacity>
                      )}
                      {imageUploading && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                          <ActivityIndicator size="small" color={colors.primary} />
                          <Text style={{ marginLeft: 8 }}>Uploading image...</Text>
                        </View>
                      )}
                    </View>
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
  header: {
    padding: 20,
    alignItems: 'center',
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
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.black,
  },
  // Add a shared row style for details (address, phone, info_link)
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6, // tighter spacing
  },
  address: {
    fontSize: 16,
    color: colors.black,
    // marginBottom removed for tighter, consistent spacing
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
  hoursCard: {
    backgroundColor: colors.lightGray,
    borderRadius: 10,
    padding: 12,
    marginTop: 2,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  hoursRowToday: {
    backgroundColor: '#e6f9ed', // subtle green highlight
    borderRadius: 6,
  },
  hoursDay: {
    fontWeight: 'bold',
    color: colors.darkGray,
    fontSize: 15,
  },
  hoursDayToday: {
    color: '#2ecc40',
  },
  hoursTime: {
    color: colors.black,
    fontSize: 15,
  },
});

export default FoodSpotDetailScreen;

