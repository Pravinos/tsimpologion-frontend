import React from 'react';
import { View, StyleSheet } from 'react-native';
import colors from '../../styles/colors';

const ReviewItemSkeleton = () => (
  <View style={styles.container}>
    <View style={styles.header}>
      <View style={styles.avatar} />
      <View style={styles.userInfo}>
        <View style={styles.textBlockShort} />
        <View style={styles.textBlockShorter} />
      </View>
    </View>
    <View style={styles.ratingBar} />
    <View style={styles.textBlockLong} />
    <View style={styles.textBlockLong} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundWarm,
    padding: 16,
    borderRadius: 12,
    marginRight: 16,
    width: 280,
    borderWidth: 1,
    borderColor: colors.warmAccent1,
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
    backgroundColor: colors.warmAccent2,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  textBlockShort: {
    height: 16,
    width: '70%',
    backgroundColor: colors.warmAccent2,
    borderRadius: 4,
    marginBottom: 6,
  },
  textBlockShorter: {
    height: 12,
    width: '40%',
    backgroundColor: colors.warmAccent2,
    borderRadius: 4,
  },
  ratingBar: {
    height: 18,
    width: '50%',
    backgroundColor: colors.warmAccent2,
    borderRadius: 4,
    marginBottom: 12,
  },
  textBlockLong: {
    height: 14,
    width: '90%',
    backgroundColor: colors.warmAccent2,
    borderRadius: 4,
    marginBottom: 6,
  },
});

export default ReviewItemSkeleton;
