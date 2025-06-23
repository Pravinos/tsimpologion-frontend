import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Review } from '../../../types/models';
import ReviewItem from './ReviewItem';
import UserReviewItem from './UserReviewItem';
import colors from '../../styles/colors';

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
          </View>

          <View style={styles.reviewActions}> 
            <Text style={styles.sortByText}>Sort by:</Text>
            <TouchableOpacity onPress={() => onSortOrderChange('recent')} style={[styles.sortButton, currentSortOrder === 'recent' && styles.activeSortButton]}>
              <Text style={[styles.sortButtonText, currentSortOrder === 'recent' && styles.activeSortButtonText]}>Most Recent</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onSortOrderChange('liked')} style={[styles.sortButton, currentSortOrder === 'liked' && styles.activeSortButton]}>
              <Text style={[styles.sortButtonText, currentSortOrder === 'liked' && styles.activeSortButtonText]}>Most Liked</Text>
            </TouchableOpacity>
          </View>

          {otherReviews.length > 0 ? (
            <FlatList
              data={otherReviews}
              keyExtractor={(item: Review) => item.id.toString()}
              renderItem={({ item }: { item: Review }) => (
                <View style={styles.reviewItemContainer}>
                  <ReviewItem 
                    review={item} 
                    onToggleLike={onToggleLike} 
                    isLiked={item.is_liked} 
                    likesCount={item.likes_count} 
                    currentUserId={userId}
                  />
                </View>
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              initialNumToRender={3}
              contentContainerStyle={{ paddingVertical: 4, paddingHorizontal: 20 }}
            />
          ) : (
            <Text style={styles.noReviewsText}>
              {/* This text will show if there's a user review but no other reviews */}
              No other reviews yet.
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
  otherReviewsHeader: { // Added
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
  reviewCountText: { // Added (similar to old reviewCount style)
    fontSize: 14,
    color: colors.darkGray,
  },
  reviewActions: { // Added (styles from FoodSpotDetailScreen)
    flexDirection: 'row',
    justifyContent: 'flex-start', // Changed from flex-end to flex-start
    alignItems: 'center', 
    marginBottom: 12, 

  },
  sortByText: { // Added style for Sort by text
    fontSize: 14,
    color: colors.darkGray,
    fontWeight: '600',
    marginRight: 8, // Added marginRight to space it from the first button
  },
  sortButton: { // Added (styles from FoodSpotDetailScreen)
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: colors.lightGray,
    marginLeft: 0, // Was 8, set to 0 as sortByText now has marginRight
    marginRight: 8, // Added marginRight for spacing between buttons
  },
  activeSortButton: { // Added (styles from FoodSpotDetailScreen)
    backgroundColor: colors.primary,
  },
  sortButtonText: { // Added (styles from FoodSpotDetailScreen)
    fontSize: 12,
    color: colors.darkGray,
    fontWeight: '600',
  },
  activeSortButtonText: { // Added (styles from FoodSpotDetailScreen)
    color: colors.white,
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
});

export default ReviewsSection;
