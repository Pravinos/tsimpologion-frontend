import React, { useState, useReducer, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Animated,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import colors from '@/app/styles/colors';
import { useAuth } from '@/services/AuthProvider';
import AuthInput from '@/app/components/UI/AuthInput';
import { CustomStatusBar, AnimatedAuthButton } from '@/app/components/UI';
import ErrorBox from '@/app/components/UI/ErrorBox';
import * as Haptics from 'expo-haptics';
import { useAuthScreenAnimations } from '@/app/hooks/useAuthScreenAnimations';

interface RegisterScreenProps {
  navigation: any;
}

// Form state and actions for the reducer
interface FormState {
  values: {
    name: string;
    email: string;
    password: string;
    passwordConfirmation: string;
  };
  errors: {
    name?: string;
    email?: string;
    password?: string;
    passwordConfirmation?: string;
  };
}

type FormAction =
  | { type: 'UPDATE_FIELD'; field: keyof FormState['values']; value: string }
  | { type: 'SET_ERRORS'; errors: FormState['errors'] }
  | { type: 'CLEAR_ERRORS' };

// --- Reducer and Initial State ---
const initialState: FormState = {
  values: {
    name: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  },
  errors: {},
};

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return {
        ...state,
        values: { ...state.values, [action.field]: action.value },
        errors: { ...state.errors, [action.field]: undefined },
      };
    case 'SET_ERRORS':
      return { ...state, errors: action.errors };
    case 'CLEAR_ERRORS':
      return { ...state, errors: {} };
    default:
      return state;
  }
};

// --- Main Component ---
const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [formState, dispatch] = useReducer(formReducer, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { register } = useAuth();

  // Animations
  const { logoOpacity, logoTranslateY, formOpacity, formTranslateY, errorOpacity } = useAuthScreenAnimations(apiError);

  // --- Handlers ---
  const handleInputChange = (field: keyof FormState['values'], value: string) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  };

  const validateForm = (): boolean => {
    const { name, email, password, passwordConfirmation } = formState.values;
    const newErrors: FormState['errors'] = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email address is invalid';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (!passwordConfirmation) {
      newErrors.passwordConfirmation = 'Please confirm your password';
    } else if (password !== passwordConfirmation) {
      newErrors.passwordConfirmation = 'Passwords do not match';
    }
    dispatch({ type: 'SET_ERRORS', errors: newErrors });
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    setApiError(null);
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    try {
      const result = await register({
        name: formState.values.name,
        email: formState.values.email,
        password: formState.values.password,
        password_confirmation: formState.values.passwordConfirmation,
      });
      if (result?.authError) {
        setApiError(result.message);
      } else if (result?.unexpectedError) {
        setApiError(null);
        Alert.alert('Registration Error', result.message, [{ text: 'OK', style: 'default' }]);
      } else if (result?.message) {
        // Registration success (no auto-login)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Registration Successful',
          'Your account has been created. You can now sign in!',
          [{ text: 'Sign In', onPress: () => navigation.navigate('Login'), style: 'default' }]
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Login');
  };

  // --- Render ---
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
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
              <Text style={styles.title}>Create Account</Text>
              {apiError && (
                <ErrorBox error={apiError} errorOpacity={errorOpacity} />
              )}
              <AuthInput
                icon="user"
                placeholder="Full Name"
                value={formState.values.name}
                onChangeText={(value) => handleInputChange('name', value)}
                editable={!isLoading}
                autoCapitalize="words"
                error={formState.errors.name}
                delay={0}
              />
              <AuthInput
                icon="mail"
                placeholder="Email Address"
                value={formState.values.email}
                onChangeText={(value) => handleInputChange('email', value)}
                editable={!isLoading}
                error={formState.errors.email}
                delay={0}
              />
              <AuthInput
                icon="lock"
                placeholder="Password (min. 8 characters)"
                value={formState.values.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry
                showToggle
                onToggle={() => setShowPassword((v) => !v)}
                showValue={showPassword}
                editable={!isLoading}
                error={formState.errors.password}
                delay={0}
              />
              <AuthInput
                icon="shield"
                placeholder="Confirm Password"
                value={formState.values.passwordConfirmation}
                onChangeText={(value) => handleInputChange('passwordConfirmation', value)}
                secureTextEntry
                showToggle={false}
                editable={!isLoading}
                error={formState.errors.passwordConfirmation}
                delay={0}
              />
              <AnimatedAuthButton
                title="Create Account"
                onPress={handleRegister}
                isLoading={isLoading}
                disabled={isLoading}
                icon="user-plus"
                delay={0}
              />
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity 
                  onPress={navigateToLogin} 
                  disabled={isLoading}
                  activeOpacity={0.7}
                  style={styles.loginLinkContainer}
                >
                  <Feather 
                    name="log-in" 
                    size={16} 
                    color={isLoading ? colors.mediumGray : colors.primary} 
                    style={{ marginRight: 4 }} 
                  />
                  <Text style={[styles.loginLink, isLoading && styles.linkDisabled]}>
                    Sign In
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
    marginBottom: 30,
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 25,
    backgroundColor: colors.lightGray,
    marginBottom: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  appName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 8,
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    alignItems: 'center',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  loginText: {
    color: colors.darkGray,
    fontSize: 14,
  },
  loginLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  linkDisabled: {
    color: colors.mediumGray,
  },
});

export default RegisterScreen;