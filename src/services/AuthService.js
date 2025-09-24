import { AUTH_CONFIG } from '../constants/AppConstants';
import { ValidationUtils } from '../utils/ValidationUtils';

// Authentication service for user management
export class AuthService {
  constructor(databaseHelper = null) {
    this.currentUser = null;
    this.currentUserId = null;
    this.sessionStartTime = null;
    this.databaseHelper = databaseHelper;
  }

  // Register new user
  async register(username, password) {
    try {
      // Validate credentials
      const validation = ValidationUtils.validateLoginCredentials(username, password);
      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      if (!this.databaseHelper) {
        throw new Error('Database not available');
      }

      // Check if user already exists
      const existingUser = await this.databaseHelper.getUserByUsername(username);
      if (existingUser) {
        throw new Error('Username already exists');
      }

      // Create new user
      const userId = await this.databaseHelper.createUser(username, password);
      
      return {
        success: true,
        userId: userId,
        message: 'Registration successful',
      };
    } catch (error) {
      console.error('AuthService register error:', error);
      return {
        success: false,
        userId: null,
        message: error.message || 'Registration failed',
      };
    }
  }

  // Login user with credentials
  async login(username, password) {
    try {
      // Validate credentials
      const validation = ValidationUtils.validateLoginCredentials(username, password);
      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      if (!this.databaseHelper) {
        // Fallback to default credentials for development
        if (username === AUTH_CONFIG.defaultCredentials.username && 
            password === AUTH_CONFIG.defaultCredentials.password) {
          
          this.currentUser = username;
          this.currentUserId = 0; // Default user ID
          this.sessionStartTime = Date.now();
          
          return {
            success: true,
            user: username,
            userId: 0,
            message: 'Login successful',
          };
        } else {
          throw new Error('Invalid username or password');
        }
      }

      // Check credentials against database
      const user = await this.databaseHelper.getUserByUsername(username);
      if (user && user.password === password) {
        this.currentUser = username;
        this.currentUserId = user.id;
        this.sessionStartTime = Date.now();
        
        // Update last login
        await this.databaseHelper.updateUserLastLogin(user.id);
        
        return {
          success: true,
          user: username,
          userId: user.id,
          message: 'Login successful',
        };
      } else {
        throw new Error('Invalid username or password');
      }
    } catch (error) {
      return {
        success: false,
        user: null,
        userId: null,
        message: error.message || 'Login failed',
      };
    }
  }

  // Login as guest
  async loginAsGuest() {
    try {
      this.currentUser = AUTH_CONFIG.guestUser;
      this.sessionStartTime = Date.now();
      
      await this.storeSession(AUTH_CONFIG.guestUser);
      
      return {
        success: true,
        user: AUTH_CONFIG.guestUser,
        message: 'Logged in as guest',
      };
    } catch (error) {
      return {
        success: false,
        user: null,
        message: error.message || 'Guest login failed',
      };
    }
  }

  // Logout user
  async logout() {
    try {
      this.currentUser = null;
      this.sessionStartTime = null;
      
      await this.clearSession();
      
      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Logout failed',
      };
    }
  }

  // Check if user is logged in
  isLoggedIn() {
    return this.currentUser !== null;
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Get current user ID
  getCurrentUserId() {
    return this.currentUserId;
  }

  // Check if session is valid
  isSessionValid() {
    if (!this.currentUser || !this.sessionStartTime) {
      return false;
    }

    const sessionDuration = Date.now() - this.sessionStartTime;
    return sessionDuration < AUTH_CONFIG.sessionTimeout;
  }

  // Check if user is guest
  isGuest() {
    return this.currentUser === AUTH_CONFIG.guestUser;
  }

  // Check if user is authenticated (not guest)
  isAuthenticated() {
    return this.isLoggedIn() && !this.isGuest();
  }

  // Store session data
  async storeSession(username) {
    try {
      const sessionData = {
        username,
        loginTime: Date.now(),
        isGuest: username === AUTH_CONFIG.guestUser,
      };
      
      // In a real app, this would use secure storage
      // For now, we'll just store in memory
      this.sessionData = sessionData;
      
      return true;
    } catch (error) {
      console.error('Error storing session:', error);
      return false;
    }
  }

  // Clear session data
  async clearSession() {
    try {
      this.sessionData = null;
      return true;
    } catch (error) {
      console.error('Error clearing session:', error);
      return false;
    }
  }

  // Restore session from storage
  async restoreSession() {
    // In a real app, this would restore from secure storage
    // For now, we'll return false to force fresh login
    return false;
  }

  // Get session info
  getSessionInfo() {
    if (!this.sessionData) {
      return null;
    }

    return {
      username: this.sessionData.username,
      loginTime: this.sessionData.loginTime,
      isGuest: this.sessionData.isGuest,
      sessionDuration: Date.now() - this.sessionData.loginTime,
    };
  }

  // Validate user permissions
  hasPermission(permission) {
    if (!this.isLoggedIn()) {
      return false;
    }

    // Guest users have limited permissions
    if (this.isGuest()) {
      const guestPermissions = ['view_characters', 'practice_characters'];
      return guestPermissions.includes(permission);
    }

    // Authenticated users have all permissions
    const authenticatedPermissions = [
      'view_characters',
      'practice_characters',
      'save_progress',
      'view_progress',
      'manage_account',
    ];
    
    return authenticatedPermissions.includes(permission);
  }

  // Get user display name
  getUserDisplayName() {
    if (!this.currentUser) {
      return 'Unknown User';
    }

    if (this.isGuest()) {
      return 'Guest User';
    }

    return this.currentUser;
  }

  // Check if user can save progress
  canSaveProgress() {
    return this.hasPermission('save_progress');
  }

  // Check if user can view progress
  canViewProgress() {
    return this.hasPermission('view_progress');
  }
}
