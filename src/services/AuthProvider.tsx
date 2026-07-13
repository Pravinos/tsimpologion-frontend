import React, { createContext, useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as apiClient from './ApiClient';
import { User, LoginCredentials, RegisterData, AuthResult } from '../app/types/appTypes';
import queryClient from '../app/queryClient';

// Define the context types
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResult>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<AuthResult>;
  updateUserInContext: (updatedUser: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// AuthProvider only owns the cached user profile. The auth token itself is
// owned exclusively by ApiClient (storeToken/getToken/removeToken) so there
// is a single source of truth for token persistence.
const USER_KEY = 'authUser';

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Guards against setting state after the component unmounts (e.g. a slow
  // getCurrentUser() call resolving after a session-expired clear already ran).
  const isMountedRef = useRef(true);

  const clearAuthData = useCallback(async () => {
    try {
      await Promise.all([
        apiClient.removeToken(),
        AsyncStorage.removeItem(USER_KEY),
      ]);
    } catch (e) {
      console.error('Failed to clear auth data from storage:', e);
    } finally {
      if (isMountedRef.current) {
        setToken(null);
        setUser(null);
      }
      // Drop every cached query (profile, favourites, reviews, etc.) so no
      // data from this session leaks into the next login on the same device.
      queryClient.clear();
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // React immediately to a 401 from any API call, instead of only detecting
  // an expired/invalid token on the next cold start.
  useEffect(() => {
    const unsubscribe = apiClient.onSessionExpired(() => {
      clearAuthData();
    });
    return unsubscribe;
  }, [clearAuthData]);

  useEffect(() => {
    // Load both token and user from storage on app start
    const loadAuthData = async () => {
      try {
        const [storedToken, storedUserJson] = await Promise.all([
          apiClient.getToken(),
          AsyncStorage.getItem(USER_KEY),
        ]);

        if (storedToken) {
          if (storedUserJson) {
            const parsedUser = JSON.parse(storedUserJson);
            setUser(parsedUser);
            setToken(storedToken);
          } else {
            // Only fetch from API if we have a token but no stored user
            try {
              const response = await apiClient.getCurrentUser();
              const userData = apiClient.unwrap(response);
              setUser(userData);
              setToken(storedToken);
              // Save the fetched user to storage
              await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
            } catch (err) {
              console.error('Failed to fetch user data despite having token:', err);
              // Token might be invalid/expired, clear it
              await clearAuthData();
            }
          }
        }
      } catch (e) {
        console.error('Failed to load auth data from storage:', e);
        // Clear potentially corrupted data
        await clearAuthData();
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    loadAuthData();
  }, [clearAuthData]);

  // Save the fetched user to the local cache (token persistence is handled
  // by apiClient.login/register themselves).
  const saveUserData = async (authUser: User) => {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(authUser));
    } catch (e) {
      console.error('Failed to save auth data to storage:', e);
    }
  };

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResult> => {
    try {
      await clearAuthData();
      const response = await apiClient.login(credentials);
      if (response && response.token) {
        try {
          const userResponse = await apiClient.getCurrentUser();
          const userData = apiClient.unwrap(userResponse);
          if (userData) {
            setUser(userData);
            setToken(response.token);
            await saveUserData(userData);
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
  }, [clearAuthData]);

  const register = useCallback(async (userData: RegisterData): Promise<AuthResult> => {
    try {
      await clearAuthData();
      const response = await apiClient.register(userData);
      if (response && response.message) {
        return response;
      }
      if (response && response.token) {
        try {
          const userResponse = await apiClient.getCurrentUser();
          const newUserData = apiClient.unwrap(userResponse);
          if (newUserData) {
            setUser(newUserData);
            setToken(response.token);
            await saveUserData(newUserData);
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
  }, [clearAuthData]);

  const logout = useCallback(async () => {
    // Send the server logout request first, while the token is still
    // attached by the request interceptor, then clear local state. Doing
    // this in the opposite order let the token disappear from storage
    // before the outgoing request read it, so the server never saw it.
    try {
      await apiClient.logout();
    } catch (error) {
      console.warn('Server logout failed, clearing local session anyway', error);
    } finally {
      await clearAuthData();
    }
  }, [clearAuthData]);

  // Utility function to update user data without a full API call
  const updateUserInContext = useCallback(async (updatedUser: User) => {
    try {
      setUser(updatedUser);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    } catch (e) {
      console.error('Failed to update user in context:', e);
    }
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    user,
    token,
    isLoading,
    login,
    logout,
    register,
    updateUserInContext,
  }), [user, token, isLoading, login, logout, register, updateUserInContext]);

  return (
    <AuthContext.Provider value={value}>
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
