import React from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './app/navigation/AppNavigator';
import { AuthProvider } from './app/services/AuthProvider';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from './app/queryClient';
import { StatusBar } from 'expo-status-bar';

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#f4f5f7',
    card: '#f4f5f7',
  },
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <NavigationContainer theme={MyTheme}>
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
