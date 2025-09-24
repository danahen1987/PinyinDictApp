/**
 * Generate Pinyin for Missing Characters
 * Creates a list of the 822 missing characters with their pinyin translations
 */

const fs = require('fs');
const path = require('path');

// Import the embedded data to check if any of the missing characters exist there
const chineseCharactersData = require('./src/data/chineseCharactersData.js').chineseCharactersData;

// Read the analysis results
const analysisPath = path.join(__dirname, 'sentence-character-analysis.json');
const analysisData = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));

class PinyinGenerator {
  constructor() {
    this.missingCharacters = analysisData.analysis.missingFromMain;
    this.existingCharacters = new Map();
    
    // Create a map of existing characters for quick lookup
    chineseCharactersData.forEach(charData => {
      if (charData.character && charData.pinyin) {
        this.existingCharacters.set(charData.character, charData.pinyin);
      }
    });
  }

  /**
   * Get pinyin for a character from existing data or generate a placeholder
   */
  getPinyinForCharacter(character) {
    // First check if it exists in our existing data
    if (this.existingCharacters.has(character)) {
      return this.existingCharacters.get(character);
    }
    
    // For missing characters, we'll need to look them up or use a placeholder
    // This is a simplified approach - in reality you'd want to use a proper pinyin library
    return `[PINYIN_FOR_${character}]`;
  }

  /**
   * Generate the complete list with pinyin
   */
  generatePinyinList() {
    console.log('🔍 Generating pinyin for missing characters...\n');
    
    const characterPinyinList = [];
    let foundInExisting = 0;
    let needPinyinLookup = 0;
    
    this.missingCharacters.forEach((character, index) => {
      const pinyin = this.getPinyinForCharacter(character);
      
      if (pinyin.startsWith('[PINYIN_FOR_')) {
        needPinyinLookup++;
      } else {
        foundInExisting++;
      }
      
      characterPinyinList.push({
        index: index + 1,
        character: character,
        pinyin: pinyin,
        needsLookup: pinyin.startsWith('[PINYIN_FOR_')
      });
    });
    
    console.log(`📊 Summary:`);
    console.log(`   • Total missing characters: ${this.missingCharacters.length}`);
    console.log(`   • Found in existing data: ${foundInExisting}`);
    console.log(`   • Need pinyin lookup: ${needPinyinLookup}\n`);
    
    return characterPinyinList;
  }

  /**
   * Export to CSV format for Google Sheets
   */
  exportToCSV(characterPinyinList) {
    const csvPath = path.join(__dirname, 'missing-characters-with-pinyin.csv');
    
    let csvContent = 'Index,Character,Pinyin,Needs_Lookup\n';
    
    characterPinyinList.forEach(item => {
      csvContent += `${item.index},"${item.character}","${item.pinyin}",${item.needsLookup}\n`;
    });
    
    fs.writeFileSync(csvPath, csvContent, 'utf8');
    console.log(`💾 CSV exported to: ${csvPath}`);
  }

  /**
   * Export to JSON format
   */
  exportToJSON(characterPinyinList) {
    const jsonPath = path.join(__dirname, 'missing-characters-with-pinyin.json');
    
    const exportData = {
      timestamp: new Date().toISOString(),
      totalCharacters: characterPinyinList.length,
      foundInExisting: characterPinyinList.filter(item => !item.needsLookup).length,
      needLookup: characterPinyinList.filter(item => item.needsLookup).length,
      characters: characterPinyinList
    };
    
    fs.writeFileSync(jsonPath, JSON.stringify(exportData, null, 2), 'utf8');
    console.log(`💾 JSON exported to: ${jsonPath}`);
  }

  /**
   * Display the list in console
   */
  displayList(characterPinyinList) {
    console.log('📋 MISSING CHARACTERS WITH PINYIN:\n');
    
    characterPinyinList.forEach(item => {
      const status = item.needsLookup ? '❓' : '✅';
      console.log(`${item.index.toString().padStart(3)}. ${item.character} - ${item.pinyin} ${status}`);
    });
  }

  /**
   * Main execution
   */
  run() {
    try {
      const characterPinyinList = this.generatePinyinList();
      
      // Display first 20 characters as preview
      console.log('📋 PREVIEW (First 20 characters):\n');
      characterPinyinList.slice(0, 20).forEach(item => {
        const status = item.needsLookup ? '❓' : '✅';
        console.log(`${item.index.toString().padStart(3)}. ${item.character} - ${item.pinyin} ${status}`);
      });
      
      if (characterPinyinList.length > 20) {
        console.log(`\n... and ${characterPinyinList.length - 20} more characters\n`);
      }
      
      // Export to files
      this.exportToCSV(characterPinyinList);
      this.exportToJSON(characterPinyinList);
      
      console.log('\n✅ Pinyin generation completed!');
      console.log('\n📝 Next steps:');
      console.log('   1. Open the CSV file in Google Sheets');
      console.log('   2. For characters marked as needing lookup, you can:');
      console.log('      - Use online pinyin dictionaries');
      console.log('      - Use Google Translate');
      console.log('      - Use pinyin input methods');
      console.log('   3. Replace the placeholder pinyin with actual pinyin');
      
    } catch (error) {
      console.error('❌ Error generating pinyin:', error);
    }
  }
}

// Run the pinyin generator
const generator = new PinyinGenerator();
generator.run();
