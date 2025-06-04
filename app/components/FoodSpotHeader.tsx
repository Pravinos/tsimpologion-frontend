import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import StarRating from './StarRating';
import colors from '../styles/colors';


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

const FoodSpotHeader: React.FC<FoodSpotHeaderProps> = ({ name, rating, category, price_range, isFavourite, onToggleFavourite, showFavourite }) => (
  <View style={styles.header}>
    <View style={styles.iconBackground}>
      <Feather name="map-pin" size={30} color={colors.primary} />
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
          onPress={onToggleFavourite}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons
            name={isFavourite ? 'heart' : 'heart-outline'}
            color={isFavourite ? '#D32F2F' : colors.mediumGray}
            size={30}
            style={{ opacity: isFavourite ? 1 : 0.6 }}
          />
        </TouchableOpacity>
      )}
    </View>
    <Text style={styles.category}>
      {category} {price_range ? `· ${price_range}` : ''}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomColor: colors.lightGray,
  },
  iconBackground: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
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
