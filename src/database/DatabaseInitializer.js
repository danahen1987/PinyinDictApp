import { DatabaseHelper } from './DatabaseHelper';
import { CSVImporter } from './CSVImporter';
import { chineseCharactersData } from '../data/chineseCharactersData';

export class DatabaseInitializer {
  constructor() {
    this.databaseHelper = new DatabaseHelper();
    this.csvImporter = new CSVImporter(this.databaseHelper);
    this.CSV_FILE_NAME = 'ChineseAppDatabase3.csv';
  }

  async initializeDatabase() {
    try {
      // Initialize database
      await this.databaseHelper.initializeDatabase();

            // Check if database already has the correct data (1882 characters from new CSV)
            const existingCount = await this.databaseHelper.getCharacterCount();
            
            if (existingCount === 1882) {
              return true;
            } else if (existingCount > 0) {
              await this.databaseHelper.clearAllData();
            }
            
            // Force rebuild if we have the old count (1060) to ensure we get the new data
            if (existingCount === 1060) {
              await this.databaseHelper.clearAllData();
            }

      // Always use the real embedded data (1882 characters from new CSV)
      await this.createEmbeddedDataFromCSV();
      const finalCount = await this.databaseHelper.getCharacterCount();
      
      if (finalCount > 0) {
        // Add a test user for development/testing
        const testUserId = await this.databaseHelper.addTestUser();
        
        // Ensure dana user is set as admin
        const danaUser = await this.databaseHelper.getUserByUsername('dana');
        if (danaUser) {
          await this.databaseHelper.setUserAsAdmin('dana');
        }
        
        return true;
      } else {
        console.error('Database verification failed - no characters found after import');
        return false;
      }
    } catch (error) {
      console.error('Error during database initialization', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      return false;
    }
  }

  async reinitializeDatabase() {
    try {
      // Clear existing data
      await this.databaseHelper.clearAllData();

      // Re-initialize with real embedded data
      await this.createEmbeddedDataFromCSV();
      const finalCount = await this.databaseHelper.getCharacterCount();

      if (finalCount > 0) {
        return true;
      } else {
        console.error('Failed to re-import any data');
        return false;
      }
    } catch (error) {
      console.error('Error during database re-initialization', error);
      return false;
    }
  }

  async isDatabaseInitialized() {
    try {
      const count = await this.databaseHelper.getCharacterCount();
      return count > 0;
    } catch (error) {
      console.error('Error checking database initialization:', error);
      return false;
    }
  }

  async clearDatabase() {
    try {
      // Delete the entire database file
      await this.databaseHelper.deleteDatabase();
      
      // Create a new database helper instance
      this.databaseHelper = new DatabaseHelper();
      
      // Initialize the new database
      await this.databaseHelper.initializeDatabase();
      
      return true;
    } catch (error) {
      console.error('Error clearing database:', error);
      return false;
    }
  }

  async getDatabaseStats() {
    const characterCount = await this.databaseHelper.getCharacterCount();
    return new DatabaseStats(characterCount);
  }

  async close() {
    await this.databaseHelper.close();
  }

  getDatabaseHelper() {
    return this.databaseHelper;
  }

  async createEmbeddedDataFromCSV() {
    try {
      let importedCount = 0;
      for (const charData of chineseCharactersData) {
        try {
          // Prepare character object for insertion
          const characterObject = {
            character: charData.character,
            pinyin: charData.pinyin,
            englishTranslation: charData.englishTranslation,
            hebrewTranslation: charData.hebrewTranslation,
            sentenceLength: charData.relatedSentence ? charData.relatedSentence.length : 0,
            appearanceFrequency: charData.appearancesInSentences || 0
          };

          // Insert character
          const characterId = await this.databaseHelper.insertCharacter(characterObject);

          // Insert sentence if it exists
          if (charData.relatedSentence && charData.relatedSentence.trim()) {
            const sentenceObject = {
              characterId: characterId,
              sentence: charData.relatedSentence,
              sentencePinyin: charData.sentencePinyin,
              sentenceEnglishTranslation: charData.sentenceEnglishTranslation,
              sentenceHebrewTranslation: charData.sentenceHebrewTranslation
            };
            
            await this.databaseHelper.insertSentence(sentenceObject);
          }

          importedCount++;
        } catch (insertError) {
          console.error(`Error inserting character ${charData.character}:`, insertError);
        }
      }
    } catch (error) {
      console.error('Error creating embedded data from CSV:', error);
      throw error;
    }
  }

}

export class DatabaseStats {
  constructor(characterCount) {
    this.characterCount = characterCount;
  }

  toString() {
    return `DatabaseStats{characterCount=${this.characterCount}}`;
  }
}
