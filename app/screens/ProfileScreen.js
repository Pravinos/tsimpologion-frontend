import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity,
  ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { userProfile } from '../data/mockData';
import colors from '../styles/colors';

const ProfileScreen = ({ navigation }) => {
  const handleLogout = () => {
    // This would normally clear authentication, but we're just navigating for now
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Feather name="user" size={40} color={colors.white} />
          </View>
          <Text style={styles.name}>{userProfile.name}</Text>
          <Text style={styles.role}>{userProfile.role}</Text>
        </View>
        
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Πληροφορίες Λογαριασμού</Text>
          
          <View style={styles.infoItem}>
            <Feather name="mail" size={20} color={colors.primary} style={styles.infoIcon} />
            <View>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{userProfile.email}</Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <Feather name="calendar" size={20} color={colors.primary} style={styles.infoIcon} />
            <View>
              <Text style={styles.infoLabel}>Μέλος από</Text>
              <Text style={styles.infoValue}>{userProfile.joinDate}</Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <Feather name="message-square" size={20} color={colors.primary} style={styles.infoIcon} />
            <View>
              <Text style={styles.infoLabel}>Αξιολογήσεις</Text>
              <Text style={styles.infoValue}>{userProfile.reviewsCount}</Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <Feather name="heart" size={20} color={colors.primary} style={styles.infoIcon} />
            <View>
              <Text style={styles.infoLabel}>Αγαπημένη κουζίνα</Text>
              <Text style={styles.infoValue}>{userProfile.favoriteCuisine}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton}>
            <Feather name="edit-2" size={20} color={colors.primary} style={styles.actionIcon} />
            <Text style={styles.actionText}>Επεξεργασία λογαριασμού</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Feather name="settings" size={20} color={colors.primary} style={styles.actionIcon} />
            <Text style={styles.actionText}>Ρυθμίσεις</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Feather name="help-circle" size={20} color={colors.primary} style={styles.actionIcon} />
            <Text style={styles.actionText}>Help & Support</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Feather name="log-out" size={20} color={colors.error} style={styles.actionIcon} />
            <Text style={[styles.actionText, styles.logoutText]}>Αποσύνδεση</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.version}>Tsimpologion v1.0.0</Text>
        </View>
      </ScrollView>
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
    padding: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
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
    padding: 20,
    backgroundColor: colors.white,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoIcon: {
    marginRight: 15,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 16,
    color: colors.black,
  },
  actionsSection: {
    padding: 20,
    backgroundColor: colors.lightGray,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  actionIcon: {
    marginRight: 15,
  },
  actionText: {
    fontSize: 16,
    color: colors.black,
  },
  logoutButton: {
    marginTop: 10,
  },
  logoutText: {
    color: colors.error,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  version: {
    fontSize: 14,
    color: colors.darkGray,
  },
});

export default ProfileScreen;
