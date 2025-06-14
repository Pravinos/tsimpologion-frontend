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
          {/* Removed city display */}
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
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
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
