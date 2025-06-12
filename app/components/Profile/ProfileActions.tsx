import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import colors from '../../styles/colors';

interface ActionItemProps {
  icon: string;
  label: string;
  onPress: () => void;
  color?: string;
  backgroundColor?: string;
  isLast?: boolean;
}

const ActionItem: React.FC<ActionItemProps> = ({ 
  icon, 
  label, 
  onPress,
  color = colors.black,
  backgroundColor = 'transparent',
  isLast = false
}) => (
  <TouchableOpacity 
    style={[
      styles.actionButton, 
      !isLast && styles.actionButtonBorder,
      { backgroundColor }
    ]}
    onPress={onPress}
    activeOpacity={0.85}
  >
    <Feather 
      name={icon as any} 
      size={20} 
      color={color === colors.black ? colors.primary : color} 
      style={styles.actionIcon} 
    />
    <Text style={[styles.actionText, { color }]}>{label}</Text>
  </TouchableOpacity>
);

interface ProfileActionsProps {
  isBusinessOwner: boolean;
  onEditProfile: () => void;
  onAddBusiness?: () => void;
  onLogout: () => void;
}

const ProfileActions: React.FC<ProfileActionsProps> = ({
  isBusinessOwner,
  onEditProfile,
  onAddBusiness,
  onLogout
}) => {
  return (
    <View style={styles.actionsSectionCard}>
      <ActionItem 
        icon="edit-2" 
        label="Edit Profile" 
        onPress={onEditProfile}
      />
      
      {isBusinessOwner && onAddBusiness && (
        <ActionItem 
          icon="plus-circle" 
          label="Add Business" 
          onPress={onAddBusiness}
        />
      )}
      
      <ActionItem 
        icon="log-out" 
        label="Logout" 
        onPress={onLogout}
        color={colors.error}
        backgroundColor="rgba(255,0,0,0.04)"
        isLast={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  actionsSectionCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    marginHorizontal: 18,
    marginBottom: 18,
    padding: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  actionButton: {
    flexDirection: 'row',
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 8,
    marginBottom: 2,
  },
  actionButtonBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  actionIcon: {
    marginRight: 15,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
  }
});

export default ProfileActions;
