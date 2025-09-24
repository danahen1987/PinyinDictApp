// App Configuration Constants
export const APP_CONFIG = {
  name: 'Chinese Learning App',
  version: '1.0.0',
  databaseName: 'chinese_learning.db',
  csvFileName: 'ChineseAppDatabase3.csv',
  defaultLanguage: 'zh-CN',
  supportedLanguages: ['zh-CN', 'en-US', 'he-IL'],
};

// Authentication Constants
export const AUTH_CONFIG = {
  defaultCredentials: {
    username: 'user',
    password: 'password',
  },
  guestUser: 'Guest',
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
};

// Character Learning Constants
export const LEARNING_CONFIG = {
  maxCharactersPerSession: 50,
  practiceThreshold: 3, // times practiced before marking complete
  strokePracticeEnabled: true,
  audioEnabled: true,
  progressTrackingEnabled: true,
};

// UI Constants
export const UI_CONFIG = {
  animationDuration: 300,
  modalAnimationType: 'slide',
  toastDuration: 3000,
  loadingTimeout: 10000,
  maxRetries: 3,
};

// Feature Flags
export const FEATURES = {
  cardsPractice: true,
  strokePractice: true,
  audioPronunciation: true,
  sentencePopup: true,
  progressTracking: true,
  userAuthentication: true,
  topNavigationRibbon: true,
  vocabularyBuilder: false, // Coming soon
  quizMode: false, // Coming soon
  advancedProgressTracking: false, // Coming soon
};

// Error Messages
export const ERROR_MESSAGES = {
  databaseInit: 'Failed to initialize database',
  ttsInit: 'Text-to-speech initialization failed',
  characterLoad: 'Failed to load character',
  sentenceLoad: 'Failed to load sentence',
  progressUpdate: 'Failed to update progress',
  authentication: 'Invalid username or password',
  networkError: 'Network connection error',
  unknownError: 'An unexpected error occurred',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  characterCompleted: 'Character marked as completed!',
  progressSaved: 'Progress saved successfully',
  loginSuccess: 'Login successful',
  dataImported: 'Data imported successfully',
};

// Validation Rules
export const VALIDATION_RULES = {
  username: {
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/,
  },
  password: {
    minLength: 4,
    maxLength: 4,
  },
  character: {
    maxLength: 10, // For Chinese characters
  },
  sentence: {
    maxLength: 200,
  },
};

// API Endpoints (for future use)
export const API_ENDPOINTS = {
  baseUrl: 'https://api.chineselearning.com',
  auth: '/auth',
  progress: '/progress',
  characters: '/characters',
  sentences: '/sentences',
  audio: '/audio',
};

// Storage Keys
export const STORAGE_KEYS = {
  userSession: 'user_session',
  userProgress: 'user_progress',
  appSettings: 'app_settings',
  lastCharacter: 'last_character',
  completedCharacters: 'completed_characters',
};

// Default Values
export const DEFAULTS = {
  currentCharacterId: 1,
  showDiscovery: false,
  showStrokePractice: false,
  showSentencePopup: false,
  ttsReady: false,
  isLoading: true,
  currentView: 'landing',
  currentUser: null,
};
