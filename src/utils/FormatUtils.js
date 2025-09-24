// Formatting utility functions
export class FormatUtils {
  // Format character data for display
  static formatCharacter(character) {
    if (!character) return null;
    
    return {
      id: character.id,
      character: character.character?.trim(),
      pinyin: character.pinyin?.trim(),
      englishTranslation: character.englishTranslation?.trim(),
      hebrewTranslation: character.hebrewTranslation?.trim(),
      sentenceLength: character.sentenceLength || 0,
      appearanceFrequency: character.appearanceFrequency || 0,
    };
  }

  // Format sentence data for display
  static formatSentence(sentence) {
    if (!sentence) return null;
    
    return {
      id: sentence.id,
      characterId: sentence.characterId,
      sentence: sentence.sentence?.trim(),
      sentencePinyin: sentence.sentencePinyin?.trim(),
      sentenceEnglishTranslation: sentence.sentenceEnglishTranslation?.trim(),
      sentenceHebrewTranslation: sentence.sentenceHebrewTranslation?.trim(),
    };
  }

  // Format user progress data
  static formatUserProgress(progress) {
    if (!progress) return null;
    
    return {
      id: progress.id,
      userId: progress.userId?.trim(),
      characterId: progress.characterId,
      completed: Boolean(progress.completed),
      lastAccessed: progress.lastAccessed,
      timesPracticed: progress.timesPracticed || 0,
    };
  }

  // Format progress summary
  static formatProgressSummary(summary) {
    if (!summary) return { totalCharacters: 0, completedCharacters: 0, totalPractices: 0 };
    
    return {
      totalCharacters: summary.totalCharacters || 0,
      completedCharacters: summary.completedCharacters || 0,
      totalPractices: summary.totalPractices || 0,
      completionPercentage: summary.totalCharacters > 0 
        ? Math.round((summary.completedCharacters / summary.totalCharacters) * 100) 
        : 0,
    };
  }

  // Format character list for navigation
  static formatCharacterList(characters) {
    if (!Array.isArray(characters)) return [];
    
    return characters.map(char => this.formatCharacter(char)).filter(Boolean);
  }

  // Format completed characters list
  static formatCompletedCharacters(completedIds) {
    if (!Array.isArray(completedIds)) return [];
    
    return completedIds.filter(id => typeof id === 'number' && id > 0);
  }

  // Format stroke data
  static formatStrokeData(strokeData) {
    if (!strokeData) return null;
    
    return {
      strokes: Array.isArray(strokeData.strokes) ? strokeData.strokes : [],
      totalStrokes: strokeData.totalStrokes || 0,
    };
  }

  // Format time for display
  static formatTime(timestamp) {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  }

  // Format progress percentage
  static formatProgressPercentage(completed, total) {
    if (!total || total === 0) return '0%';
    
    const percentage = Math.round((completed / total) * 100);
    return `${percentage}%`;
  }

  // Format practice count
  static formatPracticeCount(count) {
    if (!count || count === 0) return 'Not practiced';
    if (count === 1) return 'Practiced once';
    return `Practiced ${count} times`;
  }

  // Format character display name
  static formatCharacterDisplayName(character) {
    if (!character) return '';
    
    return character.character || `Character ${character.id}`;
  }

  // Format sentence display name
  static formatSentenceDisplayName(sentence) {
    if (!sentence) return '';
    
    return sentence.sentence || `Sentence ${sentence.id}`;
  }

  // Sanitize input text
  static sanitizeText(text) {
    if (!text || typeof text !== 'string') return '';
    
    return text.trim().replace(/[<>]/g, '');
  }

  // Format error message
  static formatErrorMessage(error) {
    if (!error) return 'An unknown error occurred';
    
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    if (error.error) return error.error;
    
    return 'An unexpected error occurred';
  }

  // Format success message
  static formatSuccessMessage(message) {
    if (!message || typeof message !== 'string') return 'Operation completed successfully';
    
    return message;
  }
}
