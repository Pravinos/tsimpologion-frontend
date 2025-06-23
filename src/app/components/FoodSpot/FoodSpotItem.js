import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Ensure this is the only icon import
import colors from '../../styles/colors';
import StarRating from '../UI/StarRating';
import { getIconForCategory } from '../../utils/categoryIcons';

const FoodSpotItem = ({ item, onPress }) => {
  const iconName = getIconForCategory(item.category);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name={iconName} size={24} color={colors.primary} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={styles.row}>
          <Text style={styles.category}>{item.category}</Text>
          {item.price_range && (
            <View style={styles.priceContainer}>
              <Text style={styles.priceRange}>{item.price_range}</Text>
            </View>
          )}
        </View>
        <View style={styles.ratingContainer}>
          <StarRating rating={item.rating} size={16} />
          <Text style={styles.ratingText}>
            {item.rating != null ? item.rating.toFixed(1) : 'No ratings'}
          </Text>
        </View>
      </View>
      {/* Changed Feather to MaterialCommunityIcons for chevron-right */}
      <MaterialCommunityIcons name="chevron-right" size={24} color={colors.darkGray} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  iconContainer: {
    marginRight: 16,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  contentContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: colors.darkGray,
    marginRight: 8,
  },
  priceContainer: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priceRange: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 14,
    color: colors.darkGray,
  },
});

export default FoodSpotItem;
