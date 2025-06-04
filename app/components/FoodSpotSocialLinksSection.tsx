import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import colors from '../styles/colors';

const FoodSpotSocialLinksSection = ({ social_links }) => {
  if (!social_links || Object.keys(social_links).length === 0) return null;
  const openLink = (url) => {
    if (url) Linking.openURL(url);
  };
  return (
    <>
      {Object.entries(social_links).map(([platform, url]) => (
        <TouchableOpacity key={platform} style={styles.linkRow} onPress={() => openLink(url)}>
          <Feather name={getIconName(platform)} size={20} color={colors.primary} />
          <Text style={styles.linkText}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</Text>
        </TouchableOpacity>
      ))}
    </>
  );
};

function getIconName(platform) {
  switch (platform) {
    case 'facebook':
      return 'facebook';
    case 'instagram':
      return 'instagram';
    case 'twitter':
      return 'twitter';
    case 'website':
      return 'globe';
    default:
      return 'link';
  }
}

const styles = StyleSheet.create({
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  linkText: {
    marginLeft: 10,
    fontSize: 16,
    color: colors.darkGray,
  },
});

export default FoodSpotSocialLinksSection;
