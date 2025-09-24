import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { UserDetailsModalStyles } from '../styles/AppStyles';

const UserDetailsModal = ({ 
  visible, 
  onClose, 
  currentUser, 
  databaseHelper 
}) => {
  const [userData, setUserData] = useState(null);
  const [viewedCount, setViewedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (visible && currentUser && databaseHelper) {
      loadUserData();
    }
  }, [visible, currentUser, databaseHelper]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Get user data
      const user = await databaseHelper.getUserByUsername(currentUser);
      
      if (user) {
        setUserData(user);
        // Get the actual viewed characters count from database
        const viewedCharacters = await databaseHelper.getViewedCharacters(user.id);
        const actualViewedCount = viewedCharacters ? viewedCharacters.length : 0;
        setViewedCount(actualViewedCount);
      }
    } catch (error) {
      console.error('UserDetailsModal: Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleResetProgress = () => {
    Alert.alert(
      'Reset Progress',
      'Are you sure you want to reset your progress? This will clear all viewed characters and cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: confirmResetProgress,
        },
      ]
    );
  };

  const confirmResetProgress = async () => {
    try {
      setResetting(true);
      
      const success = await databaseHelper.clearUserProgress(userData.id);
      
      if (success) {
        setViewedCount(0);
        Alert.alert('Success', 'Your progress has been reset successfully!');
      } else {
        Alert.alert('Error', 'Failed to reset progress. Please try again.');
      }
    } catch (error) {
      console.error('UserDetailsModal: Error resetting progress:', error);
      Alert.alert('Error', 'Failed to reset progress. Please try again.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={UserDetailsModalStyles.overlay}>
        <View style={UserDetailsModalStyles.modalContainer}>
          <View style={UserDetailsModalStyles.header}>
            <Text style={UserDetailsModalStyles.title}>User Details</Text>
            <TouchableOpacity
              style={UserDetailsModalStyles.closeButton}
              onPress={onClose}
            >
              <Text style={UserDetailsModalStyles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={UserDetailsModalStyles.content}>
            {loading ? (
              <View style={UserDetailsModalStyles.loadingContainer}>
                <ActivityIndicator size="large" color="#3498db" />
                <Text style={UserDetailsModalStyles.loadingText}>Loading user data...</Text>
              </View>
            ) : userData ? (
              <>
                <View style={UserDetailsModalStyles.userInfoSection}>
                  <Text style={UserDetailsModalStyles.sectionTitle}>Account Information</Text>
                  
                  <View style={UserDetailsModalStyles.infoRow}>
                    <Text style={UserDetailsModalStyles.infoLabel}>Username:</Text>
                    <Text style={UserDetailsModalStyles.infoValue}>{userData.username}</Text>
                  </View>
                  
                  <View style={UserDetailsModalStyles.infoRow}>
                    <Text style={UserDetailsModalStyles.infoLabel}>Member Since:</Text>
                    <Text style={UserDetailsModalStyles.infoValue}>
                      {new Date(userData.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  <View style={UserDetailsModalStyles.infoRow}>
                    <Text style={UserDetailsModalStyles.infoLabel}>Last Login:</Text>
                    <Text style={UserDetailsModalStyles.infoValue}>
                      {new Date(userData.last_login).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                <View style={UserDetailsModalStyles.progressSection}>
                  <Text style={UserDetailsModalStyles.sectionTitle}>Learning Progress</Text>
                  
                  <View style={UserDetailsModalStyles.infoRow}>
                    <Text style={UserDetailsModalStyles.infoLabel}>Characters Viewed:</Text>
                    <Text style={UserDetailsModalStyles.infoValue}>{viewedCount}</Text>
                  </View>
                </View>

                <View style={UserDetailsModalStyles.actionsSection}>
                  <TouchableOpacity
                    style={[
                      UserDetailsModalStyles.resetButton,
                      resetting && UserDetailsModalStyles.resetButtonDisabled
                    ]}
                    onPress={handleResetProgress}
                    disabled={resetting}
                  >
                    {resetting ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text style={UserDetailsModalStyles.resetButtonText}>
                        Reset Progress
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={UserDetailsModalStyles.errorContainer}>
                <Text style={UserDetailsModalStyles.errorText}>
                  Failed to load user data
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default UserDetailsModal;
