import { StatusBarStyle } from 'expo-status-bar';

/**
 * Determines the ideal status bar style (light or dark) based on the background color.
 * @param backgroundColor - The background color in hex format (e.g., '#RRGGBB').
 * @returns 'light' or 'dark' for the status bar style.
 */
export function getIdealStatusBarStyle(backgroundColor: string): StatusBarStyle {
  // Remove '#' if present
  const color = backgroundColor.startsWith('#') ? backgroundColor.slice(1) : backgroundColor;

  // Convert hex to RGB
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  // Calculate brightness using the YIQ formula
  const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;

  // Return 'dark' for light backgrounds, 'light' for dark backgrounds
  return brightness > 128 ? 'dark' : 'light';
}
