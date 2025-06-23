import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import StarRating from '../UI/StarRating';
import colors from '../../styles/colors';
import { getIconForCategory } from '../../utils/categoryIcons';

interface FoodSpotHeaderProps {
  name: string;
  rating?: number;
  category?: string;
  price_range?: string;
  isFavourite?: boolean;
  onToggleFavourite?: () => void;
  showFavourite?: boolean;
}

const FoodSpotHeader: React.FC<FoodSpotHeaderProps> = ({ name, rating, category, price_range, isFavourite, onToggleFavourite, showFavourite }) => {
  const iconName = getIconForCategory(category);
  const [isProcessingFavourite, setIsProcessingFavourite] = useState(false);
  const isFavouriteCoolingDownRef = useRef(false);

  const handleToggleFavourite = () => {
    if (isFavouriteCoolingDownRef.current || !onToggleFavourite) return;

    isFavouriteCoolingDownRef.current = true;
    setIsProcessingFavourite(true);
    onToggleFavourite();

    setTimeout(() => {
      isFavouriteCoolingDownRef.current = false;
      setIsProcessingFavourite(false);
    }, 2000);
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        <View style={styles.iconRow}>
          <View style={styles.iconBackground}>
            <MaterialCommunityIcons name={iconName} size={32} color={colors.primary} />
          </View>
          {showFavourite && (
            <TouchableOpacity
              style={styles.favouriteButton}
              onPress={handleToggleFavourite}
              disabled={isProcessingFavourite}
            >
              <MaterialCommunityIcons
                name={isFavourite ? 'heart' : 'heart-outline'}
                color={isProcessingFavourite ? colors.mediumGray : (isFavourite ? colors.error : colors.primary)}
                size={30}
              />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.ratingRow}>
          <StarRating rating={rating || 0} size={20} selectable={false} onRatingChange={() => {}} />
          {rating != null && (
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          )}
        </View>
        <View style={styles.categoryRow}>
          <Text style={styles.categoryText}>{category}</Text>
          {price_range ? (
            <View style={styles.priceContainer}>
              <Text style={styles.priceRange}>{price_range}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    minHeight: 120,
    marginBottom: 18,
  },
  headerContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    alignItems: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 8,
  },
  iconBackground: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.mediumGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.black,
    textAlign: 'center',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  categoryText: {
    color: colors.darkGray,
    fontWeight: '500',
    fontSize: 15,
    marginRight: 8,
  },
  priceContainer: {
    backgroundColor: colors.mediumGray,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priceRange: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  favouriteButton: {
   width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.mediumGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
});

export default FoodSpotHeader;
