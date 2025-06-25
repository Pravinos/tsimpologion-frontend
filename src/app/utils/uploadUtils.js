// Utility function for uploading images
import { uploadImage as apiUploadImage } from '@/services/ApiClient';
import * as ImagePicker from 'expo-image-picker';

/**
 * Uploads an image to the server
 * @param {string|Object} image - Either an image URI or an ImagePickerAsset object
 * @param {string} modelType - The type of model to associate the image with ('reviews', 'food-spots', etc.)
 * @param {number} modelId - The ID of the model to associate the image with
 * @returns {Promise} - The response from the server
 */
export async function uploadImage(image, modelType, modelId) {
  // Create a FormData object for the file upload
  const formData = new FormData();
  
  let uri, fileName, fileType;
  
  // Handle different image input formats
  if (typeof image === 'string') {
    // If image is just a URI string
    uri = image;
    const uriParts = uri.split('/');
    fileName = uriParts[uriParts.length - 1] || `upload_${Date.now()}.jpg`;
    fileType = fileName.endsWith('.png') ? 'image/png' : 'image/jpeg';
  } else if (image && typeof image === 'object') {
    // If image is an ImagePicker result or similar object
    uri = image.uri;
    fileName = image.fileName || image.name;
    fileType = image.mimeType || image.type;
    
    // Generate fileName if not provided
    if (!fileName) {
      const uriParts = uri.split('/');
      fileName = uriParts[uriParts.length - 1] || `upload_${Date.now()}.jpg`;
    }
    
    // Determine fileType if not provided
    if (!fileType) {
      if (fileName.endsWith('.png')) fileType = 'image/png';
      else fileType = 'image/jpeg';
    }
  } else {
    throw new Error('Invalid image format provided');
  }
  
  // Ensure the filename has the correct extension
  if (!fileName.match(/\.(jpg|jpeg|png)$/i)) {
    fileName += fileType === 'image/png' ? '.png' : '.jpg';
  }
  
  // Create the file object for FormData
  // @ts-ignore: React Native FormData allows this object for file upload
  formData.append('images[]', { 
    uri, 
    type: fileType, 
    name: fileName 
  });
  
  // Call the API function
  return apiUploadImage(modelType, modelId, formData);
}

/**
 * Uploads multiple images to the server
 * @param {Array} images - Array of image URIs or ImagePickerAsset objects
 * @param {string} modelType - The type of model to associate the images with
 * @param {number} modelId - The ID of the model to associate the images with
 * @returns {Promise} - The response from the server
 */
export async function uploadMultipleImages(images, modelType, modelId) {
  if (!Array.isArray(images) || images.length === 0) {
    return Promise.resolve({ data: { images: [] } });
  }
  
  const formData = new FormData();
  
  images.forEach(image => {
    let uri, fileName, fileType;
    
    if (typeof image === 'string') {
      uri = image;
      const uriParts = uri.split('/');
      fileName = uriParts[uriParts.length - 1] || `upload_${Date.now()}.jpg`;
      fileType = fileName.endsWith('.png') ? 'image/png' : 'image/jpeg';
    } else {
      uri = image.uri;
      fileName = image.fileName || image.name;
      fileType = image.mimeType || image.type;
      
      if (!fileName) {
        const uriParts = uri.split('/');
        fileName = uriParts[uriParts.length - 1] || `upload_${Date.now()}.jpg`;
      }
      
      if (!fileType) {
        if (fileName.endsWith('.png')) fileType = 'image/png';
        else fileType = 'image/jpeg';
      }
    }
    
    if (!fileName.match(/\.(jpg|jpeg|png)$/i)) {
      fileName += fileType === 'image/png' ? '.png' : '.jpg';
    }
    
    // @ts-ignore: React Native FormData allows this object for file upload
    formData.append('images[]', { 
      uri, 
      type: fileType, 
      name: fileName 
    });
  });
  
  return apiUploadImage(modelType, modelId, formData);
}

export default {
  uploadImage,
  uploadMultipleImages
};
