import { useEffect, useRef } from 'react';
import { Animated, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export function useAuthScreenAnimations(apiError: string | null) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(-50)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(30)).current;
  const errorOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animationDelay = Platform.OS === 'android' ? 100 : 50;
    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 600,
      delay: 300,
      useNativeDriver: true,
    }).start();
    Animated.timing(logoTranslateY, {
      toValue: 0,
      duration: 600,
      delay: 300,
      useNativeDriver: true,
    }).start();
    setTimeout(() => {
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
      Animated.timing(formTranslateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 600 + animationDelay);
  }, [logoOpacity, logoTranslateY, formOpacity, formTranslateY]);

  useEffect(() => {
    if (apiError) {
      errorOpacity.setValue(0);
      Animated.timing(errorOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [apiError, errorOpacity]);

  return { logoOpacity, logoTranslateY, formOpacity, formTranslateY, errorOpacity };
}

export default useAuthScreenAnimations;
