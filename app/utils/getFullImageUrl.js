// Shared utility for resolving image URLs
import { API_BASE_ORIGIN } from '../../services/ApiClient';
export function getFullImageUrl(imageObj) {
  if (!imageObj) return undefined;
  if (Array.isArray(imageObj)) imageObj = imageObj[0];
  if (typeof imageObj === 'string') {
    if (imageObj.startsWith('http://') || imageObj.startsWith('https://')) return imageObj;
    return `${API_BASE_ORIGIN}${imageObj.startsWith('/') ? '' : '/'}${imageObj}`;
  }
  if (typeof imageObj === 'object' && imageObj.url) return imageObj.url;
  if (typeof imageObj === 'object' && imageObj.path) return `${API_BASE_ORIGIN}/storage/${imageObj.path}`;
  return undefined;
}

// No default export, only named export
// This file should not be treated as a screen or route
