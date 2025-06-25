import React, { useState, useReducer, useEffect, useRef } from 'react';
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Image,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import colors from '@/app/styles/colors';
import { useAuth } from '@/services/AuthProvider';
import AuthInput from '@/app/components/UI/AuthInput';
import { CustomStatusBar, AnimatedAuthButton } from '@/app/components/UI';
import * as Haptics from 'expo-haptics';
import { fadeIn, slideIn, parallelAnimations } from '@/app/utils/animationUtils';

interface LoginScreenProps {
  navigation: any;
}

// Form state and actions for the reducer
interface FormState {
  values: {
    email: string;
    password: string;
  };
  errors: {
    email?: string;
    password?: string;
  };
}

type FormAction =
  | { type: 'UPDATE_FIELD'; field: keyof FormState['values']; value: string }
  | { type: 'SET_ERRORS'; errors: FormState['errors'] }
  | { type: 'CLEAR_ERRORS' };

const initialState: FormState = {
  values: {
    email: '',
    password: '',
  },
  errors: {},
};

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return {
        ...state,
        values: { ...state.values, [action.field]: action.value },
        errors: { ...state.errors, [action.field]: undefined }, // Clear error on change
      };
    case 'SET_ERRORS':
      return { ...state, errors: action.errors };
    case 'CLEAR_ERRORS':
      return { ...state, errors: {} };
    default:
      return state;
  }
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [formState, dispatch] = useReducer(formReducer, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { login } = useAuth();

  // Animation values
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(-50)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(30)).current;
  const errorOpacity = useRef(new Animated.Value(0)).current;
  
  // Start animations when component mounts
  useEffect(() => {
    // Using staggered animation for smoother performance
    const animationDelay = Platform.OS === 'android' ? 100 : 50;
    
    // Logo animation
    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 600,
      delay: 300,
      useNativeDriver: true,
    }).start();
    
    Animated.timing(logoTranslateY, {
      toValue: 0,
      duration: 600,
      delay: 300,
      useNativeDriver: true,
    }).start();
    
    // Form animation with delay
    setTimeout(() => {
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
      
      Animated.timing(formTranslateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 600 + animationDelay);
  }, [logoOpacity, logoTranslateY, formOpacity, formTranslateY]);

  // Error animation
  useEffect(() => {
    if (apiError) {
      errorOpacity.setValue(0);
      Animated.timing(errorOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      // Provide haptic feedback for error
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [apiError, errorOpacity]);

  const handleInputChange = (field: keyof FormState['values'], value: string) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  };

  const validateForm = (): boolean => {
    const { email, password } = formState.values;
    const newErrors: FormState['errors'] = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email address is invalid';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }

    dispatch({ type: 'SET_ERRORS', errors: newErrors });
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    setApiError(null);
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    
    // Success haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setIsLoading(true);
    try {
      await login(formState.values);
      // On successful login, the AuthProvider and AppNavigator will handle navigation
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Login failed. Please check your credentials.';
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToRegister = () => {
    // Provide haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <CustomStatusBar backgroundColor={colors.white} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo section with animation */}
          <Animated.View 
            style={[
              styles.logoContainer, 
              { 
                opacity: logoOpacity,
                transform: [{ translateY: logoTranslateY }]
              }
            ]}
          >
            <Image
              source={require('@/assets/images/tsimpologo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.appName}>Tsimpologion</Text>
            <Text style={styles.tagline}>Find your comfort food, wherever you are!</Text>
          </Animated.View>
          
          {/* Form section with animation */}
          <Animated.View 
            style={[
              styles.formAnimationWrapper, 
              { 
                opacity: formOpacity,
                transform: [{ translateY: formTranslateY }]
              }
            ]}
          >
            <View style={styles.formContainer}>
              <Text style={styles.title}>Welcome Back!</Text>
              
              {apiError && (
                <Animated.View style={[styles.errorBox, { opacity: errorOpacity }]}>
                  <Feather name="alert-circle" size={18} color={colors.error} style={{ marginRight: 6 }} />
                  <Text style={styles.errorText}>{apiError}</Text>
                </Animated.View>
              )}
              
              <AuthInput
                icon="mail"
                placeholder="Email Address"
                value={formState.values.email}
                onChangeText={(value) => handleInputChange('email', value)}
                editable={!isLoading}
                error={formState.errors.email}
                delay={0} // Remove delays for smoother UX
              />
              
              <AuthInput
                icon="lock"
                placeholder="Password"
                value={formState.values.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry
                showToggle
                onToggle={() => setShowPassword((v) => !v)}
                showValue={showPassword}
                editable={!isLoading}
                error={formState.errors.password}
                delay={0} // Remove delays for smoother UX
              />
              
              <AnimatedAuthButton
                title="Sign In"
                onPress={handleLogin}
                isLoading={isLoading}
                disabled={isLoading}
                icon="log-in"
                delay={0} // Remove delays for smoother UX
              />
              
              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Don't have an account? </Text>
                <TouchableOpacity 
                  onPress={navigateToRegister} 
                  disabled={isLoading} 
                  style={styles.registerLinkContainer}
                  activeOpacity={0.7}
                >
                  <Feather 
                    name="user-plus" 
                    size={16} 
                    color={isLoading ? colors.mediumGray : colors.primary} 
                    style={{ marginRight: 2 }} 
                  />
                  <Text style={[styles.registerLink, isLoading && styles.linkDisabled]}>
                    Register Now
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 12,
  },
  tagline: {
    fontSize: 16,
    color: colors.darkGray,
    marginTop: 6,
    textAlign: 'center',
  },
  formAnimationWrapper: {
    width: '100%',
    overflow: 'visible',
  },
  formWrapper: {
    width: '100%',
    overflow: 'visible',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 20,
    textAlign: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff6f6',
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    textAlign: 'left',
    fontSize: 14,
    flex: 1,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    alignItems: 'center',
  },
  registerLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 2,
    padding: 4,
  },
  registerText: {
    color: colors.darkGray,
    fontSize: 14,
  },
  registerLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  linkDisabled: {
    color: colors.mediumGray,
  },
  logoImage: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: colors.lightGray,
    marginBottom: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
});

export default LoginScreen;