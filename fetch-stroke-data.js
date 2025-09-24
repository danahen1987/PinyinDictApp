const fs = require('fs');
const path = require('path');

// Node.js 18+ has built-in fetch, no need to install node-fetch

// Chinese Character Web API endpoint
const STROKE_API_BASE = 'http://ccdb.hemiola.com/strokes/';

// Function to fetch stroke data for a single character
async function fetchStrokeData(character) {
  try {
    console.log(`Fetching stroke data for: ${character}`);
    
    const response = await fetch(`${STROKE_API_BASE}${encodeURIComponent(character)}`);
    
    if (!response.ok) {
      console.log(`No stroke data found for: ${character}`);
      return null;
    }
    
    const data = await response.json();
    console.log(`✅ Found stroke data for: ${character}`);
    return data;
  } catch (error) {
    console.error(`❌ Error fetching stroke data for ${character}:`, error.message);
    return null;
  }
}

// Function to process stroke data into our format
function processStrokeData(rawData) {
  if (!rawData || !rawData.strokes) {
    return null;
  }
  
  return {
    strokeCount: rawData.strokes.length,
    strokes: rawData.strokes.map((stroke, index) => ({
      strokeNumber: index + 1,
      path: stroke.path || stroke.d || '', // SVG path data
      direction: stroke.direction || 'unknown',
      type: stroke.type || 'unknown'
    })),
    character: rawData.character || '',
    unicode: rawData.unicode || ''
  };
}

// Function to fetch stroke data for all characters in our database
async function fetchAllStrokeData() {
  console.log('🚀 Starting stroke data fetch for all characters...');
  
  // Read our character data
  const characterDataPath = path.join(__dirname, 'src', 'data', 'ChineseAppDatabase2.js');
  
  if (!fs.existsSync(characterDataPath)) {
    console.error('❌ Character data file not found:', characterDataPath);
    return;
  }
  
  const characterData = require(characterDataPath);
  const characters = characterData.characters || [];
  
  console.log(`📊 Found ${characters.length} characters to process`);
  
  const strokeDataMap = {};
  let successCount = 0;
  let errorCount = 0;
  
  // Process characters in batches to avoid overwhelming the API
  const batchSize = 10;
  const delay = 1000; // 1 second delay between batches
  
  for (let i = 0; i < characters.length; i += batchSize) {
    const batch = characters.slice(i, i + batchSize);
    console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(characters.length / batchSize)}`);
    
    const batchPromises = batch.map(async (char) => {
      const strokeData = await fetchStrokeData(char.character);
      if (strokeData) {
        const processedData = processStrokeData(strokeData);
        if (processedData) {
          strokeDataMap[char.character] = processedData;
          successCount++;
        } else {
          errorCount++;
        }
      } else {
        errorCount++;
      }
    });
    
    await Promise.all(batchPromises);
    
    // Delay between batches
    if (i + batchSize < characters.length) {
      console.log(`⏳ Waiting ${delay}ms before next batch...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.log(`\n📈 Results:`);
  console.log(`✅ Successfully fetched: ${successCount} characters`);
  console.log(`❌ Failed to fetch: ${errorCount} characters`);
  console.log(`📊 Total processed: ${characters.length} characters`);
  
  // Save the stroke data
  const outputPath = path.join(__dirname, 'src', 'data', 'strokeData.js');
  const outputContent = `// Auto-generated stroke data for Chinese characters
// Generated on: ${new Date().toISOString()}
// Total characters with stroke data: ${successCount}

export const strokeData = ${JSON.stringify(strokeDataMap, null, 2)};

export default strokeData;
`;
  
  fs.writeFileSync(outputPath, outputContent);
  console.log(`💾 Stroke data saved to: ${outputPath}`);
  
  // Create a summary report
  const summaryPath = path.join(__dirname, 'stroke-data-summary.json');
  const summary = {
    generatedAt: new Date().toISOString(),
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

// Run the script
if (require.main === module) {
  fetchAllStrokeData()
    .then(() => {
      console.log('\n🎉 Stroke data fetch completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = {
  fetchStrokeData,
  processStrokeData,
  fetchAllStrokeData
};
