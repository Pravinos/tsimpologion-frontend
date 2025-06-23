import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import colors from '@/app/styles/colors';

type StarRatingProps = {
  rating: number;
  size?: number;
  selectable?: boolean;
  onRatingChange?: (rating: number) => void;
};

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  size = 16,
  selectable = false,
  onRatingChange,
}) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  const handlePress = (index: number) => {
    if (selectable && onRatingChange) {
      onRatingChange(index + 1);
    }
  };

  return (
    <View style={styles.container}>
      {[...Array(fullStars)].map((_, i) => (
        <TouchableOpacity key={`full_${i}`} onPress={() => handlePress(i)} disabled={!selectable}>
          <Feather name="star" size={size} color={colors.accent} style={styles.star} />
        </TouchableOpacity>
      ))}
      {halfStar && (
        <TouchableOpacity onPress={() => handlePress(fullStars)} disabled={!selectable}>
          <Feather name="star" size={size} color={colors.accent} style={styles.star} />
        </TouchableOpacity>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <TouchableOpacity
          key={`empty_${i}`}
          onPress={() => handlePress(fullStars + (halfStar ? 1 : 0) + i)}
          disabled={!selectable}
        >
          <Feather
            name="star"
            size={size}
            color={colors.mediumGray}
            style={styles.star}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
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
