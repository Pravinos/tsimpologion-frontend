import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFoodSpot, unwrap } from '@/services/ApiClient';
import { uploadMultipleImages } from '@/app/utils/uploadUtils';
import { CustomStatusBar } from '../components/UI';
import { FoodSpotFormFields, foodSpotFormStyles as styles } from '../components/FoodSpot';
import { useFoodSpotForm } from '@/app/hooks/useFoodSpotForm';
import colors from '../styles/colors';
import { NavigationProps } from '@/app/types/appTypes';

function AddFoodSpotScreen({ navigation }: { navigation: NavigationProps }) {
  const queryClient = useQueryClient();
  const form = useFoodSpotForm();

  const createMutation = useMutation({
    mutationFn: async () => {
      const response = await createFoodSpot(form.buildPayload());
      const createdSpot = unwrap(response);
      if (!createdSpot?.id) {
        throw new Error('Failed to get created food spot ID');
      }
      return createdSpot;
    },
    onSuccess: async (createdSpot) => {
      await queryClient.invalidateQueries({ queryKey: ['foodSpots'] });
      await queryClient.invalidateQueries({ queryKey: ['mySpots'] });

      // The spot itself was created successfully at this point — any image
      // upload failure below is reported separately so the user doesn't
      // think creation failed outright and resubmit (creating a duplicate).
      if (form.newImages.length > 0) {
        try {
          await uploadMultipleImages(form.newImages, 'food-spots', createdSpot.id);
        } catch (imageError) {
          console.error('Image upload failed after spot creation:', imageError);
          Alert.alert(
            'Spot Created',
            'Your food spot was created, but the photos failed to upload. You can add photos from the Edit screen.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
          return;
        }
      }

      Alert.alert('Success', 'Food spot created successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: (error: any) => {
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join('\n');
        Alert.alert('Creation Failed', `Please check the following fields:\n${errorMessages}`);
      } else {
        Alert.alert('Error', error.message || 'An unexpected error occurred.');
      }
    },
  });

  const handleCreate = () => {
    if (!form.validate()) return;
    createMutation.mutate();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <CustomStatusBar backgroundColor={'#f4f5f7'} />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.title}>Add New Food Spot</Text>

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
          newImages={form.newImages}
          removeNewImage={form.removeNewImage}
          handleImagePick={form.handleImagePick}
        />

        <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={createMutation.isPending}>
          {createMutation.isPending ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Create Food Spot</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

export default AddFoodSpotScreen;
