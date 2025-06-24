import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getFoodSpot, updateFoodSpot, uploadImage, deleteImage } from '@/services/ApiClient';
import { FoodSpot } from '../types/appTypes';
import colors from '../styles/colors';
import { ScreenProps } from '../types/appTypes';
import { getFullImageUrl } from '../utils/getFullImageUrl';

interface BusinessHour {
  id: number;
  dayRange: string;
  timeRange: string;
}

interface SocialLink {
  id: number;
  platform: string;
  url: string;
}

const EditFoodSpotScreen: React.FC<ScreenProps> = ({ route, navigation }) => {
  if (!route || !route.params) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Invalid navigation state.</Text>
        </View>
      </SafeAreaView>
    );
  }
  const { foodSpotId } = route.params as { foodSpotId: number };
  const queryClient = useQueryClient();

  const { data: foodSpot, isLoading, isError } = useQuery<FoodSpot>({
    queryKey: ['foodSpot', foodSpotId],
    queryFn: () => getFoodSpot(foodSpotId).then(res => res.data.data || res.data),
  });

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [infoLink, setInfoLink] = useState('');
  const [phone, setPhone] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [newImages, setNewImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const [permission, requestPermission] = ImagePicker.useMediaLibraryPermissions();

  useEffect(() => {
    if (foodSpot) {
      setName(foodSpot.name);
      setCategory(foodSpot.category);
      setCity(foodSpot.city);
      setAddress(foodSpot.address);
      setDescription(foodSpot.description);
      setInfoLink(foodSpot.info_link);
      setPhone(foodSpot.phone || '');
      setPriceRange(foodSpot.price_range || '');
      setExistingImages(foodSpot.images || []);
      if (foodSpot.business_hours) {
        try {
          const parsedHours = typeof foodSpot.business_hours === 'string'
            ? JSON.parse(foodSpot.business_hours)
            : foodSpot.business_hours;
          const hoursArray = Object.entries(parsedHours).map(([dayRange, timeRange], index) => ({
            id: index,
            dayRange: dayRange,
            timeRange: timeRange as string,
          }));
          setBusinessHours(hoursArray);
        } catch (e) {
          console.error("Failed to parse business hours:", e);
          setBusinessHours([]);
        }
      }
      if (foodSpot.social_links) {
        try {
          const parsedLinks = typeof foodSpot.social_links === 'string'
            ? JSON.parse(foodSpot.social_links)
            : foodSpot.social_links;
          const linksArray = Object.entries(parsedLinks).map(([platform, url], index) => ({
            id: index,
            platform: platform,
            url: url as string,
          }));
          setSocialLinks(linksArray);
        } catch (e) {
          console.error("Failed to parse social links:", e);
          setSocialLinks([]);
        }
      }
    }
  }, [foodSpot]);

  const handleUpdate = async () => {
    setIsUpdating(true);

    const businessHoursObject = businessHours.reduce((acc, curr) => {
      if (curr.dayRange) {
        acc[curr.dayRange] = curr.timeRange;
      }
      return acc;
    }, {} as Record<string, string>);

    const socialLinksObject = socialLinks.reduce((acc, curr) => {
      if (curr.platform && curr.url) {
        let sanitizedUrl = curr.url.trim();
        // Handle the common error of duplicating the protocol
        if (sanitizedUrl.startsWith('https://https://')) {
          sanitizedUrl = sanitizedUrl.substring(8);
        }
        acc[curr.platform] = sanitizedUrl;
      }
      return acc;
    }, {} as Record<string, string>);

    const updatedData: Partial<FoodSpot> = {
      name,
      category,
      city,
      address,
      description,
      info_link: infoLink,
      phone,
      price_range: priceRange,
      business_hours: businessHoursObject,
      social_links: socialLinksObject,
    };

    console.log('Updating food spot with data:', JSON.stringify(updatedData, null, 2));

    try {
      // 1. Update text data
      await updateFoodSpot(foodSpotId, updatedData);

      // 2. Delete images
      if (imagesToDelete.length > 0) {
        await Promise.all(imagesToDelete.map(imageId => deleteImage('food-spots', foodSpotId, imageId)));
      }

      // 3. Upload new images
      if (newImages.length > 0) {
        const formData = new FormData();
        newImages.forEach(image => {
          const uri = image.uri;
          let fileName = image.fileName;
          let fileType = image.mimeType || image.type;

          if (!fileName) {
            const uriParts = uri.split('/');
            fileName = uriParts[uriParts.length - 1] || `spot_${Date.now()}.jpg`;
          }

          if (!fileType) {
            if (fileName.endsWith('.png')) fileType = 'image/png';
            else fileType = 'image/jpeg';
          }
          // @ts-ignore
          formData.append('images[]', { uri, type: fileType, name: fileName });
        });
        await uploadImage('food-spots', foodSpotId, formData);
      }

      // 4. Invalidate queries and show success
      await queryClient.invalidateQueries({ queryKey: ['foodSpot', foodSpotId] });
      await queryClient.invalidateQueries({ queryKey: ['spotImages', foodSpotId] });
      await queryClient.invalidateQueries({ queryKey: ['mySpots'] });
      Alert.alert('Success', 'Food spot updated successfully.');
      navigation.goBack();

    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.errors) {
        // Handle Laravel validation errors
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join('\n');
        console.error('Validation Errors:', JSON.stringify(errors, null, 2));
        Alert.alert('Update Failed', `Please check the following fields:\n${errorMessages}`);
      } else {
        // Handle other errors
        console.error('Update Error:', error.response?.data || error.message);
        Alert.alert('Error', error.message || 'An unexpected error occurred.');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBusinessHourChange = (id: number, field: 'dayRange' | 'timeRange', value: string) => {
    setBusinessHours(currentHours =>
      currentHours.map(hour => (hour.id === id ? { ...hour, [field]: value } : hour))
    );
  };

  const addBusinessHour = () => {
    setBusinessHours(currentHours => [...currentHours, { id: Date.now(), dayRange: '', timeRange: '' }]);
  };

  const removeBusinessHour = (id: number) => {
    setBusinessHours(currentHours => currentHours.filter(hour => hour.id !== id));
  };

  const handleImagePick = async () => {
    if (!permission?.granted) {
      const { status } = await requestPermission();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'You need to grant permission to access the photo library.');
        return;
      }
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setNewImages(prev => [...prev, ...result.assets]);
    }
  };

  const removeNewImage = (uri: string) => {
    setNewImages(prev => prev.filter(img => img.uri !== uri));
  };

  const handleRemoveExistingImage = (imageId: number) => {
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
    setImagesToDelete(prev => [...prev, imageId]);
  };

  const handleSocialLinkChange = (id: number, field: 'platform' | 'url', value: string) => {
    setSocialLinks(currentLinks =>
      currentLinks.map(link => (link.id === id ? { ...link, [field]: value } : link))
    );
  };

  const addSocialLink = () => {
    setSocialLinks(currentLinks => [...currentLinks, { id: Date.now(), platform: '', url: '' }]);
  };

  const removeSocialLink = (id: number) => {
    setSocialLinks(currentLinks => currentLinks.filter(link => link.id !== id));
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load food spot data.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.title}>Edit Food Spot</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Basic Information</Text>
          <View style={styles.inputContainer}>
            <Feather name="edit" size={20} color={colors.darkGray} style={styles.icon} />
            <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
          </View>
          <View style={styles.inputContainer}>
            <Feather name="tag" size={20} color={colors.darkGray} style={styles.icon} />
            <TextInput style={styles.input} placeholder="Category" value={category} onChangeText={setCategory} />
          </View>
          <View style={styles.inputContainer}>
            <Feather name="map-pin" size={20} color={colors.darkGray} style={styles.icon} />
            <TextInput style={styles.input} placeholder="City" value={city} onChangeText={setCity} />
          </View>
          <View style={styles.inputContainer}>
            <Feather name="map" size={20} color={colors.darkGray} style={styles.icon} />
            <TextInput style={styles.input} placeholder="Address" value={address} onChangeText={setAddress} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Details</Text>
          <View style={styles.inputContainer}>
            <Feather name="align-left" size={20} color={colors.darkGray} style={styles.icon} />
            <TextInput style={[styles.input, styles.textArea]} placeholder="Description" value={description} onChangeText={setDescription} multiline />
          </View>
          <View style={styles.inputContainer}>
            <Feather name="link" size={20} color={colors.darkGray} style={styles.icon} />
            <TextInput style={styles.input} placeholder="Info Link" value={infoLink} onChangeText={setInfoLink} />
          </View>
          <View style={styles.inputContainer}>
            <Feather name="phone" size={20} color={colors.darkGray} style={styles.icon} />
            <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} />
          </View>
          <View style={styles.inputContainer}>
            <Feather name="dollar-sign" size={20} color={colors.darkGray} style={styles.icon} />
            <TextInput style={styles.input} placeholder="Price Range (e.g., €, €€, €€€)" value={priceRange} onChangeText={setPriceRange} />
          </View>
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
              />
              <TextInput
                style={[styles.hourInput, styles.hourInputTime]}
                placeholder="Time Range (e.g., 9:00-17:00)"
                value={hour.timeRange}
                onChangeText={text => handleBusinessHourChange(hour.id, 'timeRange', text)}
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
          {socialLinks.map(link => (
            <View key={link.id} style={styles.hourRow}>
              <TextInput
                style={[styles.hourInput, styles.hourInputDay]}
                placeholder="Platform (e.g., facebook)"
                value={link.platform}
                onChangeText={text => handleSocialLinkChange(link.id, 'platform', text)}
              />
              <TextInput
                style={[styles.hourInput, styles.hourInputTime]}
                placeholder="URL"
                value={link.url}
                onChangeText={text => handleSocialLinkChange(link.id, 'url', text)}
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
              <View key={image.id} style={styles.imageContainer}>
                <Image source={{ uri: getFullImageUrl(image) }} style={styles.image} />
                <TouchableOpacity onPress={() => handleRemoveExistingImage(image.id)} style={styles.removeImageButton}>
                  <Feather name="x" size={18} color={colors.white} />
                </TouchableOpacity>
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

        <TouchableOpacity style={styles.button} onPress={handleUpdate} disabled={isUpdating}>
          {isUpdating ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Update Food Spot</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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

export default EditFoodSpotScreen;
