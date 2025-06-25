import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Review } from '@/app/types/appTypes';
import ReviewItem from './ReviewItem';
import ReviewItemSkeleton from './ReviewItemSkeleton';
import colors from '../../styles/colors';

interface ReviewsProps {
  reviews: Review[];
  isLoading: boolean;
  isRefetching?: boolean;
  userId?: number | null;
  onToggleLike: (reviewId: number, isLiked: boolean) => void;
  sortOrder?: 'recent' | 'liked';
  onSortChange: (sortOrder: 'recent' | 'liked') => void;
  totalReviewCount: number;
}

const ReviewsSection: React.FC<ReviewsProps> = ({
  reviews,
  isLoading,
  isRefetching,
  userId,
  onToggleLike,
  sortOrder = 'recent',
  onSortChange,
  totalReviewCount,
}) => {
 
  const [showOnlyLiked, setShowOnlyLiked] = useState(false);
  
  // Define pill style constants upfront
  const pillWidth = 110;
  const pillHeight = 32;
  const pillThumbColor = colors.primary;
  const pillBgColor = colors.lightGray;

  const translateX = useSharedValue(sortOrder === 'recent' ? 0 : pillWidth);

  useEffect(() => {
    translateX.value = withSpring(sortOrder === 'recent' ? 0 : pillWidth, {
      damping: 18,
      stiffness: 120,
    });
  }, [sortOrder, pillWidth]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    backgroundColor: pillThumbColor,
    position: 'absolute',
    left: 0,
    top: 0,
    width: pillWidth,
    height: pillHeight,
    borderRadius: 16,
    zIndex: 0,
  }));

  // Render pill toggle component
  const renderPillToggle = (interactive = true) => (
    <View style={[styles.pillSwitchContainer, { width: pillWidth * 2, height: pillHeight, backgroundColor: pillBgColor, position: 'relative', overflow: 'hidden' }]}> 
      <Animated.View style={thumbStyle} />
      <TouchableOpacity
        style={[styles.pillOption, { width: pillWidth, height: pillHeight, zIndex: 1 }]}
        onPress={interactive ? () => onSortChange('recent') : undefined}
        activeOpacity={0.85}
        disabled={!interactive}
      >
        <Text style={[styles.pillOptionText, sortOrder === 'recent' && styles.pillOptionTextActive]}>Most Recent</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.pillOption, { width: pillWidth, height: pillHeight, zIndex: 1 }]}
        onPress={interactive ? () => onSortChange('liked') : undefined}
        activeOpacity={0.85}
        disabled={!interactive}
      >
        <Text style={[styles.pillOptionText, sortOrder === 'liked' && styles.pillOptionTextActive]}>Most Liked</Text>
      </TouchableOpacity>
    </View>
  );

  // Show skeleton loaders during loading
  if (isLoading) {
    return (
      <View style={styles.otherReviewsSection}>
        <View style={styles.otherReviewsHeader}>
          <Text style={styles.reviewCountText}>Reviews</Text>
          {renderPillToggle(false)}
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ paddingVertical: 4, paddingLeft: 0, paddingRight: 12 }}
        >
          {[...Array(3)].map((_, index) => (
            <View key={index} style={styles.reviewItemContainer}>
              <ReviewItemSkeleton />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  // Data validation
  if (!reviews || !Array.isArray(reviews)) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading reviews data</Text>
      </View>
    );
  }

  // When data is loaded but empty
  if (!isLoading && reviews.length === 0) {
    return (
      <View style={styles.otherReviewsSection}>
        <View style={styles.otherReviewsHeader}>
          <Text style={styles.reviewCountText}>0 Reviews</Text>
          {renderPillToggle()}
        </View>
        <View style={styles.noReviewsContainer}>
          <Text style={styles.noReviewsText}>
            No reviews yet. Be the first to leave a review!
          </Text>
        </View>
      </View>
    );
  }

  const filteredReviews = showOnlyLiked
    ? reviews.filter((review) => review.is_liked)
    : reviews;
  
  return (
    <View style={styles.otherReviewsSection}>
      <View style={styles.otherReviewsHeader}>
        <Text style={styles.reviewCountText}>{totalReviewCount} {totalReviewCount === 1 ? 'Review' : 'Reviews'}</Text>
        {renderPillToggle()}
      </View>

      <View style={isRefetching ? styles.refetchingContainer : undefined}>
        {filteredReviews.length > 0 ? (
          <Animated.FlatList
            data={filteredReviews}
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
          />
        ) : (
          <View style={styles.noReviewsContainer}>
            <Text style={styles.noReviewsText}>
              {showOnlyLiked ? 'No liked reviews yet.' : 'No other reviews yet.'}
            </Text>
          </View>
        )}
      </View>
    </View>
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
  otherReviewsSection: {
    paddingHorizontal: 2,
  },
  otherReviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewCountText: {
    fontSize: 14,
    color: colors.darkGray,
  },
  reviewItemContainer: {
    width: 280,
    marginRight: 16,
  },
  noReviewsContainer: {
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
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
  refetchingContainer: {
    opacity: 0.5,
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
