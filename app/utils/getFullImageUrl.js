// Shared utility for resolving image URLs
import { API_BASE_ORIGIN } from '../../services/ApiClient';
export function getFullImageUrl(imageObj) {
  if (!imageObj) return undefined;
  if (Array.isArray(imageObj)) imageObj = imageObj[0];
  if (typeof imageObj === 'string') {
    // If it's a full URL, rewrite localhost/127.0.0.1 to API_BASE_ORIGIN
    if (imageObj.startsWith('http://') || imageObj.startsWith('https://')) {
      return imageObj.replace('http://localhost:8000', API_BASE_ORIGIN)
                    .replace('http://127.0.0.1:8000', API_BASE_ORIGIN);
    }
    return `${API_BASE_ORIGIN}${imageObj.startsWith('/') ? '' : '/'}${imageObj}`;
  }
  if (typeof imageObj === 'object' && imageObj.url) {
    // Rewrite localhost/127.0.0.1 in the url field
    return imageObj.url.replace('http://localhost:8000', API_BASE_ORIGIN)
                      .replace('http://127.0.0.1:8000', API_BASE_ORIGIN);
  }
  if (typeof imageObj === 'object' && imageObj.path) return `${API_BASE_ORIGIN}/storage/${imageObj.path}`;
  return undefined;
}

// No default export, only named export
// This file should not be treated as a screen or route
