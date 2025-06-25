import React, { useState, useReducer } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '@/app/styles/colors';
import { useAuth } from '@/services/AuthProvider';
import AuthInput from '@/app/components/UI/AuthInput';
import { CustomStatusBar } from '@/app/components/UI';

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

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [formState, dispatch] = useReducer(formReducer, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { register } = useAuth();

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
      return;
    }

    setIsLoading(true);

    try {
      const { name, email, password } = formState.values;
      await register({ name, email, password, password_confirmation: formState.values.passwordConfirmation });

      Alert.alert(
        'Registration Successful',
        'Your account has been created. Please log in.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );

    } catch (err: any) {
      console.error('Registration failed in component:', err);
      let errorMessage = 'Registration failed. Please try again.';
      if (err?.response?.data?.errors) {
        errorMessage = Object.values(err.response.data.errors).flat().join('\n');
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
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
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/tsimpologo.png')}
              style={{ width: 80, height: 80 }}
              resizeMode="contain"
            />
            <Text style={styles.appName}>Tsimpologion</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Create Account</Text>

            {apiError && <Text style={styles.apiErrorText}>{apiError}</Text>}

            <AuthInput
              icon="user"
              placeholder="Username"
              value={formState.values.name}
              onChangeText={(value) => handleInputChange('name', value)}
              editable={!isLoading}
              autoCapitalize="words"
              error={formState.errors.name}
            />
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
            <AuthInput
              icon="lock"
              placeholder="Confirm Password"
              value={formState.values.passwordConfirmation}
              onChangeText={(value) => handleInputChange('passwordConfirmation', value)}
              secureTextEntry
              showToggle={false}
              editable={!isLoading}
              error={formState.errors.passwordConfirmation}
            />

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.buttonText}>Register</Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={isLoading}>
                <Text style={[styles.loginLink, isLoading && styles.linkDisabled]}>Login</Text>
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
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 10,
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
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: colors.mediumGray,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
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
  apiErrorText: {
    color: colors.error,
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
  },
});

export default RegisterScreen;