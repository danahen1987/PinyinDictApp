import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { RegisterPageStyles } from '../styles/AppStyles';
import MaterialIcon from './MaterialIcon';
import { AuthService } from '../services/AuthService';

const RegisterPage = ({ onRegister, onBackToLogin, databaseHelper }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Create AuthService dynamically to ensure databaseHelper is available
  const getAuthService = () => {
    if (!databaseHelper) {
      throw new Error('Database not available');
    }
    return new AuthService(databaseHelper);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }
    
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter an email');
      return;
    }
    
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    
    if (password.length !== 4) {
      Alert.alert('Error', 'Password must be exactly 4 digits');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const authService = getAuthService();
      const result = await authService.register(username.trim(), password);
      
      if (result.success) {
        Alert.alert('Success', 'Registration successful! You can now login.', [
          { text: 'OK', onPress: () => onBackToLogin() }
        ]);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={RegisterPageStyles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={RegisterPageStyles.header}>
          <Text style={RegisterPageStyles.title}>Create Account</Text>
          <Text style={RegisterPageStyles.subtitle}>Join the Chinese Learning Community</Text>
        </View>

        <View style={RegisterPageStyles.form}>
        <View style={RegisterPageStyles.fieldContainer}>
          <Text style={RegisterPageStyles.fieldLabel}>Username</Text>
          <TextInput
            style={RegisterPageStyles.input}
            placeholder="Enter your username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>
        
        <View style={RegisterPageStyles.fieldContainer}>
          <Text style={RegisterPageStyles.fieldLabel}>Email Address</Text>
          <TextInput
            style={RegisterPageStyles.input}
            placeholder="Enter your email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        <View style={RegisterPageStyles.fieldContainer}>
          <Text style={RegisterPageStyles.fieldLabel}>Password</Text>
          <View style={RegisterPageStyles.passwordContainer}>
            <TextInput
              key={showPassword ? 'visible' : 'hidden'}
              style={RegisterPageStyles.passwordInput}
              placeholder="Enter 4-digit password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              keyboardType="numeric"
              maxLength={4}
            />
            <TouchableOpacity 
              style={RegisterPageStyles.eyeIcon} 
              onPress={() => setShowPassword(!showPassword)}
            >
              <MaterialIcon 
                name={showPassword ? 'visibility' : 'visibility-off'} 
                size={24} 
                color="#7f8c8d" 
              />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={RegisterPageStyles.fieldContainer}>
          <Text style={RegisterPageStyles.fieldLabel}>Confirm Password</Text>
          <View style={RegisterPageStyles.passwordContainer}>
            <TextInput
              key={showConfirmPassword ? 'visible' : 'hidden'}
              style={RegisterPageStyles.passwordInput}
              placeholder="Re-enter your 4-digit password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              keyboardType="numeric"
              maxLength={4}
            />
            <TouchableOpacity 
              style={RegisterPageStyles.eyeIcon} 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <MaterialIcon 
                name={showConfirmPassword ? 'visibility' : 'visibility-off'} 
                size={24} 
                color="#7f8c8d" 
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={[RegisterPageStyles.registerButton, isLoading && RegisterPageStyles.disabledButton]} 
          onPress={handleRegister}
          disabled={isLoading}
        >
          <Text style={RegisterPageStyles.registerButtonText}>
            {isLoading ? 'Creating Account...' : 'Register'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={RegisterPageStyles.backButton} onPress={onBackToLogin}>
          <Text style={RegisterPageStyles.backButtonText}>Back to Login</Text>
        </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default RegisterPage;