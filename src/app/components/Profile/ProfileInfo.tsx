import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import colors from '../../styles/colors';

interface InfoItemProps {
  icon: string;
  label: string;
  value: React.ReactNode;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value }) => (
  <View style={styles.infoItem}>
    <Feather name={icon as any} size={20} color={colors.primary} style={styles.infoIcon} />
    <View>
      <Text style={styles.infoLabel}>{label}</Text>
      {typeof value === 'string' ? (
        <Text style={styles.infoValue}>{value}</Text>
      ) : (
        value
      )}
    </View>
  </View>
);

interface ProfileInfoProps {
  email: string;
  joinDate: string;
  reviewsCount: number | string;
  isBusinessOwner: boolean;
  isReviewsLoading: boolean;
  onNavigateToBusinesses: () => void;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({
  email,
  joinDate,
  reviewsCount,
  isBusinessOwner,
  isReviewsLoading,
  onNavigateToBusinesses
}) => {
  return (
    <View style={styles.infoSectionCard}>
      <Text style={styles.sectionTitle}>Account Information</Text>
      <InfoItem icon="mail" label="Email" value={email} />
      <InfoItem icon="calendar" label="Member Since" value={joinDate} />
      <InfoItem 
        icon="message-square" 
        label="Reviews" 
        value={isReviewsLoading ? 'Loading...' : reviewsCount} 
      />

      {isBusinessOwner && (
        <InfoItem
          icon="home"
          label="Businesses"
          value={
            <Text 
              style={[styles.infoValue, styles.linkText]}
              onPress={onNavigateToBusinesses}
            >
              View my businesses
            </Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  infoSectionCard: {
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
    marginBottom: 15,
    color: colors.black,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
  },
  infoIcon: {
    width: 30,
    marginRight: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: colors.black,
  },
  linkText: {
    color: colors.primary,
    textDecorationLine: 'underline',
  }
});

export default ProfileInfo;
