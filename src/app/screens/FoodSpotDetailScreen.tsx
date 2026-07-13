import React, { useState, useRef, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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
  UserReviewCard
} from '@/app/components/Reviews';
import { 
  FoodSpotHeader, 
  FoodSpotDetailsSection, 
  FoodSpotAboutSection,
  FoodSpotSocialLinksSection
} from '@/app/components/FoodSpot';
import { ImageCarousel, BusinessHours, CustomStatusBar } from '@/app/components/UI';

// Hooks and utilities
import { useAuth } from '@/services/AuthProvider';
import { useFoodSpotDetailData } from '@/app/hooks/useFoodSpotDetailData';
import { useReviewMutations } from '@/app/hooks/useReviewMutations';
import { getFullImageUrl } from '@/app/utils/getFullImageUrl';
import { useBusinessHours } from '@/app/hooks/useBusinessHours';
import { parseSocialLinks } from '@/app/utils/parseSocialLinks';

// Types
import { Review, FoodSpot, NavigationProps, RootStackParamList } from '@/app/types/appTypes';
import { RouteProp } from '@react-navigation/native';
import colors from '@/app/styles/colors';

interface FoodSpotDetailScreenProps {
  route: RouteProp<RootStackParamList, 'FoodSpotDetail'>;
  navigation: NavigationProps;
}

const FoodSpotDetailScreen = ({ route, navigation }: FoodSpotDetailScreenProps) => {
  if (!route) return null;
  const { foodSpot: initialFoodSpot } = route.params;
  const id = initialFoodSpot.id;
  const { token, user } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);

  const [sortOrder, setSortOrder] = useState<'recent' | 'liked'>('recent');

  const {
    foodSpot,
    isLoadingSpot,
    isSpotError,
    refetchSpot,
    spotImages,
    userReview,
    isLoadingUserReview,
    otherReviews,
    totalReviewCount,
    isLoadingReviews,
    isFetchingReviews,
    isFavourite,
  } = useFoodSpotDetailData({ id, initialFoodSpot, sortOrder });

  const {
    isSubmitting,
    imageUploading,
    isDeletingReview,
    handleToggleFavourite,
    submitReview,
    updateUserReview,
    requestReviewDeletion,
    handleToggleLike,
  } = useReviewMutations({
    id,
    foodSpot,
    isFavourite,
    userId: user?.id,
    userReview,
    sortOrder,
    refetchSpot,
  });

  const { isOpen, formattedHours } = useBusinessHours(foodSpot?.business_hours);

  const socialLinks = parseSocialLinks(foodSpot?.social_links);

  const otherReviewImages = otherReviews.flatMap((review: Review) => review.images?.map(img => getFullImageUrl(img)) || []);
  const userReviewImages = userReview?.images?.map((img: { id: number; url: string; }) => getFullImageUrl(img)) || [];
  const allReviewImages = [...new Set([...otherReviewImages, ...userReviewImages])].filter(Boolean);

  const userHasReview = !!userReview;

  useEffect(() => {
    if (route?.params?.scrollToReviews && scrollViewRef.current) {
      const yOffset = 500; // Approximate position of reviews section
      scrollViewRef.current.scrollTo({ y: yOffset, animated: true });
    }
  }, [route?.params?.scrollToReviews, userHasReview, foodSpot, otherReviews, totalReviewCount]);

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
                onSubmit={submitReview}
                onUpdate={updateUserReview}
                onDelete={requestReviewDeletion}
                onToggleLike={handleToggleLike}
                // Users reach this screen only when authenticated, so there is
                // no real "go to login" destination from here; route to the
                // Profile tab (inside the same authenticated stack) instead of
                // a misleading callback name that implied a login screen.
                onNavigateToLogin={() => (navigation as any).navigate('HomeTabs', { screen: 'Profile' })}
              />
            </Animated.View>
          </View>
        </ScrollView>
        {(
          // Allow spot owners to edit their own spots
          (user?.role === 'spot_owner' && user?.id === (foodSpot?.user?.id || foodSpot?.user_id || foodSpot?.owner_id)) ||
          // Allow admins to edit all spots
          user?.role === 'admin'
        ) && (
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
    padding: 0,
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
