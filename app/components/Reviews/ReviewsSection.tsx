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
}

const ReviewsSection: React.FC<ReviewsProps> = ({
  reviews,
  isLoading,
  userId,
  onUpdateReview,
  onDeleteReview
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
    )
    .sort((a: Review, b: Review) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
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
          />
        </View>
      )}
      
      {/* Other users' reviews section */}
      {otherReviews.length > 0 ? (
        <View style={styles.otherReviewsSection}>
          {userReview && (
            <Text style={styles.otherReviewsTitle}>Other Reviews</Text>
          )}
          <FlatList
            data={otherReviews}
            keyExtractor={(item: Review) => item.id.toString()}
            renderItem={({ item }: { item: Review }) => (
              <View style={styles.reviewItemContainer}>
                <ReviewItem review={item} />
              </View>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            initialNumToRender={3}
            contentContainerStyle={{ paddingVertical: 4 }}
          />
        </View>
      ) : (
        <Text style={styles.noReviewsText}>
          {reviews.length === 0
            ? 'No reviews yet. Be the first to leave a review!'
            : 'No other reviews yet.'}
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
  otherReviewsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.black,
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
