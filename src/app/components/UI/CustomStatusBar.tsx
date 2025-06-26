import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import Constants from 'expo-constants';
import { getIdealStatusBarStyle } from '@/app/utils/getIdealStatusBarStyle';

interface CustomStatusBarProps {
  backgroundColor: string;
  barStyle?: 'light-content' | 'dark-content';
}

const CustomStatusBar: React.FC<CustomStatusBarProps> = ({ backgroundColor, barStyle }) => {
  // If barStyle is provided, use it; otherwise, determine from backgroundColor
  const statusBarStyle = barStyle || (getIdealStatusBarStyle(backgroundColor) === 'dark' ? 'dark-content' : 'light-content');

  return (
    <View style={[styles.statusBar, { backgroundColor }]}>
      <StatusBar
        translucent
        backgroundColor={backgroundColor}
        barStyle={statusBarStyle}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  statusBar: {
    height: Constants.statusBarHeight,
  },
});

export default CustomStatusBar;
