// First ensure these imports are at the top
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Configuration ---
const API_BASE_URL = 'http://192.168.1.7:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// --- Interceptor to add Auth Token ---
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Token Management ---
const TOKEN_KEY = 'authToken';

export const storeToken = async (token) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    console.error('Failed to save the token to storage', e);
  }
};

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (e) {
    console.error('Failed to fetch the token from storage', e);
    return null;
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    console.error('Failed to remove the token from storage', e);
  }
};

// --- Generic HTTP Methods ---
const get = (url, params = {}, config = {}) => 
  apiClient.get(url, { params, ...config });

const post = (url, data = {}, config = {}) => 
  apiClient.post(url, data, config);

const put = (url, data = {}, config = {}) => 
  apiClient.put(url, data, config);

const patch = (url, data = {}, config = {}) => 
  apiClient.patch(url, data, config);

const del = (url, config = {}) => 
  apiClient.delete(url, config);

// --- Authentication ---
export const login = async (credentials) => {
  try {
    const response = await post('/login', credentials);
    if (response.data.token) {
      await storeToken(response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await post('/register', userData);
    if (response.data.token) {
      await storeToken(response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error.response?.data || error.message);
    throw error;
  }
};

export const logout = async () => {
  try {
    await post('/logout');
  } catch (error) {
    console.error('Backend logout failed:', error);
  } finally {
    await removeToken();
  }
};

// --- User ---
export const getCurrentUser = () => {
  // Use the /user endpoint for current authenticated user
  return get('/user');
};

export const getUser = (id) => {
  return get(`/users/${id}`);
};

export const updateUser = (id, data) => {
  return put(`/users/${id}`, data);
};

export const deleteUser = (id) => {
  return del(`/users/${id}`);
};

// --- Food Spots ---
export const getFoodSpots = (params) => 
  get('/food-spots', params);

export const getFoodSpot = (id) => 
  get(`/food-spots/${id}`);

export const createFoodSpot = (data) => 
  post('/food-spots', data);

export const updateFoodSpot = (id, data) => 
  put(`/food-spots/${id}`, data);

export const deleteFoodSpot = (id) => 
  del(`/food-spots/${id}`);

export const restoreFoodSpot = (id) => 
  put(`/food-spots/${id}/restore`, {});

export const forceDeleteFoodSpot = (id) => 
  del(`/food-spots/${id}/force`);

export const getFoodSpotRating = (id) => 
  get(`/food-spots/${id}/rating`);

// --- Food Spot Reviews ---
export const getReviews = (foodSpotId, params) => 
  get(`/food-spots/${foodSpotId}/reviews`, params);

export const getReview = (foodSpotId, reviewId) => 
  get(`/food-spots/${foodSpotId}/reviews/${reviewId}`);

export const createReview = (foodSpotId, data) => 
  post(`/food-spots/${foodSpotId}/reviews`, data);

export const updateReview = (foodSpotId, reviewId, data) => 
  put(`/food-spots/${foodSpotId}/reviews/${reviewId}`, data);

export const deleteReview = (foodSpotId, reviewId) => 
  del(`/food-spots/${foodSpotId}/reviews/${reviewId}`);

export const moderateReview = (foodSpotId, reviewId, data) => 
  put(`/food-spots/${foodSpotId}/reviews/${reviewId}/moderate`, data);

export const getUserReviews = (userId) => {
  return get(`/users/${userId}/reviews`);
};

// --- Images ---
export const uploadImage = (modelType, id, formData) => {
  return post(`/images/${modelType}/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const viewAllImages = (modelType, id) => 
  get(`/images/${modelType}/${id}`);

export const viewOneImage = (modelType, id, imageId) => 
  get(`/images/${modelType}/${id}/${imageId}`);

export const deleteImage = (modelType, id, imageId) => 
  del(`/images/${modelType}/${id}/${imageId}`);

export default apiClient;