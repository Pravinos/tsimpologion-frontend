// Shared utility for resolving image URLs
const API_BASE_URL = 'http://192.168.1.162:8000';
export function getFullImageUrl(imageObj) {
  if (!imageObj) return undefined;
  if (Array.isArray(imageObj)) imageObj = imageObj[0];
  if (typeof imageObj === 'string') {
    if (imageObj.startsWith('http://') || imageObj.startsWith('https://')) return imageObj;
    return `${API_BASE_URL}${imageObj.startsWith('/') ? '' : '/'}${imageObj}`;
  }
  if (typeof imageObj === 'object' && imageObj.url) return imageObj.url;
  if (typeof imageObj === 'object' && imageObj.path) return `${API_BASE_URL}/storage/${imageObj.path}`;
  return undefined;
}

// No default export, only named export
// This file should not be treated as a screen or route
