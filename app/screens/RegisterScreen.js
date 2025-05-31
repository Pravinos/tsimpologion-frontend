import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import colors from '../styles/colors';
import { useAuth } from '../../services/AuthProvider';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { register } = useAuth(); // Get register function from context

  const handleRegister = async () => {
    // Basic Validation
    if (!name || !email || !password) {
      Alert.alert('Σφάλμα', 'Παρακαλώ συμπληρώστε όλα τα πεδία.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`Attempting registration for email: ${email}`);
      await register({ name, email, password}); 
      console.log('Registration successful via context.');

      // Registration successful
      Alert.alert(
        'Επιτυχής Εγγραφή',
        'Ο λογαριασμός σας δημιουργήθηκε. Παρακαλώ συνδεθείτε.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }] // Navigate to Login screen
      );
      // If register function in context automatically logs in, navigation will be handled by AppNavigator

    } catch (err) {
      console.error('Registration failed in component:', err);
       // Try to get specific error messages from backend response
       let errorMessage = 'Η εγγραφή απέτυχε. Παρακαλώ δοκιμάστε ξανά.';
       if (err.response?.data?.errors) {
         // Example: Concatenate Laravel validation errors
         errorMessage = Object.values(err.response.data.errors).flat().join('\n');
       } else if (err.response?.data?.message) {
         errorMessage = err.response.data.message;
       }
      setError(errorMessage);
      Alert.alert('Σφάλμα Εγγραφής', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // --- JSX Structure ---
  // Similar to LoginScreen, but with fields for Name and Password Confirmation
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* ... Logo Container (optional or smaller) ... */}
           <View style={styles.logoContainer}>
             <Image
               source={require('../assets/tsimpologo.png')}
               style={{ width: 80, height: 80 }} // Slightly smaller logo
               resizeMode="contain"
             />
             <Text style={styles.appName}>Tsimpologion</Text>
           </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Create Account</Text>

            {error && <Text style={styles.errorText}>{error}</Text>}

            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Feather name="user" size={20} color={colors.darkGray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Username"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Feather name="mail" size={20} color={colors.darkGray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Feather name="lock" size={20} color={colors.darkGray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                disabled={isLoading}
              >
                <Feather name={showPassword ? "eye-off" : "eye"} size={20} color={colors.darkGray} />
              </TouchableOpacity>
            </View>

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

            {/* Login Link */}
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

// --- Styles --- (Add styles similar to LoginScreen, adjust names like loginContainer/loginLink)
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
        marginBottom: 30, // Adjust as needed
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
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.mediumGray,
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 10,
        height: 50,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: colors.black,
    },
    eyeIcon: {
        padding: 5,
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
    loginContainer: { // Changed from registerContainer
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    loginText: { // Changed from registerText
        color: colors.darkGray,
        fontSize: 14,
    },
    loginLink: { // Changed from registerLink
        color: colors.primary,
        fontSize: 14,
        fontWeight: 'bold',
    },
    linkDisabled: {
        color: colors.mediumGray,
    },
    errorText: {
        color: colors.danger, // Make sure colors.danger is defined
        textAlign: 'center',
        marginBottom: 10,
        fontSize: 14,
    },
});

export default RegisterScreen;