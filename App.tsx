import React, { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import Orientation from 'react-native-orientation-locker';
import LoginPage from './src/components/LoginPage';
import RegisterPage from './src/components/RegisterPage';
import LandingPage from './src/components/LandingPage';
import SimpleCharacterCard from './src/components/SimpleCharacterCard';
import QuizModePage from './src/components/QuizModePage';
import { DatabaseInitializer } from './src/database/DatabaseInitializer';

function App() {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'register', 'landing', 'cards', 'quiz'
  const [currentUser, setCurrentUser] = useState(null);
  const [databaseHelper, setDatabaseHelper] = useState(null);
  const [databaseReady, setDatabaseReady] = useState(false);

  // Initialize database and lock screen orientation
  useEffect(() => {
    if (Platform.OS === 'android') {
      Orientation.lockToPortrait();
    }
    
    // Initialize database
    const initializeDatabase = async () => {
      try {
        console.log('=== APP DATABASE INITIALIZATION DEBUG ===');
        const dbInit = new DatabaseInitializer();
        console.log('DatabaseInitializer created');
        const dbReady = await dbInit.initializeDatabase();
        console.log('Database initialization result:', dbReady);
        if (dbReady) {
          const dbHelper = dbInit.getDatabaseHelper();
          console.log('DatabaseHelper obtained:', !!dbHelper);
          setDatabaseHelper(dbHelper);
          setDatabaseReady(true);
          console.log('DatabaseHelper set in state and database marked as ready');
        } else {
          console.error('Database initialization failed - dbReady is false');
        }
      } catch (error) {
        console.error('Database initialization failed:', error);
      }
    };
    
    initializeDatabase();
  }, []);

  const handleLogin = (username) => {
    setCurrentUser(username);
    setCurrentView('landing'); // Go to landing page after login
  };

  const handleNavigateToRegister = () => {
    setCurrentView('register');
  };

  const handleBackToLogin = () => {
    setCurrentView('login');
  };

  const handleRegister = (username, email, password) => {
    // Registration successful, go back to login
    setCurrentView('login');
  };

  const handleNavigateToCards = () => {
    setCurrentView('cards');
  };

  const handleNavigateToQuiz = () => {
    setCurrentView('quiz');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
  };

  return (
    <>
      {currentView === 'login' ? (
        <LoginPage
          onLogin={handleLogin}
          onNavigateToRegister={handleNavigateToRegister}
        />
      ) : currentView === 'register' ? (
        <RegisterPage
          onRegister={handleRegister}
          onBackToLogin={handleBackToLogin}
          databaseHelper={databaseHelper}
        />
      ) : currentView === 'landing' ? (
        <LandingPage
          onNavigateToCards={handleNavigateToCards}
          onNavigateToQuiz={handleNavigateToQuiz}
          onLogin={handleLogin}
          currentUser={currentUser}
          onLogout={handleLogout}
          databaseHelper={databaseHelper}
        />
      ) : currentView === 'cards' && databaseReady ? (
        <SimpleCharacterCard
          currentUser={currentUser}
          onBackToLanding={handleBackToLanding}
          databaseHelper={databaseHelper}
        />
      ) : currentView === 'quiz' && databaseReady ? (
        <QuizModePage
          currentUser={currentUser}
          databaseHelper={databaseHelper}
          onBack={handleBackToLanding}
        />
      ) : (
        <LoginPage
          onLogin={handleLogin}
          onNavigateToRegister={handleNavigateToRegister}
        />
      )}
    </>
  );
}

export default App;