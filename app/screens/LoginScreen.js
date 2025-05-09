import React, { useState } from 'react'; // Removed useEffect if not needed elsewhere
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
import { useAuth } from '../../services/AuthProvider';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Σφάλμα', 'Παρακαλώ συμπληρώστε το email και τον κωδικό πρόσβασης.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`Attempting login via context with email: ${email}`);
      await login({ email, password }); // Call context login function
      // Navigation should be handled by AppNavigator based on token change in context
      // console.log('Login successful via context.'); // Context handles token storage
      // navigation.navigate('Home'); // Remove navigation from here
    } catch (err) {
      console.error('Login failed in component:', err);
      // Extract a more specific error message if possible from your API response structure
      const errorMessage = err.response?.data?.message || 'Η σύνδεση απέτυχε. Ελέγξτε τα στοιχεία σας.';
      setError(errorMessage);
      Alert.alert('Σφάλμα Σύνδεσης', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ... rest of the component (return statement with JSX) remains largely the same ...
  // Make sure to use the 'isLoading' and 'error' states as before in the JSX

  return (
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* ... Logo Container ... */}
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/tsimpologo.png')}
                style={{ width: 100, height: 100 }}
                resizeMode="contain"
              />
              <Text style={styles.appName}>Τσιμπολόγιον</Text>
              <Text style={styles.tagline}>Βρες το Πιάτο σου, Όπου κι Αν Είσαι!</Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.title}>Σύνδεση</Text>

              {/* Display error message if exists */}
              {error && <Text style={styles.errorText}>{error}</Text>}

              {/* ... Input Containers ... */}
              <View style={styles.inputContainer}>
                <Feather name="mail" size={20} color={colors.darkGray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading} // Disable input while loading
                />
              </View>

              <View style={styles.inputContainer}>
                <Feather name="lock" size={20} color={colors.darkGray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!isLoading} // Disable input while loading
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                  disabled={isLoading} // Disable eye icon while loading
                >
                  <Feather
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={colors.darkGray}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]} // Add disabled style
                onPress={handleLogin}
                disabled={isLoading} // Disable button while loading
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.white} /> // Show spinner
                ) : (
                  <Text style={styles.buttonText}>ΣΥΝΔΕΣΗ</Text> // Show text
                )}
              </TouchableOpacity>

              {/* ... Register Container ... */}
              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Δεν έχεις λογαριασμό; </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={isLoading}>
                  <Text style={[styles.registerLink, isLoading && styles.linkDisabled]}>Εγγραφή</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
};

// ... styles remain the same ...
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
    height: '100%',    fontSize: 16,
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
    backgroundColor: colors.mediumGray,  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
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
  errorText: {    color: colors.danger,    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
  },
});


export default LoginScreen;