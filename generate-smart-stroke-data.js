const cnchar = require('cnchar');
const fs = require('fs');
const path = require('path');

// Function to extract individual Chinese characters from a string
function extractChineseCharacters(text) {
  if (!text) return [];
  
  // Remove special characters, punctuation, and non-Chinese characters
  // Keep only Chinese characters (CJK Unified Ideographs)
  const chineseRegex = /[\u4e00-\u9fff]/g;
  const matches = text.match(chineseRegex);
  
  return matches ? [...new Set(matches)] : []; // Remove duplicates
}

// Function to check if a character is a Chinese character
function isChineseCharacter(char) {
  return /[\u4e00-\u9fff]/.test(char);
}

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

// Function to generate stroke data for all unique Chinese characters
async function generateSmartStrokeData() {
  console.log('🚀 Starting smart stroke data generation...');
  
  // Read our character data
  const characterDataPath = path.join(__dirname, 'src', 'data', 'chineseCharactersData.js');
  
  if (!fs.existsSync(characterDataPath)) {
    console.error('❌ Character data file not found:', characterDataPath);
    return;
  }
  
  const characterData = require(characterDataPath);
  const entries = characterData.chineseCharactersData || [];
  
  console.log(`📊 Found ${entries.length} entries to process`);
  
  // Extract all unique Chinese characters from all entries
  const allCharacters = new Set();
  const characterToEntries = new Map(); // Track which entries contain each character
  
  for (const entry of entries) {
    const characters = extractChineseCharacters(entry.character);
    
    for (const char of characters) {
      allCharacters.add(char);
      
      // Track which entries contain this character
      if (!characterToEntries.has(char)) {
        characterToEntries.set(char, []);
      }
      characterToEntries.get(char).push({
        id: entry.lineNumber,
        fullEntry: entry.character,
        pinyin: entry.pinyin,
        englishTranslation: entry.englishTranslation
      });
    }
  }
  
  const uniqueCharacters = Array.from(allCharacters).sort();
  console.log(`🔍 Found ${uniqueCharacters.length} unique Chinese characters`);
  
  const strokeDataMap = {};
  let successCount = 0;
  let errorCount = 0;
  
  // Process each unique character
  for (const character of uniqueCharacters) {
    console.log(`Processing character: ${character}`);
    
    const strokeData = generateStrokeData(character);
    if (strokeData) {
      // Add metadata about which entries contain this character
      strokeData.entries = characterToEntries.get(character);
      strokeDataMap[character] = strokeData;
      successCount++;
      console.log(`✅ Generated stroke data for: ${character} (${strokeData.strokeCount} strokes, appears in ${strokeData.entries.length} entries)`);
    } else {
      errorCount++;
      console.log(`❌ Failed to generate stroke data for: ${character}`);
    }
  }
  
  console.log(`\n📈 Results:`);
  console.log(`✅ Successfully generated: ${successCount} characters`);
  console.log(`❌ Failed to generate: ${errorCount} characters`);
  console.log(`📊 Total unique characters: ${uniqueCharacters.length}`);
  console.log(`📊 Total entries processed: ${entries.length}`);
  
  // Save the stroke data
  const outputPath = path.join(__dirname, 'src', 'data', 'strokeData.js');
  const outputContent = `// Auto-generated stroke data for Chinese characters using cnchar
// Generated on: ${new Date().toISOString()}
// Total unique characters with stroke data: ${successCount}
// Total entries processed: ${entries.length}

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

// Get stroke data for all characters in a text
export const getStrokeDataForText = (text) => {
  const characters = extractChineseCharacters(text);
  return characters.map(char => ({
    character: char,
    strokeData: getStrokeData(char)
  })).filter(item => item.strokeData !== null);
};

// Extract Chinese characters from text (ignoring symbols and special characters)
export const extractChineseCharacters = (text) => {
  if (!text) return [];
  const chineseRegex = /[\u4e00-\u9fff]/g;
  const matches = text.match(chineseRegex);
  return matches ? [...new Set(matches)] : [];
};

export default strokeData;
`;
  
  fs.writeFileSync(outputPath, outputContent);
  console.log(`💾 Stroke data saved to: ${outputPath}`);
  
  // Create a detailed summary report
  const summaryPath = path.join(__dirname, 'smart-stroke-data-summary.json');
  const summary = {
    generatedAt: new Date().toISOString(),
    method: 'cnchar-smart',
    totalEntries: entries.length,
    uniqueCharacters: uniqueCharacters.length,
    successCount,
    errorCount,
    successRate: `${((successCount / uniqueCharacters.length) * 100).toFixed(2)}%`,
    charactersWithStrokeData: Object.keys(strokeDataMap),
    charactersWithoutStrokeData: uniqueCharacters.filter(char => !strokeDataMap[char]),
    characterFrequency: Array.from(characterToEntries.entries()).map(([char, entries]) => ({
      character: char,
      frequency: entries.length,
      entries: entries.map(e => e.id)
    })).sort((a, b) => b.frequency - a.frequency)
  };
  
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`📋 Detailed summary report saved to: ${summaryPath}`);
  
  // Show top 10 most frequent characters
  console.log(`\n🔝 Top 10 most frequent characters:`);
  summary.characterFrequency.slice(0, 10).forEach((item, index) => {
    console.log(`${index + 1}. ${item.character}: appears in ${item.frequency} entries`);
  });
  
  return strokeDataMap;
}

// Test with sample entries
function testSmartExtraction() {
  console.log('🧪 Testing smart character extraction...');
  
  const testEntries = [
    '布置',
    '花生',
    '讲座',
    '忘',
    '马虎',
    '说明',
    '身份证',
    '同意',
    '师傅',
    '迟到',
    '扎针',
    '背景',
    '另外',
    '工业',
    '顺便',
    '演奏',
    '门',
    '平方',
    '哎呀',
    '访问',
    '国家',
    '后天',
    '掌握',
    '愿意',
    '...似的',
    '布',
    '次',
    '切',
    '少',
    '通',
    '错',
    '排',
    '拍',
    '被',
    '落',
    '病',
    '周',
    '以上',
    '规矩',
    '赶快',
    '让',
    '冬天',
    '担心',
    '打开',
    '光圈',
    '古迹',
    '假期',
    '激光',
    '咳嗽',
    '论文',
    '辛苦',
    '药方',
    '零下',
    '面积',
    '更',
    '样子',
    '地毯',
    '电池',
    '裤子',
    '完全',
    '一切',
    '银行',
    '十字路口',
    '麻婆豆腐',
    '不停',
    '十分',
    '琵琶',
    '抽烟',
    '变',
    '增加',
    '中心',
    '坏事',
    '登记',
    '蛋糕',
    '空',
    '香港',
    '自然',
    '邮票',
    '只好',
    '影碟',
    '熊猫',
    '结婚',
    '开放',
    '小偷',
    '语法',
    '公里',
    '经营',
    '规则',
    '包括',
    '放大',
    '面前',
    '抓',
    '机会',
    '告诉',
    '马上',
    '摄影',
    '已经',
    '杂技',
    '准备',
    '乱七八糟',
    '实况转播',
    '岁寒三友',
    '文房四宝',
    '杯子',
    '画册',
    '让',
    '包裹',
    '影响',
    '孟子',
    '山水',
    '感情',
    '曲子',
    '交流',
    '冰箱',
    '好看',
    '国际',
    '编',
    '感冒',
    '出去',
    '女儿',
    '弹',
    '伸',
    '霜',
    '弄',
    '掉',
    '单',
    '单',
    '滚',
    '受',
    '开玩笑',
    '忘不了',
    '小伙子',
    '兵马俑',
    '不得了',
    '册',
    '分',
    '抽',
    '指',
    '脸',
    '刮',
    '冷',
    '拉',
    '秋',
    '偷',
    '药',
    '怕',
    '靠',
    '它',
    '闻',
    '看样子',
    '落汤鸡',
    '照相机',
    '奖学金',
    '晴',
    '打盹儿',
    '大使馆',
    '西红柿',
    '双',
    '夏',
    '牌子',
    '夜',
    '桥',
    '讲话',
    '开户',
    '空姐',
    '人们',
    '算卦',
    '停留',
    '同志',
    '外公',
    '弯腰',
    '微笑',
    '卫星',
    '摇头',
    '友谊',
    '原来',
    '祖国',
    '长久',
    '丰富',
    '各种',
    '过去',
    '气氛',
    '题目',
    '中医',
    '闭',
    '金',
    '腿',
    '治',
    '干',
    '烤',
    '加油',
    '敬酒',
    '劳驾',
    '签名',
    '上街',
    '世上',
    '谈论',
    '污染',
    '做客',
    '表现',
    '爱人',
    '不如',
    '打算',
    '方面',
    '画家',
    '烤鸭',
    '民歌',
    '母亲',
    '热闹',
    '身高',
    '颜色',
    '要求',
    '这么',
    '幸福',
    '人口',
    '搂',
    '办事',
    '不久',
    '双',
    '纸',
    '与',
    '地址',
    '千',
    '喘气',
    '救命',
    '鼻子',
    '大约',
    '道理',
    '国籍',
    '开演',
    '肯定',
    '离婚',
    '练习',
    '人家',
    '相信',
    '英语',
    '圆',
    '针灸',
    '渴',
    '捎',
    '涂',
    '哦',
    '倍',
    '尝',
    '阴',
    '幅',
    '熟',
    '除了...以外',
    '一边...一边',
    '帮(助)',
    '只要...就',
    '一...就...',
    '把',
    '着',
    '北京',
    '活动',
    '地上',
    '长',
    '手提包',
    '专业',
    '丢三落四',
    '预报',
    '风光',
    '城市',
    '坏',
    '应',
    '带',
    '加',
    '当',
    '灯',
    '学说',
    '协奏曲',
    '布置',
    '平方米',
    '记',
    '节',
    '精力',
    '平均',
    '讲学',
    '歌曲',
    '商业',
    '一样',
    '演员',
    '工商业',
    '产生',
    '参加',
    '糖葫芦',
    '未婚妻',
    '装',
    '通',
    '暖和',
    '着急',
    '钥匙',
    '前天',
    '利用',
    '困难',
    '游览',
    '简单',
    '住宿',
    '古典',
    '介绍',
    '今年',
    '鲁迅',
    '亲耳',
    '一些',
    '有名',
    '不见不散',
    '不好意思',
    '季节',
    '顺',
    '饭店',
    '滑冰',
    '好听',
    '后悔',
    '火车',
    '认为',
    '天下',
    '早晨',
    '主要',
    '糖',
    '红叶',
    '家乡',
    '开会',
    '旅行',
    '讨论',
    '听写',
    '安静',
    '百科全书',
    '马马虎虎',
    '旅馆',
    '文件',
    '克',
    '开关',
    '历史',
    '同学',
    '建筑',
    '笑',
    '质量',
    '帽子',
    '其他',
    '首先',
    '小心',
    '摸',
    '百',
    '拿',
    '盘',
    '借',
    '别提了',
    '丢',
    '疼',
    '安全带',
    '可不是',
    '电视台',
    '哈尔滨',
    '拾',
    '摔',
    '未婚夫',
    '登',
    '咳',
    '特',
    '收集',
    '外地',
    '抱',
    '无',
    '阿姨',
    '保证',
    '背包',
    '唱片',
    '导游',
    '父母',
    '继续',
    '可惜',
    '暖气',
    '水果',
    '文化',
    '周末',
    '准时',
    '作品',
    '老外',
    '座位',
    '肚子',
    '插',
    '叫',
    '巴黎',
    '办理',
    '报名',
    '编码',
    '标准',
    '别人',
    '开展',
    '名曲',
    '农村',
    '气温',
    '外语',
    '想法',
    '新闻',
    '以后',
    '一直',
    '动物',
    '笔记',
    '比较',
    '变化',
    '出土',
    '到处',
    '放心',
    '父亲',
    '歌词',
    '计划',
    '课文',
    '恐怕',
    '声音',
    '原谅',
    '赶',
    '手指',
    '捡',
    '出来',
    '寒假',
    '好像',
    '美元',
    '钱包',
    '改',
    '胡同',
    '警察',
    '对面',
    '参观',
    '聪明',
    '跟前',
    '婚礼',
    '坚持',
    '接着',
    '紧张',
    '经过',
    '课本',
    '年龄',
    '气候',
    '实现',
    '提高',
    '响声',
    '学位',
    '遥远',
    '正好',
    '整整',
    '终于',
    '又',
    '搬',
    '破',
    '句',
    '鸟',
    '递',
    '嘛',
    '掏',
    '笨',
    '猜',
    '棵',
    '寄',
    '只有...才',
    '...极了',
    '孔子',
    '行李',
    '大概',
    '方便',
    '大象',
    '那么',
    '长城',
    '步',
    '内',
    '展览馆',
    '一下子',
    '脏',
    '瓜子儿',
    '导演',
    '发生',
    '容易',
    '白薯',
    '欢乐',
    '见面',
    '山村',
    '时差',
    '叔叔',
    '水平',
    '遇到',
    '光盘',
    '邮局',
    '请假',
    '暑假',
    '改革',
    '台湾',
    '消息',
    '台词',
    '年轻',
    '尤其',
    '老子',
    '签字',
    '白天',
    '所以',
    '堵车',
    '邀请',
    '宴会',
    '护照',
    '陪',
    '胖',
    '兴旺',
    '住院',
    '不但...而且',
    '...家',
    '是...的',
    '可...了'
  ];
  
  const allChars = new Set();
  for (const entry of testEntries) {
    const chars = extractChineseCharacters(entry);
    chars.forEach(char => allChars.add(char));
    console.log(`"${entry}" -> [${chars.join(', ')}]`);
  }
  
  console.log(`\nTotal unique characters in test: ${allChars.size}`);
  console.log(`Characters: [${Array.from(allChars).sort().join(', ')}]`);
}

// Run the script
if (require.main === module) {
  // First test with sample entries
  testSmartExtraction();
  
  console.log('\n' + '='.repeat(50));
  
  // Then generate for all characters
  generateSmartStrokeData()
    .then(() => {
      console.log('\n🎉 Smart stroke data generation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = {
  extractChineseCharacters,
  generateStrokeData,
  generateSmartStrokeData,
  testSmartExtraction
};
