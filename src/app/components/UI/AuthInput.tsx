import React from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text
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
}) => (
  <View style={styles.container}>
    <View style={[styles.inputContainer, !!error && styles.inputContainerError]}>
      <Feather name={icon as any} size={20} color={colors.darkGray} style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && !showValue}
        autoCapitalize={autoCapitalize}
        editable={editable}
        placeholderTextColor={colors.mediumGray}
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
);

const styles = StyleSheet.create({
    container: {
        marginBottom: 15,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.mediumGray,
        borderRadius: 8,
        paddingHorizontal: 10,
        height: 50,
    },
    inputContainerError: {
        borderColor: colors.error,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: colors.black,
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
