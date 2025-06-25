import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import ReviewForm from './ReviewForm';
import UserReviewItem from './UserReviewItem';
import { Review } from '@/app/types/appTypes';
import * as ImagePicker from 'expo-image-picker';
import colors from '@/app/styles/colors';

interface UserReviewCardProps {
  userReview?: Review | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  isSubmitting: boolean;
  imageUploading: boolean;
  onSubmit: (rating: number, comment: string, images: ImagePicker.ImagePickerAsset[]) => Promise<void>;
  onUpdate: (reviewId: number, data: { rating?: number; comment?: string; newImages?: ImagePicker.ImagePickerAsset[], deletedImageIds?: number[] }) => void;
  onDelete: (reviewId: number) => void;
  onToggleLike: (reviewId: number, isLiked: boolean) => void;
  onNavigateToLogin: () => void;
}

const UserReviewCardSkeleton = () => (
  <View>
    <Text style={styles.title}>Your Review</Text>
    <View style={styles.skeletonCard}>
      <ActivityIndicator color={colors.primary} />
      <Text style={styles.skeletonText}>Loading...</Text>
    </View>
  </View>
);

export const UserReviewCard: React.FC<UserReviewCardProps> = ({
  userReview,
  isLoading,
  isLoggedIn,
  isSubmitting,
  imageUploading,
  onSubmit,
  onUpdate,
  onDelete,
  onNavigateToLogin,
  onToggleLike,
}) => {
  if (isLoading) {
    return <UserReviewCardSkeleton />;
  }

  return (
    <View>
      <Text style={styles.title}>{userReview ? 'Your Review' : 'Leave Your Review'}</Text>
      {userReview ? (
        <UserReviewItem
          review={userReview}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onToggleLike={(reviewId: number) => onToggleLike(reviewId, userReview.is_liked ?? false)}
          isLiked={userReview.is_liked}
          likesCount={userReview.likes_count}
        />
      ) : (
        <ReviewForm
          isLoggedIn={isLoggedIn}
          isSubmitting={isSubmitting}
          imageUploading={imageUploading}
          onSubmit={onSubmit}
          onNavigateToLogin={onNavigateToLogin}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.darkGray,
    marginBottom: 15,
  },
  skeletonCard: {
    backgroundColor: colors.backgroundWarm,
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeletonText: {
    marginTop: 10,
    fontSize: 14,
    color: colors.darkGray,
  },
});

export default UserReviewCard;