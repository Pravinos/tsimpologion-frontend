import { Stack } from "expo-router";
import React from 'react';
import { Slot } from 'expo-router'; // Or Stack if using Stack layout
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../services/AuthProvider'; // Adjust path if you moved services

export default function RootLayout() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <Slot />
      </SafeAreaProvider>
    </AuthProvider>
  );
}
