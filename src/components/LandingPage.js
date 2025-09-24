import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import { AuthService } from '../services/AuthService';
import { ValidationUtils } from '../utils/ValidationUtils';
import { ErrorUtils } from '../utils/ErrorUtils';
import { SUCCESS_MESSAGES } from '../constants/AppConstants';
import { CommonStyles, LandingPageStyles } from '../styles/AppStyles';
import RegisterPage from './RegisterPage';
import UserDetailsModal from './UserDetailsModal';
import PieChart from './PieChart';

const LandingPage = ({ onNavigateToCards, onNavigateToQuiz, onLogin, currentUser, onLogout, databaseHelper }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // Create AuthService dynamically to ensure databaseHelper is available
  const getAuthService = () => {
    if (!databaseHelper) {
      throw new Error('Database not available');
    }
    return new AuthService(databaseHelper);
  };
  const [showUsersList, setShowUsersList] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [progressData, setProgressData] = useState({ viewed: 0, total: 0, percentage: 0 });
  const [isAdmin, setIsAdmin] = useState(false);

  // Calculate progress when user changes
  useEffect(() => {
    if (currentUser && databaseHelper) {
      calculateProgress();
    } else {
      setProgressData({ viewed: 0, total: 0, percentage: 0 });
      setIsAdmin(false);
    }
  }, [currentUser, databaseHelper]);

  const handleLogin = async () => {
    try {
      // Validate credentials
      const validation = ValidationUtils.validateLoginCredentials(username, password);
      if (!validation.isValid) {
        Alert.alert('Error', validation.message);
        return;
      }

      // Authenticate user
      const authService = getAuthService();
      const result = await authService.login(username, password);
      
      if (result.success) {
        onLogin(result.user);
        setShowLogin(false);
        setUsername('');
        setPassword('');
        Alert.alert('Success', SUCCESS_MESSAGES.loginSuccess);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      const errorMsg = ErrorUtils.createUserFriendlyMessage(error);
      Alert.alert('Error', errorMsg);
    }
  };

  const handleGuestLogin = async () => {
    try {
      const authService = getAuthService();
      const result = await authService.loginAsGuest();
      
      if (result.success) {
        onLogin(result.user);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      const errorMsg = ErrorUtils.createUserFriendlyMessage(error);
      Alert.alert('Error', errorMsg);
    }
  };

  const handleCardsPractice = () => {
    onNavigateToCards();
  };

  const handleQuizMode = () => {
    onNavigateToQuiz();
  };

  const calculateProgress = async () => {
    if (!databaseHelper || !currentUser || currentUser === 'Guest') {
      setProgressData({ viewed: 0, total: 0, percentage: 0 });
      return;
    }

    try {
      // Get total character count
      const totalCharacters = await databaseHelper.getCharacterCount();
      
      // Get user data
      const user = await databaseHelper.getUserByUsername(currentUser);
      if (!user) {
        setProgressData({ viewed: 0, total: totalCharacters, percentage: 0 });
        setIsAdmin(false);
        return;
      }

      // Check if user is admin
      const userIsAdmin = user.is_admin === 1 || user.is_admin === true;
      setIsAdmin(userIsAdmin);
      
      // Get viewed characters count
      const viewedCharacters = await databaseHelper.getViewedCharacters(user.id);
      const viewedCount = viewedCharacters ? viewedCharacters.length : 0;
      
      // Calculate percentage
      const percentage = totalCharacters > 0 ? Math.round((viewedCount / totalCharacters) * 100) : 0;
      
      setProgressData({
        viewed: viewedCount,
        total: totalCharacters,
        percentage: percentage
      });
    } catch (error) {
      console.error('Error calculating progress:', error);
      setProgressData({ viewed: 0, total: 0, percentage: 0 });
    }
  };

  const handleShowRegistration = () => {
    setShowRegistration(true);
    setShowLogin(false);
  };

  const handleBackToLogin = () => {
    setShowRegistration(false);
    setShowLogin(true);
  };

  const handleViewUsers = async () => {
    if (!databaseHelper) {
      Alert.alert('Error', 'Database not available');
      return;
    }
    
    try {
      const users = await databaseHelper.getAllUsersWithProgress();
      setUsersList(users);
      setShowUsersList(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to load users: ' + error.message);
    }
  };


  const handleCloseUsersList = () => {
    setShowUsersList(false);
    setUsersList([]);
  };

  if (showRegistration) {
    return (
      <RegisterPage
        onBackToLogin={handleBackToLogin}
        onRegister={() => {
          setShowRegistration(false);
          setShowLogin(true);
        }}
        databaseHelper={databaseHelper}
      />
    );
  }

  if (showUsersList) {
    return (
      <View style={CommonStyles.container}>
        <View style={LandingPageStyles.topBar}>
          <View style={LandingPageStyles.topBarSpacer} />
          <TouchableOpacity style={LandingPageStyles.topLoginButton} onPress={handleCloseUsersList}>
            <Text style={LandingPageStyles.topLoginButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
        
        <View style={LandingPageStyles.header}>
          <Text style={LandingPageStyles.appTitle}>Registered Users</Text>
          <Text style={LandingPageStyles.appSubtitle}>User Progress Overview</Text>
        </View>

        <View style={LandingPageStyles.usersListContainer}>
          {usersList.length === 0 ? (
            <Text style={LandingPageStyles.noUsersText}>No registered users found</Text>
          ) : (
            usersList.map((user) => (
              <View key={user.id} style={LandingPageStyles.userCard}>
                <Text style={LandingPageStyles.userName}>{user.username}</Text>
                <Text style={LandingPageStyles.userStats}>
                  Viewed: {user.viewed_characters} / {user.total_characters} characters
                </Text>
                <Text style={LandingPageStyles.userProgress}>
                  Progress: {user.completion_percentage}%
                </Text>
                <Text style={LandingPageStyles.userDate}>
                  Joined: {new Date(user.created_at).toLocaleDateString()}
                </Text>
                {user.last_login && (
                  <Text style={LandingPageStyles.userDate}>
                    Last Login: {new Date(user.last_login).toLocaleDateString()}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>
      </View>
    );
  }

  if (showLogin) {
    return (
      <View style={CommonStyles.container}>
        <View style={LandingPageStyles.loginContainer}>
          <Text style={LandingPageStyles.loginTitle}>Login to Chinese Learning App</Text>
          
          <TextInput
            style={CommonStyles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          
          <TextInput
            style={CommonStyles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <View style={LandingPageStyles.loginButtons}>
            <TouchableOpacity style={LandingPageStyles.loginButton} onPress={handleLogin}>
              <Text style={LandingPageStyles.loginButtonText}>Login</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={LandingPageStyles.registerButton} 
              onPress={handleShowRegistration}
            >
              <Text style={LandingPageStyles.registerButtonText}>Create Account</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={LandingPageStyles.cancelButton} 
              onPress={() => setShowLogin(false)}
            >
              <Text style={LandingPageStyles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={CommonStyles.container}>
      {/* Top Right Login/Logout/Admin Buttons */}
      <View style={LandingPageStyles.topBar}>
        <View style={LandingPageStyles.topBarSpacer} />
        <View style={LandingPageStyles.topButtonContainer}>
          {databaseHelper && isAdmin && (
            <TouchableOpacity style={LandingPageStyles.topAdminButton} onPress={handleViewUsers}>
              <Text style={LandingPageStyles.topAdminButtonText}>View Users</Text>
            </TouchableOpacity>
          )}
          {currentUser ? (
            <>
              <TouchableOpacity style={LandingPageStyles.topLoginButton} onPress={() => setShowUserDetails(true)}>
                <Text style={LandingPageStyles.topLoginButtonText}>Logged In: {currentUser}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={LandingPageStyles.topLogoutButton} onPress={onLogout}>
                <Text style={LandingPageStyles.topLogoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={LandingPageStyles.topLoginButton} onPress={() => setShowLogin(true)}>
              <Text style={LandingPageStyles.topLoginButtonText}>Login</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={LandingPageStyles.featuresContainer}>
        {/* Cards Practice - Primary Feature */}
        <TouchableOpacity style={LandingPageStyles.featureCard} onPress={handleCardsPractice}>
          <View style={LandingPageStyles.featureCardContent}>
            <View style={LandingPageStyles.featureLeft}>
              <View style={LandingPageStyles.featureContent}>
                <Text style={LandingPageStyles.featureTitle}>Cards Practice</Text>
              </View>
            </View>
            {currentUser && currentUser !== 'Guest' && (
              <View style={LandingPageStyles.pieChartContainer}>
                <PieChart percentage={progressData.percentage} size={60} strokeWidth={6} />
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Future Features */}
        <TouchableOpacity style={LandingPageStyles.featureCard} onPress={handleQuizMode}>
          <View style={LandingPageStyles.featureCardContent}>
            <View style={LandingPageStyles.featureLeft}>
              <View style={LandingPageStyles.featureContent}>
                <Text style={LandingPageStyles.featureTitle}>Quiz Mode</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <View style={LandingPageStyles.authContainer}>
        {!currentUser && (
          <>
            <TouchableOpacity style={LandingPageStyles.loginPromptButton} onPress={() => setShowLogin(true)}>
              <Text style={LandingPageStyles.loginPromptText}>Login for Progress Tracking</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={LandingPageStyles.guestButton} onPress={handleGuestLogin}>
              <Text style={LandingPageStyles.guestButtonText}>Continue as Guest</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* User Details Modal */}
      <UserDetailsModal
        visible={showUserDetails}
        onClose={() => setShowUserDetails(false)}
        currentUser={currentUser}
        databaseHelper={databaseHelper}
      />

    </View>
  );
};

export default LandingPage;
