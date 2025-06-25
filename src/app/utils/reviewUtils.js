// Utility for handling image uploads in reviews
import { uploadImage as apiUploadImage, deleteImage as apiDeleteImage } from '@/services/ApiClient';
import * as ImagePicker from 'expo-image-picker';

/**
 * Uploads multiple images for a review
 * @param {ImagePicker.ImagePickerAsset[]} images - Array of images to upload
 * @param {number} reviewId - ID of the review to attach images to
 * @returns {Promise} - Promise that resolves when all images are uploaded
 */
export async function uploadReviewImages(images, reviewId) {
  if (!images || images.length === 0 || !reviewId) {
    return Promise.resolve({ data: { images: [] } });
  }
  
  const formData = new FormData();
  
  // Add all images to FormData
  images.forEach(image => {
    const uri = image.uri;
    let fileName = image.fileName;
    let fileType = image.mimeType || image.type;
    
    if (!fileName) {
      const uriParts = uri.split('/');
      fileName = uriParts[uriParts.length - 1] || `review_${Date.now()}.jpg`;
    }
    
    if (!fileType) {
      if (fileName.endsWith('.png')) fileType = 'image/png';
      else fileType = 'image/jpeg';
    }
    
    if (!fileName.match(/\.(jpg|jpeg|png)$/i)) {
      fileName += fileType === 'image/png' ? '.png' : '.jpg';
    }
    
    // @ts-ignore: React Native FormData allows this object for file upload
    formData.append('images[]', { uri, type: fileType, name: fileName });
  });
  
  // Call the API to upload the images
  return apiUploadImage('reviews', reviewId, formData);
}

/**
 * Delete images from a review
 * @param {number[]} imageIds - Array of image IDs to delete
 * @param {number} reviewId - ID of the review the images belong to
 * @returns {Promise} - Promise that resolves when all deletions are complete
 */
export async function deleteReviewImages(imageIds, reviewId) {
  if (!imageIds || imageIds.length === 0 || !reviewId) {
    return Promise.resolve();
  }
  
  // Delete each image one by one
  const deletePromises = imageIds.map(imageId => 
    apiDeleteImage('reviews', reviewId, imageId)
  );
  
  return Promise.all(deletePromises);
}

/**
 * Handle all image operations for a review update in one function
 * @param {Object} options - Options for the update
 * @param {number} options.reviewId - ID of the review to update
 * @param {ImagePicker.ImagePickerAsset[]} options.newImages - New images to upload
 * @param {number[]} options.deletedImageIds - IDs of images to delete
 * @returns {Promise} - Promise that resolves when all operations are complete
 */
export async function handleReviewImageUpdates({ reviewId, newImages = [], deletedImageIds = [] }) {
  try {
    // First delete any images that need to be removed
    if (deletedImageIds.length > 0) {
      await deleteReviewImages(deletedImageIds, reviewId);
    }
    
    // Then upload any new images
    if (newImages.length > 0) {
      await uploadReviewImages(newImages, reviewId);
    }
    
    return true;
  } catch (error) {
    console.error('Error updating review images:', error);
    throw error;
  }
}

export default {
  uploadReviewImages,
  deleteReviewImages,
  handleReviewImageUpdates
};
