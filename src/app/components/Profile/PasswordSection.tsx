import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FormInput from '../Profile/FormInput';
import colors from '../../styles/colors';

interface PasswordSectionProps {
  currentPassword: string;
  setCurrentPassword: (val: string) => void;
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  errors: { currentPassword?: string; newPassword?: string; confirmPassword?: string };
  saving: boolean;
}

const PasswordSection: React.FC<PasswordSectionProps> = ({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  errors,
  saving,
}) => (
  <View style={styles.sectionCard}>
    <Text style={styles.sectionTitle}>Change Password</Text>
    <Text style={styles.sectionSubtitle}>Leave blank to keep current password</Text>
    <FormInput
      label="Current Password"
      value={currentPassword}
      onChangeText={setCurrentPassword}
      placeholder="Enter current password"
      secureTextEntry
      error={errors.currentPassword}
      editable={!saving}
    />
    <FormInput
      label="New Password"
      value={newPassword}
      onChangeText={setNewPassword}
      placeholder="Enter new password"
      secureTextEntry
      error={errors.newPassword}
      editable={!saving}
    />
    <FormInput
      label="Confirm New Password"
      value={confirmPassword}
      onChangeText={setConfirmPassword}
      placeholder="Confirm new password"
      secureTextEntry
      error={errors.confirmPassword}
      editable={!saving}
    />
  </View>
);

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    marginHorizontal: 18,
    marginBottom: 18,
    padding: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 16,
  },
});

export default PasswordSection;
