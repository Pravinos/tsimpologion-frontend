import React, { useState } from 'react';
import { API_BASE_URL } from '@/services/ApiClient';
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
import AvatarSection from '../components/Profile/AvatarSection';
import PersonalInfoSection from '../components/Profile/PersonalInfoSection';
import PasswordSection from '../components/Profile/PasswordSection';
import { uploadImage as uploadImageUtil } from '../utils/uploadUtils';

interface FormErrors {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

interface UpdateData {
  name: string;
  email: string;
  current_password?: string;
  password?: string;
  password_confirmation?: string;
  images?: string[]; // Backend expects array, not string
}

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
  const [name, setName] = useState('');
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
      setName(userProfile.name || '');
      setEmail(userProfile.email || '');
      if (userProfile.images && userProfile.images.length > 0) {
        const img = userProfile.images[0];
        setSelectedImage(typeof img === 'string' ? img : img.url || img);
      }
    }
  }, [userProfile]);

  // Memoized form values (for future extensibility)
  const formValues = React.useMemo(() => ({
    name,
    email,
    currentPassword,
    newPassword,
    confirmPassword,
    selectedImage,
    pickerAsset,
  }), [name, email, currentPassword, newPassword, confirmPassword, selectedImage, pickerAsset]);

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
    if (!name.trim()) newErrors.name = 'Name is required';
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
  }, [name, email, currentPassword, newPassword, confirmPassword]);

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
      const updateData: UpdateData = {
        name: name.trim(),
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
  }, [validateForm, userProfile, selectedImage, pickerAsset, name, email, currentPassword, newPassword, confirmPassword, updateUserInContext, queryClient, token, navigation]);

  if (loading) return <LoadingState />;

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <CustomStatusBar backgroundColor={colors.primary} />
      <View style={{flex: 1}}>
        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView style={styles.content} contentContainerStyle={{flexGrow: 1, paddingBottom: 32}} showsVerticalScrollIndicator={false}>
            <AvatarSection selectedImage={selectedImage} onPickImage={handlePickImage} saving={saving} />
            <PersonalInfoSection
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              errors={errors}
              saving={saving}
            />
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
              style={{ marginHorizontal: 8, marginBottom: 8 }}
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
    paddingHorizontal: 0, // Remove extra padding
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 18,
    marginHorizontal: 13,
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
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonDisabled: {
    backgroundColor: colors.mediumGray,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.5,
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
    marginHorizontal: 18,
    marginTop: -24,
    marginBottom: 18,
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
  avatar: {
    width: 106,
    height: 106,
    borderRadius: 53,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarHint: {
    fontSize: 13,
    color: colors.white,
    marginBottom: 8,
  },
});

export default EditProfileScreen;
