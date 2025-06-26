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
            console.log('User loaded from storage:', parsedUser.username);
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
      await clearAuthData();
      const response = await apiClient.login(credentials);
      if (response && response.token) {
        try {
          const userResponse = await apiClient.getCurrentUser();
          const userData = userResponse.data?.data || userResponse.data;
          if (userData) {
            setUser(userData);
            setToken(response.token);
            await saveAuthData(response.token, userData);
            return response;
          } else {
            throw new Error('No user data returned after login');
          }
        } catch (userError) {
          await clearAuthData();
          throw userError;
        }
      } else {
        throw new Error('No token returned from login');
      }
    } catch (error: any) {
      await clearAuthData();
      // For expected auth/validation errors, return a custom object
      if (error.response && (error.response.status === 401 || error.response.status === 422)) {
        return { authError: true, message: error.response.data?.message || 'Invalid email or password.' };
      }
      // Unexpected: don't throw, but return a custom object for the UI to handle
      return { unexpectedError: true, message: error?.message || 'Unexpected login error.' };
    }
  };
  const register = async (userData: RegisterData) => {
    try {
      await clearAuthData();
      const response = await apiClient.register(userData);
      if (response && response.message) {
        return response;
      }
      if (response && response.token) {
        try {
          const userResponse = await apiClient.getCurrentUser();
          const newUserData = userResponse.data?.data || userResponse.data;
          if (newUserData) {
            setUser(newUserData);
            setToken(response.token);
            await saveAuthData(response.token, newUserData);
            return response;
          } else {
            throw new Error('No user data returned after registration');
          }
        } catch (userError) {
          await clearAuthData();
          throw userError;
        }
      }
      throw new Error('Registration response not recognized.');
    } catch (error: any) {
      await clearAuthData();
      // For expected validation errors, return a custom object
      if (error.response && error.response.status === 422) {
        let message = 'Registration failed.';
        if (error.response.data?.errors) {
          message = Object.values(error.response.data.errors).flat().join('\n');
        } else if (error.response.data?.message) {
          message = error.response.data.message;
        }
        return { authError: true, message };
      }
      // Unexpected: don't throw, but return a custom object for the UI to handle
      return { unexpectedError: true, message: error?.message || 'Unexpected registration error.' };
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