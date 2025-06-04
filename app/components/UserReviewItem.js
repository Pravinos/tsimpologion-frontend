
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import StarRating from './StarRating';
import colors from '../styles/colors';
import { getFullImageUrl } from '../utils/getFullImageUrl';
import { deleteImage } from '../../services/ApiClient';

const UserReviewItem = ({ review, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editRating, setEditRating] = useState(review.rating);
  const [editComment, setEditComment] = useState(review.comment);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle both object user and string user formats
  const userName = typeof review.user === 'object' ? 
    review.user?.name || 'Unknown User' : 
    review.user || 'Unknown User';
  
  // Format date if available
  const formattedDate = review.created_at ? 
    new Date(review.created_at).toLocaleDateString() : null;

  const handleSave = async () => {
    if (editRating === 0) {
      Alert.alert('Rating Required', 'Please select a rating for your review.');
      return;
    }

    if (!editComment.trim()) {
      Alert.alert('Comment Required', 'Please write a comment for your review.');
      return;
    }

    try {
      setIsUpdating(true);
      await onUpdate(review.id, {
        rating: editRating,
        comment: editComment.trim(),
      });
      setIsEditing(false);
      Alert.alert('Success', 'Your review has been updated successfully!');
    } catch (error) {
      console.error('Failed to update review:', error);
      Alert.alert('Error', 'Failed to update your review. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditRating(review.rating);
    setEditComment(review.comment);
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete your review? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              await onDelete(review.id);
              Alert.alert('Success', 'Your review has been deleted successfully!');
            } catch (error) {
              console.error('Failed to delete review:', error);
              Alert.alert('Error', 'Failed to delete your review. Please try again.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (isDeleting) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>Deleting review...</Text>
      </View>
    );
  }

  // Show review image if available
  const [removingImage, setRemovingImage] = useState(false);
  const reviewImage = review.images && review.images.length > 0 ? getFullImageUrl(review.images[0]) : null;

  // Helper to get image id or path for deletion
  const getImageIdOrPath = (img) => {
    if (!img) return null;
    if (typeof img === 'object' && img.id) return img.id;
    if (typeof img === 'object' && img.path) return img.path;
    if (typeof img === 'string') return img;
    return null;
  };

  const handleRemoveImage = async () => {
    if (!review.images || review.images.length === 0) return;
    const imageObj = review.images[0];
    const imageIdOrPath = getImageIdOrPath(imageObj);
    if (!imageIdOrPath) return;
    try {
      setRemovingImage(true);
      await deleteImage('reviews', review.id, imageIdOrPath);
      // Optionally, you may want to refresh the review here, or call onUpdate to refetch
      if (onUpdate) await onUpdate(review.id, {}); // triggers refetch
    } catch (err) {
      Alert.alert('Error', 'Failed to remove image.');
      console.error('Failed to remove review image:', err);
    } finally {
      setRemovingImage(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, styles.userReviewContainer]}
      onPress={() => !isEditing && setIsEditing(true)}
      disabled={isEditing || isUpdating}
    >
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {review.user?.images && review.user.images.length > 0 ? (
            <Image 
              source={{ uri: review.user.images[0] }} 
              style={styles.userImage} 
            />
          ) : (
            <View style={styles.userInitial}>
              <Text style={styles.initialText}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.username}>{userName} (You)</Text>
            {formattedDate && (
              <Text style={styles.date}>{formattedDate}</Text>
            )}
          </View>
        </View>
        {!isEditing ? (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            >
              <Feather name="edit-2" size={16} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
            >
              <Feather name="trash-2" size={16} color={colors.error} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton]}
              onPress={handleSave}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Feather name="check" size={16} color={colors.white} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancel}
              disabled={isUpdating}
            >
              <Feather name="x" size={16} color={colors.white} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {isEditing ? (
        <View style={styles.editMode}>
          <View style={styles.ratingSelector}>
            <Text style={styles.ratingLabel}>Rating:</Text>
            <StarRating 
              rating={editRating} 
              size={20} 
              selectable={true}
              onRatingChange={setEditRating} 
            />
          </View>
          <TextInput
            style={styles.editInput}
            value={editComment}
            onChangeText={setEditComment}
            multiline
            placeholder="Edit your review..."
            editable={!isUpdating}
          />
          {reviewImage && (
            <View style={{ alignItems: 'center', marginTop: 12 }}>
              <Image
                source={{ uri: reviewImage }}
                style={{ width: 120, height: 120, borderRadius: 10, marginBottom: 8 }}
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={handleRemoveImage}
                style={{ backgroundColor: colors.error, paddingVertical: 4, paddingHorizontal: 12, borderRadius: 6 }}
                disabled={removingImage}
              >
                {removingImage ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={{ color: colors.white, fontWeight: 'bold' }}>Remove Photo</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.reviewContent}>
          <View style={styles.ratingRow}>
            <StarRating rating={review.rating} size={14} />
          </View>
          <Text style={styles.comment}>{review.comment}</Text>
          {reviewImage && typeof reviewImage === 'string' && (
            <Image
              source={{ uri: reviewImage }}
              style={{ width: 120, height: 120, borderRadius: 10, marginTop: 8 }}
              resizeMode="cover"
            />
          )}
        </View>
      )}

      {!isEditing && (
        <View style={styles.tapHint}>
          <Text style={styles.tapHintText}>Tap to edit</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.lightGray,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  userReviewContainer: {
    backgroundColor: colors.primary + '15', // Light primary color background
    borderWidth: 2,
    borderColor: colors.primary + '30',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.darkGray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  userInitial: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  initialText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 14,
    color: colors.black,
  },
  date: {
    fontSize: 12,
    color: colors.darkGray,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  saveButton: {
    backgroundColor: colors.success || colors.primary,
  },
  cancelButton: {
    backgroundColor: colors.mediumGray,
  },
  editMode: {
    marginTop: 8,
  },
  ratingSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 14,
    marginRight: 8,
    fontWeight: 'bold',
  },
  editInput: {
    minHeight: 60,
    borderWidth: 1,
    borderColor: colors.mediumGray,
    borderRadius: 6,
    padding: 8,
    backgroundColor: colors.white,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  reviewContent: {
    marginTop: 4,
  },
  ratingRow: {
    marginBottom: 6,
  },
  comment: {
    fontSize: 14,
    color: colors.black,
    lineHeight: 20,
  },
  tapHint: {
    marginTop: 8,
    alignItems: 'center',
  },
  tapHintText: {
    fontSize: 12,
    color: colors.darkGray,
    fontStyle: 'italic',
  },
});

export default UserReviewItem;
