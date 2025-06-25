import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import colors from '../../styles/colors';

const FoodSpotDetailsSection = ({ address, distance, phone, website }) => (
  <>
    {address ? (
      <View style={styles.detailRow}>
        <Feather name="map-pin" size={20} color={colors.primary} />
        <Text style={styles.detailText}>{address}</Text>
      </View>
    ) : null}
    {distance != null ? (
      <View style={styles.detailRow}>
        <Feather name="navigation" size={20} color={colors.primary} />
        <Text style={styles.detailText}>{distance.toFixed(1)} km away</Text>
      </View>
    ) : null}
    {phone ? (
      <TouchableOpacity style={styles.detailRow} onPress={() => Linking.openURL(`tel:${phone}`)}>
        <Feather name="phone" size={20} color={colors.primary} />
        <Text style={[styles.detailText, { color: colors.primary }]}>{phone}</Text>
      </TouchableOpacity>
    ) : null}
    {website ? (
      <TouchableOpacity style={styles.detailRow} onPress={() => Linking.openURL(website)}>
        <Feather name="map" size={20} color={colors.primary} />
        <Text style={[styles.detailText, { color: colors.primary }]}>Open location on map</Text>
      </TouchableOpacity>
    ) : null}
  </>
);

const styles = StyleSheet.create({
  detailsSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 16,
    color: colors.darkGray,
  },
});

export default FoodSpotDetailsSection;
