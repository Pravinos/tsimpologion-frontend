import React, { useState } from 'react';
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
import { useAuth } from '../../services/AuthProvider';
import { updateUser, getCurrentUser, uploadImage, getToken, deleteImage } from '../../services/ApiClient';
import { User } from '../../types/models';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { getFullImageUrl } from '../utils/getFullImageUrl';

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
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [pickerAsset, setPickerAsset] = useState<any>(null);

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
        setSelectedImage(userProfile.images[0]);
      }
    }
  }, [userProfile]);

  const validateForm = () => {
    const newErrors: FormErrors = {};

    // Validate name
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate password fields if changing password
    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword) {
        newErrors.currentPassword = 'Current password is required to change password';
      }
      if (!newPassword) {
        newErrors.newPassword = 'New password is required';
      } else if (newPassword.length < 8) {
        newErrors.newPassword = 'New password must be at least 8 characters';
      }
      if (newPassword !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  // When picking a new image, set as { url: localUri } for preview compatibility
  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Permission to access media library is required!');
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      setSelectedImage({ url: pickerResult.assets[0].uri });
      setPickerAsset(pickerResult.assets[0]);
    }
  };
  const handleSave = async () => {
    if (!validateForm() || !userProfile) {
      return;
    }
    try {
      setSaving(true);
      let imageUrl = selectedImage;
      // If a new image is selected and it's a local file, upload it
      if (selectedImage && (selectedImage.url || typeof selectedImage === 'string' && !selectedImage.startsWith('http'))) {
        // 1. Delete old image if exists
        if (userProfile.images && userProfile.images.length > 0) {
          try {
            await deleteImage('users', userProfile.id, userProfile.images[0].id);
          } catch (e) {
            console.warn('Failed to delete old profile image:', e);
          }
        }
        // 2. Upload new image
        const formData = new FormData();
        let fileName = pickerAsset?.fileName;
        let fileType = pickerAsset?.mimeType || pickerAsset?.type;
        let uri = pickerAsset?.uri || (selectedImage.url || selectedImage);
        if (!fileName) {
          const uriParts = uri.split('/');
          fileName = uriParts[uriParts.length - 1] || 'profile.jpg';
        }
        if (!fileType) {
          if (fileName.endsWith('.png')) fileType = 'image/png';
          else fileType = 'image/jpeg';
        }
        if (!fileName.match(/\.(jpg|jpeg|png)$/i)) {
          fileName += fileType === 'image/png' ? '.png' : '.jpg';
        }
        formData.append('images[]', {
          uri,
          type: fileType,
          name: fileName,
        } as any);
        if (__DEV__) {
          console.log('Uploading file:', { uri, type: fileType, name: fileName });
        }
        const uploadUrl = `http://192.168.1.162:8000/api/images/users/${userProfile.id}`;
        const token = await getToken();
        const fetchRes = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          body: formData,
        });
        const uploadRes = await fetchRes.json();
        if (__DEV__) {
          console.log('Upload response:', uploadRes);
        }
        let imageUrl;
        if (uploadRes.data?.data && Array.isArray(uploadRes.data.data)) {
          imageUrl = uploadRes.data.data[0];
        } else if (uploadRes.data?.data) {
          imageUrl = uploadRes.data.data;
        } else if (uploadRes.data?.images && Array.isArray(uploadRes.data.images)) {
          imageUrl = uploadRes.data.images[0];
        }
        setSelectedImage(imageUrl);
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
      // Always send images field, even if empty, to satisfy backend validation
      if (imageUrl) {
        updateData.images = [imageUrl];
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
      // Enhanced error logging for 422 and backend validation
      if (err.response) {
        console.error('Backend error:', err.response.status, err.response.data);
        if (err.response.data?.errors) {
          // Laravel-style validation errors
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
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{flex: 1}}>
        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={{flex: 1}}>
            <ScrollView style={styles.content} contentContainerStyle={{flexGrow: 1}} showsVerticalScrollIndicator={false}>
              <View style={styles.avatarSection}>
                <TouchableOpacity onPress={handlePickImage} disabled={saving} style={styles.avatarTouchable}>
                  {/* Debug: log selectedImage and resolved URL before rendering avatar */}
                  {selectedImage ? (
                    <Image source={{ uri: getFullImageUrl(selectedImage) }} style={styles.avatar} />
                  ) : (
                    <Feather name="user" size={60} color={colors.primary} />
                  )}
                  <View style={styles.cameraIconContainer}>
                    <Feather name="camera" size={20} color={colors.white} />
                  </View>
                </TouchableOpacity>
                <Text style={styles.avatarHint}>Tap to change photo</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Name</Text>
                  <TextInput
                    style={[styles.input, errors.name && styles.inputError]}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your name"
                    editable={!saving}
                  />
                  {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
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

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Change Password</Text>
                <Text style={styles.sectionSubtitle}>Leave blank to keep current password</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Current Password</Text>
                  <TextInput
                    style={[styles.input, errors.currentPassword && styles.inputError]}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Enter current password"
                    secureTextEntry
                    editable={!saving}
                  />
                  {errors.currentPassword && <Text style={styles.errorText}>{errors.currentPassword}</Text>}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>New Password</Text>
                  <TextInput
                    style={[styles.input, errors.newPassword && styles.inputError]}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password"
                    secureTextEntry
                    editable={!saving}
                  />
                  {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm New Password</Text>
                  <TextInput
                    style={[styles.input, errors.confirmPassword && styles.inputError]}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm new password"
                    secureTextEntry
                    editable={!saving}
                  />
                  {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                </View>
              </View>
            </ScrollView>
            <View style={styles.footer}>
              <TouchableOpacity 
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
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
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
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
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: colors.white,
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
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: colors.mediumGray,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
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
  avatarSection: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  avatarTouchable: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 4,
  },
  avatarHint: {
    fontSize: 13,
    color: colors.darkGray,
    marginBottom: 8,
  },
});

export default EditProfileScreen;
