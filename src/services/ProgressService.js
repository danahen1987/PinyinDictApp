// Progress tracking service for user learning progress
import { ValidationUtils } from '../utils/ValidationUtils';
import { FormatUtils } from '../utils/FormatUtils';

// Progress tracking service for user learning progress
export class ProgressService {
  constructor(databaseHelper, authService) {
    this.databaseHelper = databaseHelper;
    this.authService = authService;
    this.progressCache = new Map();
  }

  // Update user progress for a character
  async updateProgress(characterId, completed = false) {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate character ID
      const validation = ValidationUtils.validateCharacterId(characterId);
      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      // Update progress in database
      await this.databaseHelper.updateUserProgress(user, characterId, completed);
      
      // Update cache
      const cacheKey = `${user}_${characterId}`;
      this.progressCache.set(cacheKey, {
        characterId,
        completed,
        lastUpdated: Date.now(),
      });

      return {
        success: true,
        message: completed ? 'Character marked as completed' : 'Progress updated',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to update progress',
      };
    }
  }

  // Get user progress for a specific character
  async getCharacterProgress(characterId) {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        return null;
      }

      // Check cache first
      const cacheKey = `${user}_${characterId}`;
      if (this.progressCache.has(cacheKey)) {
        return this.progressCache.get(cacheKey);
      }

      // Get from database
      const progress = await this.databaseHelper.getUserProgress(user, characterId);
      const formattedProgress = FormatUtils.formatUserProgress(progress);
      
      // Cache the result
      if (formattedProgress) {
        this.progressCache.set(cacheKey, formattedProgress);
      }

      return formattedProgress;
    } catch (error) {
      console.error('Error getting character progress:', error);
      return null;
    }
  }

  // Get all completed characters for user
  async getCompletedCharacters() {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        return [];
      }

      const completedIds = await this.databaseHelper.getCompletedCharacters(user);
      return FormatUtils.formatCompletedCharacters(completedIds);
    } catch (error) {
      console.error('Error getting completed characters:', error);
      return [];
    }
  }

  // Get user progress summary
  async getProgressSummary() {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        return FormatUtils.formatProgressSummary(null);
      }

      const summary = await this.databaseHelper.getUserProgressSummary(user);
      return FormatUtils.formatProgressSummary(summary);
    } catch (error) {
      console.error('Error getting progress summary:', error);
      return FormatUtils.formatProgressSummary(null);
    }
  }

  // Check if character is completed
  async isCharacterCompleted(characterId) {
    try {
      const progress = await this.getCharacterProgress(characterId);
      return progress ? progress.completed : false;
    } catch (error) {
      console.error('Error checking character completion:', error);
      return false;
    }
  }

  // Get practice count for character
  async getPracticeCount(characterId) {
    try {
      const progress = await this.getCharacterProgress(characterId);
      return progress ? progress.timesPracticed : 0;
    } catch (error) {
      console.error('Error getting practice count:', error);
      return 0;
    }
  }

  // Mark character as completed
  async markCharacterCompleted(characterId) {
    return await this.updateProgress(characterId, true);
  }

  // Mark character as incomplete
  async markCharacterIncomplete(characterId) {
    return await this.updateProgress(characterId, false);
  }

  // Get next unstudied character
  async getNextUnstudiedCharacter() {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        return null;
      }

      // Get all characters
      const allCharacters = await this.databaseHelper.getAllCharacters();
      const completedCharacters = await this.getCompletedCharacters();
      
      // Find first uncompleted character
      const unstudiedCharacter = allCharacters.find(char => 
        !completedCharacters.includes(char.id)
      );

      return unstudiedCharacter ? FormatUtils.formatCharacter(unstudiedCharacter) : null;
    } catch (error) {
      console.error('Error getting next unstudied character:', error);
      return null;
    }
  }

  // Get learning statistics
  async getLearningStats() {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        return null;
      }

      const summary = await this.getProgressSummary();
      const allCharacters = await this.databaseHelper.getAllCharacters();
      
      return {
        totalCharacters: allCharacters.length,
        completedCharacters: summary.completedCharacters,
        totalPractices: summary.totalPractices,
        completionPercentage: summary.completionPercentage,
        averagePracticesPerCharacter: summary.completedCharacters > 0 
          ? Math.round(summary.totalPractices / summary.completedCharacters) 
          : 0,
        remainingCharacters: allCharacters.length - summary.completedCharacters,
      };
    } catch (error) {
      console.error('Error getting learning stats:', error);
      return null;
    }
  }

  // Get recent activity
  async getRecentActivity(limit = 10) {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        return [];
      }

      // This would require additional database methods for activity tracking
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Error getting recent activity:', error);
      return [];
    }
  }

  // Clear all progress (for testing or reset)
  async clearAllProgress() {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Clear from database
      await this.databaseHelper.clearUserProgress(user);
      
      // Clear cache
      this.progressCache.clear();

      return {
        success: true,
        message: 'All progress cleared',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to clear progress',
      };
    }
  }

  // Export progress data
  async exportProgress() {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const summary = await this.getProgressSummary();
      const completedCharacters = await this.getCompletedCharacters();
      const stats = await this.getLearningStats();

      return {
        user,
        exportDate: new Date().toISOString(),
        summary,
        completedCharacters,
        stats,
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to export progress');
    }
  }

  // Import progress data
  async importProgress(progressData) {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      if (!progressData || !progressData.completedCharacters) {
        throw new Error('Invalid progress data');
      }

      // Import completed characters
      for (const characterId of progressData.completedCharacters) {
        await this.markCharacterCompleted(characterId);
      }

      return {
        success: true,
        message: 'Progress imported successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to import progress',
      };
    }
  }

  // Clear cache
  clearCache() {
    this.progressCache.clear();
  }

  // Get cache size
  getCacheSize() {
    return this.progressCache.size;
  }
}
