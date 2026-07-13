import { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { FoodSpot } from '@/app/types/appTypes';
import { PRICE_RANGE_ORDER, isValidPriceRange } from '@/app/utils/priceRange';
import {
  BusinessHourRow,
  SocialLinkRow,
  businessHoursArrayToObject,
  businessHoursObjectToArray,
  socialLinksArrayToObject,
  socialLinksObjectToArray,
} from '@/app/utils/foodSpotFormTransforms';

export interface ExistingImage {
  id: number;
  url?: string;
  [key: string]: any;
}

/**
 * Shared form state + handlers for AddFoodSpotScreen and EditFoodSpotScreen,
 * which previously duplicated ~90% of this logic (business-hours/social-link
 * list CRUD, image picking, and validation only present on the Add screen).
 */
export function useFoodSpotForm() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [infoLink, setInfoLink] = useState('');
  const [phone, setPhone] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [businessHours, setBusinessHours] = useState<BusinessHourRow[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLinkRow[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [newImages, setNewImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);

  const [permission, requestPermission] = ImagePicker.useMediaLibraryPermissions();

  // Guards against a background refetch (e.g. an invalidated ['foodSpot', id]
  // query after the user navigates back to this screen) re-running the
  // initializer and silently overwriting whatever the user has typed so far.
  const hasInitializedRef = useRef(false);

  const initializeFromFoodSpot = useCallback((foodSpot: FoodSpot | undefined | null) => {
    if (!foodSpot || hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    setName(foodSpot.name || '');
    setCategory(foodSpot.category || '');
    setCity(foodSpot.city || '');
    setAddress(foodSpot.address || '');
    setDescription(foodSpot.description || '');
    setInfoLink(foodSpot.info_link || '');
    setPhone(foodSpot.phone || '');
    setPriceRange(foodSpot.price_range || '');
    setExistingImages(foodSpot.images || []);
    setBusinessHours(businessHoursObjectToArray(foodSpot.business_hours));
    setSocialLinks(socialLinksObjectToArray(foodSpot.social_links));
  }, []);

  const handleBusinessHourChange = useCallback((id: number, field: 'dayRange' | 'timeRange', value: string) => {
    setBusinessHours(currentHours =>
      currentHours.map(hour => (hour.id === id ? { ...hour, [field]: value } : hour))
    );
  }, []);

  const addBusinessHour = useCallback(() => {
    setBusinessHours(currentHours => [...currentHours, { id: Date.now(), dayRange: '', timeRange: '' }]);
  }, []);

  const removeBusinessHour = useCallback((id: number) => {
    setBusinessHours(currentHours => currentHours.filter(hour => hour.id !== id));
  }, []);

  const handleSocialLinkChange = useCallback((id: number, field: 'platform' | 'url', value: string) => {
    setSocialLinks(currentLinks =>
      currentLinks.map(link => (link.id === id ? { ...link, [field]: value } : link))
    );
  }, []);

  const addSocialLink = useCallback(() => {
    setSocialLinks(currentLinks => [...currentLinks, { id: Date.now(), platform: '', url: '' }]);
  }, []);

  const removeSocialLink = useCallback((id: number) => {
    setSocialLinks(currentLinks => currentLinks.filter(link => link.id !== id));
  }, []);

  const handleImagePick = useCallback(async () => {
    if (!permission?.granted) {
      const { status } = await requestPermission();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'You need to grant permission to access the photo library.');
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setNewImages(prev => [...prev, ...result.assets]);
    }
  }, [permission, requestPermission]);

  const removeNewImage = useCallback((uri: string) => {
    setNewImages(prev => prev.filter(img => img.uri !== uri));
  }, []);

  const handleRemoveExistingImage = useCallback((imageId: number) => {
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
    setImagesToDelete(prev => [...prev, imageId]);
  }, []);

  /** Validates the required fields shared by create and edit; shows an Alert on failure. */
  const validate = useCallback((): boolean => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter a name for the food spot.');
      return false;
    }
    if (!category.trim()) {
      Alert.alert('Validation Error', 'Please enter a category.');
      return false;
    }
    if (!city.trim()) {
      Alert.alert('Validation Error', 'Please enter a city.');
      return false;
    }
    if (!address.trim()) {
      Alert.alert('Validation Error', 'Please enter an address.');
      return false;
    }
    if (infoLink.length > 500) {
      Alert.alert('Validation Error', 'Info link must be 500 characters or less');
      return false;
    }
    if (priceRange.trim() && !isValidPriceRange(priceRange.trim())) {
      Alert.alert('Validation Error', `Price range must be one of: ${PRICE_RANGE_ORDER.join(', ')}`);
      return false;
    }
    return true;
  }, [name, category, city, address, infoLink, priceRange]);

  /** Builds the JSON payload for createFoodSpot/updateFoodSpot from current form state. */
  const buildPayload = useCallback(() => {
    const businessHoursObject = businessHoursArrayToObject(businessHours);
    const socialLinksObject = socialLinksArrayToObject(socialLinks);

    return {
      name,
      category,
      city,
      address,
      description: description.trim() || '',
      info_link: infoLink.trim() || '',
      ...(phone.trim() && { phone }),
      ...(priceRange.trim() && { price_range: priceRange.trim() }),
      ...(Object.keys(businessHoursObject).length > 0 && { business_hours: businessHoursObject }),
      ...(Object.keys(socialLinksObject).length > 0 && { social_links: socialLinksObject }),
    };
  }, [name, category, city, address, description, infoLink, phone, priceRange, businessHours, socialLinks]);

  return {
    name, setName,
    category, setCategory,
    city, setCity,
    address, setAddress,
    description, setDescription,
    infoLink, setInfoLink,
    phone, setPhone,
    priceRange, setPriceRange,
    businessHours,
    socialLinks,
    existingImages,
    newImages,
    imagesToDelete,
    initializeFromFoodSpot,
    handleBusinessHourChange,
    addBusinessHour,
    removeBusinessHour,
    handleSocialLinkChange,
    addSocialLink,
    removeSocialLink,
    handleImagePick,
    removeNewImage,
    handleRemoveExistingImage,
    validate,
    buildPayload,
  };
}

export default useFoodSpotForm;
