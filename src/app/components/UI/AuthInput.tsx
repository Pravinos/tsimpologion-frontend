import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Animated,
  Easing,
  Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import colors from '../../styles/colors';

interface AuthInputProps {
  icon: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  showToggle?: boolean;
  onToggle?: () => void;
  showValue?: boolean;
  editable?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  delay?: number;
}

const AuthInput: React.FC<AuthInputProps> = ({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  showToggle = false,
  onToggle,
  showValue = false,
  editable = true,
  autoCapitalize = 'none',
  error,
  delay = 0,
}) => {
  // Animation values
  const translateX = useRef(new Animated.Value(-20)).current;
  const containerOpacity = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Start the animations after a delay
    const animationTimeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(containerOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
    
    return () => clearTimeout(animationTimeout);
  }, [delay, translateX, containerOpacity]);
  
  return (
    <Animated.View 
      style={[
        styles.animationWrapper, 
        { 
          transform: [{ translateX }],
          opacity: containerOpacity 
        }
      ]}
    >
      <View style={styles.container}>
        <View style={[styles.inputContainer, !!error && styles.inputContainerError]}>
          <Feather name={icon as any} size={20} color={colors.darkGray} style={styles.inputIcon} />
          <TextInput
            style={[
              styles.input,
              Platform.OS === 'android' && styles.inputAndroid
            ]}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry && !showValue}
            autoCapitalize={autoCapitalize}
            editable={editable}
            placeholderTextColor={colors.mediumGray}
            selectionColor={colors.primary}
            cursorColor={colors.primary}
            keyboardAppearance="light"
            underlineColorAndroid="transparent"
          />
          {showToggle && onToggle && (
            <TouchableOpacity
              onPress={onToggle}
              style={styles.eyeIcon}
              disabled={!editable}
            >
              <Feather
                name={showValue ? 'eye-off' : 'eye'}
                size={20}
                color={colors.darkGray}
              />
            </TouchableOpacity>
          )}
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  animationWrapper: {
    width: '100%',
  },
  container: {
    marginBottom: 15,
    overflow: 'visible',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.mediumGray,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
    backgroundColor: '#FFFFFF',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
  },
  inputContainerError: {
    borderColor: colors.error,
    borderWidth: 1.5,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#000000',
    paddingVertical: 8,
    paddingHorizontal: 0,
    textAlignVertical: 'center',
    opacity: 1,
  },
  inputAndroid: {
    fontWeight: '400',
  },
  eyeIcon: {
    padding: 5,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
});

export default AuthInput;
