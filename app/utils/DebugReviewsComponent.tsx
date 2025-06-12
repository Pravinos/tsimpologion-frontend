// Debug component to be used with React Navigation if needed
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useProfile } from '../hooks/useProfile';
import { testUserReviewsApi } from './testApiReviews';
import colors from '../styles/colors';

const DebugReviewsComponent = () => {
  const {
    userProfile,
    userReviews,
    isReviewsLoading,
    isReviewsError,
    refetchReviews
  } = useProfile();

  const runReviewsTest = async () => {
    if (!userProfile?.id) {
      console.log('No user profile available for testing');
      return;
    }

    try {
      console.log('Starting reviews API test...');
      await testUserReviewsApi(userProfile.id);
    } catch (error) {
      console.error('Debug test error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reviews Debug Information</Text>
      
      <ScrollView style={styles.infoContainer}>
        <Text style={styles.sectionTitle}>User Profile Info:</Text>
        <Text>User ID: {userProfile?.id || 'Not available'}</Text>
        <Text>Name: {userProfile?.name || 'Not available'}</Text>
        
        <Text style={styles.sectionTitle}>Reviews State:</Text>
        <Text>Loading: {isReviewsLoading ? 'Yes' : 'No'}</Text>
        <Text>Error: {isReviewsError ? 'Yes' : 'No'}</Text>
        <Text>Reviews count: {userReviews?.length || 0}</Text>
        
        {userReviews && userReviews.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>First Review Data:</Text>
            <Text style={styles.codeBlock}>
              {JSON.stringify(userReviews[0], null, 2)}
            </Text>
          </>
        )}
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={runReviewsTest}
        >
          <Text style={styles.buttonText}>Test Reviews API</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => refetchReviews()}
        >
          <Text style={styles.buttonText}>Refetch Reviews</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.primary,
  },
  infoContainer: {
    flex: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: colors.black,
  },
  codeBlock: {
    fontFamily: 'monospace',
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default DebugReviewsComponent;
