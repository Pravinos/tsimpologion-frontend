import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as apiClient from './ApiClient';
import { User, LoginCredentials, RegisterData } from '../app/types/appTypes';

// Define the context types
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<any>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<any>;
  updateUserInContext: (updatedUser: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Storage keys
const TOKEN_KEY = 'authToken';
const USER_KEY = 'authUser';

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load both token and user from storage on app start
    const loadAuthData = async () => {
      try {
        const [storedToken, storedUserJson] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY)
        ]);

        if (storedToken) {
          console.log('Token loaded from storage');
          
          if (storedUserJson) {
            const parsedUser = JSON.parse(storedUserJson);
            setUser(parsedUser);
            setToken(storedToken);
            console.log('User loaded from storage:', parsedUser.name);
          } else {
            // Only fetch from API if we have a token but no stored user
            try {
              const response = await apiClient.getCurrentUser();
              const userData = response.data?.data || response.data;
              setUser(userData);
              setToken(storedToken);
              // Save the fetched user to storage
              await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
              console.log('User fetched from API:', userData.name);
            } catch (err) {
              console.error('Failed to fetch user data despite having token:', err);
              // Token might be invalid/expired, clear it
              console.log('Clearing invalid token and user data');
              await clearAuthData();
            }
          }
        } else {
          console.log('No token found in storage');
        }
      } catch (e) {
        console.error('Failed to load auth data from storage:', e);
        // Clear potentially corrupted data
        await clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthData();
  }, []);

  // Save both token and user to storage
  const saveAuthData = async (authToken: string, authUser: User) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, authToken),
        AsyncStorage.setItem(USER_KEY, JSON.stringify(authUser))
      ]);
      console.log('Auth data saved to storage');
    } catch (e) {
      console.error('Failed to save auth data to storage:', e);
    }
  };

  // Remove both token and user from storage
  const clearAuthData = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(USER_KEY)
      ]);
      setToken(null);
      setUser(null);
      console.log('Auth data cleared from storage');
    } catch (e) {
      console.error('Failed to clear auth data from storage:', e);
    }
  };
  const login = async (credentials: LoginCredentials) => {
    try {
      // Clear any previous error state first
      await clearAuthData();
      
      // Call the login API
      const response = await apiClient.login(credentials);
      
      // Check if we got a token back
      if (response && response.token) {
        try {
          // Fetch the user data with the new token
          const userResponse = await apiClient.getCurrentUser();
          const userData = userResponse.data?.data || userResponse.data;
          
          if (userData) {
            // Store everything in state and localStorage
            setUser(userData);
            setToken(response.token);
            await saveAuthData(response.token, userData);
            return response; // Return the full response for the caller
          } else {
            throw new Error('No user data returned after login');
          }
        } catch (userError) {
          console.error('Error fetching user after login:', userError);
          await clearAuthData();
          throw userError;
        }
      } else {
        throw new Error('No token returned from login');
      }
    } catch (error: any) {
      // Only log unexpected errors
      if (!error.response || (error.response.status !== 401 && error.response.status !== 422)) {
        console.error('Login error:', error);
      }
      
      // Make sure we clear any partial auth state
      await clearAuthData();
      
      // Re-throw to let the UI handle the error
      throw error;
    }
  };
  const register = async (userData: RegisterData) => {
    try {
      // Clear any previous auth state
      await clearAuthData();
      
      // Call the register API
      const response = await apiClient.register(userData);
      
      // Check if we got a token back
      if (response && response.token) {
        try {
          // Fetch the user data with the new token
          const userResponse = await apiClient.getCurrentUser();
          const newUserData = userResponse.data?.data || userResponse.data;
          
          if (newUserData) {
            // Store everything in state and localStorage
            setUser(newUserData);
            setToken(response.token);
            await saveAuthData(response.token, newUserData);
            return response; // Return the full response for the caller
          } else {
            throw new Error('No user data returned after registration');
          }
        } catch (userError) {
          console.error('Error fetching user after registration:', userError);
          await clearAuthData();
          throw userError;
        }
      } else {
        throw new Error('No token returned from registration');
      }
    } catch (error: any) {
      // Only log unexpected errors
      if (!error.response || (error.response.status !== 401 && error.response.status !== 422)) {
        console.error('Registration error:', error);
      }
      
      // Make sure we clear any partial auth state
      await clearAuthData();
      
      // Re-throw to let the UI handle the error
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        // Try to notify the server, but don't wait for it
        apiClient.logout().catch(e => {
          console.warn('Logout API call failed, but continuing with local logout', e);
        });
      }
      
      // Clear auth data from state and storage
      await clearAuthData();
      
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if logout fails
      await clearAuthData();
    }
  };

  // Utility function to update user data without a full API call
  const updateUserInContext = async (updatedUser: User) => {
    try {
      setUser(updatedUser);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      console.log('User data updated in context and storage');
    } catch (e) {
      console.error('Failed to update user in context:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        register,
        updateUserInContext
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};