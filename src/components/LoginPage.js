import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { LoginPageStyles } from '../styles/AppStyles';
import MaterialIcon from './MaterialIcon';

const LoginPage = ({ onLogin, onNavigateToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }
    onLogin(username.trim());
  };

  return (
    <View style={LoginPageStyles.container}>
      <View style={LoginPageStyles.card}>
        <Text style={LoginPageStyles.title}>Chinese Learning App</Text>
        <Text style={LoginPageStyles.subtitle}>Welcome Back!</Text>
        
        
        <TextInput
          style={LoginPageStyles.input}
          placeholder="Enter your username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        
        <View style={LoginPageStyles.passwordContainer}>
          <TextInput
            key={showPassword ? 'visible' : 'hidden'}
            style={LoginPageStyles.passwordInput}
            placeholder="Enter your 4-digit password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            keyboardType="numeric"
            maxLength={4}
          />
          <TouchableOpacity 
            style={LoginPageStyles.eyeIcon} 
            onPress={() => setShowPassword(!showPassword)}
          >
            <MaterialIcon 
              name={showPassword ? 'visibility' : 'visibility-off'} 
              size={24} 
              color="#7f8c8d" 
            />
          </TouchableOpacity>
        </View>
        

        <TouchableOpacity style={LoginPageStyles.loginButton} onPress={handleLogin}>
          <Text style={LoginPageStyles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={LoginPageStyles.registerButton} onPress={onNavigateToRegister}>
          <Text style={LoginPageStyles.registerButtonText}>New User? Register Here</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginPage;