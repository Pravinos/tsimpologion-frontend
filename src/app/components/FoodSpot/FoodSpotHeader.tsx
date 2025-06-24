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
      <View style={styles.headerCard}>
        <View style={styles.topRow}>
          <View style={styles.iconBackgroundSmall}>
            <MaterialCommunityIcons name={iconName} size={28} color={colors.primary} />
          </View>
          <Text style={styles.name}>{name}</Text>
          {showFavourite && (
            <TouchableOpacity
              style={styles.favouriteButtonSmall}
              onPress={handleToggleFavourite}
              disabled={isProcessingFavourite}
            >
              <MaterialCommunityIcons
                name={isFavourite ? 'heart' : 'heart-outline'}
                color={isProcessingFavourite ? colors.error : (isFavourite ? colors.error : colors.primary)}
                size={26}
              />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.ratingRowCentered}>
          <StarRating rating={rating || 0} size={18} selectable={false} onRatingChange={() => {}} />
          {rating != null && (
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          )}
        </View>
        <View style={styles.infoRowCentered}>
          {category && <Text style={styles.categoryText}>{category}</Text>}
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
    paddingTop: 18,
    minHeight: 18,
  },
  headerCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    marginHorizontal: 13,
    marginBottom: 18,
    padding: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  topRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  iconBackgroundSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.mediumGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favouriteButtonSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.mediumGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  ratingRowCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    width: '100%',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 15,
    color: colors.primary,
    fontWeight: '600',
  },
  infoRowCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    marginTop: 4,
  },
  categoryText: {
    color: colors.darkGray,
    fontWeight: '500',
    fontSize: 14,
    marginRight: 6,
  },
  priceContainer: {
    backgroundColor: colors.mediumGray,
    paddingHorizontal: 7,
    paddingVertical: 2,
    
    alignItems: 'center',
    borderRadius: 5,
  },
  priceRange: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default FoodSpotHeader;
