import { useState } from 'react';
import { Alert } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import {
  addFavourite,
  removeFavourite,
  createReview,
  updateReview,
  deleteReview,
  deleteImage,
  toggleReviewLike,
} from '@/services/ApiClient';
import { uploadReviewImages, handleReviewImageUpdates } from '@/app/utils/reviewUtils';
import { FoodSpot, Review } from '@/app/types/appTypes';

interface UseReviewMutationsOptions {
  id: number;
  foodSpot?: FoodSpot;
  isFavourite: boolean;
  userId?: number;
  userReview?: Review | null;
  sortOrder: 'recent' | 'liked';
  refetchSpot: () => void;
}

/**
 * Every write action (favourite toggle, review create/update/delete, like
 * toggle, review-image delete) needed by FoodSpotDetailScreen, extracted
 * alongside useFoodSpotDetailData so the screen component only orchestrates
 * hooks + rendering.
 */
export function useReviewMutations({
  id,
  foodSpot,
  isFavourite,
  userId,
  userReview,
  sortOrder,
  refetchSpot,
}: UseReviewMutationsOptions) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [isDeletingReview, setIsDeletingReview] = useState(false);

  const invalidateSpotAndReviews = () => {
    queryClient.invalidateQueries({ queryKey: ['foodSpotReviews', id] });
    queryClient.invalidateQueries({ queryKey: ['userReview', id, userId] });
    queryClient.invalidateQueries({ queryKey: ['foodSpot', id] });
  };

  const toggleFavouriteMutation = useMutation({
    mutationFn: async (currentIsFavourite: boolean) => {
      if (!foodSpot) throw new Error('Food spot not loaded');
      return currentIsFavourite ? removeFavourite(foodSpot.id) : addFavourite(foodSpot.id);
    },
    onMutate: async (currentIsFavourite: boolean) => {
      if (!foodSpot) return;
      await queryClient.cancelQueries({ queryKey: ['favourites'] });
      const previousFavourites = queryClient.getQueryData<FoodSpot[]>(['favourites']);
      queryClient.setQueryData<FoodSpot[]>(['favourites'], (oldFavourites = []) =>
        currentIsFavourite
          ? oldFavourites.filter((fs) => fs.id !== foodSpot.id)
          : [...oldFavourites, foodSpot]
      );
      return { previousFavourites };
    },
    onError: (_err, _currentIsFavourite, context) => {
      Alert.alert('Error', 'Failed to update favourites.');
      if (context?.previousFavourites) {
        queryClient.setQueryData(['favourites'], context.previousFavourites);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favourites'] });
    },
  });

  const handleToggleFavourite = () => {
    if (!foodSpot) return;
    toggleFavouriteMutation.mutate(isFavourite);
  };

  const reviewMutation = useMutation({
    mutationFn: async ({ reviewData, reviewId }: { reviewData: any; reviewId?: number }) => {
      // Extract image data before sending the rest of the payload to the API
      const { newImages, deletedImageIds, ...reviewDataForApi } = reviewData;
      return reviewId ? updateReview(id, reviewId, reviewDataForApi) : createReview(id, reviewDataForApi);
    },
    // setIsSubmitting lives here (not inside mutationFn) so it only ever
    // fires once per mutation attempt, even if react-query were to retry.
    onMutate: () => {
      setIsSubmitting(true);
    },
    onSuccess: async (data: any, variables) => {
      const reviewId = data.data?.id || data.data?.data?.id;

      if (reviewId) {
        try {
          setImageUploading(true);
          if (variables.reviewId) {
            await handleReviewImageUpdates({
              reviewId: variables.reviewId,
              newImages: variables.reviewData.newImages || [],
              deletedImageIds: variables.reviewData.deletedImageIds || [],
            });
          } else if (variables.reviewData.newImages && variables.reviewData.newImages.length > 0) {
            await uploadReviewImages(variables.reviewData.newImages, reviewId);
          }
        } catch (error) {
          console.error('Error handling review images:', error);
          Alert.alert('Warning', 'Your review was saved, but there was an issue with some images.');
        } finally {
          setImageUploading(false);
        }
      }

      invalidateSpotAndReviews();
      refetchSpot();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred.';
      Alert.alert('Error', `Failed to submit review: ${errorMessage}`);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  // Uses mutateAsync (not fire-and-forget mutate) so ReviewForm/UserReviewItem,
  // which `await` this call before clearing their local fields, only do so
  // once the mutation has actually settled — previously the form could reset
  // itself while the request/image upload was still in flight, or even after
  // it ultimately failed.
  const submitReview = async (rating: number, comment: string, images: ImagePicker.ImagePickerAsset[]) => {
    if (comment.length < 10) {
      Alert.alert('Comment too short', 'Please provide a more detailed review (at least 10 characters).');
      return;
    }
    if (rating === 0) {
      Alert.alert('No rating selected', 'Please select a rating before submitting.');
      return;
    }
    await reviewMutation.mutateAsync({ reviewData: { rating, comment, newImages: images } });
  };

  const updateUserReview = async (
    reviewId: number,
    data: {
      rating?: number;
      comment?: string;
      newImages?: ImagePicker.ImagePickerAsset[];
      deletedImageIds?: number[];
    }
  ) => {
    if (data.comment && data.comment.length < 10) {
      Alert.alert('Comment too short', 'Please provide a more detailed review (at least 10 characters).');
      return;
    }
    if (data.rating === 0) {
      Alert.alert('No rating selected', 'Please select a rating before submitting.');
      return;
    }
    await reviewMutation.mutateAsync({
      reviewData: {
        rating: data.rating,
        comment: data.comment,
        newImages: data.newImages || [],
        deletedImageIds: data.deletedImageIds || [],
      },
      reviewId,
    });
  };

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: number) => deleteReview(id, reviewId),
    onMutate: () => {
      setIsDeletingReview(true);
    },
    onSuccess: (_data, reviewId) => {
      Alert.alert('Success', 'Your review has been deleted.');
      queryClient.setQueryData(['userReview', id, userId], null);
      queryClient.setQueryData(['foodSpotReviews', id, sortOrder], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          reviews: oldData.reviews.filter((r: any) => r.id !== reviewId),
          total: Math.max(0, (oldData.total || 1) - 1),
        };
      });
      invalidateSpotAndReviews();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred.';
      Alert.alert('Error', `Failed to delete review: ${errorMessage}`);
    },
    onSettled: () => {
      setIsDeletingReview(false);
    },
  });

  const requestReviewDeletion = (reviewId: number) => {
    if (isDeletingReview) return; // Prevent double-tap
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete your review?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteReviewMutation.mutate(reviewId),
        },
      ]
    );
  };

  const toggleLikeMutation = useMutation({
    mutationFn: ({ reviewId }: { reviewId: number; isLiked: boolean }) => toggleReviewLike(reviewId),
    onMutate: async ({ reviewId, isLiked }) => {
      await queryClient.cancelQueries({ queryKey: ['foodSpotReviews', id, sortOrder] });
      const previousReviewsData = queryClient.getQueryData<{ reviews: Review[]; total: number }>(['foodSpotReviews', id, sortOrder]);
      if (previousReviewsData) {
        const newReviews = previousReviewsData.reviews.map((r) => {
          if (r.id === reviewId) {
            return {
              ...r,
              is_liked: !isLiked,
              likes_count: isLiked ? (r.likes_count ?? 1) - 1 : (r.likes_count ?? 0) + 1,
            };
          }
          return r;
        });
        queryClient.setQueryData(['foodSpotReviews', id, sortOrder], { ...previousReviewsData, reviews: newReviews });
      }

      await queryClient.cancelQueries({ queryKey: ['userReview', id, userId] });
      const previousUserReview = queryClient.getQueryData<Review>(['userReview', id, userId]);
      if (previousUserReview && previousUserReview.id === reviewId) {
        queryClient.setQueryData<Review>(['userReview', id, userId], {
          ...previousUserReview,
          is_liked: !isLiked,
          likes_count: isLiked ? (previousUserReview.likes_count ?? 1) - 1 : (previousUserReview.likes_count ?? 0) + 1,
        });
      }

      return { previousReviewsData, previousUserReview };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousReviewsData) {
        queryClient.setQueryData(['foodSpotReviews', id, sortOrder], context.previousReviewsData);
      }
      if (context?.previousUserReview) {
        queryClient.setQueryData(['userReview', id, userId], context.previousUserReview);
      }
      Alert.alert('Error', 'Failed to update like status.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['foodSpotReviews', id, sortOrder] });
      queryClient.invalidateQueries({ queryKey: ['userReview', id, userId] });
    },
  });

  const handleToggleLike = (reviewId: number, isLiked: boolean) => {
    toggleLikeMutation.mutate({ reviewId, isLiked });
  };

  const handleImageDelete = async (imageId: number) => {
    // Guard against calls that race ahead of userReview having loaded.
    if (!userReview) return;
    try {
      await deleteImage('reviews', userReview.id, imageId);
      Alert.alert('Success', 'Image deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['userReview', id, userId] });
      queryClient.invalidateQueries({ queryKey: ['foodSpot', id] });
    } catch (error) {
      Alert.alert('Error', 'Failed to delete image.');
    }
  };

  return {
    isSubmitting,
    imageUploading,
    isDeletingReview,
    handleToggleFavourite,
    submitReview,
    updateUserReview,
    requestReviewDeletion,
    handleToggleLike,
    handleImageDelete,
  };
}

export default useReviewMutations;
