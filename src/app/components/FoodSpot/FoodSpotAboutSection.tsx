import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../styles/colors';

const FoodSpotAboutSection = ({ about }) => {
  if (!about) return null;
  return (
    <Text style={styles.aboutText}>{about}</Text>
  );
};

const styles = StyleSheet.create({
  aboutText: {
    fontSize: 16,
    color: colors.darkGray,
  },
});

export default FoodSpotAboutSection;
