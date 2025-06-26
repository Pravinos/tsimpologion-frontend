import React from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import colors from '@/app/styles/colors';

interface ErrorBoxProps {
  error: string;
  errorOpacity: Animated.Value;
}

const ErrorBox: React.FC<ErrorBoxProps> = ({ error, errorOpacity }) => (
  <Animated.View style={[styles.errorBox, { opacity: errorOpacity }]}> 
    <Feather name="alert-circle" size={18} color={colors.error} style={{ marginRight: 6 }} />
    <Text style={styles.errorText}>{error}</Text>
  </Animated.View>
);

const styles = StyleSheet.create({
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff6f6',
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    textAlign: 'left',
    fontSize: 14,
    flex: 1,
  },
});

export default ErrorBox;
