import { AchievementDef, BeastSkill, Subject } from './types';

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_beast',
    title: '初级驯兽师',
    description: '拥有你的第一只灵兽',
    icon: '🥚',
    targetValue: 1,
    category: 'beast'
  },
  {
    id: 'study_novice',
    title: '好学之士',
    description: '累计获得 1,000 XP',
    icon: '📚',
    targetValue: 1000,
    category: 'study'
  },
  {
    id: 'study_expert',
    title: '博学大师',
    description: '累计获得 10,000 XP',
    icon: '🎓',
    targetValue: 10000,
    category: 'study'
  },
  {
    id: 'streak_7',
    title: '坚持不懈',
    description: '连续学习 7 天',
    icon: '🔥',
    targetValue: 7,
    category: 'streak'
  },
  {
    id: 'streak_30',
    title: '学习达人',
    description: '连续学习 30 天',
    icon: '👑',
    targetValue: 30,
    category: 'streak'
  },
  {
    id: 'beast_master',
    title: '灵兽宗师',
    description: '任意一只灵兽达到 10 级',
    icon: '🐉',
    targetValue: 10,
    category: 'beast'
  },
  {
    id: 'all_subjects',
    title: '全能选手',
    description: '解锁所有学科的灵兽',
    icon: '🌈',
    targetValue: 9,
    category: 'beast'
  },
  {
    id: 'perfect_accuracy',
    title: '百发百中',
    description: '在一次练习中获得 100% 正确率',
    icon: '🎯',
    targetValue: 1,
    category: 'study'
  }
];

export const BEAST_SKILLS: Record<Subject, BeastSkill[]> = {
  math: [
    { id: 'math_1', name: '逻辑思辨', description: '提高数学问题的思考速度', icon: '🧠', requiredLevel: 5, effect: 'XP +5%' },
    { id: 'math_2', name: '几何感知', description: '在几何题中获得额外提示', icon: '📐', requiredLevel: 10, effect: 'XP +10%' },
    { id: 'math_3', name: '数论宗师', description: '彻底掌握数字的奥秘', icon: '🔢', requiredLevel: 25, effect: 'Accuracy Bonus' }
  ],
  english: [
    { id: 'eng_1', name: '词根记忆', description: '更快地掌握新单词', icon: '🔤', requiredLevel: 5, effect: 'XP +5%' },
    { id: 'eng_2', name: '语感觉醒', description: '自动过滤错误的语法选项', icon: '🗣️', requiredLevel: 10, effect: 'XP +10%' },
    { id: 'eng_3', name: '演讲大师', description: '像母语者一样交流', icon: '🎙️', requiredLevel: 25, effect: 'Mood Bonus' }
  ],
  chinese: [
    { id: 'chi_1', name: '文心雕龙', description: '提升古文理解能力', icon: '🖋️', requiredLevel: 5, effect: 'XP +5%' },
    { id: 'chi_2', name: '诗词歌赋', description: '在诗词题中获得额外提示', icon: '📜', requiredLevel: 10, effect: 'XP +10%' },
    { id: 'chi_3', name: '博古通今', description: '通晓古今文学脉络', icon: '🐉', requiredLevel: 25, effect: 'All Stats Up' }
  ],
  physics: [
    { id: 'phy_1', name: '力学基础', description: '理解万物运动之理', icon: '⚙️', requiredLevel: 5, effect: 'XP +5%' },
    { id: 'phy_2', name: '能量守恒', description: '在学习中保持更高心情', icon: '⚡', requiredLevel: 10, effect: 'Mood Degradation -20%' },
    { id: 'phy_3', name: '宇宙探索', description: '解析宏观与微观的奥秘', icon: '🌌', requiredLevel: 25, effect: 'XP +20%' }
  ],
  chemistry: [
    { id: 'che_1', name: '元素周期', description: '掌握物质的组成', icon: '🧪', requiredLevel: 5, effect: 'XP +5%' },
    { id: 'che_2', name: '化学反应', description: '加快XP获取效率', icon: '💥', requiredLevel: 10, effect: 'XP +10%' },
    { id: 'che_3', name: '炼金术士', description: '点石成金的奥秘', icon: '⚗️', requiredLevel: 25, effect: 'Double Rewards Chance' }
  ],
  biology: [
    { id: 'bio_1', name: '细胞结构', description: '理解生命的基石', icon: '🧫', requiredLevel: 5, effect: 'XP +5%' },
    { id: 'bio_2', name: '物种起源', description: '理解生命的演化', icon: '🧬', requiredLevel: 10, effect: 'XP +10%' },
    { id: 'bio_3', name: '生态系统', description: '掌控生命的平衡', icon: '🌿', requiredLevel: 25, effect: 'Recovery +20%' }
  ],
  politics: [
    { id: 'pol_1', name: '思政基础', description: '理解社会运作规律', icon: '🏛️', requiredLevel: 5, effect: 'XP +5%' },
    { id: 'pol_2', name: '逻辑构建', description: '更清晰的思维框架', icon: '🧩', requiredLevel: 10, effect: 'XP +10%' },
    { id: 'pol_3', name: '社会共识', description: '理解秩序的真意', icon: '⚖️', requiredLevel: 25, effect: 'XP +20%' }
  ],
  history: [
    { id: 'his_1', name: '岁月回响', description: '倾听历史的声音', icon: '⏳', requiredLevel: 5, effect: 'XP +5%' },
    { id: 'his_2', name: '古文明考', description: '解析失落的智慧', icon: '🏺', requiredLevel: 10, effect: 'XP +10%' },
    { id: 'his_3', name: '时空行者', description: '在历史长河中漫步', icon: '🏛️', requiredLevel: 25, effect: 'XP +20%' }
  ],
  geography: [
    { id: 'geo_1', name: '大地母亲', description: '理解地球的构造', icon: '🌍', requiredLevel: 5, effect: 'XP +5%' },
    { id: 'geo_2', name: '洋流流向', description: '在知识的海洋中航行', icon: '🌊', requiredLevel: 10, effect: 'XP +10%' },
    { id: 'geo_3', name: '星图测绘', description: '定位宇宙中的存在', icon: '🛰️', requiredLevel: 25, effect: 'XP +20%' }
  ]
};
