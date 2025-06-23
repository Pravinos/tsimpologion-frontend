import React, { useState, useRef } from 'react'; // Added useState, useRef
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import StarRating from '../UI/StarRating';
import colors from '../../styles/colors';
import { getIconForCategory } from '../../utils/categoryIcons'; // Import the utility


// Add favourite star icon (filled or outline) and onPress handler
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
    <View style={styles.header}>
      <View style={styles.iconBackground}>
        <MaterialCommunityIcons name={iconName} size={30} color={colors.primary} />
      </View>
      <Text style={styles.name}>{name}</Text>
      <View style={styles.ratingContainer}>
        <StarRating rating={rating || 0} size={18} selectable={false} onRatingChange={() => {}} />
        <Text style={styles.ratingText}>
          {rating != null ? rating.toFixed(1) : 'No ratings yet'}
        </Text>
        {showFavourite && (
          <TouchableOpacity
            style={{ marginLeft: 16, padding: 4, justifyContent: 'center', alignItems: 'center' }}
            onPress={handleToggleFavourite} // Use the new handler
            disabled={isProcessingFavourite} // Disable during cooldown
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons
              name={isFavourite ? 'heart' : 'heart-outline'}
              color={isProcessingFavourite ? colors.mediumGray : (isFavourite ? '#D32F2F' : colors.mediumGray)} // Dim color during cooldown
              size={30}
              style={{ opacity: isProcessingFavourite ? 0.6 : (isFavourite ? 1 : 0.6) }} // Adjust opacity during cooldown
            />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.category}>
        {category} {price_range ? `· ${price_range}` : ''}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomColor: colors.lightGray,
    width: '100%',
  },
  iconBackground: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    // Shadow properties copied from FoodSpotItem for consistency
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2, 
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.darkGray,
  },
  category: {
    fontSize: 16,
    color: colors.darkGray,
  },
});

export default FoodSpotHeader;
