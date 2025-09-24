const fs = require('fs');
const { pinyin } = require('pinyin-pro');

console.log('🔍 Generating pinyin for all sentences...\n');

// Read the character sentences file
const filePath = '/Users/codelovers/PinYinDict/PinYinDictApp/character-sentences.txt';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.trim().split('\n');

// Skip header line
const dataLines = lines.slice(1);

console.log(`📊 Processing ${dataLines.length} sentences...\n`);

const results = [];
let processedCount = 0;
let pinyinGeneratedCount = 0;

for (const line of dataLines) {
  const [character, currentPinyin, sentence] = line.split(',');
  
  // Check if pinyin is a placeholder
  const isPlaceholder = currentPinyin.startsWith('[PINYIN_') && currentPinyin.endsWith(']');
  
  let finalPinyin = currentPinyin;
  
  if (isPlaceholder) {
    // Generate pinyin for the character
    const characterPinyin = pinyin(character, { toneType: 'none' });
    finalPinyin = characterPinyin;
    pinyinGeneratedCount++;
  }
  
  // Generate pinyin for the entire sentence
  const sentencePinyin = pinyin(sentence, { toneType: 'none' });
  
  results.push({
    character,
    pinyin: finalPinyin,
    sentence,
    sentencePinyin
  });
  
  processedCount++;
  
  if (processedCount % 100 === 0) {
    console.log(`📝 Processed ${processedCount}/${dataLines.length} sentences...`);
  }
}

console.log(`\n📊 Summary:`);
console.log(`   • Total sentences processed: ${processedCount}`);
console.log(`   • Pinyin generated for characters: ${pinyinGeneratedCount}`);
console.log(`   • Sentences with existing pinyin: ${processedCount - pinyinGeneratedCount}`);

// Generate CSV output
const csvContent = [
  'Character,Pinyin,Sentence,SentencePinyin',
  ...results.map(r => `${r.character},${r.pinyin},"${r.sentence}","${r.sentencePinyin}"`)
].join('\n');

// Generate text output for easy copy-paste
const textContent = results.map(r => 
  `${r.character},${r.pinyin},"${r.sentence}","${r.sentencePinyin}"`
).join('\n');

// Save files
const csvPath = '/Users/codelovers/PinYinDict/PinYinDictApp/complete-sentences-with-pinyin.csv';
const textPath = '/Users/codelovers/PinYinDict/PinYinDictApp/complete-sentences-with-pinyin.txt';

fs.writeFileSync(csvPath, csvContent);
fs.writeFileSync(textPath, textContent);

console.log(`\n📋 PREVIEW (First 20 sentences with pinyin):\n`);

results.slice(0, 20).forEach((result, index) => {
  const status = result.pinyin !== `[PINYIN_${result.character}]` ? '✅' : '❓';
  console.log(`  ${index + 1}. ${result.character} (${result.pinyin}) - "${result.sentence}"`);
  console.log(`     Pinyin: "${result.sentencePinyin}" ${status}`);
});

console.log(`\n💾 Complete CSV exported to: ${csvPath}`);
console.log(`💾 Complete text file exported to: ${textPath}`);

console.log(`\n🎉 All sentences now have complete pinyin!`);
