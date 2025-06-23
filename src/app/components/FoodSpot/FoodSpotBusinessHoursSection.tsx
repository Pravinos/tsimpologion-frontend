import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../styles/colors';

const FoodSpotBusinessHoursSection = ({ business_hours }) => {
  if (!business_hours || !Array.isArray(business_hours) || business_hours.length === 0) return null;
  return (
    <>
      {business_hours.map((item, idx) => (
        <View key={idx} style={styles.row}>
          <Text style={styles.day}>{item.day}</Text>
          <Text style={styles.hours}>{item.hours}</Text>
        </View>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  day: {
    fontSize: 16,
    color: colors.darkGray,
  },
  hours: {
    fontSize: 16,
    color: colors.darkGray,
  },
});

export default FoodSpotBusinessHoursSection;
