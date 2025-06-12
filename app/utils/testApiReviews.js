// testApiReviews.js - Utility to test the API response for user reviews
import { getUserReviews } from '../../services/ApiClient';

/**
 * Tests the user reviews API response and logs detailed information
 * @param {number} userId - The user ID to get reviews for
 * @returns {Promise<Array>} - The parsed reviews array (if successful)
 */
export const testUserReviewsApi = async (userId) => {
  console.log(`Testing user reviews API for userId: ${userId}`);
  
  try {
    // Make the API call
    const response = await getUserReviews(userId);
    console.log('API Response status:', response.status);
    console.log('API Response headers:', response.headers);
    
    // Log the raw response data
    console.log('Raw response data:', JSON.stringify(response.data, null, 2));
    
    // Try to extract reviews from different possible response structures
    let extractedReviews = [];
    
    if (response.data?.data && Array.isArray(response.data.data)) {
      console.log('Found reviews in response.data.data structure');
      extractedReviews = response.data.data;
    } else if (Array.isArray(response.data)) {
      console.log('Found reviews in direct array response');
      extractedReviews = response.data;
    } else if (typeof response.data === 'object' && response.data !== null) {
      // Try to find an array in any of the object's properties
      for (const key in response.data) {
        if (Array.isArray(response.data[key]) && 
            response.data[key].length > 0 && 
            response.data[key][0]?.rating !== undefined) {
          console.log(`Found reviews in response.data.${key}`);
          extractedReviews = response.data[key];
          break;
        }
      }
    }
    
    // Log what we found
    console.log(`Found ${extractedReviews.length} reviews`);
    if (extractedReviews.length > 0) {
      console.log('First review sample:', JSON.stringify(extractedReviews[0], null, 2));
    }
    
    return extractedReviews;
  } catch (error) {
    console.error('Error testing user reviews API:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    throw error;
  }
};

export default testUserReviewsApi;
