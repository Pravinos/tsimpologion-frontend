import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FormInput from '../Profile/FormInput';
import colors from '../../styles/colors';

interface PersonalInfoSectionProps {
  name: string;
  setName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  errors: { name?: string; email?: string };
  saving: boolean;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ name, setName, email, setEmail, errors, saving }) => (
  <View style={styles.sectionCard}>
    <Text style={styles.sectionTitle}>Personal Information</Text>
    <FormInput
      label="Name"
      value={name}
      onChangeText={setName}
      placeholder="Enter your name"
      error={errors.name}
      editable={!saving}
    />
    <FormInput
      label="Email"
      value={email}
      onChangeText={setEmail}
      placeholder="Enter your email"
      keyboardType="email-address"
      autoCapitalize="none"
      error={errors.email}
      editable={!saving}
    />
  </View>
);

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    marginHorizontal: 18,
    marginTop: -24,
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
});

export default PersonalInfoSection;
