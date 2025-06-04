import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as apiClient from './ApiClient';
import { User, LoginCredentials, RegisterData } from '../types/models';

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
      const response = await apiClient.login(credentials);
      
      // Debug: Log the full response structure
      console.log('Login response structure:', JSON.stringify(response, null, 2));
      
      // Try different possible response structures
      let authToken, authUser;
      
      // Check direct response properties
      if (response.token && response.user) {
        authToken = response.token;
        authUser = response.user;
      }
      // Check if wrapped in data property
      else if (response.data?.token && response.data?.user) {
        authToken = response.data.token;
        authUser = response.data.user;
      }
      // Check if token is direct but user needs to be fetched
      else if (response.token || response.data?.token) {
        authToken = response.token || response.data.token;
        
        // Fetch user data separately
        try {
          const userResponse = await apiClient.getCurrentUser();
          authUser = userResponse.data?.data || userResponse.data;
        } catch (userErr) {
          console.error('Failed to fetch user after login:', userErr);
          throw new Error('Login succeeded but failed to fetch user data');
        }
      }
      else {
        throw new Error(`Invalid login response format. Response: ${JSON.stringify(response)}`);
      }
      
      if (authToken && authUser) {
        // Update state
        setToken(authToken);
        setUser(authUser);
        
        // Save to storage
        await saveAuthData(authToken, authUser);
        
        return { token: authToken, user: authUser };
      } else {
        throw new Error('Missing token or user data in response');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await apiClient.register(userData);
      console.log('Registration response structure:', JSON.stringify(response, null, 2));

      // Accept a successful registration message (no token/user) as valid
      if (response.message && response.message.toLowerCase().includes('user registered')) {
        // Registration succeeded, but no login. Just return a flag.
        return { success: true, message: response.message };
      }

      // Try different possible response structures for auto-login
      let authToken, authUser;
      if (response.token && response.user) {
        authToken = response.token;
        authUser = response.user;
      } else if (response.data?.token && response.data?.user) {
        authToken = response.data.token;
        authUser = response.data.user;
      } else if (response.token || response.data?.token) {
        authToken = response.token || response.data.token;
        try {
          const userResponse = await apiClient.getCurrentUser();
          authUser = userResponse.data?.data || userResponse.data;
        } catch (userErr) {
          console.error('Failed to fetch user after registration:', userErr);
          throw new Error('Registration succeeded but failed to fetch user data');
        }
      }

      if (authToken && authUser) {
        setToken(authToken);
        setUser(authUser);
        await saveAuthData(authToken, authUser);
        return { token: authToken, user: authUser };
      } else {
        throw new Error('Invalid registration response format. Response: ' + JSON.stringify(response));
      }
    } catch (error) {
      console.error('Registration error:', error);
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