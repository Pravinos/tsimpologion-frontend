import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import Constants from 'expo-constants';
import { getIdealStatusBarStyle } from '@/app/utils/getIdealStatusBarStyle';

interface CustomStatusBarProps {
  backgroundColor: string;
}

const CustomStatusBar: React.FC<CustomStatusBarProps> = ({ backgroundColor }) => {
  const statusBarStyle = getIdealStatusBarStyle(backgroundColor);

  return (
    <View style={[styles.statusBar, { backgroundColor }]}>
      <StatusBar
        translucent
        backgroundColor={backgroundColor}
        barStyle={statusBarStyle === 'dark' ? 'dark-content' : 'light-content'}
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
