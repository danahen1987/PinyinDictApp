/**
 * Generate Basic Sentences for Missing Characters
 * Creates simple, unique sentences for each of the 822 missing characters
 */

const fs = require('fs');
const path = require('path');

// Read the analysis results
const analysisPath = path.join(__dirname, 'sentence-character-analysis.json');
const analysisData = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));

// Basic sentence templates for different character types
const sentenceTemplates = {
  // Numbers
  "一": "一是一。",
  "二": "二是二。", 
  "三": "三是三。",
  "五": "五是五。",
  "七": "七是七。",
  "九": "九是九。",
  "十": "十是十。",
  
  // Basic pronouns and common words
  "不": "我不去。",
  "也": "我也去。",
  "人": "我是人。",
  "我": "我是学生。",
  "你": "你好吗？",
  "他": "他是老师。",
  "她": "她是医生。",
  "好": "你好。",
  "是": "我是学生。",
  "有": "我有书。",
  "在": "我在家。",
  "的": "这是我的书。",
  "了": "我去了。",
  "和": "我和你。",
  "就": "我就来。",
  "都": "我们都去。",
  "很": "很好。",
  "会": "我会说中文。",
  "要": "我要学习。",
  "可以": "我可以去。",
  "没有": "我没有钱。",
  
  // Basic verbs
  "去": "我去学校。",
  "来": "你来我家。",
  "看": "我看书。",
  "听": "我听音乐。",
  "说": "我说中文。",
  "做": "我做作业。",
  "吃": "我吃饭。",
  "喝": "我喝水。",
  "买": "我买东西。",
  "卖": "我卖书。",
  "走": "我走路。",
  "跑": "我跑步。",
  "坐": "我坐车。",
  "站": "我站着。",
  "住": "我住这里。",
  "到": "我到了。",
  "出": "我出去。",
  "进": "我进来。",
  "回": "我回家。",
  
  // Time and place
  "今天": "今天很好。",
  "明天": "明天我去。",
  "昨天": "昨天我去了。",
  "现在": "现在几点了？",
  "以前": "以前我住这里。",
  "以后": "以后我会来。",
  "这里": "我在这里。",
  "那里": "书在那里。",
  "哪里": "你在哪里？",
  "什么": "这是什么？",
  
  // Family and people
  "爸爸": "我爸爸是老师。",
  "妈妈": "我妈妈是医生。",
  "哥哥": "我哥哥很高。",
  "姐姐": "我姐姐很漂亮。",
  "朋友": "他是我的朋友。",
  "老师": "老师很好。",
  "学生": "我是学生。",
  "医生": "医生很忙。",
  "工人": "工人很辛苦。",
  
  // Common single characters
  "个": "一个人。",
  "们": "我们很好。",
  "这": "这是书。",
  "那": "那是笔。",
  "些": "这些是书。",
  "多": "很多书。",
  "少": "很少人。",
  "大": "很大。",
  "小": "很小。",
  "高": "很高。",
  "低": "很低。",
  "长": "很长。",
  "短": "很短。",
  "新": "新书。",
  "旧": "旧书。",
  "老": "老人。",
  "年": "今年。",
  "月": "这个月。",
  "日": "今天。",
  "时": "什么时候？",
  "分": "几分钟。",
  "秒": "几秒钟。",
  "天": "今天。",
  "地": "大地。",
  "山": "高山。",
  "水": "清水。",
  "火": "大火。",
  "木": "木头。",
  "金": "金子。",
  "土": "土地。",
  "东": "东方。",
  "南": "南方。",
  "西": "西方。",
  "北": "北方。",
  "上": "上面。",
  "下": "下面。",
  "左": "左边。",
  "右": "右边。",
  "前": "前面。",
  "后": "后面。",
  "中": "中间。",
  "里": "里面。",
  "外": "外面。",
  "内": "内部。",
  "边": "旁边。",
  "面": "见面。",
  "头": "头发。",
  "手": "手很干净。",
  "脚": "脚很累。",
  "眼": "眼睛。",
  "耳": "耳朵。",
  "口": "口很渴。",
  "鼻": "鼻子。",
  "心": "心情。",
  "身": "身体。",
  "家": "我家。",
  "房": "房子。",
  "门": "门开了。",
  "窗": "窗户。",
  "床": "床很舒服。",
  "桌": "桌子。",
  "椅": "椅子。",
  "书": "书很好。",
  "笔": "笔很新。",
  "纸": "纸很白。",
  "车": "车很快。",
  "船": "船很大。",
  "飞机": "飞机很快。",
  "衣服": "衣服很漂亮。",
  "鞋子": "鞋子很新。",
  "帽子": "帽子很漂亮。",
  "食物": "食物很香。",
  "茶": "茶很香。",
  "咖啡": "咖啡很香。",
  "牛奶": "牛奶很白。",
  "面包": "面包很香。",
  "米饭": "米饭很香。",
  "面条": "面条很好吃。",
  "肉": "肉很香。",
  "鱼": "鱼很新鲜。",
  "鸡": "鸡很香。",
  "鸭": "鸭很好吃。",
  "蛋": "蛋很新鲜。",
  "菜": "菜很新鲜。",
  "水果": "水果很甜。",
  "苹果": "苹果很红。",
  "香蕉": "香蕉很黄。",
  "橙子": "橙子很甜。",
  "葡萄": "葡萄很甜。",
  
  // Colors
  "红": "红色。",
  "蓝": "蓝色。",
  "绿": "绿色。",
  "黄": "黄色。",
  "黑": "黑色。",
  "白": "白色。",
  "灰": "灰色。",
  
  // Common adjectives
  "快": "很快。",
  "慢": "很慢。",
  "热": "很热。",
  "冷": "很冷。",
  "暖": "很暖。",
  "凉": "很凉。",
  "干": "很干。",
  "湿": "很湿。",
  "干净": "很干净。",
  "脏": "很脏。",
  "漂亮": "很漂亮。",
  "丑": "很丑。",
  "聪明": "很聪明。",
  "笨": "很笨。",
  "坏": "很坏。",
  "对": "对的。",
  "错": "错的。",
  "真": "真的。",
  "假": "假的。",
  "容易": "很容易。",
  "难": "很难。",
  "简单": "很简单。",
  "复杂": "很复杂。",
  
  // Common verbs
  "想": "我想你。",
  "知道": "我知道。",
  "明白": "我明白。",
  "忘记": "我忘记了。",
  "记得": "我记得。",
  "喜欢": "我喜欢。",
  "爱": "我爱你。",
  "恨": "我恨他。",
  "怕": "我怕。",
  "希望": "我希望。",
  "需要": "我需要。",
  "应该": "我应该。",
  "能": "我能。",
  "必须": "我必须。",
  "愿意": "我愿意。",
  "开始": "开始了。",
  "结束": "结束了。",
  "继续": "继续。",
  "停止": "停止了。",
  "完成": "完成了。",
  "帮助": "帮助我。",
  "教": "教我。",
  "学": "我学习。",
  "练习": "我练习。",
  "工作": "我工作。",
  "休息": "我休息。",
  "睡觉": "我睡觉。",
  "起床": "我起床。",
  "洗澡": "我洗澡。",
  "刷牙": "我刷牙。",
  "吃饭": "我吃饭。",
  "喝水": "我喝水。",
  "买东西": "我买东西。",
  "卖东西": "我卖东西。",
  "花钱": "我花钱。",
  "赚钱": "我赚钱。",
  
  // Common nouns
  "钱": "我有钱。",
  "时间": "我有时间。",
  "地方": "好地方。",
  "问题": "有问题。",
  "答案": "有答案。",
  "事情": "有事情。",
  "学习": "我学习。",
  "生活": "好生活。",
  "家庭": "好家庭。",
  "学校": "好学校。",
  "医院": "好医院。",
  "商店": "好商店。",
  "银行": "好银行。",
  "邮局": "好邮局。",
  "公园": "好公园。",
  "电影院": "好电影院。",
  "图书馆": "好图书馆。",
  "博物馆": "好博物馆。",
  
  // Common question words
  "谁": "你是谁？",
  "怎么": "怎么去？",
  "多少": "多少钱？",
  "几个": "几个人？",
  "哪个": "哪个好？",
  "哪些": "哪些书？",
  
  // Common particles and connectors
  "着": "看着。",
  "过": "去过。",
  "得": "很好。",
  "地": "慢慢地。",
  "呢": "你呢？",
  "吗": "好吗？",
  "吧": "好吧。",
  "啊": "好啊。",
  "呀": "好呀。",
  "哦": "哦。",
  "嗯": "嗯。",
  "哈": "哈哈。",
  "与": "你与我。",
  "或": "你或我。",
  "但是": "但是。",
  "可是": "可是。",
  "不过": "不过。",
  "因为": "因为。",
  "所以": "所以。",
  "如果": "如果。",
  "虽然": "虽然。",
  
  // Common measure words
  "只": "一只猫。",
  "条": "一条鱼。",
  "张": "一张纸。",
  "本": "一本书。",
  "支": "一支笔。",
  "把": "一把刀。",
  "套": "一套书。",
  "双": "一双鞋。",
  "对": "一对。",
  "群": "一群人。",
  "点": "一点。",
  
  // Default template for any character not in the above list
  "default": "这个字是{character}。"
};

class SentenceGenerator {
  constructor() {
    this.missingCharacters = analysisData.analysis.missingFromMain;
  }

  /**
   * Generate sentence for a character
   */
  generateSentenceForCharacter(character) {
    // Check if we have a specific template for this character
    if (sentenceTemplates[character]) {
      return sentenceTemplates[character];
    }
    
    // Use default template
    return sentenceTemplates.default.replace('{character}', character);
  }

  /**
   * Generate all sentences
   */
  generateAllSentences() {
    console.log('🔍 Generating sentences for missing characters...\n');
    
    const characterSentences = [];
    
    this.missingCharacters.forEach((character, index) => {
      const sentence = this.generateSentenceForCharacter(character);
      
      characterSentences.push({
        index: index + 1,
        character: character,
        sentence: sentence,
        pinyin: this.getPinyinForCharacter(character)
      });
    });
    
    console.log(`📊 Generated ${characterSentences.length} sentences\n`);
    return characterSentences;
  }

  /**
   * Get pinyin for character (simplified version)
   */
  getPinyinForCharacter(character) {
    // This is a simplified version - you can expand this
    const pinyinMap = {
      "一": "yī", "二": "èr", "三": "sān", "五": "wǔ", "七": "qī", "九": "jiǔ", "十": "shí",
      "不": "bù", "也": "yě", "人": "rén", "我": "wǒ", "你": "nǐ", "他": "tā", "她": "tā",
      "好": "hǎo", "是": "shì", "有": "yǒu", "在": "zài", "的": "de", "了": "le", "和": "hé",
      "就": "jiù", "都": "dōu", "很": "hěn", "会": "huì", "要": "yào", "去": "qù", "来": "lái",
      "看": "kàn", "听": "tīng", "说": "shuō", "做": "zuò", "吃": "chī", "喝": "hē", "买": "mǎi",
      "卖": "mài", "走": "zǒu", "跑": "pǎo", "坐": "zuò", "站": "zhàn", "住": "zhù", "到": "dào",
      "出": "chū", "进": "jìn", "回": "huí", "个": "gè", "们": "men", "这": "zhè", "那": "nà",
      "些": "xiē", "多": "duō", "少": "shǎo", "大": "dà", "小": "xiǎo", "高": "gāo", "低": "dī",
      "长": "cháng", "短": "duǎn", "新": "xīn", "旧": "jiù", "老": "lǎo", "年": "nián", "月": "yuè",
      "日": "rì", "时": "shí", "分": "fēn", "秒": "miǎo", "天": "tiān", "地": "dì", "山": "shān",
      "水": "shuǐ", "火": "huǒ", "木": "mù", "金": "jīn", "土": "tǔ", "东": "dōng", "南": "nán",
      "西": "xī", "北": "běi", "上": "shàng", "下": "xià", "左": "zuǒ", "右": "yòu", "前": "qián",
      "后": "hòu", "中": "zhōng", "里": "lǐ", "外": "wài", "内": "nèi", "边": "biān", "面": "miàn",
      "头": "tóu", "手": "shǒu", "脚": "jiǎo", "眼": "yǎn", "耳": "ěr", "口": "kǒu", "鼻": "bí",
      "心": "xīn", "身": "shēn", "家": "jiā", "房": "fáng", "门": "mén", "窗": "chuāng", "床": "chuáng",
      "桌": "zhuō", "椅": "yǐ", "书": "shū", "笔": "bǐ", "纸": "zhǐ", "车": "chē", "船": "chuán",
      "红": "hóng", "蓝": "lán", "绿": "lǜ", "黄": "huáng", "黑": "hēi", "白": "bái", "灰": "huī",
      "快": "kuài", "慢": "màn", "热": "rè", "冷": "lěng", "暖": "nuǎn", "凉": "liáng", "干": "gān",
      "湿": "shī", "漂亮": "piàoliang", "聪明": "cōngmíng", "对": "duì", "错": "cuò", "真": "zhēn",
      "假": "jiǎ", "容易": "róngyì", "难": "nán", "简单": "jiǎndān", "复杂": "fùzá", "想": "xiǎng",
      "知道": "zhīdào", "明白": "míngbai", "喜欢": "xǐhuan", "爱": "ài", "希望": "xīwàng",
      "需要": "xūyào", "应该": "yīnggāi", "能": "néng", "必须": "bìxū", "愿意": "yuànyì",
      "开始": "kāishǐ", "结束": "jiéshù", "继续": "jìxù", "停止": "tíngzhǐ", "完成": "wánchéng",
      "帮助": "bāngzhù", "教": "jiāo", "学": "xué", "练习": "liànxí", "工作": "gōngzuò", "休息": "xiūxi",
      "睡觉": "shuìjiào", "起床": "qǐchuáng", "洗澡": "xǐzǎo", "刷牙": "shuāyá", "吃饭": "chīfàn",
      "喝水": "hēshuǐ", "钱": "qián", "时间": "shíjiān", "地方": "dìfāng", "问题": "wèntí",
      "答案": "dá'àn", "事情": "shìqing", "学习": "xuéxí", "生活": "shēnghuó", "家庭": "jiātíng",
      "学校": "xuéxiào", "医院": "yīyuàn", "商店": "shāngdiàn", "银行": "yínháng", "邮局": "yóujú",
      "公园": "gōngyuán", "谁": "shéi", "怎么": "zěnme", "多少": "duōshǎo", "几个": "jǐgè",
      "哪个": "nǎgè", "哪些": "nǎxiē", "着": "zhe", "过": "guò", "得": "de", "地": "de",
      "呢": "ne", "吗": "ma", "吧": "ba", "啊": "a", "呀": "ya", "哦": "o", "嗯": "en",
      "哈": "hā", "与": "yǔ", "或": "huò", "但是": "dànshì", "可是": "kěshì", "不过": "búguò",
      "因为": "yīnwèi", "所以": "suǒyǐ", "如果": "rúguǒ", "虽然": "suīrán", "只": "zhī",
      "条": "tiáo", "张": "zhāng", "本": "běn", "支": "zhī", "把": "bǎ", "套": "tào",
      "双": "shuāng", "对": "duì", "群": "qún", "点": "diǎn"
    };
    
    return pinyinMap[character] || `[PINYIN_${character}]`;
  }

  /**
   * Export to CSV format
   */
  exportToCSV(characterSentences) {
    const csvPath = path.join(__dirname, 'character-sentences.csv');
    
    let csvContent = 'Index,Character,Pinyin,Sentence\n';
    
    characterSentences.forEach(item => {
      csvContent += `${item.index},"${item.character}","${item.pinyin}","${item.sentence}"\n`;
    });
    
    fs.writeFileSync(csvPath, csvContent, 'utf8');
    console.log(`💾 CSV exported to: ${csvPath}`);
  }

  /**
   * Export to simple text format
   */
  exportToText(characterSentences) {
    const txtPath = path.join(__dirname, 'character-sentences.txt');
    
    let txtContent = 'Character,Pinyin,Sentence\n';
    
    characterSentences.forEach(item => {
      txtContent += `${item.character},${item.pinyin},${item.sentence}\n`;
    });
    
    fs.writeFileSync(txtPath, txtContent, 'utf8');
    console.log(`💾 Text file exported to: ${txtPath}`);
  }

  /**
   * Display preview
   */
  displayPreview(characterSentences) {
    console.log('📋 PREVIEW (First 20 sentences):\n');
    
    characterSentences.slice(0, 20).forEach(item => {
      console.log(`${item.index.toString().padStart(3)}. ${item.character} (${item.pinyin}) - ${item.sentence}`);
    });
    
    if (characterSentences.length > 20) {
      console.log(`\n... and ${characterSentences.length - 20} more sentences\n`);
    }
  }

  /**
   * Main execution
   */
  run() {
    try {
      const characterSentences = this.generateAllSentences();
      
      this.displayPreview(characterSentences);
      
      this.exportToCSV(characterSentences);
      this.exportToText(characterSentences);
      
      console.log('✅ Sentence generation completed!');
      console.log('\n📝 Files created:');
      console.log('   • character-sentences.csv - For Google Sheets');
      console.log('   • character-sentences.txt - For copy-paste');
      
    } catch (error) {
      console.error('❌ Error generating sentences:', error);
    }
  }
}

// Run the sentence generator
const generator = new SentenceGenerator();
generator.run();
