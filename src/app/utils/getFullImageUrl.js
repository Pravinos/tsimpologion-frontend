// Shared utility for resolving image URLs
import { API_BASE_ORIGIN } from '@/services/ApiClient';
export function getFullImageUrl(imageObj) {
  if (!imageObj) return undefined;
  if (Array.isArray(imageObj)) imageObj = imageObj[0];
  
  // If it's a string (path or URL)
  if (typeof imageObj === 'string') {
    // If it's a full URL, rewrite localhost/127.0.0.1 to API_BASE_ORIGIN
    if (imageObj.startsWith('http://') || imageObj.startsWith('https://')) {
      return imageObj.replace('http://localhost:8000', API_BASE_ORIGIN)
                    .replace('http://127.0.0.1:8000', API_BASE_ORIGIN);
    }
    // If it's a relative path
    return `${API_BASE_ORIGIN}${imageObj.startsWith('/') ? '' : '/'}${imageObj}`;
  }
  
  // If it's an object with a url property (like backend response)
  if (typeof imageObj === 'object' && imageObj.url) {
    // Rewrite localhost/127.0.0.1 in the url field
    return imageObj.url.replace('http://localhost:8000', API_BASE_ORIGIN)
                      .replace('http://127.0.0.1:8000', API_BASE_ORIGIN);
  }
  
  // If it's an object with a path property (storage path)
  if (typeof imageObj === 'object' && imageObj.path) {
    return `${API_BASE_ORIGIN}/storage/${imageObj.path}`;
  }
  
  // If it's an ImagePicker result or similar format
  if (typeof imageObj === 'object' && imageObj.uri) {
    return imageObj.uri;
  }
  
  return undefined;
}

// Add a React component as the default export to satisfy the router
import React from 'react';
const ImageUrlUtils = () => null;
export default ImageUrlUtils;
