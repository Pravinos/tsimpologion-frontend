import React, { useState, useReducer } from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Image,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import colors from '@/app/styles/colors';
import { useAuth } from '@/services/AuthProvider';
import AuthInput from '@/app/components/UI/AuthInput';
import { CustomStatusBar } from '@/app/components/UI';

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
      return;
    }
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <CustomStatusBar backgroundColor={colors.white} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/tsimpologo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.appName}>Tsimpologion</Text>
            <Text style={styles.tagline}>Find Your Dish, Wherever You Are!</Text>
          </View>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Welcome!</Text>
            {apiError && (
              <View style={styles.errorBox}>
                <Feather name="alert-circle" size={18} color={colors.error} style={{ marginRight: 6 }} />
                <Text style={styles.errorText}>{apiError}</Text>
              </View>
            )}
            <AuthInput
              icon="mail"
              placeholder="Email"
              value={formState.values.email}
              onChangeText={(value) => handleInputChange('email', value)}
              editable={!isLoading}
              error={formState.errors.email}
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
            />
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={isLoading} style={styles.registerLinkContainer}>
                <Feather name="user-plus" size={16} color={isLoading ? colors.mediumGray : colors.primary} style={{ marginRight: 2 }} />
                <Text style={[styles.registerLink, isLoading && styles.linkDisabled]}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    padding: 20,
    justifyContent: 'center',  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 10,
  },
  tagline: {
    fontSize: 16,
    color: colors.darkGray,
    marginTop: 5,
  },
  formContainer: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 4,
    elevation: 2,
    transform: [{ scale: 1 }],
  },
  buttonDisabled: {
    backgroundColor: colors.mediumGray,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff6f6',
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
    marginTop: -10,
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
    color: colors.mediumGray,  },
  logoImage: {
    width: 110,
    height: 110,
    borderRadius: 24,
    backgroundColor: colors.lightGray,
    marginBottom: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
});


export default LoginScreen;