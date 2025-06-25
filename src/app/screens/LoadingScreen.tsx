import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../styles/colors';
import { CustomStatusBar } from '../components/UI';

const LoadingScreen = () => (
  <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
    <CustomStatusBar backgroundColor={colors.white} />
    <ActivityIndicator size="large" color={colors.primary} />
  </SafeAreaView>
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