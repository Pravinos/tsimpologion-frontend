import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Image,
  Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import StarRating from '../UI/StarRating';
import colors from '../../styles/colors';

interface ReviewFormProps {
  isLoggedIn: boolean;
  isSubmitting: boolean;
  imageUploading: boolean;
  onSubmit: (rating: number, comment: string, image: ImagePicker.ImagePickerAsset | null) => Promise<void>;
  onNavigateToLogin: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  isLoggedIn,
  isSubmitting,
  imageUploading,
  onSubmit,
  onNavigateToLogin
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Permission to access media library is required!');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0] as ImagePicker.ImagePickerAsset);
    }
  };
  
  const handleRemoveImage = () => setSelectedImage(null);
  
  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating for your review.');
      return;
    }
    
    if (!comment.trim()) {
      Alert.alert('Comment Required', 'Please write a comment for your review.');
      return;
    }
    
    await onSubmit(rating, comment, selectedImage);
    
    // Reset form after successful submission
    setRating(0);
    setComment('');
    setSelectedImage(null);
  };
  
  if (!isLoggedIn) {
    return (
      <View style={styles.loginPrompt}>
        <Text style={styles.loginPromptText}>
          Please log in to leave a review
        </Text>
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={onNavigateToLogin}
        >
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <>
      <View style={styles.ratingSelector}>
        <Text style={styles.ratingLabel}>Rating:</Text>
        <StarRating 
          rating={rating} 
          size={24} 
          selectable={true}
          onRatingChange={setRating} 
        />
      </View>
      
      <TextInput
        style={styles.reviewInput}
        placeholder="Share your experience..."
        multiline
        value={comment}
        onChangeText={setComment}
        editable={!isSubmitting && !imageUploading}
      />
      
      {/* Image Picker */}
      <View style={styles.imagePickerContainer}>
        {selectedImage ? (
          <View style={styles.selectedImageContainer}>
            <Image
              source={{ uri: selectedImage.uri }}
              style={styles.selectedImage}
            />
            <TouchableOpacity 
              onPress={handleRemoveImage} 
              style={styles.removeImageButton}
            >
              <Text style={styles.removeImageText}>Remove Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            onPress={handlePickImage} 
            style={styles.addPhotoButton}
          >
            <Feather name="camera" size={20} color={colors.primary} />
            <Text style={styles.addPhotoText}>Add a photo</Text>
          </TouchableOpacity>
        )}
        
        {imageUploading && (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.uploadingText}>Uploading image...</Text>
          </View>
        )}
      </View>
      
      <TouchableOpacity 
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting || imageUploading}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <Text style={styles.submitButtonText}>SUBMIT</Text>
        )}
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  ratingSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  ratingLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  reviewInput: {
    height: 100,
    borderWidth: 1,
    borderColor: colors.mediumGray,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    textAlignVertical: 'top',
  },
  imagePickerContainer: {
    marginBottom: 15,
  },
  selectedImageContainer: {
    alignItems: 'center',
  },
  selectedImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginBottom: 8,
  },
  removeImageButton: {
    marginBottom: 8,
  },
  removeImageText: {
    color: colors.error,
    fontWeight: 'bold',
  },
  addPhotoButton: {
    backgroundColor: colors.lightGray,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  addPhotoText: {
    color: colors.primary,
    marginTop: 4,
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  uploadingText: {
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  submitButtonDisabled: {
    backgroundColor: colors.mediumGray,
  },
  loginPrompt: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
  },
  loginPromptText: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 10,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  loginButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default ReviewForm;
