import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import colors from '../../styles/colors';

// Create a more subtle skeleton color that works well with warm background
const subtleSkeletonColor = '#EADACB'; 

const ReviewItemSkeleton = () => {
  // Create a shimmer animation
  const shimmerAnim = new Animated.Value(0);
  
  useEffect(() => {
    const startShimmerAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    };
    
    startShimmerAnimation();
    
    return () => {
      shimmerAnim.stopAnimation();
    };
  }, []);
  
  // Interpolate shimmer values
  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0.8],
  });
  
  // Create animated styles
  const animatedShimmerStyle = {
    opacity: shimmerOpacity,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Animated.View style={[styles.avatar, animatedShimmerStyle]} />
        <View style={styles.userInfo}>
          <Animated.View style={[styles.textBlockShort, animatedShimmerStyle]} />
          <Animated.View style={[styles.textBlockShorter, animatedShimmerStyle]} />
        </View>
      </View>
      <Animated.View style={[styles.ratingBar, animatedShimmerStyle]} />
      <Animated.View style={[styles.textBlockLong, animatedShimmerStyle]} />
      <Animated.View style={[styles.textBlockLong, animatedShimmerStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundWarm,
    padding: 12,
    borderRadius: 12,
    marginRight: 16,
    width: 280,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: subtleSkeletonColor,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  textBlockShort: {
    height: 16,
    width: '70%',
    backgroundColor: subtleSkeletonColor,
    borderRadius: 4,
    marginBottom: 6,
  },
  textBlockShorter: {
    height: 12,
    width: '40%',
    backgroundColor: subtleSkeletonColor,
    borderRadius: 4,
  },
  ratingBar: {
    height: 18,
    width: '50%',
    backgroundColor: subtleSkeletonColor,
    borderRadius: 4,
    marginBottom: 12,
  },
  textBlockLong: {
    height: 14,
    width: '90%',
    backgroundColor: subtleSkeletonColor,
    borderRadius: 4,
    marginBottom: 6,
  },
});

export default ReviewItemSkeleton;
