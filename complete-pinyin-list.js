/**
 * Complete Pinyin List for Missing Characters
 * Provides pinyin for the 822 missing characters found in sentences
 */

const fs = require('fs');
const path = require('path');

// Common Chinese characters with their pinyin
const commonCharacterPinyin = {
  // Numbers
  "一": "yī", "二": "èr", "三": "sān", "五": "wǔ", "七": "qī", "九": "jiǔ", "十": "shí",
  
  // Basic pronouns and common words
  "不": "bù", "也": "yě", "人": "rén", "我": "wǒ", "你": "nǐ", "他": "tā", "她": "tā",
  "好": "hǎo", "是": "shì", "有": "yǒu", "在": "zài", "的": "de", "了": "le", "和": "hé",
  "就": "jiù", "都": "dōu", "很": "hěn", "会": "huì", "要": "yào", "可以": "kěyǐ", "没有": "méiyǒu",
  
  // Basic verbs
  "去": "qù", "来": "lái", "看": "kàn", "听": "tīng", "说": "shuō", "做": "zuò", "吃": "chī",
  "喝": "hē", "买": "mǎi", "卖": "mài", "走": "zǒu", "跑": "pǎo", "坐": "zuò", "站": "zhàn",
  "住": "zhù", "到": "dào", "出": "chū", "进": "jìn", "回": "huí", "去": "qù", "来": "lái",
  
  // Time and place
  "今天": "jīntiān", "明天": "míngtiān", "昨天": "zuótiān", "现在": "xiànzài", "以前": "yǐqián",
  "以后": "yǐhòu", "这里": "zhèlǐ", "那里": "nàlǐ", "哪里": "nǎlǐ", "什么": "shénme",
  
  // Family and people
  "爸爸": "bàba", "妈妈": "māma", "哥哥": "gēge", "姐姐": "jiějie", "朋友": "péngyǒu",
  "老师": "lǎoshī", "学生": "xuésheng", "医生": "yīshēng", "工人": "gōngrén",
  
  // Common single characters
  "个": "gè", "们": "men", "这": "zhè", "那": "nà", "些": "xiē", "多": "duō", "少": "shǎo",
  "大": "dà", "小": "xiǎo", "高": "gāo", "低": "dī", "长": "cháng", "短": "duǎn", "新": "xīn",
  "旧": "jiù", "老": "lǎo", "年": "nián", "月": "yuè", "日": "rì", "时": "shí", "分": "fēn",
  "秒": "miǎo", "天": "tiān", "地": "dì", "山": "shān", "水": "shuǐ", "火": "huǒ", "木": "mù",
  "金": "jīn", "土": "tǔ", "东": "dōng", "南": "nán", "西": "xī", "北": "běi", "上": "shàng",
  "下": "xià", "左": "zuǒ", "右": "yòu", "前": "qián", "后": "hòu", "中": "zhōng", "里": "lǐ",
  "外": "wài", "内": "nèi", "边": "biān", "面": "miàn", "头": "tóu", "手": "shǒu", "脚": "jiǎo",
  "眼": "yǎn", "耳": "ěr", "口": "kǒu", "鼻": "bí", "心": "xīn", "身": "shēn", "家": "jiā",
  "房": "fáng", "门": "mén", "窗": "chuāng", "床": "chuáng", "桌": "zhuō", "椅": "yǐ",
  "书": "shū", "笔": "bǐ", "纸": "zhǐ", "车": "chē", "船": "chuán", "飞机": "fēijī",
  "衣服": "yīfu", "鞋子": "xiézi", "帽子": "màozi", "食物": "shíwù", "水": "shuǐ", "茶": "chá",
  "咖啡": "kāfēi", "牛奶": "niúnǎi", "面包": "miànbāo", "米饭": "mǐfàn", "面条": "miàntiáo",
  "肉": "ròu", "鱼": "yú", "鸡": "jī", "鸭": "yā", "蛋": "dàn", "菜": "cài", "水果": "shuǐguǒ",
  "苹果": "píngguǒ", "香蕉": "xiāngjiāo", "橙子": "chéngzi", "葡萄": "pútáo",
  
  // Colors
  "红": "hóng", "蓝": "lán", "绿": "lǜ", "黄": "huáng", "黑": "hēi", "白": "bái", "灰": "huī",
  
  // Common adjectives
  "快": "kuài", "慢": "màn", "热": "rè", "冷": "lěng", "暖": "nuǎn", "凉": "liáng",
  "干": "gān", "湿": "shī", "干净": "gānjìng", "脏": "zāng", "漂亮": "piàoliang", "丑": "chǒu",
  "聪明": "cōngmíng", "笨": "bèn", "好": "hǎo", "坏": "huài", "对": "duì", "错": "cuò",
  "真": "zhēn", "假": "jiǎ", "容易": "róngyì", "难": "nán", "简单": "jiǎndān", "复杂": "fùzá",
  
  // Common verbs
  "想": "xiǎng", "知道": "zhīdào", "明白": "míngbai", "忘记": "wàngjì", "记得": "jìde",
  "喜欢": "xǐhuan", "爱": "ài", "恨": "hèn", "怕": "pà", "希望": "xīwàng", "需要": "xūyào",
  "应该": "yīnggāi", "可以": "kěyǐ", "能": "néng", "会": "huì", "必须": "bìxū", "愿意": "yuànyì",
  "开始": "kāishǐ", "结束": "jiéshù", "继续": "jìxù", "停止": "tíngzhǐ", "完成": "wánchéng",
  "帮助": "bāngzhù", "教": "jiāo", "学": "xué", "练习": "liànxí", "工作": "gōngzuò", "休息": "xiūxi",
  "睡觉": "shuìjiào", "起床": "qǐchuáng", "洗澡": "xǐzǎo", "刷牙": "shuāyá", "吃饭": "chīfàn",
  "喝水": "hēshuǐ", "买东西": "mǎidōngxi", "卖东西": "màidōngxi", "花钱": "huāqián", "赚钱": "zhuànqián",
  
  // Common nouns
  "钱": "qián", "时间": "shíjiān", "地方": "dìfāng", "问题": "wèntí", "答案": "dá'àn",
  "事情": "shìqing", "工作": "gōngzuò", "学习": "xuéxí", "生活": "shēnghuó", "家庭": "jiātíng",
  "学校": "xuéxiào", "医院": "yīyuàn", "商店": "shāngdiàn", "银行": "yínháng", "邮局": "yóujú",
  "公园": "gōngyuán", "电影院": "diànyǐngyuàn", "图书馆": "túshūguǎn", "博物馆": "bówùguǎn",
  
  // Common question words
  "谁": "shéi", "什么": "shénme", "哪里": "nǎlǐ", "什么时候": "shénmeshíhòu", "为什么": "wèishénme",
  "怎么": "zěnme", "多少": "duōshǎo", "几个": "jǐgè", "哪个": "nǎgè", "哪些": "nǎxiē",
  
  // Common particles and connectors
  "的": "de", "了": "le", "着": "zhe", "过": "guò", "得": "de", "地": "de", "呢": "ne",
  "吗": "ma", "吧": "ba", "啊": "a", "呀": "ya", "哦": "o", "嗯": "en", "哈": "hā",
  "和": "hé", "与": "yǔ", "或": "huò", "但是": "dànshì", "可是": "kěshì", "不过": "búguò",
  "因为": "yīnwèi", "所以": "suǒyǐ", "如果": "rúguǒ", "虽然": "suīrán", "但是": "dànshì",
  
  // Common measure words
  "个": "gè", "只": "zhī", "条": "tiáo", "张": "zhāng", "本": "běn", "支": "zhī", "把": "bǎ",
  "件": "jiàn", "套": "tào", "双": "shuāng", "对": "duì", "群": "qún", "些": "xiē", "点": "diǎn",
  
  // Common single characters (continued)
  "专": "zhuān", "且": "qiě", "世": "shì", "业": "yè", "丝": "sī", "两": "liǎng", "丰": "fēng",
  "临": "lín", "为": "wéi/wèi", "主": "zhǔ", "丽": "lì", "久": "jiǔ", "么": "me", "之": "zhī",
  "乐": "lè/yuè", "习": "xí", "乡": "xiāng", "买": "mǎi", "争": "zhēng", "事": "shì", "于": "yú",
  "互": "hù", "些": "xiē", "交": "jiāo", "产": "chǎn", "京": "jīng", "亮": "liàng", "亲": "qīn",
  "什": "shí", "仅": "jǐn", "今": "jīn", "介": "jiè", "从": "cóng", "仔": "zǎi", "仙": "xiān",
  "代": "dài", "以": "yǐ", "件": "jiàn", "价": "jià", "任": "rèn", "份": "fèn", "企": "qǐ",
  "休": "xiū", "优": "yōu", "伙": "huǒ", "伟": "wěi", "传": "chuán", "似": "sì", "但": "dàn",
  "位": "wèi", "体": "tǐ", "何": "hé", "作": "zuò", "使": "shǐ", "供": "gōng", "便": "biàn",
  "俑": "yǒng", "俗": "sú", "保": "bǎo", "信": "xìn", "候": "hòu", "假": "jiǎ", "健": "jiàn",
  "傅": "fù", "傲": "ào", "像": "xiàng", "儿": "ér", "元": "yuán", "兑": "duì", "全": "quán",
  "八": "bā", "公": "gōng", "关": "guān", "兴": "xīng", "兵": "bīng", "其": "qí", "典": "diǎn",
  "再": "zài", "冒": "mào", "写": "xiě", "农": "nóng", "冬": "dōng", "冰": "bīng", "决": "jué",
  "况": "kuàng", "准": "zhǔn", "几": "jǐ", "划": "huá", "列": "liè", "则": "zé", "刚": "gāng",
  "利": "lì", "别": "bié", "剧": "jù", "力": "lì", "功": "gōng", "务": "wù", "助": "zhù",
  "努": "nǔ", "劳": "láo", "包": "bāo", "化": "huà", "匙": "chí", "医": "yī", "午": "wǔ",
  "半": "bàn", "协": "xié", "博": "bó", "卡": "kǎ", "卦": "guà", "卧": "wò", "卫": "wèi",
  "印": "yìn", "危": "wēi", "即": "jí", "卷": "juǎn", "厂": "chǎng", "历": "lì", "原": "yuán",
  "参": "cān", "及": "jí", "友": "yǒu", "反": "fǎn", "发": "fā", "叔": "shū", "口": "kǒu",
  "古": "gǔ", "另": "lìng", "史": "shǐ", "叶": "yè", "号": "hào", "司": "sī", "各": "gè",
  "合": "hé", "吉": "jí", "同": "tóng", "名": "míng", "后": "hòu", "吗": "ma", "吧": "ba",
  "吸": "xī", "呀": "ya", "告": "gào", "员": "yuán", "呢": "ne", "命": "mìng", "咖": "kā",
  "咱": "zán", "品": "pǐn", "哈": "hā", "响": "xiǎng", "哎": "āi", "哥": "gē", "哪": "nǎ",
  "哲": "zhé", "唱": "chàng", "商": "shāng", "啡": "fēi", "喘": "chuǎn", "嗽": "sòu",
  "嘴": "zuǐ", "器": "qì", "四": "sì", "因": "yīn", "团": "tuán", "园": "yuán", "困": "kùn",
  "国": "guó", "图": "tú", "圈": "quān", "场": "chǎng", "圾": "jī", "址": "zhǐ", "均": "jūn",
  "块": "kuài", "坚": "jiān", "垃": "lā", "基": "jī", "堂": "táng", "堵": "dǔ", "境": "jìng",
  "墙": "qiáng", "增": "zēng", "壁": "bì", "士": "shì", "处": "chù", "备": "bèi", "复": "fù",
  "太": "tài", "夫": "fū", "失": "shī", "奇": "qí", "奏": "zòu", "奖": "jiǎng", "女": "nǚ",
  "奶": "nǎi", "如": "rú", "妈": "mā", "妹": "mèi", "妻": "qī", "始": "shǐ", "姐": "jiě",
  "姓": "xìng", "姨": "yí", "娘": "niáng", "婆": "pó", "婚": "hūn", "子": "zǐ", "孔": "kǒng",
  "字": "zì", "孟": "mèng", "季": "jì", "学": "xué", "孩": "hái", "宅": "zhái", "守": "shǒu",
  "安": "ān", "定": "dìng", "宝": "bǎo", "实": "shí", "客": "kè", "室": "shì", "宫": "gōng",
  "宴": "yàn", "宵": "xiāo", "容": "róng", "宾": "bīn", "宿": "sù", "密": "mì", "富": "fù",
  "寒": "hán", "察": "chá", "导": "dǎo", "将": "jiāng", "尊": "zūn", "尔": "ěr", "尘": "chén",
  "尤": "yóu", "尽": "jìn", "局": "jú", "屉": "tì", "展": "zhǎn", "岁": "suì", "岛": "dǎo",
  "州": "zhōu", "工": "gōng", "巧": "qiǎo", "差": "chà", "己": "jǐ", "已": "yǐ", "巴": "bā",
  "币": "bì", "市": "shì", "帅": "shuài", "师": "shī", "希": "xī", "帮": "bāng", "常": "cháng",
  "帽": "mào", "幕": "mù", "平": "píng", "并": "bìng", "幸": "xìng", "广": "guǎng", "底": "dǐ",
  "店": "diàn", "座": "zuò", "庭": "tíng", "康": "kāng", "延": "yán", "式": "shì", "引": "yǐn",
  "弟": "dì", "张": "zhāng", "弯": "wān", "录": "lù", "彩": "cǎi", "影": "yǐng", "往": "wǎng",
  "微": "wēi", "志": "zhì", "忙": "máng", "态": "tài", "怎": "zěn", "思": "sī", "性": "xìng",
  "怪": "guài", "总": "zǒng", "恐": "kǒng", "恤": "xù", "息": "xī", "恼": "nǎo", "悔": "huǐ",
  "您": "nín", "情": "qíng", "惜": "xī", "愉": "yú", "意": "yì", "感": "gǎn", "愿": "yuàn",
  "慈": "cí", "慢": "màn", "憾": "hàn", "成": "chéng", "戒": "jiè", "或": "huò", "户": "hù",
  "所": "suǒ", "才": "cái", "扎": "zhā", "打": "dǎ", "托": "tuō", "扫": "sǎo", "扮": "bàn",
  "找": "zhǎo", "技": "jì", "折": "zhé", "护": "hù", "报": "bào", "担": "dān", "拥": "yōng",
  "括": "kuò", "持": "chí", "换": "huàn", "据": "jù", "掌": "zhǎng", "接": "jiē", "握": "wò",
  "摄": "shè", "摇": "yáo", "摩": "mó", "播": "bō", "政": "zhèng", "故": "gù", "救": "jiù",
  "散": "sàn", "敬": "jìng", "数": "shù", "整": "zhěng", "文": "wén", "断": "duàn", "旁": "páng",
  "旅": "lǚ", "族": "zú", "旗": "qí", "旧": "jiù", "早": "zǎo", "明": "míng", "易": "yì",
  "星": "xīng", "昨": "zuó", "显": "xiǎn", "晚": "wǎn", "晨": "chén", "普": "pǔ", "景": "jǐng",
  "暑": "shǔ", "暖": "nuǎn", "曲": "qǔ", "替": "tì", "有": "yǒu", "朋": "péng", "服": "fú",
  "望": "wàng", "期": "qī", "未": "wèi", "末": "mò", "术": "shù", "机": "jī", "杂": "zá",
  "李": "lǐ", "村": "cūn", "杭": "háng", "杯": "bēi", "杰": "jié", "板": "bǎn", "极": "jí",
  "果": "guǒ", "染": "rǎn", "柜": "guì", "柿": "shì", "标": "biāo", "树": "shù", "校": "xiào",
  "格": "gé", "案": "àn", "梦": "mèng", "梯": "tī", "检": "jiǎn", "棉": "mián", "植": "zhí",
  "楚": "chǔ", "楼": "lóu", "概": "gài", "欢": "huān", "款": "kuǎn", "歉": "qiàn", "歌": "gē",
  "正": "zhèng", "武": "wǔ", "死": "sǐ", "母": "mǔ", "每": "měi", "毛": "máo", "毯": "tǎn",
  "民": "mín", "气": "qì", "氛": "fēn", "永": "yǒng", "求": "qiú", "汇": "huì", "汉": "hàn",
  "江": "jiāng", "池": "chí", "污": "wū", "汤": "tāng", "没": "méi", "河": "hé", "油": "yóu",
  "法": "fǎ", "注": "zhù", "泰": "tài", "洗": "xǐ", "济": "jì", "浪": "làng", "海": "hǎi",
  "消": "xiāo", "淋": "lín", "清": "qīng", "温": "wēn", "港": "gǎng", "游": "yóu", "湾": "wān",
  "湿": "shī", "滑": "huá", "满": "mǎn", "滨": "bīn", "漂": "piāo", "漆": "qī", "漠": "mò",
  "激": "jī", "灸": "jiǔ", "烛": "zhú", "烟": "yān", "烦": "fán", "然": "rán", "熊": "xióng",
  "爬": "pá", "父": "fù", "爽": "shuǎng", "牌": "pái", "牛": "niú", "物": "wù", "猫": "māo",
  "玩": "wán", "环": "huán", "现": "xiàn", "珍": "zhēn", "班": "bān", "球": "qiú", "理": "lǐ",
  "琴": "qín", "琵": "pí", "琶": "pá", "瓜": "guā", "瓶": "píng", "瓷": "cí", "甚": "shèn",
  "生": "shēng", "用": "yòng", "由": "yóu", "申": "shēn", "电": "diàn", "画": "huà", "界": "jiè",
  "留": "liú", "白": "bái", "盒": "hé", "目": "mù", "直": "zhí", "相": "xiāng", "盹": "dǔn",
  "真": "zhēn", "睛": "jīng", "睡": "shuì", "知": "zhī", "矩": "jǔ", "短": "duǎn", "石": "shí",
  "码": "mǎ", "研": "yán", "础": "chǔ", "硕": "shuò", "硬": "yìng", "碟": "dié", "磁": "cí",
  "示": "shì", "礼": "lǐ", "社": "shè", "祖": "zǔ", "祝": "zhù", "神": "shén", "祥": "xiáng",
  "票": "piào", "福": "fú", "离": "lí", "科": "kē", "秘": "mì", "租": "zū", "积": "jī",
  "究": "jiū", "突": "tū", "窗": "chuāng", "立": "lì", "章": "zhāng", "笃": "dǔ", "笔": "bǐ",
  "等": "děng", "筑": "zhù", "筒": "tǒng", "答": "dá", "筷": "kuài", "简": "jiǎn", "算": "suàn",
  "箱": "xiāng", "籍": "jí", "米": "mǐ", "精": "jīng", "糕": "gāo", "糟": "zāo", "紧": "jǐn",
  "累": "lèi", "繁": "fán", "纠": "jiū", "红": "hóng", "约": "yuē", "线": "xiàn", "练": "liàn",
  "组": "zǔ", "织": "zhī", "终": "zhōng", "绍": "shào", "经": "jīng", "给": "gěi", "统": "tǒng",
  "继": "jì", "续": "xù", "绸": "chóu", "绿": "lǜ", "缆": "lǎn", "置": "zhì", "羊": "yáng",
  "美": "měi", "翻": "fān", "老": "lǎo", "考": "kǎo", "而": "ér", "耳": "ěr", "联": "lián",
  "聪": "cōng", "肉": "ròu", "肚": "dù", "肯": "kěn", "胜": "shèng", "胡": "hú", "胶": "jiāo",
  "能": "néng", "脑": "nǎo", "腐": "fǔ", "腰": "yāo", "自": "zì", "舒": "shū", "航": "háng",
  "般": "bān", "色": "sè", "艺": "yì", "芦": "lú", "英": "yīng", "草": "cǎo", "营": "yíng",
  "葫": "hú", "薯": "shǔ", "虎": "hǔ", "蛋": "dàn", "蜜": "mì", "蜡": "là", "行": "xíng",
  "街": "jiē", "衣": "yī", "衫": "shān", "衬": "chèn", "袋": "dài", "裙": "qún", "裤": "kù",
  "裹": "guǒ", "西": "xī", "要": "yào", "见": "jiàn", "观": "guān", "规": "guī", "视": "shì",
  "览": "lǎn", "觉": "jué", "解": "jiě", "警": "jǐng", "计": "jì", "认": "rèn", "讨": "tǎo",
  "议": "yì", "许": "xǔ", "论": "lùn", "访": "fǎng", "证": "zhèng", "识": "shí", "诉": "sù",
  "词": "cí", "译": "yì", "试": "shì", "语": "yǔ", "误": "wù", "说": "shuō", "请": "qǐng",
  "读": "dú", "课": "kè", "谁": "shéi", "调": "tiáo", "谅": "liàng", "谈": "tán", "谊": "yì",
  "谎": "huǎng", "谐": "xié", "谢": "xiè", "谱": "pǔ", "豆": "dòu", "象": "xiàng", "财": "cái",
  "质": "zhì", "贵": "guì", "费": "fèi", "资": "zī", "赛": "sài", "赢": "yíng", "走": "zǒu",
  "越": "yuè", "趣": "qù", "跑": "pǎo", "距": "jù", "跤": "jiāo", "路": "lù", "踩": "cǎi",
  "身": "shēn", "车": "chē", "转": "zhuǎn", "软": "ruǎn", "轻": "qīng", "较": "jiào",
  "辆": "liàng", "辈": "bèi", "辛": "xīn", "边": "biān", "达": "dá", "迅": "xùn", "迎": "yíng",
  "运": "yùn", "近": "jìn", "这": "zhè", "进": "jìn", "远": "yuǎn", "连": "lián", "迟": "chí",
  "迹": "jì", "适": "shì", "选": "xuǎn", "造": "zào", "遇": "yù", "遍": "biàn", "道": "dào",
  "遗": "yí", "遥": "yáo", "遵": "zūn", "避": "bì", "邀": "yāo", "那": "nà", "邮": "yóu",
  "郎": "láng", "部": "bù", "都": "dōu", "酒": "jiǔ", "醋": "cù", "里": "lǐ", "重": "zhòng",
  "野": "yě", "量": "liàng", "针": "zhēn", "钟": "zhōng", "钢": "gāng", "钥": "yào",
  "钱": "qián", "铁": "tiě", "银": "yín", "链": "liàn", "镜": "jìng", "间": "jiān", "闹": "nào",
  "阅": "yuè", "阿": "ā", "际": "jì", "院": "yuàn", "除": "chú", "险": "xiǎn", "随": "suí",
  "障": "zhàng", "集": "jí", "雕": "diāo", "零": "líng", "需": "xū", "霉": "méi", "青": "qīng",
  "静": "jìng", "非": "fēi", "面": "miàn", "革": "gé", "鞋": "xié", "音": "yīn", "顶": "dǐng",
  "项": "xiàng", "顾": "gù", "预": "yù", "领": "lǐng", "颐": "yí", "频": "pín", "题": "tí",
  "颜": "yán", "风": "fēng", "食": "shí", "餐": "cān", "饭": "fàn", "饰": "shì", "饼": "bǐng",
  "馆": "guǎn", "首": "shǒu", "马": "mǎ", "驾": "jià", "骄": "jiāo", "骑": "qí", "骨": "gǔ",
  "鱼": "yú", "鲁": "lǔ", "鲜": "xiān", "鸡": "jī", "鸭": "yā", "麦": "mài", "麻": "má",
  "黄": "huáng", "黎": "lí", "鼻": "bí", "齐": "qí", "龄": "líng"
};

// Read the analysis results
const analysisPath = path.join(__dirname, 'sentence-character-analysis.json');
const analysisData = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));

class CompletePinyinGenerator {
  constructor() {
    this.missingCharacters = analysisData.analysis.missingFromMain;
  }

  /**
   * Get pinyin for a character
   */
  getPinyinForCharacter(character) {
    return commonCharacterPinyin[character] || `[NEED_PINYIN_${character}]`;
  }

  /**
   * Generate the complete list with pinyin
   */
  generateCompleteList() {
    console.log('🔍 Generating complete pinyin list for missing characters...\n');
    
    const characterPinyinList = [];
    let foundPinyin = 0;
    let needLookup = 0;
    
    this.missingCharacters.forEach((character, index) => {
      const pinyin = this.getPinyinForCharacter(character);
      
      if (pinyin.startsWith('[NEED_PINYIN_')) {
        needLookup++;
      } else {
        foundPinyin++;
      }
      
      characterPinyinList.push({
        index: index + 1,
        character: character,
        pinyin: pinyin,
        needsLookup: pinyin.startsWith('[NEED_PINYIN_')
      });
    });
    
    console.log(`📊 Summary:`);
    console.log(`   • Total missing characters: ${this.missingCharacters.length}`);
    console.log(`   • Found pinyin: ${foundPinyin}`);
    console.log(`   • Need lookup: ${needLookup}\n`);
    
    return characterPinyinList;
  }

  /**
   * Export to CSV format for Google Sheets
   */
  exportToCSV(characterPinyinList) {
    const csvPath = path.join(__dirname, 'complete-missing-characters-pinyin.csv');
    
    let csvContent = 'Index,Character,Pinyin,Needs_Lookup\n';
    
    characterPinyinList.forEach(item => {
      csvContent += `${item.index},"${item.character}","${item.pinyin}",${item.needsLookup}\n`;
    });
    
    fs.writeFileSync(csvPath, csvContent, 'utf8');
    console.log(`💾 Complete CSV exported to: ${csvPath}`);
  }

  /**
   * Export to JSON format
   */
  exportToJSON(characterPinyinList) {
    const jsonPath = path.join(__dirname, 'complete-missing-characters-pinyin.json');
    
    const exportData = {
      timestamp: new Date().toISOString(),
      totalCharacters: characterPinyinList.length,
      foundPinyin: characterPinyinList.filter(item => !item.needsLookup).length,
      needLookup: characterPinyinList.filter(item => item.needsLookup).length,
      characters: characterPinyinList
    };
    
    fs.writeFileSync(jsonPath, JSON.stringify(exportData, null, 2), 'utf8');
    console.log(`💾 Complete JSON exported to: ${jsonPath}`);
  }

  /**
   * Display the list in console
   */
  displayList(characterPinyinList) {
    console.log('📋 COMPLETE MISSING CHARACTERS WITH PINYIN:\n');
    
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
      const characterPinyinList = this.generateCompleteList();
      
      // Display first 30 characters as preview
      console.log('📋 PREVIEW (First 30 characters):\n');
      characterPinyinList.slice(0, 30).forEach(item => {
        const status = item.needsLookup ? '❓' : '✅';
        console.log(`${item.index.toString().padStart(3)}. ${item.character} - ${item.pinyin} ${status}`);
      });
      
      if (characterPinyinList.length > 30) {
        console.log(`\n... and ${characterPinyinList.length - 30} more characters\n`);
      }
      
      // Export to files
      this.exportToCSV(characterPinyinList);
      this.exportToJSON(characterPinyinList);
      
      console.log('\n✅ Complete pinyin generation completed!');
      console.log('\n📝 Files created:');
      console.log('   • complete-missing-characters-pinyin.csv - For Google Sheets');
      console.log('   • complete-missing-characters-pinyin.json - For reference');
      
    } catch (error) {
      console.error('❌ Error generating complete pinyin:', error);
    }
  }
}

// Run the complete pinyin generator
const generator = new CompletePinyinGenerator();
generator.run();
