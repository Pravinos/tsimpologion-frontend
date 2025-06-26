import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import colors from '../../styles/colors';
import { getFullImageUrl } from '../../utils/getFullImageUrl';

interface AvatarSectionProps {
  selectedImage: string | null;
  onPickImage: () => void;
  saving: boolean;
}

const AvatarSection: React.FC<AvatarSectionProps> = ({ selectedImage, onPickImage, saving }) => (
  <View style={styles.avatarSectionCard}>
    <TouchableOpacity onPress={onPickImage} disabled={saving} style={styles.avatarTouchable} activeOpacity={0.85}>
      {selectedImage ? (
        <Image source={{ uri: getFullImageUrl(selectedImage) }} style={styles.avatar} />
      ) : (
        <Feather name="user" size={60} color={colors.primary} />
      )}
      <View style={styles.cameraIconContainer}>
        <Feather name="camera" size={20} color={colors.white} />
      </View>
    </TouchableOpacity>
    <Text style={styles.avatarHint}>Tap to change photo</Text>
  </View>
);

const styles = StyleSheet.create({
  avatarSectionCard: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
  },
  avatarTouchable: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.white, 
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 2,
  },
  avatar: {
    width: 106,
    height: 106,
    borderRadius: 53,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 2,
  },
  avatarHint: {
    fontSize: 13,
    color: colors.white,
    marginBottom: 8,
  },
});

export default AvatarSection;
