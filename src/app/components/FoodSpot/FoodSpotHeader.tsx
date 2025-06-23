import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

  const headerContent = (
    <>
      
      <View style={styles.headerContent}>
        <View style={styles.iconBackground}>
          <MaterialCommunityIcons name={iconName} size={32} color={colors.primary} />
        </View>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.ratingContainer}>
          <StarRating rating={rating || 0} size={20} selectable={false} onRatingChange={() => {}} />
          {rating != null && (
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          )}
        </View>
        <Text style={styles.category}>
          {category} {price_range ? `· ${price_range}` : ''}
        </Text>
      </View>
      {showFavourite && (
        <TouchableOpacity
          style={styles.favouriteButton}
          onPress={handleToggleFavourite}
          disabled={isProcessingFavourite}
        >
          <MaterialCommunityIcons
            name={isFavourite ? 'heart' : 'heart-outline'}
            color={isProcessingFavourite ? colors.mediumGray : (isFavourite ? colors.error : colors.white)}
            size={30}
          />
        </TouchableOpacity>
      )}
    </>
  );

  return (
    <LinearGradient
      // A smoother gradient that transitions gently from primary blue to the screen background.
      colors={[colors.primary, colors.lightGray]}
      locations={[0, 0.75]}
      style={styles.headerContainer}
    >
      {headerContent}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    minHeight: 280,
    justifyContent: 'flex-start',
    // backgroundColor is now handled by LinearGradient
  },
  headerContent: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  iconBackground: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 6,
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 18,
    color: colors.white,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  category: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  favouriteButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 8,
  },
});

export default FoodSpotHeader;
