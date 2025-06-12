import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import StarRating from '../UI/StarRating';
import colors from '../../styles/colors';
import { getFullImageUrl } from '../../utils/getFullImageUrl';

const ReviewItem = ({ review }) => {
  
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.lightGray,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
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
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
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
  }
});

export default ReviewItem;