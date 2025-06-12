import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import colors from '../../styles/colors';

const StarRating = ({ rating, size = 16, selectable = false, onRatingChange }) => {
  // Convert rating to integer to ensure we have whole stars
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5;
  
  // Create an array of 5 stars
  const stars = [];
  
  for (let i = 1; i <= 5; i++) {
    let starName = 'star';
    let starColor = colors.mediumGray;
    
    if (i <= fullStars) {
      starName = 'star';
      starColor = colors.accent;
    } else if (i === fullStars + 1 && halfStar) {
      starName = 'star'; // Using star for simplicity, ideally would use a half-star icon
      starColor = colors.accent;
    }
    
    stars.push(
      <Feather
        key={i}
        name={starName}
        size={size}
        color={starColor}
        style={styles.star}
        onPress={selectable ? () => onRatingChange(i) : undefined}
      />
    );
  }
  
  return <View style={styles.container}>{stars}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  star: {
    marginRight: 2,
  },
});

export default StarRating;
