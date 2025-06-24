import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import colors from '../../styles/colors';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const FoodSpotSocialLinksSection = ({ social_links }) => {
  if (!social_links || Object.keys(social_links).length === 0) return null;
  const openLink = (url) => {
    if (url) Linking.openURL(url);
  };
  return (
    <>
      {Object.entries(social_links).map(([platform, url]) => {
        const scale = useSharedValue(1);
        const animatedStyle = useAnimatedStyle(() => ({
          transform: [{ scale: scale.value }],
        }));
        return (
          <TouchableOpacity
            key={platform}
            style={styles.linkRow}
            onPress={() => {
              scale.value = withSpring(0.92, { damping: 6, stiffness: 180 });
              setTimeout(() => {
                scale.value = withSpring(1, { damping: 6, stiffness: 180 });
                openLink(url);
              }, 120);
            }}
            activeOpacity={0.85}
          >
            <Animated.View style={animatedStyle}>
              <Feather name={getIconName(platform)} size={20} color={colors.primary} />
            </Animated.View>
            <Text style={styles.linkText}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</Text>
          </TouchableOpacity>
        );
      })}
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
