import { Stack } from "expo-router";
import React from 'react';
import { Slot } from 'expo-router'; // Or Stack if using Stack layout
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../services/AuthProvider'; // Adjust path if you moved services
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from './queryClient';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SafeAreaProvider>
          <Slot />
        </SafeAreaProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
