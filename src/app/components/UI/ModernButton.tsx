import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import colors from '../../styles/colors';

interface ModernButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  variant?: 'primary' | 'secondary' | 'danger';
}

const ModernButton: React.FC<ModernButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
  variant = 'primary',
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return [styles.button, styles.secondary, style, disabled && styles.disabled];
      case 'danger':
        return [styles.button, styles.danger, style, disabled && styles.disabled];
      default:
        return [styles.button, styles.primary, style, disabled && styles.disabled];
    }
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? colors.primary : colors.white} />
      ) : (
        <Text style={[
          styles.buttonText,
          variant === 'secondary' && styles.secondaryText,
          variant === 'danger' && styles.dangerText,
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 38,
    minWidth: 64,
    borderRadius: 7,
    paddingHorizontal: 16,
    paddingVertical: 7,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 1,
    elevation: 0.5,
    flexDirection: 'row',
    transitionDuration: '150ms',
    marginHorizontal: 8,
    marginBottom: 8,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  danger: {
    backgroundColor: colors.error,
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.1,
    textTransform: 'capitalize',
  },
  secondaryText: {
    color: colors.primary,
  },
  dangerText: {
    color: colors.white,
  },
});

export default ModernButton;
