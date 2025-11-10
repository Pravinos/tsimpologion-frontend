import React, { useState } from 'react';
// import { API_BASE_URL } from '@/services/ApiClient'; // Removed unused import
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import colors from '../styles/colors';
import { useAuth } from '@/services/AuthProvider';
import { updateUser, getCurrentUser, getToken, deleteImage } from '@/services/ApiClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import ModernButton from '../components/UI/ModernButton';
import { CustomStatusBar } from '../components/UI';
// import AvatarSection from '../components/Profile/AvatarSection'; // Removed unused import
// import PersonalInfoSection from '../components/Profile/PersonalInfoSection'; // Removed unused import
import PasswordSection from '../components/Profile/PasswordSection';
import { uploadImage as uploadImageUtil } from '../utils/uploadUtils';

interface FormErrors {
  username?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

// interface UpdateData { ... } // Removed unused interface

// --- Helper Components ---
const LoadingState = () => (
  <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
    <CustomStatusBar backgroundColor={colors.white} />
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Loading profile...</Text>
    </View>
  </SafeAreaView>
);

// --- Main Component ---
const EditProfileScreen = ({ navigation }: { navigation: any }) => {
  const { user: authUser, token, updateUserInContext } = useAuth();
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  // Form fields
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [pickerAsset, setPickerAsset] = useState<any>(null); // Use 'any' for pickerAsset, or import the Expo type if you want strict typing

  // Validation states
  const [errors, setErrors] = useState<FormErrors>({});

  // Use React Query for user profile
  const {
    data: userProfile,
    isLoading: loading,
    isError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['userProfile', token],
    queryFn: async () => {
      const response = await getCurrentUser();
      return response.data?.data || response.data;
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });

  // Pre-fill form fields with user data when loaded
  React.useEffect(() => {
    if (userProfile) {
      setUsername(userProfile.username || '');
      setFirstName(userProfile.first_name || '');
      setLastName(userProfile.last_name || '');
      setPhone(userProfile.phone || '');
      setEmail(userProfile.email || '');
      if (userProfile.images && Array.isArray(userProfile.images) && userProfile.images.length > 0) {
        const img = userProfile.images[0];
        setSelectedImage(typeof img === 'string' ? img : img.url || img);
      }
    }
  }, [userProfile]);

  // Memoized form values (for future extensibility)
  const formValues = React.useMemo(() => ({
    username,
    firstName,
    lastName,
    phone,
    email,
    currentPassword,
    newPassword,
    confirmPassword,
    selectedImage,
    pickerAsset,
  }), [username, firstName, lastName, phone, email, currentPassword, newPassword, confirmPassword, selectedImage, pickerAsset]);

  // Handlers (useCallback for performance)
  const handlePickImage = React.useCallback(async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Permission to access media library is required!');
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      const asset = pickerResult.assets[0];
      setSelectedImage(asset.uri);
      // Fix type: ensure fileName is string | undefined (never null)
      setPickerAsset({
        uri: asset.uri,
        fileName: asset.fileName ?? undefined,
        mimeType: asset.mimeType ?? undefined,
        type: asset.type ?? undefined,
      });
    }
  }, []);

  const validateForm = React.useCallback(() => {
    const newErrors: FormErrors = {};
    if (!username.trim()) newErrors.username = 'Username is required';
    if (!firstName.trim()) newErrors.first_name = 'First name is required';
    if (!lastName.trim()) newErrors.last_name = 'Last name is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!emailRegex.test(email)) newErrors.email = 'Please enter a valid email address';
    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword) newErrors.currentPassword = 'Current password is required to change password';
      if (!newPassword) newErrors.newPassword = 'New password is required';
      else if (newPassword.length < 8) newErrors.newPassword = 'New password must be at least 8 characters';
      if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [username, firstName, lastName, email, currentPassword, newPassword, confirmPassword]);

  const handleSave = React.useCallback(async () => {
    if (!validateForm() || !userProfile) return;
    try {
      setSaving(true);
      let imageUrlToSend = selectedImage;
      if (selectedImage && pickerAsset && selectedImage.startsWith('file')) {
        // Delete old image if exists
        if (userProfile.images && userProfile.images.length > 0 && userProfile.images[0].id) {
          try {
            await deleteImage('users', userProfile.id, userProfile.images[0].id);
          } catch (e) {
            console.warn('Failed to delete old profile image:', e);
          }
        }
        // Use uploadUtils.js util for upload
        const uploadRes = await uploadImageUtil(pickerAsset, 'users', userProfile.id);
        let uploadedImageUrl;
        if (uploadRes.data?.data && Array.isArray(uploadRes.data.data)) {
          uploadedImageUrl = uploadRes.data.data[0];
        } else if (uploadRes.data?.data) {
          uploadedImageUrl = uploadRes.data.data;
        } else if (uploadRes.data?.images && Array.isArray(uploadRes.data.images)) {
          uploadedImageUrl = uploadRes.data.images[0];
        }
        setSelectedImage(
          uploadedImageUrl && (typeof uploadedImageUrl === 'string' ? uploadedImageUrl : uploadedImageUrl.url || uploadedImageUrl)
        );
        imageUrlToSend =
          uploadedImageUrl && (typeof uploadedImageUrl === 'string' ? uploadedImageUrl : uploadedImageUrl.url || uploadedImageUrl);
      }
      const updateData: any = {
        username: username.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim() || undefined,
        email: email.trim(),
      };
      if (currentPassword && newPassword) {
        updateData.current_password = currentPassword;
        updateData.password = newPassword;
        updateData.password_confirmation = confirmPassword;
      }
      if (imageUrlToSend) {
        updateData.images = [imageUrlToSend];
      } else {
        updateData.images = [];
      }
      const response = await updateUser(userProfile.id, updateData);
      const updatedUser = response.data?.data || response.data;
      if (updateUserInContext) {
        await updateUserInContext(updatedUser);
      }
      await queryClient.invalidateQueries({ queryKey: ['userProfile', token] });
      await queryClient.invalidateQueries({ queryKey: ['userReviews', userProfile.id] });
      Alert.alert(
        'Success',
        'Your profile has been updated successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      if (err.response) {
        console.error('Backend error:', err.response.status, err.response.data);
        if (err.response.data?.errors) {
          const errorDetails = Object.values(err.response.data.errors).flat().join('\n');
          Alert.alert('Validation Error', errorDetails);
        } else {
          const errorMessage = err.response.data?.message || 'Failed to update profile. Please try again.';
          Alert.alert('Error', errorMessage);
        }
      } else {
        console.error('Failed to update profile:', err);
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  }, [validateForm, userProfile, selectedImage, pickerAsset, username, firstName, lastName, phone, email, currentPassword, newPassword, confirmPassword, updateUserInContext, queryClient, token, navigation]);

  if (loading) return <LoadingState />;

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <CustomStatusBar backgroundColor={colors.white} barStyle="dark-content" />
      <View style={{flex: 1}}>
        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView style={styles.content} contentContainerStyle={{flexGrow: 1, paddingBottom: 32}} showsVerticalScrollIndicator={false}>
            <View style={styles.modernHeader}>
              <TouchableOpacity 
                style={styles.avatarContainer}
                onPress={handlePickImage}
                disabled={saving}
              >
                {selectedImage ? (
                  <Image source={{ uri: selectedImage }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Feather name="user" size={32} color={colors.primary} />
                  </View>
                )}
                <View style={styles.cameraIconContainer}>
                  <Feather name="camera" size={16} color={colors.white} />
                </View>
              </TouchableOpacity>
              <Text style={styles.editHint}>Tap to change photo</Text>
            </View>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={[styles.input, errors.username && styles.inputError]}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter your username"
                  editable={!saving}
                  autoCapitalize="none"
                />
                {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                  style={[styles.input, errors.first_name && styles.inputError]}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Enter your first name"
                  editable={!saving}
                  autoCapitalize="words"
                />
                {errors.first_name && <Text style={styles.errorText}>{errors.first_name}</Text>}
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={[styles.input, errors.last_name && styles.inputError]}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Enter your last name"
                  editable={!saving}
                  autoCapitalize="words"
                />
                {errors.last_name && <Text style={styles.errorText}>{errors.last_name}</Text>}
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone (optional)</Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter your phone number"
                  editable={!saving}
                  keyboardType="phone-pad"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!saving}
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>
            </View>
            <PasswordSection
              currentPassword={currentPassword}
              setCurrentPassword={setCurrentPassword}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              errors={errors}
              saving={saving}
            />
          </ScrollView>
          <View style={styles.footer}>
            <ModernButton
              title="Save Changes"
              onPress={handleSave}
              loading={saving}
              disabled={saving}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 0,
  },
  modernHeader: {
    backgroundColor: colors.white,
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    position: 'relative',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: colors.backgroundWarm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 15,
    padding: 8,
    borderWidth: 2,
    borderColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  editHint: {
    fontSize: 14,
    color: colors.darkGray,
    textAlign: 'center',
    marginBottom: 8,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 18,
    padding: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.black,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.mediumGray,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: colors.lightGray,
    color: colors.black,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    marginTop: 4,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.darkGray,
  },
  avatarSectionCard: {
   backgroundColor: colors.primary,
       alignItems: 'center',
       paddingVertical: 36,
       paddingHorizontal: 20,
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    marginHorizontal: 16,
    marginTop: -24,
    marginBottom: 16,
    padding: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarTouchable: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.white, // Change to white for avatar border
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 3,
  },
});

export default EditProfileScreen;
