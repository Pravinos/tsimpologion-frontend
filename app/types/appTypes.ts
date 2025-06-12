import { NavigationProp, RouteProp } from '@react-navigation/native';

export interface FoodSpot {
  id: number;
  name: string;
  category: string;
  city: string;
  rating?: number;
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
  FoodSpotDetail: { id: number; name: string };
  Profile: undefined;
  EditProfile: undefined;
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
