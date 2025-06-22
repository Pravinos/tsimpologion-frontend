import { NavigationProp, RouteProp } from '@react-navigation/native';

export interface FoodSpot {
  id: number;
  name: string;
  category: string;
  city: string;
  address: string;
  description: string;
  info_link: string;
  phone?: string;
  business_hours?: any;
  social_links?: any;
  rating?: number;
  price_range?: string; // Added price_range property
  owner_id?: number;
  user_id?: number; // Added user_id property
  images?: {
    id: number;
    url: string;
    foodspot_id?: number;
    user_id?: number;
  }[];
}

export interface User {
  id: number;
  name?: string;
  email: string;
  images?: {
    id: number;
    url: string;
    user_id?: number;
  }[];
}

export type RootStackParamList = {
  Home: undefined;
  FoodSpotDetail: { foodSpot: FoodSpot };
  Profile: undefined;
  EditProfile: undefined;
  EditFoodSpot: { foodSpotId: number };
  Login: undefined;
  Register: undefined;
  Auth: undefined;
  App: undefined;
  HomeTabs: undefined;
  MySpots: undefined;
  AddFoodSpot: undefined;
};

export type NavigationProps = NavigationProp<RootStackParamList>;

export interface ScreenProps {
  navigation: NavigationProps;
  route?: RouteProp<RootStackParamList, keyof RootStackParamList>;
}

// Create a dummy React component to satisfy the router
import React from 'react';
const AppTypes = () => null;
export default AppTypes;
