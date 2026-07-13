import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import colors from '@/app/styles/colors';
import { getFullImageUrl } from '@/app/utils/getFullImageUrl';
import { BusinessHourRow, SocialLinkRow } from '@/app/utils/foodSpotFormTransforms';
import { ExistingImage } from '@/app/hooks/useFoodSpotForm';

interface FoodSpotFormFieldsProps {
  name: string;
  setName: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  infoLink: string;
  setInfoLink: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  priceRange: string;
  setPriceRange: (v: string) => void;
  businessHours: BusinessHourRow[];
  handleBusinessHourChange: (id: number, field: 'dayRange' | 'timeRange', value: string) => void;
  addBusinessHour: () => void;
  removeBusinessHour: (id: number) => void;
  socialLinks: SocialLinkRow[];
  handleSocialLinkChange: (id: number, field: 'platform' | 'url', value: string) => void;
  addSocialLink: () => void;
  removeSocialLink: (id: number) => void;
  existingImages: ExistingImage[];
  handleRemoveExistingImage?: (imageId: number) => void;
  newImages: ImagePicker.ImagePickerAsset[];
  removeNewImage: (uri: string) => void;
  handleImagePick: () => void;
}

/**
 * Shared field markup for AddFoodSpotScreen/EditFoodSpotScreen — these two
 * screens previously duplicated this entire form (business-hours/social-link
 * list CRUD, image picking, and all the input rows) nearly verbatim.
 */
export function FoodSpotFormFields({
  name, setName,
  category, setCategory,
  city, setCity,
  address, setAddress,
  description, setDescription,
  infoLink, setInfoLink,
  phone, setPhone,
  priceRange, setPriceRange,
  businessHours, handleBusinessHourChange, addBusinessHour, removeBusinessHour,
  socialLinks, handleSocialLinkChange, addSocialLink, removeSocialLink,
  existingImages, handleRemoveExistingImage,
  newImages, removeNewImage,
  handleImagePick,
}: FoodSpotFormFieldsProps) {
  return (
    <>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Basic Information</Text>
        <View style={styles.inputContainer}>
          <Feather name="edit" size={20} color={colors.darkGray} style={styles.icon} />
          <TextInput style={styles.input} placeholder="Name *" value={name} onChangeText={setName} placeholderTextColor={colors.darkGray} />
        </View>
        <View style={styles.inputContainer}>
          <Feather name="tag" size={20} color={colors.darkGray} style={styles.icon} />
          <TextInput style={styles.input} placeholder="Category *" value={category} onChangeText={setCategory} placeholderTextColor={colors.darkGray} />
        </View>
        <View style={styles.inputContainer}>
          <Feather name="map-pin" size={20} color={colors.darkGray} style={styles.icon} />
          <TextInput style={styles.input} placeholder="City *" value={city} onChangeText={setCity} placeholderTextColor={colors.darkGray} />
        </View>
        <View style={styles.inputContainer}>
          <Feather name="map" size={20} color={colors.darkGray} style={styles.icon} />
          <TextInput style={styles.input} placeholder="Address *" value={address} onChangeText={setAddress} placeholderTextColor={colors.darkGray} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Details</Text>
        <View style={styles.inputContainer}>
          <Feather name="align-left" size={20} color={colors.darkGray} style={styles.icon} />
          <TextInput style={[styles.input, styles.textArea]} placeholder="Description" value={description} onChangeText={setDescription} multiline placeholderTextColor={colors.darkGray} />
        </View>
        <View style={styles.inputContainer}>
          <Feather name="link" size={20} color={colors.darkGray} style={styles.icon} />
          <TextInput style={styles.input} placeholder="Info Link (optional)" value={infoLink} onChangeText={setInfoLink} placeholderTextColor={colors.darkGray} />
        </View>
        <View style={styles.inputContainer}>
          <Feather name="phone" size={20} color={colors.darkGray} style={styles.icon} />
          <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} placeholderTextColor={colors.darkGray} />
        </View>
        <View style={styles.inputContainer}>
          <Feather name="dollar-sign" size={20} color={colors.darkGray} style={styles.icon} />
          <TextInput style={styles.input} placeholder="Price Range (€, €€, €€€, or €€€€)" value={priceRange} onChangeText={setPriceRange} placeholderTextColor={colors.darkGray} />
        </View>
        <Text style={styles.helperText}>Enter € for budget, €€ for moderate, €€€ for expensive, or €€€€ for luxury</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Business Hours</Text>
        {businessHours.map(hour => (
          <View key={hour.id} style={styles.hourRow}>
            <TextInput
              style={[styles.hourInput, styles.hourInputDay]}
              placeholder="Day Range (e.g., Mon-Fri)"
              value={hour.dayRange}
              onChangeText={text => handleBusinessHourChange(hour.id, 'dayRange', text)}
              placeholderTextColor={colors.darkGray}
            />
            <TextInput
              style={[styles.hourInput, styles.hourInputTime]}
              placeholder="Time Range (e.g., 9:00-17:00)"
              value={hour.timeRange}
              onChangeText={text => handleBusinessHourChange(hour.id, 'timeRange', text)}
              placeholderTextColor={colors.darkGray}
            />
            <TouchableOpacity onPress={() => removeBusinessHour(hour.id)} style={styles.removeButton}>
              <Feather name="x" size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity onPress={addBusinessHour} style={styles.addButton}>
          <Feather name="plus" size={20} color={colors.primary} />
          <Text style={styles.addButtonText}>Add Hours</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Social Links</Text>
        <Text style={styles.helperText}>Add social media links (optional)</Text>
        {socialLinks.map(link => (
          <View key={link.id} style={styles.hourRow}>
            <TextInput
              style={[styles.hourInput, styles.hourInputDay]}
              placeholder="Platform (e.g., facebook)"
              value={link.platform}
              onChangeText={text => handleSocialLinkChange(link.id, 'platform', text)}
              placeholderTextColor={colors.darkGray}
            />
            <TextInput
              style={[styles.hourInput, styles.hourInputTime]}
              placeholder="URL"
              value={link.url}
              onChangeText={text => handleSocialLinkChange(link.id, 'url', text)}
              placeholderTextColor={colors.darkGray}
            />
            <TouchableOpacity onPress={() => removeSocialLink(link.id)} style={styles.removeButton}>
              <Feather name="x" size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity onPress={addSocialLink} style={styles.addButton}>
          <Feather name="plus" size={20} color={colors.primary} />
          <Text style={styles.addButtonText}>Add Social Link</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Photos</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollView}>
          {existingImages.map(image => (
            <View key={`existing-${image.id}`} style={styles.imageContainer}>
              <Image source={{ uri: getFullImageUrl(image) }} style={styles.image} />
              {handleRemoveExistingImage && (
                <TouchableOpacity onPress={() => handleRemoveExistingImage(image.id)} style={styles.removeImageButton}>
                  <Feather name="x" size={18} color={colors.white} />
                </TouchableOpacity>
              )}
            </View>
          ))}
          {newImages.map(image => (
            <View key={image.uri} style={styles.imageContainer}>
              <Image source={{ uri: image.uri }} style={styles.image} />
              <TouchableOpacity onPress={() => removeNewImage(image.uri)} style={styles.removeImageButton}>
                <Feather name="x" size={18} color={colors.white} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
        <TouchableOpacity onPress={handleImagePick} style={styles.addButton}>
          <Feather name="camera" size={20} color={colors.primary} />
          <Text style={styles.addButtonText}>Add Photos</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

export const foodSpotFormStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f5f7',
  },
  container: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: colors.black,
    paddingVertical: 20,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 15,
    marginTop: 10,
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: colors.error,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 15,
    marginTop: 10,
  },
  deleteButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
  },
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: colors.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.lightGray,
    marginBottom: 15,
  },
  icon: {
    padding: 10,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 10,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  imageScrollView: {
    marginBottom: 10,
  },
  imageContainer: {
    marginRight: 10,
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 2,
  },
  hourRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  hourInput: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  hourInputDay: {
    flex: 2,
    marginRight: 10,
  },
  hourInputTime: {
    flex: 3,
  },
  removeButton: {
    marginLeft: 10,
    padding: 5,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    marginTop: 10,
  },
  addButtonText: {
    marginLeft: 8,
    color: colors.primary,
    fontWeight: 'bold',
  },
  helperText: {
    fontSize: 12,
    color: colors.darkGray,
    marginLeft: 35,
    marginTop: -10,
    marginBottom: 15,
    fontStyle: 'italic',
  },
});

export default FoodSpotFormFields;
