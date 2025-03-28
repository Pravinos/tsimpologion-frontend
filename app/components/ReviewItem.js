import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import StarRating from './StarRating';
import colors from '../styles/colors';

const ReviewItem = ({ review }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.username}>{review.user}</Text>
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
  username: {
    fontWeight: 'bold',
    fontSize: 14,
    color: colors.black,
  },
  comment: {
    fontSize: 14,
    color: colors.black,
    lineHeight: 20,
  },
});

export default ReviewItem;
