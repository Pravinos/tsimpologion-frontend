import React from 'react';
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '@/app/styles/colors';

type StarRatingProps = {
  rating: number;
  size?: number;
  selectable?: boolean;
  onRatingChange?: (rating: number) => void;
  style?: StyleProp<ViewStyle>;
};

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  size = 16,
  selectable = false,
  onRatingChange,
  style,
}) => {
  const handlePress = (index: number) => {
    if (selectable && onRatingChange) {
      // When a star is pressed, the rating is index + 1
      onRatingChange(index + 1);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      let name: 'star' | 'star-half-full' | 'star-outline' = 'star-outline';
      if (i <= rating) {
        name = 'star';
      } else if (i - 0.5 <= rating) {
        name = 'star-half-full';
      }
      
      stars.push(
        <TouchableOpacity key={i} onPress={() => handlePress(i-1)} disabled={!selectable}>
          <MaterialCommunityIcons
            name={name}
            size={size}
            color={name === 'star-outline' ? colors.mediumGray : colors.accent}
            style={styles.star}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return <View style={[styles.container, style]}>{renderStars()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 2,
  },
});

export default StarRating;
