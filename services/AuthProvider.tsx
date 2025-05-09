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
          setToken(storedToken);
          console.log('Token loaded from storage');
        }

        if (storedUserJson) {
          const parsedUser = JSON.parse(storedUserJson);
          setUser(parsedUser);
          console.log('User loaded from storage:', parsedUser.name);
        } else if (storedToken) {
          // Only fetch from API if we have a token but no stored user
          try {
            const response = await apiClient.getCurrentUser();
            const userData = response.data?.data || response.data;
            setUser(userData);
            // Save the fetched user to storage
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
            console.log('User fetched from API:', userData.name);
          } catch (err) {
            console.error('Failed to fetch user data despite having token:', err);
          }
        }
      } catch (e) {
        console.error('Failed to load auth data from storage:', e);
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
      console.log('Auth data cleared from storage');
    } catch (e) {
      console.error('Failed to clear auth data from storage:', e);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await apiClient.login(credentials);
      
      // Check the structure of your login response
      if (response.token && response.user) {
        // Update state
        setToken(response.token);
        setUser(response.user);
        
        // Save to storage
        await saveAuthData(response.token, response.user);
        
        return response;
      } else {
        throw new Error('Invalid login response format');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await apiClient.register(userData);
      
      // Check the structure of your register response
      if (response.data?.token && response.data?.user) {
        const { token: authToken, user: authUser } = response.data;
        
        // Update state
        setToken(authToken);
        setUser(authUser);
        
        // Save to storage
        await saveAuthData(authToken, authUser);
        
        return response.data;
      } else {
        throw new Error('Invalid registration response format');
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
      setToken(null);
      setUser(null);
      await clearAuthData();
      
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if logout fails
      setToken(null);
      setUser(null);
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