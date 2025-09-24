/**
 * SQLite Character Analysis Script
 * Finds characters that appear in sentences but are not in the main characters list
 * Uses direct SQLite queries without React Native dependencies
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import the embedded data directly
const chineseCharactersData = require('./src/data/chineseCharactersData.js').chineseCharactersData;

class SQLiteCharacterAnalyzer {
  constructor() {
    this.dbPath = path.join(__dirname, 'chinese_learning.db');
  }

  /**
   * Extract all unique Chinese characters from a text string
   */
  extractChineseCharacters(text) {
    if (!text) return [];
    
    // Match Chinese characters (CJK Unified Ideographs)
    const chineseRegex = /[\u4e00-\u9fff]/g;
    const matches = text.match(chineseRegex);
    return matches ? [...new Set(matches)] : [];
  }

  /**
   * Get all characters from the main characters list
   */
  getMainCharactersList() {
    const mainCharacters = new Set();
    
    // From embedded data
    chineseCharactersData.forEach(charData => {
      if (charData.character) {
        mainCharacters.add(charData.character);
      }
    });
    
    return mainCharacters;
  }

  /**
   * Execute SQLite query and return results
   */
  executeSQLiteQuery(query) {
    try {
      // Use sqlite3 command line tool
      const result = execSync(`sqlite3 "${this.dbPath}" "${query}"`, { 
        encoding: 'utf8',
        timeout: 10000 
      });
      return result.trim().split('\n').filter(line => line.length > 0);
    } catch (error) {
      console.error('SQLite query failed:', error.message);
      return [];
    }
  }

  /**
   * Get all characters from database characters table
   */
  getDatabaseCharacters() {
    const query = 'SELECT character FROM characters';
    const results = this.executeSQLiteQuery(query);
    const characterSet = new Set();
    
    results.forEach(row => {
      if (row) {
        characterSet.add(row);
      }
    });
    
    return characterSet;
  }

  /**
   * Get all sentences from database
   */
  getDatabaseSentences() {
    const query = 'SELECT sentence FROM sentences';
    const results = this.executeSQLiteQuery(query);
    return results;
  }

  /**
   * Get all characters from database sentences
   */
  getSentenceCharacters() {
    const sentences = this.getDatabaseSentences();
    const sentenceCharacters = new Set();
    
    sentences.forEach(sentence => {
      if (sentence) {
        const chars = this.extractChineseCharacters(sentence);
        chars.forEach(char => sentenceCharacters.add(char));
      }
    });
    
    return sentenceCharacters;
  }

  /**
   * Check if database file exists
   */
  checkDatabaseExists() {
    return fs.existsSync(this.dbPath);
  }

  /**
   * Main analysis function
   */
  analyze() {
    console.log('🔍 Starting sentence character analysis...\n');
    
    try {
      // Check if database exists
      if (!this.checkDatabaseExists()) {
        console.error(`❌ Database file not found at: ${this.dbPath}`);
        console.log('Please make sure the app has been run at least once to create the database.');
        return;
      }
      
      console.log('✅ Database file found\n');
      
      // Get character sets
      console.log('📊 Gathering character data...');
      const mainCharacters = this.getMainCharactersList();
      const databaseCharacters = this.getDatabaseCharacters();
      const sentenceCharacters = this.getSentenceCharacters();
      
      console.log(`📝 Main characters list: ${mainCharacters.size} characters`);
      console.log(`🗄️  Database characters: ${databaseCharacters.size} characters`);
      console.log(`💬 Sentence characters: ${sentenceCharacters.size} characters\n`);
      
      // Find characters in sentences but not in main list
      const missingFromMain = new Set();
      sentenceCharacters.forEach(char => {
        if (!mainCharacters.has(char)) {
          missingFromMain.add(char);
        }
      });
      
      // Find characters in sentences but not in database
      const missingFromDatabase = new Set();
      sentenceCharacters.forEach(char => {
        if (!databaseCharacters.has(char)) {
          missingFromDatabase.add(char);
        }
      });
      
      // Find characters in database but not in main list
      const inDatabaseNotMain = new Set();
      databaseCharacters.forEach(char => {
        if (!mainCharacters.has(char)) {
          inDatabaseNotMain.add(char);
        }
      });
      
      // Display results
      console.log('📋 ANALYSIS RESULTS:\n');
      
      console.log('🔴 Characters in sentences but NOT in main characters list:');
      if (missingFromMain.size === 0) {
        console.log('   ✅ None found - all sentence characters are in main list!');
      } else {
        console.log(`   📊 Found ${missingFromMain.size} characters:`);
        const sortedMissing = Array.from(missingFromMain).sort();
        sortedMissing.forEach((char, index) => {
          console.log(`   ${index + 1}. ${char}`);
        });
      }
      
      console.log('\n🟡 Characters in sentences but NOT in database:');
      if (missingFromDatabase.size === 0) {
        console.log('   ✅ None found - all sentence characters are in database!');
      } else {
        console.log(`   📊 Found ${missingFromDatabase.size} characters:`);
        const sortedMissing = Array.from(missingFromDatabase).sort();
        sortedMissing.forEach((char, index) => {
          console.log(`   ${index + 1}. ${char}`);
        });
      }
      
      console.log('\n🟠 Characters in database but NOT in main list:');
      if (inDatabaseNotMain.size === 0) {
        console.log('   ✅ None found - all database characters are in main list!');
      } else {
        console.log(`   📊 Found ${inDatabaseNotMain.size} characters:`);
        const sortedMissing = Array.from(inDatabaseNotMain).sort();
        sortedMissing.forEach((char, index) => {
          console.log(`   ${index + 1}. ${char}`);
        });
      }
      
      // Summary
      console.log('\n📈 SUMMARY:');
      console.log(`   • Total unique characters in sentences: ${sentenceCharacters.size}`);
      console.log(`   • Characters missing from main list: ${missingFromMain.size}`);
      console.log(`   • Characters missing from database: ${missingFromDatabase.size}`);
      console.log(`   • Characters in database but not main: ${inDatabaseNotMain.size}`);
      
      // Export results to file
      this.exportResults({
        missingFromMain: Array.from(missingFromMain).sort(),
        missingFromDatabase: Array.from(missingFromDatabase).sort(),
        inDatabaseNotMain: Array.from(inDatabaseNotMain).sort(),
        totalSentenceCharacters: sentenceCharacters.size,
        totalMainCharacters: mainCharacters.size,
        totalDatabaseCharacters: databaseCharacters.size
      });
      
    } catch (error) {
      console.error('❌ Analysis failed:', error);
    }
  }

  /**
   * Export results to a JSON file
   */
  exportResults(results) {
    try {
      const outputPath = path.join(__dirname, 'sentence-character-analysis.json');
      const timestamp = new Date().toISOString();
      
      const exportData = {
        timestamp,
        analysis: results,
        summary: {
          totalSentenceCharacters: results.totalSentenceCharacters,
          totalMainCharacters: results.totalMainCharacters,
          totalDatabaseCharacters: results.totalDatabaseCharacters,
          missingFromMainCount: results.missingFromMain.length,
          missingFromDatabaseCount: results.missingFromDatabase.length,
          inDatabaseNotMainCount: results.inDatabaseNotMain.length
        }
      };
      
      fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
      console.log(`\n💾 Results exported to: ${outputPath}`);
      
    } catch (error) {
      console.error('❌ Failed to export results:', error);
    }
  }
}

// Run the analysis
const analyzer = new SQLiteCharacterAnalyzer();
analyzer.analyze();
