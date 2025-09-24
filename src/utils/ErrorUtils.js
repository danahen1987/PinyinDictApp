import { ERROR_MESSAGES } from '../constants/AppConstants';

// Error handling utility functions
export class ErrorUtils {
  // Handle and format errors
  static handleError(error, context = '') {
    console.error(`Error in ${context}:`, error);
    
    return {
      message: this.getErrorMessage(error),
      context,
      timestamp: Date.now(),
      stack: error.stack,
    };
  }

  // Get user-friendly error message
  static getErrorMessage(error) {
    if (!error) {
      return ERROR_MESSAGES.unknownError;
    }

    if (typeof error === 'string') {
      return error;
    }

    if (error.message) {
      return error.message;
    }

    if (error.error) {
      return error.error;
    }

    return ERROR_MESSAGES.unknownError;
  }

  // Create error object
  static createError(message, code = null, details = null) {
    const error = new Error(message);
    if (code) error.code = code;
    if (details) error.details = details;
    return error;
  }

  // Handle database errors
  static handleDatabaseError(error, operation = '') {
    const context = `Database ${operation}`;
    return this.handleError(error, context);
  }

  // Handle TTS errors
  static handleTTSError(error, operation = '') {
    const context = `TTS ${operation}`;
    return this.handleError(error, context);
  }

  // Handle authentication errors
  static handleAuthError(error, operation = '') {
    const context = `Authentication ${operation}`;
    return this.handleError(error, context);
  }

  // Handle validation errors
  static handleValidationError(error, field = '') {
    const context = `Validation ${field}`;
    return this.handleError(error, context);
  }

  // Handle network errors
  static handleNetworkError(error, operation = '') {
    const context = `Network ${operation}`;
    return this.handleError(error, context);
  }

  // Check if error is retryable
  static isRetryableError(error) {
    if (!error) return false;

    const retryableErrors = [
      'NETWORK_ERROR',
      'TIMEOUT',
      'CONNECTION_FAILED',
      'SERVER_ERROR',
    ];

    return retryableErrors.some(type => 
      error.message?.includes(type) || error.code === type
    );
  }

  // Get error severity
  static getErrorSeverity(error) {
    if (!error) return 'low';

    const criticalErrors = [
      'DATABASE_CORRUPTION',
      'AUTHENTICATION_FAILED',
      'PERMISSION_DENIED',
    ];

    const warningErrors = [
      'VALIDATION_ERROR',
      'INPUT_ERROR',
      'USER_ERROR',
    ];

    if (criticalErrors.some(type => 
      error.message?.includes(type) || error.code === type
    )) {
      return 'critical';
    }

    if (warningErrors.some(type => 
      error.message?.includes(type) || error.code === type
    )) {
      return 'warning';
    }

    return 'error';
  }

  // Format error for logging
  static formatErrorForLogging(error, context = '') {
    return {
      message: this.getErrorMessage(error),
      context,
      severity: this.getErrorSeverity(error),
      timestamp: new Date().toISOString(),
      stack: error.stack,
      code: error.code,
      details: error.details,
    };
  }

  // Handle async errors
  static async handleAsyncError(asyncFunction, context = '') {
    try {
      return await asyncFunction();
    } catch (error) {
      return this.handleError(error, context);
    }
  }

  // Retry operation with exponential backoff
  static async retryOperation(operation, maxRetries = 3, delay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries || !this.isRetryableError(error)) {
          throw error;
        }
        
        // Exponential backoff
        const waitTime = delay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    throw lastError;
  }

  // Handle promise rejection
  static handlePromiseRejection(promise, context = '') {
    return promise.catch(error => {
      return this.handleError(error, context);
    });
  }

  // Create error boundary handler
  static createErrorBoundaryHandler(context = '') {
    return (error, errorInfo) => {
      const formattedError = this.formatErrorForLogging(error, context);
      console.error('Error Boundary:', formattedError, errorInfo);
      
      return {
        hasError: true,
        error: formattedError,
        errorInfo,
      };
    };
  }

  // Validate error object
  static isValidError(error) {
    return error && (
      typeof error === 'string' ||
      (typeof error === 'object' && error.message)
    );
  }

  // Normalize error object
  static normalizeError(error) {
    if (!error) {
      return this.createError(ERROR_MESSAGES.unknownError);
    }

    if (typeof error === 'string') {
      return this.createError(error);
    }

    if (typeof error === 'object' && error.message) {
      return error;
    }

    return this.createError(ERROR_MESSAGES.unknownError);
  }

  // Get error code
  static getErrorCode(error) {
    if (!error) return 'UNKNOWN_ERROR';
    
    if (error.code) return error.code;
    
    if (error.message) {
      if (error.message.includes('network')) return 'NETWORK_ERROR';
      if (error.message.includes('timeout')) return 'TIMEOUT_ERROR';
      if (error.message.includes('permission')) return 'PERMISSION_ERROR';
      if (error.message.includes('validation')) return 'VALIDATION_ERROR';
      if (error.message.includes('authentication')) return 'AUTH_ERROR';
      if (error.message.includes('database')) return 'DATABASE_ERROR';
    }
    
    return 'UNKNOWN_ERROR';
  }

  // Create user-friendly error message
  static createUserFriendlyMessage(error) {
    const code = this.getErrorCode(error);
    
    const userMessages = {
      'NETWORK_ERROR': 'Please check your internet connection and try again.',
      'TIMEOUT_ERROR': 'The operation took too long. Please try again.',
      'PERMISSION_ERROR': 'You don\'t have permission to perform this action.',
      'VALIDATION_ERROR': 'Please check your input and try again.',
      'AUTH_ERROR': 'Please log in again to continue.',
      'DATABASE_ERROR': 'There was a problem with the data. Please try again.',
      'UNKNOWN_ERROR': 'Something went wrong. Please try again.',
    };
    
    return userMessages[code] || userMessages.UNKNOWN_ERROR;
  }
}
