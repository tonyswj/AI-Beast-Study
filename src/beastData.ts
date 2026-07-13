import { Subject } from './types';

export interface BeastStage {
  stage: number;
  name: string;
  minLevel: number;
  description: string;
  visual: string; // Emoji or icon name for now
}

export const BEAST_EVOLUTION: Record<Subject, BeastStage[]> = {
  math: [
    { stage: 1, name: '幼蛇 (Baby Snake)', minLevel: 1, description: '刚破壳而出的数学之灵，对数字充满好奇。', visual: '🐍' },
    { stage: 2, name: '灵蚺 (Spirit Boa)', minLevel: 10, description: '身体开始变得修长，能够理解基础的算术。', visual: '🐍' },
    { stage: 3, name: '玄蟒 (Mystic Python)', minLevel: 30, description: '体型巨大，目光中透着逻辑的光芒。', visual: '🐉' },
    { stage: 4, name: '虺 (Hui)', minLevel: 60, description: '传说中的水蛇，即将化龙。', visual: '🐲' },
    { stage: 5, name: '蛟 (Jiao)', minLevel: 100, description: '拥有了角和爪，能够操控代数的风暴。', visual: '🐲' },
    { stage: 6, name: '灵龙 (Spirit Dragon)', minLevel: 150, description: '真正的龙，几何与微积分在它周身环绕。', visual: '🐉' },
    { stage: 7, name: '角龙 (Horned Dragon)', minLevel: 240, description: '古老的智慧之龙。', visual: '🐉' },
    { stage: 8, name: '应龙 (Yinglong)', minLevel: 300, description: '数学的终极形态，双翼遮天蔽日。', visual: '✨🐉✨' },
  ],
  english: [
    { stage: 1, name: '精灵猫 (Spirit Cat)', minLevel: 1, description: '只会喵喵叫的英语初学者。', visual: '🐱' },
    { stage: 2, name: '幻影猫 (Phantom Cat)', minLevel: 20, description: '开始理解简单的单词。', visual: '🐈' },
    { stage: 3, name: '语灵狮 (Word Lion)', minLevel: 50, description: '咆哮中带着语法的力量。', visual: '🦁' },
    { stage: 4, name: '天界狮 (Celestial Lion)', minLevel: 100, description: '能够流畅沟通的智慧生物。', visual: '🦁' },
    { stage: 5, name: '狮鹫 (Griffin)', minLevel: 200, description: '英语大师的象征。', visual: '🦅' },
  ],
  chinese: [
    { stage: 1, name: '鲤鱼 (Carp)', minLevel: 1, description: '平凡的鲤鱼，怀揣着化龙的梦想。', visual: '🐟' },
    { stage: 2, name: '赤鲤 (Red Carp)', minLevel: 10, description: '通体赤红，灵性初现。', visual: '🐠' },
    { stage: 3, name: '金鲤 (Golden Carp)', minLevel: 30, description: '浑身金光闪闪，贵气逼人。', visual: '✨🐟' },
    { stage: 4, name: '化龙鲤 (Dragon Carp)', minLevel: 60, description: '跃过龙门，半鱼半龙。', visual: '🐲🐟' },
    { stage: 5, name: '鳌 (Ao)', minLevel: 100, description: '龙头鱼身，力大无穷。', visual: '🐢🐲' },
    { stage: 6, name: '灵龟 (Spirit Turtle)', minLevel: 150, description: '长寿且充满智慧的灵物。', visual: '🐢' },
    { stage: 7, name: '玄龟 (Mystic Turtle)', minLevel: 240, description: '背负八卦，通晓古今。', visual: '🐢✨' },
    { stage: 8, name: '玄武 (Xuanwu)', minLevel: 300, description: '北方之神，龟蛇合体。', visual: '🐢🐍✨' },
  ],
  physics: [
    { stage: 1, name: '猿 (Ape)', minLevel: 1, description: '聪颖的猿猴，对自然规律充满好奇。', visual: '🐒' },
    { stage: 2, name: '灵猿 (Spirit Ape)', minLevel: 10, description: '动作敏捷，开始掌握简单的工具。', visual: '🐒✨' },
    { stage: 3, name: '白猿 (White Ape)', minLevel: 30, description: '毛发如雪，力大无穷。', visual: '🦍' },
    { stage: 4, name: '通臂猿 (Gibbon)', minLevel: 60, description: '拿日月，缩千山，辨休咎，乾坤摩弄。', visual: '🦍💪' },
    { stage: 5, name: '朱厌 (Zhuyan)', minLevel: 100, description: '白头红脚，见则大兵。', visual: '👹' },
    { stage: 6, name: '石猿 (Stone Ape)', minLevel: 150, description: '天产石猴，金刚不坏。', visual: '🗿🐒' },
    { stage: 7, name: '灵明石猴 (Stone Monkey)', minLevel: 240, description: '通变化，识天时，知地利，移星换斗。', visual: '✨🐒✨' },
    { stage: 8, name: '孙悟空 (Sun Wukong)', minLevel: 300, description: '齐天大圣，斗战胜佛。', visual: '👑🐒✨' },
  ],
  chemistry: [
    { stage: 1, name: '虎 (Tiger)', minLevel: 1, description: '山中之王，充满野性。', visual: '🐯' },
    { stage: 2, name: '彪 (Biao)', minLevel: 10, description: '比虎更凶猛的异兽。', visual: '🐆' },
    { stage: 3, name: '白虎 (White Tiger)', minLevel: 30, description: '西方之神，威震四方。', visual: '🐅' },
    { stage: 4, name: '穷奇 (Qionqi)', minLevel: 60, description: '惩善扬恶的凶兽。', visual: '👹🐅' },
    { stage: 5, name: '饕餮 (Taotie)', minLevel: 100, description: '贪食万物，吞噬一切。', visual: '👺' },
    { stage: 6, name: '混沌 (Hundun)', minLevel: 150, description: '无面无目，混沌不明。', visual: '🌑' },
    { stage: 7, name: '梼杌 (Taowu)', minLevel: 240, description: '顽固不化，凶悍无比。', visual: '👹🐾' },
    { stage: 8, name: '监兵 (Jianbing)', minLevel: 300, description: '白虎神君，主宰杀伐。', visual: '✨🐅⚔️' },
  ],
  biology: [
    { stage: 1, name: '蚕 (Silkworm)', minLevel: 1, description: '小小的蚕宝宝，静待蜕变。', visual: '🐛' },
    { stage: 2, name: '冰蚕 (Ice Silkworm)', minLevel: 10, description: '通体晶莹，寒气逼人。', visual: '❄️🐛' },
    { stage: 3, name: '天蚕 (Sky Silkworm)', minLevel: 30, description: '吐丝如金，灵气环绕。', visual: '✨🐛' },
    { stage: 4, name: '金蚕 (Golden Silkworm)', minLevel: 60, description: '百毒不侵，万蛊之王。', visual: '🟡🐛' },
    { stage: 5, name: '蚕神 (Silkworm God)', minLevel: 100, description: '司掌蚕桑的神灵。', visual: '✨🧚' },
    { stage: 6, name: '桑神 (Mulberry God)', minLevel: 150, description: '万木之长，生机勃勃。', visual: '🌳✨' },
    { stage: 7, name: '织女星 (Vega)', minLevel: 240, description: '星辰之光，编织命运。', visual: '✨🌟' },
    { stage: 8, name: '嫘祖 (Leizu)', minLevel: 300, description: '人文始祖，蚕桑之母。', visual: '👑✨👵' },
  ],
  politics: [
    { stage: 1, name: '蝉 (Cicada)', minLevel: 1, description: '在地下蛰伏，等待鸣响。', visual: '🦗' },
    { stage: 2, name: '寒蝉 (Winter Cicada)', minLevel: 10, description: '噤若寒蝉，深藏不露。', visual: '❄️🦗' },
    { stage: 3, name: '冰蝉 (Ice Cicada)', minLevel: 30, description: '至纯至净，不染尘埃。', visual: '💎🦗' },
    { stage: 4, name: '金蝉 (Golden Cicada)', minLevel: 60, description: '金蝉脱壳，重获新生。', visual: '🟡🦗' },
    { stage: 5, name: '若虫 (Nymph)', minLevel: 100, description: '超凡脱俗，境界升华。', visual: '✨🦗' },
    { stage: 6, name: '灵蝉 (Spirit Cicada)', minLevel: 150, description: '通灵之物，预知祸福。', visual: '🔮🦗' },
    { stage: 7, name: '蝉仙 (Cicada Immortal)', minLevel: 240, description: '位列仙班，长生不老。', visual: '✨🧚🦗' },
    { stage: 8, name: '蝉祖 (Cicada Ancestor)', minLevel: 300, description: '万蝉之祖，主宰秩序。', visual: '👑✨🦗' },
  ],
  history: [
    { stage: 1, name: '雉 (Pheasant)', minLevel: 1, description: '五彩斑斓的野鸡。', visual: '🐦' },
    { stage: 2, name: '锦鸡 (Golden Pheasant)', minLevel: 10, description: '羽毛华丽，仪态万千。', visual: '🦚' },
    { stage: 3, name: '鸾鸟 (Luan Bird)', minLevel: 30, description: '神鸟之属，鸣声动听。', visual: '✨🐦' },
    { stage: 4, name: '鹓鶵 (Yuanchu)', minLevel: 60, description: '非梧桐不栖，非练实不食。', visual: '🟡🐦' },
    { stage: 5, name: '凤 (Phoenix)', minLevel: 100, description: '百鸟之王，雄为凤。', visual: '🔥🐦' },
    { stage: 6, name: '凰 (Phoenix)', minLevel: 150, description: '百鸟之王，雌为凰。', visual: '✨🔥🐦' },
    { stage: 7, name: '朱鸟 (Suzaku)', minLevel: 240, description: '南方之神，赤色神鸟。', visual: '🔴🔥🐦' },
    { stage: 8, name: '朱雀 (Suzaku)', minLevel: 300, description: '四灵之一，主宰南方。', visual: '✨🔥🐦✨' },
  ],
  geography: [
    { stage: 1, name: '鹿 (Deer)', minLevel: 1, description: '温顺的鹿，在大地上奔跑。', visual: '🦌' },
    { stage: 2, name: '斑鹿 (Spotted Deer)', minLevel: 10, description: '身上布满花纹，灵巧异常。', visual: '🦌✨' },
    { stage: 3, name: '玄鹿 (Black Deer)', minLevel: 30, description: '通体乌黑，神秘莫测。', visual: '🌑🦌' },
    { stage: 4, name: '乘黄 (Chenghuang)', minLevel: 60, description: '乘之寿二千岁。', visual: '🟡🦌' },
    { stage: 5, name: '白泽 (Baize)', minLevel: 100, description: '通万物之情，晓鬼神之事。', visual: '✨🦌' },
    { stage: 6, name: '甪端 (Luduan)', minLevel: 150, description: '日行万八里，通四方语言。', visual: '🦄' },
    { stage: 7, name: '麒 (Kirin)', minLevel: 240, description: '仁兽之首，雄为麒。', visual: '✨🦁🦌' },
    { stage: 8, name: '麒麟 (Kirin)', minLevel: 300, description: '太平盛世的象征。', visual: '✨🦁🦌✨' },
  ]
};

export function getBeastStage(subject: Subject, level: number): BeastStage {
  const stages = BEAST_EVOLUTION[subject];
  if (!stages || stages.length === 0) return { stage: 1, name: '未知小兽', minLevel: 1, description: '神秘的生物', visual: '❓' };
  
  let currentStage = stages[0];
  for (const stage of stages) {
    if (level >= stage.minLevel) {
      currentStage = stage;
    } else {
      break;
    }
  }
  return currentStage;
}

export function getNextStageLevel(subject: Subject, level: number): number | null {
  const stages = BEAST_EVOLUTION[subject];
  if (!stages) return null;
  for (const stage of stages) {
    if (stage.minLevel > level) return stage.minLevel;
  }
  return null;
}
