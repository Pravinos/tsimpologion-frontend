import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  ActivityIndicator,
  Animated,
  Easing,
  ViewStyle,
  TextStyle,
  Pressable,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import colors from '../../styles/colors';

interface AnimatedAuthButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  delay?: number;
}

const AnimatedAuthButton: React.FC<AnimatedAuthButtonProps> = ({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  variant = 'primary',
  delay = 0,
}) => {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  // Handle press animation
  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.97,
      duration: 100,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  };

  // Entrance animation
  useEffect(() => {
    const animationTimeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(animationTimeout);
  }, [delay, opacity, translateY]);

  // Button appearance based on variant
  const getButtonStyle = () => {
    const baseStyle = [
      styles.button,
      style,
    ];

    switch (variant) {
      case 'outline':
        return [...baseStyle, styles.outlineButton];
      case 'secondary':
        return [...baseStyle, styles.secondaryButton];
      default:
        return [...baseStyle, styles.primaryButton];
    }
  };

  const getTextStyle = () => {
    const baseTextStyle = [styles.buttonText, textStyle];
    
    switch (variant) {
      case 'outline':
        return [...baseTextStyle, styles.outlineText];
      case 'secondary':
        return [...baseTextStyle, styles.secondaryText];
      default:
        return baseTextStyle;
    }
  };

  const contentTransform = { transform: [{ scale: scaleAnim }] };

  // We split the animation from the content to prevent Android rendering issues
  return (
    <Animated.View 
      style={[
        styles.animationWrapper,
        {
          opacity,
          transform: [{ translateY }],
        }
      ]}
    >
      <View style={getButtonStyle()}>
        <Pressable
          onPress={isLoading || disabled ? undefined : onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[
            styles.pressableContent, 
            (isLoading || disabled) && styles.disabled,
          ]}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.2)', borderless: false }}
        >
          {isLoading ? (
            <ActivityIndicator
              color={variant === 'outline' ? colors.primary : colors.white}
              size="small"
            />
          ) : (
            <Animated.View style={contentTransform}>
              <View style={styles.buttonContent}>
                {icon && (
                  <Feather
                    name={icon as any}
                    size={18}
                    color={variant === 'outline' ? colors.primary : colors.white}
                    style={styles.icon}
                  />
                )}
                <Text style={getTextStyle()}>{title}</Text>
              </View>
            </Animated.View>
          )}
        </Pressable>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  animationWrapper: {
    width: '100%',
    marginVertical: 8,
  },
  button: {
    borderRadius: 12,
    height: 52,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 4,
    elevation: 2,
  },
  pressableContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    paddingHorizontal: 16,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.warmAccent1,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
  secondaryText: {
    color: colors.white,
  },
  outlineText: {
    color: colors.primary,
  },
  disabled: {
    opacity: 0.6,
  },
  icon: {
    marginRight: 8,
  },
});

export default AnimatedAuthButton;
