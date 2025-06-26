import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';

import colors from '../styles/colors';
import { useAuth } from '@/services/AuthProvider';
import { useUserProfile } from '@/app/hooks/useUserProfile';
import { getFullImageUrl } from '../utils/getFullImageUrl';
import { CustomStatusBar } from '../components/UI';

// --- Helper Components ---
const LoadingState = () => (
  <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
    <CustomStatusBar backgroundColor={colors.white} barStyle="dark-content" />
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Loading profile...</Text>
    </View>
  </SafeAreaView>
);

const NotLoggedInState = ({ navigation }: { navigation: any }) => (
  <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
    <CustomStatusBar backgroundColor={colors.white} barStyle="dark-content" />
    <View style={styles.notLoggedInContainer}>
      <Text style={styles.notLoggedInText}>
        Please log in to view your profile.
      </Text>
      <TouchableOpacity 
        style={styles.loginButton}
        onPress={() => navigation.navigate('Auth')}
      >
        <Text style={styles.loginButtonText}>Log In</Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

const ErrorState = ({ refetchProfile, handleLogout }: { refetchProfile: () => void; handleLogout: () => void }) => (
  <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
    <CustomStatusBar backgroundColor={colors.white} barStyle="dark-content" />
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>Failed to load profile.</Text>
      <TouchableOpacity style={styles.retryButton} onPress={refetchProfile}>
        <Text style={styles.retryText}>Try Again</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.error, marginTop: 10 }]} onPress={handleLogout}>
        <Text style={styles.retryText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

// --- Main Component ---
const ProfileScreen = ({ navigation }: { navigation: any }) => {
  const { user: authUser, token, logout } = useAuth();
  const queryClient = useQueryClient();
  const { 
    userProfile,
    isProfileLoading,
    isProfileError,
    refetchProfile,
    userReviews,
    areReviewsLoading,
  } = useUserProfile();

  const handleLogout = React.useCallback(() => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'OK', onPress: async () => {
        await logout();
        queryClient.invalidateQueries({ queryKey: ['userProfile', token] });
        queryClient.invalidateQueries({ queryKey: ['userReviews'] });
      }}
    ]);
  }, [logout, queryClient, token]);

  // Memoized derived values
  const displayFullName = React.useMemo(() => {
    if (userProfile?.first_name || userProfile?.last_name) {
      return `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim();
    }
    return 'N/A';
  }, [userProfile]);
  const displayUsername = React.useMemo(() => userProfile?.username || 'N/A', [userProfile]);
  const displayPhone = React.useMemo(() => userProfile?.phone || null, [userProfile]);
  const displayEmail = React.useMemo(() => userProfile?.email || authUser?.email || 'No email', [userProfile, authUser]);
  const displayJoinDate = React.useMemo(() => userProfile?.created_at 
    ? new Date(userProfile.created_at).toLocaleDateString() 
    : 'N/A', [userProfile]);
  const displayReviewsCount = React.useMemo(() => userReviews.length || 0, [userReviews]);
  const displayRole = React.useMemo(() => {
    if (userProfile?.role) {
      if (userProfile.role === 'foodie') return 'Foodie';
      if (userProfile.role === 'spot_owner') return 'Owner';
      if (userProfile.role === 'admin') return 'Administrator';
    }
    return 'Food Explorer';
  }, [userProfile]);

  useEffect(() => {
    // Set status bar style for ProfileScreen
    StatusBar.setBarStyle('light-content');
  }, []);

  if (isProfileLoading) return <LoadingState />;
  if (!token) return <NotLoggedInState navigation={navigation} />;
  if (isProfileError) return <ErrorState refetchProfile={refetchProfile} handleLogout={handleLogout} />;

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <CustomStatusBar backgroundColor={colors.primary} barStyle="light-content" />
      <View style={{flex: 1}}>
        <ScrollView style={styles.container} contentContainerStyle={{flexGrow: 1, paddingBottom: 32}} showsVerticalScrollIndicator={false}>
          <View style={styles.headerShadow}>
            <View style={styles.headerCard}>
              <View style={styles.avatarContainer}>
                {userProfile?.images && Array.isArray(userProfile.images) && userProfile.images.length > 0 ? (
                  <Image 
                    source={{ uri: getFullImageUrl(userProfile.images[0]) }} 
                    style={styles.avatar} 
                  />
                ) : (
                  <Feather name="user" size={40} color={colors.white} />
                )}
              </View>
              <Text style={styles.name}>{displayFullName}</Text>
              <Text style={styles.role}>{displayRole}</Text>
            </View>
          </View>
          <View style={styles.infoSectionCard}>
            <Text style={styles.sectionTitle}>Account Information</Text>
            <View style={styles.infoItem}>
              <Feather name="user" size={20} color={colors.primary} style={styles.infoIcon} />
              <View>
                <Text style={styles.infoLabel}>Username</Text>
                <Text style={styles.infoValue}>{displayUsername}</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <Feather name="user-check" size={20} color={colors.primary} style={styles.infoIcon} />
              <View>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoValue}>{displayFullName}</Text>
              </View>
            </View>
            {displayPhone && (
              <View style={styles.infoItem}>
                <Feather name="phone" size={20} color={colors.primary} style={styles.infoIcon} />
                <View>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{displayPhone}</Text>
                </View>
              </View>
            )}
            <View style={styles.infoItem}>
              <Feather name="mail" size={20} color={colors.primary} style={styles.infoIcon} />
              <View>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{displayEmail}</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <Feather name="calendar" size={20} color={colors.primary} style={styles.infoIcon} />
              <View>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>{displayJoinDate}</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <Feather name="message-square" size={20} color={colors.primary} style={styles.infoIcon} />
              <View>
                <Text style={styles.infoLabel}>Reviews</Text>
                <Text style={styles.infoValue}>
                  {areReviewsLoading ? 'Loading...' : displayReviewsCount}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.actionsSectionCard}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('EditProfile')}
              activeOpacity={0.85}
            >
              <Feather name="edit-2" size={20} color={colors.primary} style={styles.actionIcon} />
              <Text style={styles.actionText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.logoutButton]}
              onPress={handleLogout}
              activeOpacity={0.85}
            >
              <Feather name="log-out" size={20} color={colors.error} style={styles.actionIcon} />
              <Text style={[styles.actionText, styles.logoutText]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <Text style={styles.version}>Tsimpologion v1.0.0</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
  },
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
  },
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
  },
  actionButton: {
    flexDirection: 'row',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 8,
    marginBottom: 2,
  },
  actionIcon: {
    marginRight: 15,
  },
  actionText: {
    fontSize: 16,
    color: colors.black,
    fontWeight: '500',
  },
  logoutButton: {
    borderBottomWidth: 0,
    marginTop: 8,
    backgroundColor: 'rgba(255,0,0,0.04)',
  },
  logoutText: {
    color: colors.error,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    padding: 10,
  },
  version: {
    fontSize: 14,
    color: colors.darkGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.darkGray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notLoggedInText: {
    fontSize: 16,
    color: colors.darkGray,
    textAlign: 'center',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  loginButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ProfileScreen;