import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import colors from '../styles/colors';
import { useAuth } from '../../services/AuthProvider';
import { getCurrentUser, getUserReviews } from '../../services/ApiClient';
import { User, Review } from '../../types/models';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getFullImageUrl } from '../utils/getFullImageUrl';

const API_BASE_URL = 'http://192.168.1.162:8000';

const ProfileScreen = ({ navigation }: { navigation: any }) => {
  const { user: authUser, token, logout } = useAuth();
  const queryClient = useQueryClient();

  // React Query for user profile
  const {
    data: userProfile,
    isLoading: loading,
    isError: isProfileError,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['userProfile', token],
    queryFn: async () => {
      try {
        const response = await getCurrentUser();
        return response.data?.data || response.data;
      } catch (err) {
        const error = err as any;
        console.error('Profile query error:', error.response ? error.response.data : error);
        throw err;
      }
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
    retry: false, // Do not retry on error for debugging
  });

  // React Query for user reviews
  const {
    data: userReviews = [],
    isLoading: reviewsLoading,
    isError: isReviewsError,
    refetch: refetchReviews,
  } = useQuery({
    queryKey: ['userReviews', userProfile?.id],
    queryFn: async () => {
      if (!userProfile?.id) return [];
      const response = await getUserReviews(userProfile.id);
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        return [];
      }
    },
    enabled: !!userProfile?.id,
    staleTime: 1000 * 60 * 2,
  });

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'OK', onPress: async () => {
        await logout();
        await queryClient.invalidateQueries({ queryKey: ['userProfile', token] });
        await queryClient.invalidateQueries({ queryKey: ['userReviews'] });
      }}
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!token) {
    return (
      <SafeAreaView style={styles.safeArea}>
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
  }

  if (isProfileError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load profile.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetchProfile()}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.error, marginTop: 10 }]} onPress={handleLogout}>
            <Text style={styles.retryText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const displayName = userProfile?.name || authUser?.name || 'User';
  const displayEmail = userProfile?.email || authUser?.email || 'No email';
  const displayJoinDate = userProfile?.created_at 
    ? new Date(userProfile.created_at).toLocaleDateString() 
    : 'N/A';
  const displayReviewsCount = userReviews.length || 0;
  const displayRole = userProfile?.role 
    ? userProfile.role === 'foodie' 
      ? 'Food Explorer' 
      : userProfile.role === 'spot_owner' 
        ? 'Business Owner' 
        : 'Administrator'
    : 'Food Explorer';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{flex: 1}}>
        <ScrollView style={styles.container} contentContainerStyle={{flexGrow: 1}}>
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              {userProfile?.images && userProfile.images.length > 0 ? (
                <Image 
                  source={{ uri: getFullImageUrl(userProfile.images[0]) }} 
                  style={styles.avatar} 
                />
              ) : (
                <Feather name="user" size={40} color={colors.white} />
              )}
            </View>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.role}>{displayRole}</Text>
          </View>
          
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Account Information</Text>

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
                  {reviewsLoading ? 'Loading...' : displayReviewsCount}
                </Text>
              </View>
            </View>
            
            {userProfile?.role === 'spot_owner' && (
              <View style={styles.infoItem}>
                <Feather name="home" size={20} color={colors.primary} style={styles.infoIcon} />
                <View>
                  <Text style={styles.infoLabel}>Businesses</Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('MySpots')}
                  >
                    <Text style={[styles.infoValue, styles.linkText]}>
                      View my businesses
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
          
          <View style={styles.actionsSection}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Feather name="edit-2" size={20} color={colors.primary} style={styles.actionIcon} />
              <Text style={styles.actionText}>Edit Profile</Text>
            </TouchableOpacity>

            {userProfile?.role === 'spot_owner' && (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('AddFoodSpot')}
              >
                <Feather name="plus-circle" size={20} color={colors.primary} style={styles.actionIcon} />
                <Text style={styles.actionText}>Add Business</Text>
              </TouchableOpacity>
            )}

            {/* <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <Feather name="settings" size={20} color={colors.primary} style={styles.actionIcon} />
              <Text style={styles.actionText}>Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Help')}
            >
              <Feather name="help-circle" size={20} color={colors.primary} style={styles.actionIcon} />
              <Text style={styles.actionText}>Help & Support</Text>
            </TouchableOpacity> */}

            <TouchableOpacity
              style={[styles.actionButton, styles.logoutButton]}
              onPress={handleLogout}
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
  header: {
    backgroundColor: colors.primary,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 5,
  },
  role: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.8,
  },
  infoSection: {
    backgroundColor: colors.white,
    padding: 20,
    marginBottom: 10,
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
  actionsSection: {
    backgroundColor: colors.white,
    padding: 20,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    alignItems: 'center',
  },
  actionIcon: {
    marginRight: 15,
  },
  actionText: {
    fontSize: 16,
    color: colors.black,
  },
  logoutButton: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: colors.error,
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