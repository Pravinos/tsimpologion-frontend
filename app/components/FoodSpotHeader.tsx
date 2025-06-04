import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import StarRating from './StarRating';
import colors from '../styles/colors';

const FoodSpotHeader = ({ name, rating, category, price_range }) => (
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
