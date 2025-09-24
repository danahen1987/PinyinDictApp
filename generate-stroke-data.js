const cnchar = require('cnchar');
const fs = require('fs');
const path = require('path');

// Function to generate stroke data using cnchar
function generateStrokeData(character) {
  try {
    // Get stroke count using cnchar
    const strokeCount = cnchar.stroke(character);
    
    if (!strokeCount || strokeCount === 0) {
      console.log(`No stroke data found for: ${character}`);
      return null;
    }
    
    // Generate basic stroke paths (simplified representation)
    const strokes = [];
    
    // Create basic stroke representations
    for (let i = 0; i < strokeCount; i++) {
      strokes.push({
        strokeNumber: i + 1,
        path: generateBasicStrokePath(character, i, strokeCount),
        direction: getStrokeDirection(character, i),
        type: getStrokeType(character, i)
      });
    }
    
    return {
      strokeCount: strokeCount,
      strokes: strokes,
      character: character,
      unicode: character.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0'),
      strokeOrder: strokeCount // This is just the count, not the actual order
    };
  } catch (error) {
    console.error(`Error generating stroke data for ${character}:`, error.message);
    return null;
  }
}

// Generate basic stroke path (simplified)
function generateBasicStrokePath(character, strokeIndex, totalStrokes) {
  // This is a simplified approach - in a real implementation, 
  // you'd want to use actual stroke path data
  const width = 200;
  const height = 200;
  const margin = 20;
  
  // Basic stroke patterns based on common stroke types
  const patterns = [
    // Horizontal stroke
    `M ${margin} ${height/2} L ${width-margin} ${height/2}`,
    // Vertical stroke  
    `M ${width/2} ${margin} L ${width/2} ${height-margin}`,
    // Diagonal stroke
    `M ${margin} ${margin} L ${width-margin} ${height-margin}`,
    // Curved stroke
    `M ${margin} ${height/2} Q ${width/2} ${margin} ${width-margin} ${height/2}`,
    // Dot stroke
    `M ${width/2} ${height/2} L ${width/2+5} ${height/2+5}`
  ];
  
  return patterns[strokeIndex % patterns.length];
}

// Get stroke direction (simplified)
function getStrokeDirection(character, strokeIndex) {
  const directions = ['horizontal', 'vertical', 'diagonal', 'curved', 'dot'];
  return directions[strokeIndex % directions.length];
}

// Get stroke type (simplified)
function getStrokeType(character, strokeIndex) {
  const types = ['heng', 'shu', 'pie', 'na', 'dian'];
  return types[strokeIndex % types.length];
}

// Function to generate stroke data for all characters
async function generateAllStrokeData() {
  console.log('🚀 Starting stroke data generation using cnchar...');
  
  // Read our character data
  const characterDataPath = path.join(__dirname, 'src', 'data', 'chineseCharactersData.js');
  
  if (!fs.existsSync(characterDataPath)) {
    console.error('❌ Character data file not found:', characterDataPath);
    return;
  }
  
  const characterData = require(characterDataPath);
  const characters = characterData.chineseCharactersData || [];
  
  console.log(`📊 Found ${characters.length} characters to process`);
  
  const strokeDataMap = {};
  let successCount = 0;
  let errorCount = 0;
  
  // Process characters
  for (const char of characters) {
    const character = char.character;
    console.log(`Processing: ${character}`);
    
    const strokeData = generateStrokeData(character);
    if (strokeData) {
      strokeDataMap[character] = strokeData;
      successCount++;
      console.log(`✅ Generated stroke data for: ${character} (${strokeData.strokeCount} strokes)`);
    } else {
      errorCount++;
      console.log(`❌ Failed to generate stroke data for: ${character}`);
    }
  }
  
  console.log(`\n📈 Results:`);
  console.log(`✅ Successfully generated: ${successCount} characters`);
  console.log(`❌ Failed to generate: ${errorCount} characters`);
  console.log(`📊 Total processed: ${characters.length} characters`);
  
  // Save the stroke data
  const outputPath = path.join(__dirname, 'src', 'data', 'strokeData.js');
  const outputContent = `// Auto-generated stroke data for Chinese characters using cnchar
// Generated on: ${new Date().toISOString()}
// Total characters with stroke data: ${successCount}

export const strokeData = ${JSON.stringify(strokeDataMap, null, 2)};

// Helper functions
export const getStrokeData = (character) => {
  return strokeData[character] || null;
};

export const hasStrokeData = (character) => {
  return character in strokeData;
};

export const getAvailableCharacters = () => {
  return Object.keys(strokeData);
};

export default strokeData;
`;
  
  fs.writeFileSync(outputPath, outputContent);
  console.log(`💾 Stroke data saved to: ${outputPath}`);
  
  // Create a summary report
  const summaryPath = path.join(__dirname, 'stroke-data-summary.json');
  const summary = {
    generatedAt: new Date().toISOString(),
    method: 'cnchar',
    totalCharacters: characters.length,
    successCount,
    errorCount,
    successRate: `${((successCount / characters.length) * 100).toFixed(2)}%`,
    charactersWithStrokeData: Object.keys(strokeDataMap),
    charactersWithoutStrokeData: characters
      .filter(char => !strokeDataMap[char.character])
      .map(char => char.character)
  };
  
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`📋 Summary report saved to: ${summaryPath}`);
  
  return strokeDataMap;
}

// Test with a few characters first
function testStrokeGeneration() {
  console.log('🧪 Testing stroke generation with sample characters...');
  
  const testCharacters = ['一', '二', '三', '中', '人', '大', '小', '好'];
  
  for (const char of testCharacters) {
    const strokeData = generateStrokeData(char);
    if (strokeData) {
      console.log(`✅ ${char}: ${strokeData.strokeCount} strokes`);
    } else {
      console.log(`❌ ${char}: No stroke data`);
    }
  }
}

// Run the script
if (require.main === module) {
  // First test with sample characters
  testStrokeGeneration();
  
  console.log('\n' + '='.repeat(50));
  
  // Then generate for all characters
  generateAllStrokeData()
    .then(() => {
      console.log('\n🎉 Stroke data generation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = {
  generateStrokeData,
  generateAllStrokeData,
  testStrokeGeneration
};
