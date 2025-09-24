const fs = require('fs');
const path = require('path');

// Read the new CSV file
const csvFilePath = path.join(__dirname, '..', 'ChineseAppDatabase3.csv');
const outputPath = path.join(__dirname, 'src', 'data', 'chineseCharactersData.js');

console.log('Converting new CSV file to JavaScript format...');
console.log('Input file:', csvFilePath);
console.log('Output file:', outputPath);

try {
  // Read the CSV file
  const csvContent = fs.readFileSync(csvFilePath, 'utf8');
  const lines = csvContent.split('\n');
  
  // Skip the header line
  const dataLines = lines.slice(1).filter(line => line.trim() !== '');
  
  console.log(`Found ${dataLines.length} data lines in CSV`);
  
  // Convert CSV lines to JavaScript objects
  const characters = dataLines.map((line, index) => {
    // Split by comma, but handle quoted fields properly
    const fields = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(currentField.trim());
        currentField = '';
      } else {
        currentField += char;
      }
    }
    fields.push(currentField.trim()); // Add the last field
    
    // Map fields to object properties
    const character = {
      lineNumber: parseInt(fields[0]) || index + 1,
      character: fields[1] || '',
      pinyin: fields[2] || '',
      englishTranslation: fields[3] || '',
      hebrewTranslation: fields[4] || '',
      relatedSentence: fields[5] || '',
      sentencePinyin: fields[6] || '',
      sentenceEnglishTranslation: fields[7] || '',
      sentenceHebrewTranslation: fields[8] || '',
      appearancesInSentences: parseInt(fields[9]) || 0,
      group: fields[10] || '',
      sentenceLength: parseInt(fields[11]) || 0
    };
    
    return character;
  });
  
  // Generate the JavaScript file content
  const jsContent = `// Chinese Characters Data - Generated from ChineseAppDatabase3.csv
// Generated on: ${new Date().toISOString()}
// Total characters: ${characters.length}

export const chineseCharactersData = [
${characters.map(char => `  {
    lineNumber: ${char.lineNumber},
    character: "${char.character}",
    pinyin: "${char.pinyin}",
    englishTranslation: "${char.englishTranslation}",
    hebrewTranslation: "${char.hebrewTranslation}",
    relatedSentence: "${char.relatedSentence}",
    sentencePinyin: "${char.sentencePinyin}",
    sentenceEnglishTranslation: "${char.sentenceEnglishTranslation}",
    sentenceHebrewTranslation: "${char.sentenceHebrewTranslation}",
    appearancesInSentences: ${char.appearancesInSentences},
    group: "${char.group}",
    sentenceLength: ${char.sentenceLength}
  }`).join(',\n')}
];

// Export default for compatibility
export default chineseCharactersData;
`;

  // Write the JavaScript file
  fs.writeFileSync(outputPath, jsContent, 'utf8');
  
  console.log('✅ Successfully converted CSV to JavaScript format!');
  console.log(`✅ Generated ${characters.length} characters`);
  console.log(`✅ Output written to: ${outputPath}`);
  
  // Show first few characters as preview
  console.log('\n📋 Preview of first 3 characters:');
  characters.slice(0, 3).forEach((char, index) => {
    console.log(`${index + 1}. ${char.character} (${char.pinyin}) - ${char.englishTranslation}`);
  });
  
} catch (error) {
  console.error('❌ Error converting CSV:', error);
  process.exit(1);
}
