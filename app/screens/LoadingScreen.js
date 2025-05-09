import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import colors from '../styles/colors';

const LoadingScreen = () => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={colors.primary} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
});

export default LoadingScreen;