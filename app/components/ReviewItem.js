import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import StarRating from './StarRating';
import colors from '../styles/colors';

const ReviewItem = ({ review }) => {
  // Handle both object user and string user formats
  const userName = typeof review.user === 'object' ? 
    review.user?.name || 'Unknown User' : 
    review.user || 'Unknown User';
  
  // Format date if available
  const formattedDate = review.created_at ? 
    new Date(review.created_at).toLocaleDateString() : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {review.user?.images && review.user.images.length > 0 ? (
            <Image 
              source={{ uri: review.user.images[0] }} 
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
        <StarRating rating={review.rating} size={14} />
      </View>
      <Text style={styles.comment}>{review.comment}</Text>
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
});

export default ReviewItem;