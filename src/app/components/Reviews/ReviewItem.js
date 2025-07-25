import React, { useState, useRef } from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import StarRating from '../UI/StarRating';
import colors from '../../styles/colors';
import { getFullImageUrl } from '../../utils/getFullImageUrl';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Changed from Feather

// Add index prop for animation
const ReviewItem = ({ review, onToggleLike, isLiked, likesCount, currentUserId, index = 0 }) => {
  const [isLiking, setIsLiking] = useState(false);
  const isCoolingDownRef = useRef(false);
  
  // Validate review object
  if (!review) {
    console.error('ReviewItem received null or undefined review');
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Invalid review data</Text>
      </View>
    );
  }

  // Handle both object user and string user formats
  const userName = typeof review.user === 'object' ? 
    review.user?.username || 'Unknown User' : 
    review.user || 'Unknown User';
  
  // Format date if available
  const formattedDate = review.created_at ? 
    new Date(review.created_at).toLocaleDateString() : null;

  // Show review image if available
  const reviewImage = review.images && review.images.length > 0 ? getFullImageUrl(review.images[0]) : null;

  // Check if we have a valid rating
  const rating = typeof review.rating === 'number' ? review.rating : 0;
  const displayLikesCount = typeof likesCount === 'number' ? likesCount : review.likes_count || 0;
  const displayIsLiked = typeof isLiked === 'boolean' ? isLiked : review.is_liked || false;

  const handleLikePress = () => {
    if (isCoolingDownRef.current) return;

    if (onToggleLike && typeof review.id === 'number') {
      isCoolingDownRef.current = true;
      setIsLiking(true);
      onToggleLike(review.id, displayIsLiked);
      setTimeout(() => {
        isCoolingDownRef.current = false;
        setIsLiking(false);
      }, 2000);
    }
  };

  return (
    <Animated.View
      entering={FadeInUp.duration(500).delay(index * 90).damping(18)}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {review.user?.images && review.user.images.length > 0 ? (
            <Image 
              source={{ uri: getFullImageUrl(review.user.images[0]) }} 
              style={styles.userImage} 
            />
          ) : (
            <View style={styles.userInitial}>
              <Text style={styles.initialText}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.userInfoText}>
            <Text style={styles.username}>{userName}</Text>
            {formattedDate && (
              <Text style={styles.date}>{formattedDate}</Text>
            )}
          </View>
        </View>
        <StarRating rating={rating} size={14} />
      </View>
      <Text style={styles.comment}>{review.comment || 'No comment provided'}</Text>
      {reviewImage && typeof reviewImage === 'string' && (
        <Image
          source={{ uri: reviewImage }}
          style={{ width: 120, height: 120, borderRadius: 10, marginTop: 8 }}
          resizeMode="cover"
        />
      )}
      {/* Like button and count */}
      {typeof review.id === 'number' && currentUserId && (
        <View style={styles.likeSection}>
          <TouchableOpacity 
            onPress={handleLikePress} 
            style={styles.likeButton}
            disabled={isLiking}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons 
              name={displayIsLiked ? "heart" : "heart-outline"} 
              size={24} 
              color={isLiking ? colors.mediumGray : (displayIsLiked ? '#D32F2F' : colors.mediumGray)}
              style={{ opacity: displayIsLiked && !isLiking ? 1 : 0.6 }}
            />
          </TouchableOpacity>
          <Text style={styles.likesCountText}>{displayLikesCount} {displayLikesCount === 1 ? 'Like' : 'Likes'}</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundWarm,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 10,
  },
  userImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  userInitial: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.warmAccent1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  userInfoText: {
    flex: 1,
  },
  initialText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 14,
    color: colors.black,
  },
  date: {
    fontSize: 12,
    color: colors.darkGray,
  },
  comment: {
    fontSize: 14,
    color: colors.black,
    lineHeight: 20,
  },
  errorText: {
    color: colors.error || '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
    padding: 10,
  },
  likeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  likeButton: {
    marginRight: 5, 
    padding: 6,
  },
  likesCountText: {
    fontSize: 14,
    color: colors.darkGray,
  },
});

ReviewItem.defaultProps = {
  index: 0,
};

export default ReviewItem;