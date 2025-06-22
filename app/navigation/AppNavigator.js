import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Feather } from '@expo/vector-icons';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen'; 
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import FoodSpotDetailScreen from '../screens/FoodSpotDetailScreen';
import EditFoodSpotScreen from '../screens/EditFoodSpotScreen';
import LoadingScreen from '../screens/LoadingScreen';

import { useAuth } from '../../services/AuthProvider';
import colors from '../styles/colors';

const Stack = createNativeStackNavigator();
const Tab = createMaterialTopTabNavigator(); // Using MaterialTopTabNavigator for gestures

// Auth stack for login/register screens
function AuthStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: colors.white },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Home tabs with gesture navigation and hidden tab bar
function HomeTabs() {
  const { width } = Dimensions.get('window');
  
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarStyle: { display: 'none' }, // Hide the tab bar completely
        swipeEnabled: true, // Enable swipe gestures
        animationEnabled: true,
        lazy: true,
      }}
      style={styles.container}
      sceneContainerStyle={styles.sceneContainer}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
      />
    </Tab.Navigator>
  );
}

// Main stack for the authenticated app flow
function MainStack() {
  return (
    <Stack.Navigator>
      {/* HomeTabs without any header */}
      <Stack.Screen 
        name="HomeTabs" 
        component={HomeTabs} 
        options={{ 
          headerShown: false 
        }} 
      />
        {/* FoodSpotDetail with custom back gesture */}
      <Stack.Screen 
        name="FoodSpotDetail" 
        component={FoodSpotDetailScreen} 
        options={{ 
          headerShown: false, // Hide the header completely
          animation: 'slide_from_right',
          gestureEnabled: true, // Enable swipe back gesture
          gestureDirection: 'horizontal',
          contentStyle: {
            backgroundColor: colors.white,
          }
        }} 
      />
      
      {/* EditProfile screen */}
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen} 
        options={{ 
          headerShown: false, // Hide the header completely
          animation: 'slide_from_right',
          gestureEnabled: true, // Enable swipe back gesture
          gestureDirection: 'horizontal',
          contentStyle: {
            backgroundColor: colors.white,
          }
        }} 
      />
      
      {/* EditFoodSpot screen */}
      <Stack.Screen 
        name="EditFoodSpot" 
        component={EditFoodSpotScreen} 
        options={{ 
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          contentStyle: {
            backgroundColor: colors.white,
          }
        }} 
      />

      {/* Add other screens here with similar options */}
    </Stack.Navigator>
  );
}

// Root navigator
export default function AppNavigator() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <Stack.Screen name="App" component={MainStack} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </GestureHandlerRootView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sceneContainer: {
    backgroundColor: colors.white,
  },
});