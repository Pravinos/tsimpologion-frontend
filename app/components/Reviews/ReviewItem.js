import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import StarRating from '../UI/StarRating';
import colors from '../../styles/colors';
import { getFullImageUrl } from '../../utils/getFullImageUrl';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Changed from Feather

const ReviewItem = ({ review, onToggleLike, isLiked, likesCount, currentUserId }) => {
  
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
    review.user?.name || 'Unknown User' : 
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
    if (onToggleLike && typeof review.id === 'number') {
      onToggleLike(review.id);
    }
  };

  return (
    <View style={styles.container}>
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
          <View>
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
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Added hitSlop for easier tapping
          >
            <MaterialCommunityIcons 
              name={displayIsLiked ? "heart" : "heart-outline"} 
              size={24} // Adjusted size
              color={displayIsLiked ? '#D32F2F' : colors.mediumGray} 
              style={{ opacity: displayIsLiked ? 1 : 0.6 }} // Added opacity
            />
          </TouchableOpacity>
          <Text style={styles.likesCountText}>{displayLikesCount} {displayLikesCount === 1 ? 'Like' : 'Likes'}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundWarm, // Use warm background
    padding: 16, // Increased padding
    borderRadius: 12, // Increased border radius
    marginBottom: 12, // Adjusted margin
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, // Subtle shadow
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  userInitial: {
    width: 34, // Slightly larger
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.warmAccent1, // Use warm accent for initials background
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10, // Adjusted margin
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
    marginTop: 8, // Ensure some space from content above
  },
  likeButton: {
    marginRight: 5, 
    padding: 6, // Slightly increased padding for touchability
  },
  likesCountText: {
    fontSize: 14,
    color: colors.darkGray,
  },
});

export default ReviewItem;