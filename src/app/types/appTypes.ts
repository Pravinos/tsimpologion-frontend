import { NavigationProp, RouteProp } from '@react-navigation/native';

// Auth related interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: 'foodie' | 'spot_owner';
}

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
  reviews_count?: number;
  average_rating?: string;
  created_at?: string;
  updated_at?: string;
  user?: User;
  images?: {
    id: number;
    url: string;
    foodspot_id?: number;
    user_id?: number;
  }[];
}

export interface Review {
  id: number;
  comment: string;
  rating: number;
  created_at: string;
  user: User | string;
  user_id?: number;
  images?: {
    id: number;
    url: string;
  }[];
  likes_count?: number;
  is_liked?: boolean;
}

export interface User {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  name?: string; // legacy, for compatibility
  email: string;
  role?: 'foodie' | 'spot_owner' | 'admin';
  created_at?: string;
  images?: {
    id: number;
    url: string;
    user_id?: number;
  }[] | null;
}

export type RootStackParamList = {
  Home: undefined;
  FoodSpotDetail: { foodSpot: FoodSpot };
  Profile: undefined;
  EditProfile: undefined;
  EditFoodSpot: { foodSpotId: number };
  AddFoodSpot: undefined;
  Login: undefined;
  Register: undefined;
  Auth: undefined;
  App: undefined;
  HomeTabs: undefined;
  MySpots: undefined;
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
