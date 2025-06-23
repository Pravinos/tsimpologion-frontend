import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';

export type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const DEFAULT_ICON: IconName = 'map-marker'; // Default icon if category not found

const categoryIconMap: Record<string, IconName> = {
  'cafe': 'coffee',
  'restaurant': 'silverware-fork-knife',
  'bar': 'glass-cocktail',
  'bakery': 'muffin',
  'italian': 'pasta',
  'fast food': 'food-takeout-box',
  'vegan': 'leaf',
  'burger': 'hamburger',
  'brunch': 'food-croissant',
  'pizza': 'pizza',
};

export const getIconForCategory = (category?: string): IconName => {
  if (category) {
    const icon = categoryIconMap[category.toLowerCase()];
    if (icon) {
      return icon;
    }
  }
  return DEFAULT_ICON;
};

export default {};
