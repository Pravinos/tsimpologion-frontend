import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import colors from '../../styles/colors';

interface TrendingBadgeProps {
  size?: 'small' | 'medium';
  showText?: boolean;
}

const TrendingBadge: React.FC<TrendingBadgeProps> = ({ 
  size = 'medium', 
  showText = true 
}) => {
  const isSmall = size === 'small';
  
  return (
    <View style={[
      styles.container, 
      isSmall ? styles.containerSmall : styles.containerMedium
    ]}>
      <Feather 
        name="trending-up" 
        size={isSmall ? 10 : 12} 
        color={colors.white} 
      />
      {showText && (
        <Text style={[
          styles.text,
          isSmall ? styles.textSmall : styles.textMedium
        ]}>
          Trending
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  containerSmall: {
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  containerMedium: {
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  text: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 3,
  },
  textSmall: {
    fontSize: 8,
    marginLeft: 2,
  },
  textMedium: {
    fontSize: 10,
    marginLeft: 3,
  },
});

export default TrendingBadge;
