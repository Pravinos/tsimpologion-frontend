import React, { useState } from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import colors from '../styles/colors';
import { useAuth } from '@/services/AuthProvider';

interface LoginScreenProps {
  navigation: any;
}

interface AuthInputProps {
  icon: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  showToggle?: boolean;
  onToggle?: () => void;
  showValue?: boolean;
  editable?: boolean;
}

const AuthInput: React.FC<AuthInputProps> = ({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  showToggle = false,
  onToggle,
  showValue = false,
  editable = true,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <View
      style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        !editable && styles.inputContainerDisabled,
      ]}
    >
      <Feather name={icon as any} size={20} color={colors.darkGray} style={styles.inputIcon} />
      <TextInput
        style={[styles.input, { color: '#000' }]}
        placeholder={placeholder}
        placeholderTextColor={colors.darkGray}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && !showValue}
        autoCapitalize="none"
        editable={editable}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {showToggle && onToggle && (
        <TouchableOpacity
          onPress={onToggle}
          style={styles.eyeIcon}
          disabled={!editable}
        >
          <Feather
            name={showValue ? 'eye-off' : 'eye'}
            size={20}
            color={colors.darkGray}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await login({ email, password });
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      Alert.alert('Login Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/tsimpologo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.appName}>Tsimpologion</Text>
            <Text style={styles.tagline}>Find Your Dish, Wherever You Are!</Text>
          </View>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Welcome!</Text>
            {error && (
              <View style={styles.errorBox}>
                <Feather name="alert-circle" size={18} color={colors.error} style={{ marginRight: 6 }} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            <AuthInput
              icon="mail"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              editable={!isLoading}
            />
            <AuthInput
              icon="lock"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              showToggle
              onToggle={() => setShowPassword((v) => !v)}
              showValue={showPassword}
              editable={!isLoading}
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.mediumGray,
    borderRadius: 12,
    marginBottom: 18,
    paddingHorizontal: 14,
    height: 52,
    backgroundColor: colors.lightGray,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  inputContainerFocused: {
    borderColor: colors.primary,
    backgroundColor: '#fff',
    shadowOpacity: 0.12,
    elevation: 2,
  },
  inputContainerDisabled: {
    opacity: 0.7,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#000',
    backgroundColor: 'transparent',
  },
  eyeIcon: {
    padding: 5,
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