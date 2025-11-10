import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated as RNAnimated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../styles/colors';
import StarRating from '../UI/StarRating';

import { getIconForCategory } from '../../utils/categoryIcons';

const FoodSpotItem = ({ item, onPress, showTrendingBadge = false }) => {
  const scale = useRef(new RNAnimated.Value(1)).current;

  const handlePressIn = () => {
    RNAnimated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
  };

  const handlePressOut = () => {
    RNAnimated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      android_ripple={{ color: colors.lightGray }}
      style={({ pressed }) => [{ borderRadius: 16, marginBottom: 12 }, pressed && { opacity: 0.96 }]}
    >
      <RNAnimated.View style={[styles.container, { transform: [{ scale }] }]}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name={getIconForCategory(item.category)} size={24} color={colors.primary} />
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
        <MaterialCommunityIcons name="chevron-right" size={24} color={colors.darkGray} />
      </RNAnimated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    marginRight: 16,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
