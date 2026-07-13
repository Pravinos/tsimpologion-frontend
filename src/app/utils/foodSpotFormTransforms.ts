// Business-hours/social-links object<->array transforms shared by
// AddFoodSpotScreen and EditFoodSpotScreen (previously duplicated verbatim
// in both files).

export interface BusinessHourRow {
  id: number;
  dayRange: string;
  timeRange: string;
}

export interface SocialLinkRow {
  id: number;
  platform: string;
  url: string;
}

export const businessHoursArrayToObject = (rows: BusinessHourRow[]): Record<string, string> =>
  rows.reduce((acc, curr) => {
    if (curr.dayRange) {
      acc[curr.dayRange] = curr.timeRange;
    }
    return acc;
  }, {} as Record<string, string>);

export const businessHoursObjectToArray = (
  hours: string | Record<string, string> | null | undefined
): BusinessHourRow[] => {
  if (!hours) return [];
  try {
    const parsed = typeof hours === 'string' ? JSON.parse(hours) : hours;
    return Object.entries(parsed).map(([dayRange, timeRange], index) => ({
      id: index,
      dayRange,
      timeRange: timeRange as string,
    }));
  } catch (e) {
    console.error('Failed to parse business hours:', e);
    return [];
  }
};

const sanitizeUrl = (rawUrl: string): string => {
  let sanitizedUrl = rawUrl.trim();
  // Handle the common error of duplicating the protocol
  if (sanitizedUrl.startsWith('https://https://')) {
    sanitizedUrl = sanitizedUrl.substring(8);
  }
  // Add https:// if no protocol is specified
  if (sanitizedUrl && !sanitizedUrl.startsWith('http://') && !sanitizedUrl.startsWith('https://')) {
    sanitizedUrl = 'https://' + sanitizedUrl;
  }
  return sanitizedUrl;
};

export const socialLinksArrayToObject = (rows: SocialLinkRow[]): Record<string, string> =>
  rows.reduce((acc, curr) => {
    if (curr.platform && curr.url) {
      acc[curr.platform] = sanitizeUrl(curr.url);
    }
    return acc;
  }, {} as Record<string, string>);

export const socialLinksObjectToArray = (
  links: string | Record<string, string> | null | undefined
): SocialLinkRow[] => {
  if (!links) return [];
  try {
    const parsed = typeof links === 'string' ? JSON.parse(links) : links;
    return Object.entries(parsed).map(([platform, url], index) => ({
      id: index,
      platform,
      url: url as string,
    }));
  } catch (e) {
    console.error('Failed to parse social links:', e);
    return [];
  }
};

// Add a React component as the default export to satisfy expo-router, which
// treats every file under src/app/ as a route.
import React from 'react';
const FoodSpotFormTransformsUtils = () => null;
export default FoodSpotFormTransformsUtils;
