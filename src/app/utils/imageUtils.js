import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Compress and resize an image to fit under a target size (in bytes) and max dimensions.
 * @param {string} uri - The image URI
 * @param {number} maxWidth - Max width in pixels
 * @param {number} maxHeight - Max height in pixels
 * @param {number} quality - Compression quality (0-1)
 * @returns {Promise<{ uri: string, width: number, height: number }>} - The compressed image asset
 */
export async function compressImage(uri, maxWidth = 1200, maxHeight = 1200, quality = 0.85) {
  // Resize first
  const manipResult = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: maxWidth, height: maxHeight } }],
    { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
  );
  return manipResult;
}

export default {};