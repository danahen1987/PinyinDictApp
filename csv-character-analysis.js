/**
 * CSV Character Analysis Script
 * Finds characters that appear in sentences but are not in the main characters list
 * Works directly with the CSV data without requiring a database
 */

const fs = require('fs');
const path = require('path');

// Import the embedded data directly
const chineseCharactersData = require('./src/data/chineseCharactersData.js').chineseCharactersData;

class CSVCharacterAnalyzer {
  constructor() {
    this.csvPath = path.join(__dirname, '..', 'ChineseAppDatabase3.csv');
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
   * Parse CSV line handling quoted fields
   */
  parseCSVLine(line) {
    const fields = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    fields.push(current.trim());
    return fields;
  }

  /**
   * Read and parse CSV file
   */
  readCSVFile() {
    try {
      if (!fs.existsSync(this.csvPath)) {
        console.error(`❌ CSV file not found at: ${this.csvPath}`);
        return [];
      }

      const csvContent = fs.readFileSync(this.csvPath, 'utf8');
      const lines = csvContent.split('\n').filter(line => line.trim().length > 0);
      
      // Skip header row
      const dataLines = lines.slice(1);
      
      const csvData = [];
      dataLines.forEach((line, index) => {
        try {
          const fields = this.parseCSVLine(line);
          
          // Expected format: line number,Character,Character pinyin,Character EN translation,Character HE translation,Related Sentence,Sentence Pinyin,Sentence EN Translation,Sentence HE Translation,Appearances in sentences,Group
          if (fields.length >= 6) {
            csvData.push({
              lineNumber: index + 2, // +2 because we skipped header and arrays are 0-indexed
              character: fields[1]?.trim(),
              pinyin: fields[2]?.trim(),
              englishTranslation: fields[3]?.trim(),
              hebrewTranslation: fields[4]?.trim(),
              sentence: fields[5]?.trim(),
              sentencePinyin: fields[6]?.trim(),
              sentenceEnglishTranslation: fields[7]?.trim(),
              sentenceHebrewTranslation: fields[8]?.trim(),
              appearancesInSentences: fields[9]?.trim(),
              group: fields[10]?.trim()
            });
          }
        } catch (error) {
          console.warn(`Warning: Could not parse line ${index + 2}: ${line.substring(0, 50)}...`);
        }
      });
      
      return csvData;
    } catch (error) {
      console.error('Error reading CSV file:', error);
      return [];
    }
  }

  /**
   * Get all characters from CSV data
   */
  getCSVCharacters(csvData) {
    const characterSet = new Set();
    
    csvData.forEach(row => {
      if (row.character) {
        characterSet.add(row.character);
      }
    });
    
    return characterSet;
  }

  /**
   * Get all characters from CSV sentences
   */
  getCSVSentenceCharacters(csvData) {
    const sentenceCharacters = new Set();
    
    csvData.forEach(row => {
      if (row.sentence) {
        const chars = this.extractChineseCharacters(row.sentence);
        chars.forEach(char => sentenceCharacters.add(char));
      }
    });
    
    return sentenceCharacters;
  }

  /**
   * Main analysis function
   */
  analyze() {
    console.log('🔍 Starting CSV character analysis...\n');
    
    try {
      // Read CSV data
      console.log('📊 Reading CSV data...');
      const csvData = this.readCSVFile();
      
      if (csvData.length === 0) {
        console.error('❌ No data found in CSV file');
        return;
      }
      
      console.log(`✅ Loaded ${csvData.length} rows from CSV\n`);
      
      // Get character sets
      console.log('📊 Gathering character data...');
      const mainCharacters = this.getMainCharactersList();
      const csvCharacters = this.getCSVCharacters(csvData);
      const sentenceCharacters = this.getCSVSentenceCharacters(csvData);
      
      console.log(`📝 Main characters list: ${mainCharacters.size} characters`);
      console.log(`📄 CSV characters: ${csvCharacters.size} characters`);
      console.log(`💬 Sentence characters: ${sentenceCharacters.size} characters\n`);
      
      // Find characters in sentences but not in main list
      const missingFromMain = new Set();
      sentenceCharacters.forEach(char => {
        if (!mainCharacters.has(char)) {
          missingFromMain.add(char);
        }
      });
      
      // Find characters in sentences but not in CSV
      const missingFromCSV = new Set();
      sentenceCharacters.forEach(char => {
        if (!csvCharacters.has(char)) {
          missingFromCSV.add(char);
        }
      });
      
      // Find characters in CSV but not in main list
      const inCSVNotMain = new Set();
      csvCharacters.forEach(char => {
        if (!mainCharacters.has(char)) {
          inCSVNotMain.add(char);
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
      
      console.log('\n🟡 Characters in sentences but NOT in CSV:');
      if (missingFromCSV.size === 0) {
        console.log('   ✅ None found - all sentence characters are in CSV!');
      } else {
        console.log(`   📊 Found ${missingFromCSV.size} characters:`);
        const sortedMissing = Array.from(missingFromCSV).sort();
        sortedMissing.forEach((char, index) => {
          console.log(`   ${index + 1}. ${char}`);
        });
      }
      
      console.log('\n🟠 Characters in CSV but NOT in main list:');
      if (inCSVNotMain.size === 0) {
        console.log('   ✅ None found - all CSV characters are in main list!');
      } else {
        console.log(`   📊 Found ${inCSVNotMain.size} characters:`);
        const sortedMissing = Array.from(inCSVNotMain).sort();
        sortedMissing.forEach((char, index) => {
          console.log(`   ${index + 1}. ${char}`);
        });
      }
      
      // Summary
      console.log('\n📈 SUMMARY:');
      console.log(`   • Total unique characters in sentences: ${sentenceCharacters.size}`);
      console.log(`   • Characters missing from main list: ${missingFromMain.size}`);
      console.log(`   • Characters missing from CSV: ${missingFromCSV.size}`);
      console.log(`   • Characters in CSV but not main: ${inCSVNotMain.size}`);
      
      // Export results to file
      this.exportResults({
        missingFromMain: Array.from(missingFromMain).sort(),
        missingFromCSV: Array.from(missingFromCSV).sort(),
        inCSVNotMain: Array.from(inCSVNotMain).sort(),
        totalSentenceCharacters: sentenceCharacters.size,
        totalMainCharacters: mainCharacters.size,
        totalCSVCharacters: csvCharacters.size
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
          totalCSVCharacters: results.totalCSVCharacters,
          missingFromMainCount: results.missingFromMain.length,
          missingFromCSVCount: results.missingFromCSV.length,
          inCSVNotMainCount: results.inCSVNotMain.length
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
const analyzer = new CSVCharacterAnalyzer();
analyzer.analyze();
