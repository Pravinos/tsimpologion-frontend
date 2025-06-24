import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Animated, { FadeInUp, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Review } from '@/app/types/appTypes';
import ReviewItem from './ReviewItem';
import UserReviewItem from './UserReviewItem';
import colors from '../../styles/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ReviewsProps {
  reviews: Review[];
  isLoading: boolean;
  userId?: number | null;
  onUpdateReview: (reviewId: number, data: { rating: number; comment: string }) => Promise<void>;
  onDeleteReview: (reviewId: number) => Promise<void>;
  onToggleLike: (reviewId: number) => Promise<void>; 
  currentSortOrder?: 'recent' | 'liked'; 
  onSortOrderChange: (sortOrder: 'recent' | 'liked') => void; // Added
  totalReviewCount: number; // Added
}

const ReviewsSection: React.FC<ReviewsProps> = ({
  reviews,
  isLoading,
  userId,
  onUpdateReview,
  onDeleteReview,
  onToggleLike, 
  currentSortOrder,
  onSortOrderChange, // Added
  totalReviewCount // Added
}) => {
  // Data validation
  if (!reviews || !Array.isArray(reviews)) {
    console.error('Invalid reviews data:', reviews);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading reviews data</Text>
      </View>
    );
  }

  // Find the user's review if it exists
  const userReview = userId ? reviews.find((review: Review) =>
    review.user_id === userId || 
    (typeof review.user === 'object' && review.user?.id === userId)
  ) : null;
  
  // Filter out other reviews
  const otherReviews = reviews
    .filter((review: Review) =>
      !userId || (
        review.user_id !== userId &&
        !(typeof review.user === 'object' && review.user?.id === userId)
      )
    );
    // Sorting is now handled by the query in FoodSpotDetailScreen based on currentSortOrder
  
  // Add state for like filter toggle
  const [showOnlyLiked, setShowOnlyLiked] = React.useState(false);

  // Filter reviews based on like toggle
  const filteredOtherReviews = showOnlyLiked
    ? otherReviews.filter((review) => review.is_liked)
    : otherReviews;

  // Animation for pill switch
  const pillWidth = 110; // width of each pill option
  const pillHeight = 32;
  const pillPadding = 3;
  const pillThumbRadius = 16;
  const pillThumbColor = colors.primary;
  const pillBgColor = colors.lightGray;
  const pillAnim = useSharedValue(currentSortOrder === 'recent' ? 0 : 1);
  useEffect(() => {
    pillAnim.value = currentSortOrder === 'recent' ? 0 : 1;
  }, [currentSortOrder]);
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(pillAnim.value * pillWidth) }],
    backgroundColor: pillThumbColor,
    position: 'absolute',
    left: 0,
    top: 0,
    width: pillWidth,
    height: pillHeight,
    borderRadius: pillThumbRadius,
    zIndex: 0,
  }));

  if (isLoading) {
    return (
      <View style={styles.loadingReviewsContainer}>
        <Text style={styles.loadingText}>Loading reviews...</Text>
      </View>
    );
  }
  
  return (
    <>
      {/* User's own review section */}
      {userReview && (
        <View style={styles.userReviewSection}>
          <Text style={styles.userReviewTitle}>Your Review</Text>
          <UserReviewItem 
            key={userReview.id}
            review={userReview}
            onUpdate={onUpdateReview}
            onDelete={onDeleteReview}
            onToggleLike={onToggleLike} // Pass handler
            isLiked={userReview.is_liked} // Pass isLiked
            likesCount={userReview.likes_count} // Pass likesCount
          />
        </View>
      )}
      
      {/* Other users' reviews section */}
      {otherReviews.length > 0 || userReview ? ( // Show this section if there are other reviews OR if there's a user review (to show sort options)
        <View style={styles.otherReviewsSection}>
          <View style={styles.otherReviewsHeader}>
            <Text style={styles.reviewCountText}>{totalReviewCount} {totalReviewCount === 1 ? 'Review' : 'Reviews'}</Text>
            {/* Animated pill switch for sort order */}
            <View style={[styles.pillSwitchContainer, { width: pillWidth * 2, height: pillHeight, backgroundColor: pillBgColor, position: 'relative', overflow: 'hidden' }]}> 
              <Animated.View style={thumbStyle} />
              <TouchableOpacity
                style={[styles.pillOption, { width: pillWidth, height: pillHeight, zIndex: 1 }]}
                onPress={() => onSortOrderChange('recent')}
                activeOpacity={0.85}
              >
                <Text style={[styles.pillOptionText, currentSortOrder === 'recent' && styles.pillOptionTextActive]}>Most Recent</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pillOption, { width: pillWidth, height: pillHeight, zIndex: 1 }]}
                onPress={() => onSortOrderChange('liked')}
                activeOpacity={0.85}
              >
                <Text style={[styles.pillOptionText, currentSortOrder === 'liked' && styles.pillOptionTextActive]}>Most Liked</Text>
              </TouchableOpacity>
            </View>
          </View>

          {filteredOtherReviews.length > 0 ? (
            <Animated.FlatList
              data={filteredOtherReviews}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item, index }) => (
                <View style={styles.reviewItemContainer}>
                  <ReviewItem 
                    review={item} 
                    onToggleLike={onToggleLike} 
                    isLiked={item.is_liked} 
                    likesCount={item.likes_count} 
                    currentUserId={userId}
                    index={index} // Pass index for staggered animation
                  />
                </View>
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              initialNumToRender={3}
              contentContainerStyle={{ paddingVertical: 4, paddingLeft: 0, paddingRight: 12 }}
              // Removed paddingLeft, kept small paddingRight for end spacing
            />
          ) : (
            <Text style={styles.noReviewsText}>
              {showOnlyLiked ? 'No liked reviews yet.' : 'No other reviews yet.'}
            </Text>
          )}
        </View>
      ) : (
        <Text style={styles.noReviewsText}>
          {/* This text will show if there are no reviews at all (neither user's nor others) */}
          No reviews yet. Be the first to leave a review!
        </Text>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  loadingReviewsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.darkGray,
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
  otherReviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  otherReviewsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
  },
  reviewCountText: {
    fontSize: 14,
    color: colors.darkGray,
  },
  reviewItemContainer: {
    width: 280,
    marginRight: 16,
  },
  noReviewsText: {
    textAlign: 'center',
    fontSize: 16,
    color: colors.darkGray,
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.error || '#FF3B30',
    textAlign: 'center',
    marginBottom: 15,
  },
  pillSwitchContainer: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 0,
    marginLeft: 12,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  pillOption: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  pillOptionActive: {
    backgroundColor: colors.primary,
  },
  pillOptionText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: 'bold',
    zIndex: 2,
  },
  pillOptionTextActive: {
    color: colors.white,
  },
});

export default ReviewsSection;
