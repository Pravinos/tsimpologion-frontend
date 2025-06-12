import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import colors from '../../styles/colors';

interface ProfileHeaderProps {
  name: string;
  role: string;
  imageUrl?: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ name, role, imageUrl }) => {
  return (
    <View style={styles.headerShadow}>
      <View style={styles.headerCard}>
        <View style={styles.avatarContainer}>
          {imageUrl ? (
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.avatar} 
            />
          ) : (
            <Feather name="user" size={40} color={colors.white} />
          )}
        </View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.role}>{role}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerShadow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    backgroundColor: 'transparent',
  },
  headerCard: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.white,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.08)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  role: {
    fontSize: 15,
    color: colors.white,
    opacity: 0.85,
    marginBottom: 2,
  }
});

export default ProfileHeader;
