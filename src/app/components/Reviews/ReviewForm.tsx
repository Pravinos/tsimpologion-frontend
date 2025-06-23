import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Image,
  Alert,
  ScrollView
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import StarRating from '../UI/StarRating';
import colors from '../../styles/colors';

interface ReviewFormProps {
  isLoggedIn: boolean;
  isSubmitting: boolean;
  imageUploading: boolean;
  onSubmit: (rating: number, comment: string, images: ImagePicker.ImagePickerAsset[]) => Promise<void>;
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
  const [selectedImages, setSelectedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Permission to access media library is required!');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 0.7,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImages(prev => [...prev, result.assets[0] as ImagePicker.ImagePickerAsset]);
    }
  };
  
  const handleRemoveImage = (uri: string) => {
    setSelectedImages(prev => prev.filter(image => image.uri !== uri));
  };
  
  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating for your review.');
      return;
    }
    
    if (!comment.trim()) {
      Alert.alert('Comment Required', 'Please write a comment for your review.');
      return;
    }
    
    await onSubmit(rating, comment, selectedImages);
    
    // Reset form after successful submission
    setRating(0);
    setComment('');
    setSelectedImages([]);
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
        <Text style={styles.ratingLabel}>Your Rating:</Text>
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
      <View style={styles.photoSection}>
        <Text style={styles.photoSectionTitle}>Add Photos</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollView}>
          {selectedImages.map((image, index) => (
            <View key={`new-${index}`} style={styles.imageContainer}>
              <Image
                source={{ uri: image.uri }}
                style={styles.reviewImage}
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() => handleRemoveImage(image.uri)}
                style={styles.removeImageButton}
              >
                <MaterialCommunityIcons name="close" size={18} color={colors.white} />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity onPress={handlePickImage} style={styles.addPhotoButton}>
            <MaterialCommunityIcons name="camera-plus-outline" size={30} color={colors.primary} />
          </TouchableOpacity>
        </ScrollView>
        {imageUploading && (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.uploadingText}>Uploading image(s)...</Text>
          </View>
        )}
      </View>
      
      <TouchableOpacity 
        style={[styles.submitButton, (isSubmitting || imageUploading) && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting || imageUploading}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <Text style={styles.submitButtonText}>SUBMIT REVIEW</Text>
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
    fontWeight: 'bold',
    marginRight: 10,
    color: colors.darkGray,
  },
  reviewInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.mediumGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    textAlignVertical: 'top',
    backgroundColor: colors.white,
    fontSize: 14,
  },
  photoSection: {
    marginBottom: 20,
  },
  photoSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.darkGray,
    marginBottom: 10,
  },
  imageScrollView: {
    paddingVertical: 8,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 10,
  },
  reviewImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: colors.lightGray,
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    padding: 2,
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  uploadingText: {
    marginLeft: 8,
    color: colors.darkGray,
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 14,
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
    padding: 20,
    backgroundColor: colors.backgroundWarm,
    borderRadius: 8,
  },
  loginPromptText: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 12,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  loginButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default ReviewForm;
