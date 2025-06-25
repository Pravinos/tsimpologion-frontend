import React from 'react';
import { StatusBar, StatusBarStyle } from 'expo-status-bar';
import { useIsFocused } from '@react-navigation/native';
import { getIdealStatusBarStyle } from '@/app/utils/getIdealStatusBarStyle';

interface FocusedStatusBarProps {
  backgroundColor: string;
}

const FocusedStatusBar: React.FC<FocusedStatusBarProps> = ({ backgroundColor }) => {
  const isFocused = useIsFocused();
  const statusBarStyle = getIdealStatusBarStyle(backgroundColor);

  return isFocused ? <StatusBar style={statusBarStyle} backgroundColor={backgroundColor} animated /> : null;
};

export default FocusedStatusBar;
