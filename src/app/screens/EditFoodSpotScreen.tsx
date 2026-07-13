import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFoodSpot, updateFoodSpot, deleteFoodSpot, deleteImage, unwrap } from '@/services/ApiClient';
import { uploadMultipleImages } from '@/app/utils/uploadUtils';
import { FoodSpot } from '../types/appTypes';
import colors from '../styles/colors';
import { CustomStatusBar } from '../components/UI';
import { FoodSpotFormFields, foodSpotFormStyles as styles } from '../components/FoodSpot';
import { useFoodSpotForm } from '@/app/hooks/useFoodSpotForm';
import { NavigationProps, RootStackParamList } from '@/app/types/appTypes';
import { RouteProp } from '@react-navigation/native';

interface EditFoodSpotScreenProps {
  route: RouteProp<RootStackParamList, 'EditFoodSpot'>;
  navigation: NavigationProps;
}

function EditFoodSpotScreen({ route, navigation }: EditFoodSpotScreenProps) {
  if (!route || !route.params) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <CustomStatusBar backgroundColor={colors.white} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Invalid navigation state.</Text>
        </View>
      </SafeAreaView>
    );
  }
  const { foodSpotId } = route.params;
  const queryClient = useQueryClient();
  const form = useFoodSpotForm();

  const { data: foodSpot, isLoading, isError } = useQuery<FoodSpot>({
    queryKey: ['foodSpot', foodSpotId],
    queryFn: async () => unwrap(await getFoodSpot(foodSpotId)),
  });

  // Populates the form once from the initial fetch only; useFoodSpotForm's
  // internal ref guard prevents a later background refetch of this same
  // query (e.g. after a save) from clobbering in-progress edits.
  useEffect(() => {
    form.initializeFromFoodSpot(foodSpot);
  }, [foodSpot]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      await updateFoodSpot(foodSpotId, form.buildPayload());

      if (form.imagesToDelete.length > 0) {
        await Promise.all(form.imagesToDelete.map(imageId => deleteImage('food-spots', foodSpotId, imageId)));
      }

      if (form.newImages.length > 0) {
        await uploadMultipleImages(form.newImages, 'food-spots', foodSpotId);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['foodSpot', foodSpotId] });
      // Also invalidate the Home/Categorized 'all spots' list — previously
      // missing, so edits (name, rating, etc.) stayed stale there for up to
      // the 5-minute staleTime after navigating back.
      await queryClient.invalidateQueries({ queryKey: ['foodSpots'] });
      await queryClient.invalidateQueries({ queryKey: ['mySpots'] });
      Alert.alert('Success', 'Food spot updated successfully.');
      navigation.goBack();
    },
    onError: (error: any) => {
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join('\n');
        Alert.alert('Update Failed', `Please check the following fields:\n${errorMessages}`);
      } else {
        Alert.alert('Error', error.message || 'An unexpected error occurred.');
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteFoodSpot(foodSpotId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['foodSpots'] });
      await queryClient.invalidateQueries({ queryKey: ['mySpots'] });
      Alert.alert('Success', 'Food spot deleted successfully.');
      (navigation as any).navigate('HomeTabs', { screen: 'Home' });
    },
    onError: (error: any) => {
      console.error('Delete Error:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to delete food spot. Please try again.');
    },
  });

  const handleUpdate = () => {
    if (!form.validate()) return;
    updateMutation.mutate();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Food Spot',
      'Are you sure you want to delete this food spot? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate() },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <CustomStatusBar backgroundColor={colors.white} />
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <CustomStatusBar backgroundColor={colors.white} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load food spot data.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isBusy = updateMutation.isPending || deleteMutation.isPending;

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <CustomStatusBar backgroundColor={'#f4f5f7'} />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.title}>Edit Food Spot</Text>

        <FoodSpotFormFields
          name={form.name} setName={form.setName}
          category={form.category} setCategory={form.setCategory}
          city={form.city} setCity={form.setCity}
          address={form.address} setAddress={form.setAddress}
          description={form.description} setDescription={form.setDescription}
          infoLink={form.infoLink} setInfoLink={form.setInfoLink}
          phone={form.phone} setPhone={form.setPhone}
          priceRange={form.priceRange} setPriceRange={form.setPriceRange}
          businessHours={form.businessHours}
          handleBusinessHourChange={form.handleBusinessHourChange}
          addBusinessHour={form.addBusinessHour}
          removeBusinessHour={form.removeBusinessHour}
          socialLinks={form.socialLinks}
          handleSocialLinkChange={form.handleSocialLinkChange}
          addSocialLink={form.addSocialLink}
          removeSocialLink={form.removeSocialLink}
          existingImages={form.existingImages}
          handleRemoveExistingImage={form.handleRemoveExistingImage}
          newImages={form.newImages}
          removeNewImage={form.removeNewImage}
          handleImagePick={form.handleImagePick}
        />

        <TouchableOpacity style={styles.button} onPress={handleUpdate} disabled={isBusy}>
          {updateMutation.isPending ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Update Food Spot</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} disabled={isBusy}>
          {deleteMutation.isPending ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.deleteButtonText}>Delete Food Spot</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

export default EditFoodSpotScreen;
