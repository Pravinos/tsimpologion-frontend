import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar, setStatusBarStyle } from 'expo-status-bar';
import Constants from 'expo-constants';
import { getIdealStatusBarStyle } from '@/app/utils/getIdealStatusBarStyle';
import colors from '@/app/styles/colors';

interface CustomStatusBarProps {
  backgroundColor: string;
  barStyle?: 'light-content' | 'dark-content';
}

const CustomStatusBar: React.FC<CustomStatusBarProps> = ({ backgroundColor, barStyle }) => {
  // If barStyle is provided, use it; otherwise, determine from backgroundColor
  const idealStyle = getIdealStatusBarStyle(backgroundColor);
  const statusBarStyle = barStyle || (idealStyle === 'dark' ? 'dark-content' : 'light-content');
  
  // Convert React Native style to Expo style
  const expoStyle = statusBarStyle === 'dark-content' ? 'dark' : 'light';

  // Use imperative API to force status bar update
  React.useEffect(() => {
    setStatusBarStyle(expoStyle);
  }, [expoStyle]);

  return (
    <View style={[styles.statusBar, { backgroundColor }]}>
      <StatusBar
        style={expoStyle}
        animated={true}
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
