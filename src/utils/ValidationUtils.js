import { VALIDATION_RULES } from '../constants/AppConstants';

// Validation utility functions
export class ValidationUtils {
  // Username validation
  static validateUsername(username) {
    if (!username || typeof username !== 'string') {
      return { isValid: false, message: 'Username is required' };
    }

    if (username.length < VALIDATION_RULES.username.minLength) {
      return { 
        isValid: false, 
        message: `Username must be at least ${VALIDATION_RULES.username.minLength} characters long` 
      };
    }

    if (username.length > VALIDATION_RULES.username.maxLength) {
      return { 
        isValid: false, 
        message: `Username must be no more than ${VALIDATION_RULES.username.maxLength} characters long` 
      };
    }

    if (!VALIDATION_RULES.username.pattern.test(username)) {
      return { 
        isValid: false, 
        message: 'Username can only contain letters, numbers, and underscores' 
      };
    }

    return { isValid: true, message: 'Username is valid' };
  }

  // Password validation
  static validatePassword(password) {
    if (!password || typeof password !== 'string') {
      return { isValid: false, message: 'Password is required' };
    }

    if (password.length !== 4) {
      return { 
        isValid: false, 
        message: 'Password must be exactly 4 digits' 
      };
    }

    // Check if password contains only digits
    if (!/^\d{4}$/.test(password)) {
      return { 
        isValid: false, 
        message: 'Password must contain only digits' 
      };
    }

    return { isValid: true, message: 'Password is valid' };
  }

  // Character validation
  static validateCharacter(character) {
    if (!character || typeof character !== 'string') {
      return { isValid: false, message: 'Character is required' };
    }

    if (character.length > VALIDATION_RULES.character.maxLength) {
      return { 
        isValid: false, 
        message: `Character must be no more than ${VALIDATION_RULES.character.maxLength} characters long` 
      };
    }

    return { isValid: true, message: 'Character is valid' };
  }

  // Sentence validation
  static validateSentence(sentence) {
    if (!sentence || typeof sentence !== 'string') {
      return { isValid: false, message: 'Sentence is required' };
    }

    if (sentence.length > VALIDATION_RULES.sentence.maxLength) {
      return { 
        isValid: false, 
        message: `Sentence must be no more than ${VALIDATION_RULES.sentence.maxLength} characters long` 
      };
    }

    return { isValid: true, message: 'Sentence is valid' };
  }

  // Login credentials validation
  static validateLoginCredentials(username, password) {
    const usernameValidation = this.validateUsername(username);
    if (!usernameValidation.isValid) {
      return usernameValidation;
    }

    const passwordValidation = this.validatePassword(password);
    if (!passwordValidation.isValid) {
      return passwordValidation;
    }

    return { isValid: true, message: 'Credentials are valid' };
  }

  // Character ID validation
  static validateCharacterId(characterId) {
    if (!characterId || typeof characterId !== 'number') {
      return { isValid: false, message: 'Character ID must be a number' };
    }

    if (characterId < 1) {
      return { isValid: false, message: 'Character ID must be greater than 0' };
    }

    return { isValid: true, message: 'Character ID is valid' };
  }

  // User ID validation
  static validateUserId(userId) {
    if (!userId || typeof userId !== 'string') {
      return { isValid: false, message: 'User ID is required' };
    }

    if (userId.trim().length === 0) {
      return { isValid: false, message: 'User ID cannot be empty' };
    }

    return { isValid: true, message: 'User ID is valid' };
  }
}
