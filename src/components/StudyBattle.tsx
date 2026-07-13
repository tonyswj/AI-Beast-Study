import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Beast, Question, Subject, StudyDifficulty } from '../types';
import { AlertCircle } from 'lucide-react';

interface StudyBattleProps {
  beast: Beast;
  difficulty: StudyDifficulty;
  onComplete: (xp: number, accuracy: number, wrongQuestions: Question[]) => void | Promise<void>;
  onCancel: () => void;
  customQuestions?: Question[];
}

export const StudyBattle: React.FC<StudyBattleProps> = ({ 
  beast, 
  difficulty,
  onComplete, 
  onCancel, 
  customQuestions 
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const XP_PER_CORRECT = {
    easy: 5,
    normal: 10,
    hard: 20,
    hell: 50
  }[difficulty];

  // Mock questions for MVP (Extended with more variety)
  const getQuestions = (subject: Subject): Question[] => {
    if (customQuestions && customQuestions.length > 0) return customQuestions;
    // ... Copying from App.tsx ...
    switch (subject) {
      case 'math':
        return [
          { id: 'm1', text: '12 x 8 = ?', options: ['84', '96', '104', '92'], correctAnswer: 1, explanation: '12乘以8等于96。' },
          { id: 'm2', text: '√144 + 5 = ?', options: ['17', '19', '12', '15'], correctAnswer: 0, explanation: '144的平方根是12，12加5等于17。' },
          { id: 'm3', text: '3^3 - 7 = ?', options: ['20', '18', '21', '19'], correctAnswer: 0, explanation: '3的3次方是27，27减7等于20。' },
          { id: 'm4', text: '15% of 200 = ?', options: ['25', '30', '35', '40'], correctAnswer: 1, explanation: '200的15%是200乘以0.15，等于30。' },
          { id: 'm5', text: 'x + 15 = 42, x = ?', options: ['27', '25', '28', '26'], correctAnswer: 0, explanation: 'x = 42 - 15 = 27。' },
        ];
      case 'chinese':
        return [
          { id: 'c1', text: '“学而时习之”的下一句是？', options: ['不亦说乎', '不亦乐乎', '不亦悲乎', '不亦快乎'], correctAnswer: 0, explanation: '出自《论语》，全句为“学而时习之，不亦说乎”。' },
          { id: 'c2', text: '《背影》的作者是？', options: ['鲁迅', '朱自清', '老舍', '冰心'], correctAnswer: 1, explanation: '《背影》是现代作家朱自清于1925年所写的一篇回忆性散文。' },
          { id: 'c3', text: '下列哪个不是“岁寒三友”？', options: ['松', '竹', '梅', '菊'], correctAnswer: 3, explanation: '“岁寒三友”是指松、竹、梅。菊属于“花中四君子”。' },
          { id: 'c4', text: '“但愿人长久，千里共婵娟”出自哪位词人？', options: ['苏轼', '李清照', '辛弃疾', '柳勇'], correctAnswer: 0, explanation: '出自苏轼的《水调歌头·明月几时有》。' },
          { id: 'c5', text: '《红楼梦》的作者是？', options: ['罗贯中', '施耐庵', '吴承恩', '曹雪芹'], correctAnswer: 3, explanation: '《红楼梦》是中国古典四大名著之首，清代作家曹雪芹著。' },
        ];
      case 'physics':
        return [
          { id: 'p1', text: '万有引力定律是谁发现的？', options: ['爱因斯坦', '牛顿', '伽利略', '霍金'], correctAnswer: 1, explanation: '艾萨克·牛顿在1687年发表的《自然哲学的数学原理》中提出了万有引力定律。' },
          { id: 'p2', text: '真空中光速约为多少？', options: ['30万km/s', '20万km/s', '10万km/s', '40万km/s'], correctAnswer: 0, explanation: '光在真空中的传播速度约为299,792,458米/秒，通常取30万千米/秒。' },
          { id: 'p3', text: '欧姆定律的公式是？', options: ['P=UI', 'I=U/R', 'W=Fs', 'F=ma'], correctAnswer: 1, explanation: '欧姆定律指出：在同一电路中，通过某段导体的电流跟这段导体两端的电压成正比，跟这段导体的电阻成反比。' },
          { id: 'p4', text: '水的密度是多少？', options: ['1.0g/cm³', '0.8g/cm³', '1.2g/cm³', '1.5g/cm³'], correctAnswer: 0, explanation: '在4℃时，纯水的密度为1.0g/cm³或1000kg/m³。' },
          { id: 'p5', text: '声音在空气中的传播速度约为？', options: ['340m/s', '300m/s', '100m/s', '1000m/s'], correctAnswer: 0, explanation: '在15℃的空气中，声音的传播速度约为340m/s。' },
        ];
      case 'chemistry':
        return [
          { id: 'ch1', text: '氧气的化学符号是？', options: ['H2', 'O2', 'CO2', 'N2'], correctAnswer: 1, explanation: '氧气是由氧元素组成的单质，化学式为O2。' },
          { id: 'ch2', text: '水的化学式是？', options: ['H2O', 'HO2', 'H2O2', 'OH'], correctAnswer: 0, explanation: '水是由氢、氧两种元素组成的无机物，化学式为H2O。' },
          { id: 'ch3', text: '地壳中含量最多的元素是？', options: ['铁', '铝', '氧', '硅'], correctAnswer: 2, explanation: '地壳中含量排名前四的元素依次是：氧、硅、铝、铁。' },
          { id: 'ch4', text: '下列哪种气体能使带火星的木条复燃？', options: ['二氧化碳', '氮气', '氧气', '氢气'], correctAnswer: 2, explanation: '氧气具有助燃性，能使带火星的木条复燃。' },
          { id: 'ch5', text: 'pH值等于7的溶液呈？', options: ['酸性', '碱性', '中性', '挥发性'], correctAnswer: 2, explanation: 'pH=7为中性，pH<7为酸性，pH>7为碱性。' },
        ];
      case 'biology':
        return [
          { id: 'b1', text: '生物体结构和功能的基本单位是？', options: ['组织', '器官', '细胞', '系统'], correctAnswer: 2, explanation: '除病毒外，细胞是生物体结构和功能的基本单位。' },
          { id: 'b2', text: '绿色植物进行光合作用的主要器官是？', options: ['根', '茎', '叶', '花'], correctAnswer: 2, explanation: '叶片中含有大量的叶绿体，是进行光合作用的主要场所。' },
          { id: 'b3', text: '人体的消化系统中，消化和吸收的主要场所是？', options: ['胃', '小肠', '大肠', '口腔'], correctAnswer: 1, explanation: '小肠长且内表面积大，含有多种消化液，是消化和吸收的主要场所。' },
          { id: 'b4', text: '被称为“遗传学之父”的是？', options: ['达尔文', '孟德尔', '袁隆平', '巴斯德'], correctAnswer: 1, explanation: '格雷戈尔·孟德尔通过豌豆实验发现了遗传规律，被誉为现代遗传学之父。' },
          { id: 'b5', text: '下列哪项不是生物？', options: ['病毒', '草履虫', '钟乳石', '蘑菇'], correctAnswer: 2, explanation: '钟乳石是碳酸钙沉淀形成的，不具有生命特征。' },
        ];
      case 'politics':
        return [
          { id: 'po1', text: '我国的根本政治制度是？', options: ['人民代表大会制度', '民族区域自治制度', '基层群众自治制度', '多党合作制度'], correctAnswer: 0, explanation: '人民代表大会制度是我国的根本政治制度。' },
          { id: 'po2', text: '法律最主要的特征是？', options: ['由国家制定', '靠社会舆论保证实施', '靠国家强制力保证实施', '对全体社会成员具有普遍约束力'], correctAnswer: 2, explanation: '法律是由国家强制力保证实施的，这是法律最主要的特征。' },
          { id: 'po3', text: '公民最基本的权利是？', options: ['选举权', '人身自由权', '受教育权', '劳动权'], correctAnswer: 1, explanation: '人身自由权是公民最基本的权利，是享受其他权利的前提。' },
          { id: 'po4', text: '社会主义核心价值观中，个人层面的价值准则是？', options: ['富强、民主、文明、和谐', '自由、平等、公正、法治', '爱国、敬业、诚信、友善', '和平、发展、合作、共赢'], correctAnswer: 2, explanation: '爱国、敬业、诚信、友善是个人层面的价值准则。' },
          { id: 'po5', text: '我国宪法的核心价值追求是？', options: ['规范国家权力运行以保障公民权利', '维护国家统一', '促进经济发展', '加强国防建设'], correctAnswer: 0, explanation: '宪法的核心价值追求是规范国家权力运行以保障公民权利。' },
        ];
      case 'history':
        return [
          { id: 'h1', text: '中国历史上第一个统一的封建王朝是？', options: ['夏朝', '商朝', '秦朝', '汉朝'], correctAnswer: 2, explanation: '公元前221年，秦始皇统一六国，建立了中国历史上第一个统一的封建王朝——秦朝。' },
          { id: 'h2', text: '“贞观之治”是指哪位皇帝在位期间的统治？', options: ['唐太宗', '唐玄宗', '汉武帝', '康熙帝'], correctAnswer: 0, explanation: '唐太宗李世民在位期间，政治清明，经济发展，社会安定，史称“贞观之治”。' },
          { id: 'h3', text: '中国近代史上第一个不平等条约是？', options: ['《南京条约》', '《北京条约》', '《马关条约》', '《辛丑条约》'], correctAnswer: 0, explanation: '1842年，中英签订《南京条约》，这是中国近代史上第一个不平等条约。' },
          { id: 'h4', text: '标志着中国新民主主义革命开端的事件是？', options: ['辛亥革命', '五四运动', '中国共产党成立', '南昌起义'], correctAnswer: 1, explanation: '1919年的五四运动标志着中国新民主主义革命的开端。' },
          { id: 'h5', text: '发明活字印刷术的是？', options: ['蔡伦', '毕昇', '张衡', '祖冲之'], correctAnswer: 1, explanation: '北宋时期的毕昇发明了活字印刷术。' },
        ];
      case 'geography':
        return [
          { id: 'g1', text: '地球上最大的大洲是？', options: ['非洲', '北美洲', '亚洲', '南极洲'], correctAnswer: 2, explanation: '亚洲是世界上面积最大、人口最多的洲。' },
          { id: 'g2', text: '我国面积最大的省级行政区是？', options: ['西藏', '内蒙古', '新疆', '青海'], correctAnswer: 2, explanation: '新疆维吾尔自治区面积约166万平方公里，是中国面积最大的省级行政区。' },
          { id: 'g3', text: '被称为“日光城”的城市是？', options: ['拉萨', '昆明', '三亚', '成都'], correctAnswer: 0, explanation: '拉萨由于海拔高，空气稀薄洁净，日照时间长，被称为“日光城”。' },
          { id: 'g4', text: '世界上面积最大的沙漠是？', options: ['塔克拉玛干沙漠', '撒哈拉沙漠', '维多利亚大沙漠', '戈壁沙漠'], correctAnswer: 1, explanation: '撒哈拉沙漠是世界上面积最大的沙质沙漠。' },
          { id: 'g5', text: '我国最长的河流是？', options: ['黄河', '珠江', '长江', '淮河'], correctAnswer: 2, explanation: '长江全长6300余公里，是中国也是亚洲第一长河。' },
        ];
      default:
        return [
          { id: 'e1', text: 'Which word is a synonym for "Fast"?', options: ['Slow', 'Quick', 'Loud', 'Quiet'], correctAnswer: 1, explanation: '"Quick" is a synonym for "Fast".' },
          { id: 'e2', text: 'What is the past tense of "Go"?', options: ['Gone', 'Went', 'Goes', 'Going'], correctAnswer: 1, explanation: 'The past tense of "go" is "went".' },
          { id: 'e3', text: 'Choose the correct spelling:', options: ['Receive', 'Recieve', 'Receve', 'Recive'], correctAnswer: 0, explanation: '"Receive" is the correct spelling (i before e except after c).' },
          { id: 'e4', text: 'Opposite of "Brave"?', options: ['Strong', 'Cowardly', 'Happy', 'Angry'], correctAnswer: 1, explanation: '"Cowardly" is the opposite of "Brave".' },
          { id: 'e5', text: 'A person who writes books is an...', options: ['Artist', 'Author', 'Actor', 'Athlete'], correctAnswer: 1, explanation: 'An "Author" is a person who writes books.' },
        ];
    }
  };

  const questions = getQuestions(beast.subject);

  const handleAnswer = (index: number) => {
    const isCorrect = index === questions[currentQuestion].correctAnswer;
    if (isCorrect) {
      setScore(s => s + 1);
    }
    
    setUserAnswers(prev => [...prev, index]);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(c => c + 1);
    } else {
      setFinished(true);
    }
  };

  const handleFinish = () => {
    const accuracy = score / questions.length;
    const xpEarned = score * XP_PER_CORRECT;
    
    const wrongQuestions = questions.filter((q, idx) => userAnswers[idx] !== q.correctAnswer);
    onComplete(xpEarned, accuracy, wrongQuestions);
  };

  return (
    <div className="fixed inset-0 bg-[#151619] z-50 flex flex-col font-sans text-white">
      <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#1C1D21]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#F27D26] rounded-lg flex items-center justify-center text-black font-bold">
            {beast.subject === 'math' ? 'Σ' : 'A'}
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest">Study Battle</h2>
            <p className="text-[10px] text-gray-500 uppercase font-mono">
              Subject: {beast.subject} | Difficulty: {difficulty}
            </p>
          </div>
        </div>
        <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors">
          <AlertCircle size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {!finished ? (
            <motion.div 
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full space-y-8"
            >
              <div className="text-center space-y-4">
                <span className="text-[10px] font-mono text-[#F27D26] uppercase tracking-[0.3em]">
                  Question {currentQuestion + 1} / {questions.length}
                </span>
                <h3 className="text-4xl font-bold tracking-tight leading-tight">{questions[currentQuestion].text}</h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {questions[currentQuestion].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className="group relative p-6 bg-[#1C1D21] border border-white/10 rounded-2xl text-left hover:border-[#F27D26] hover:bg-[#F27D26]/5 transition-all overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-[#F27D26] transition-colors" />
                    <div className="flex items-center gap-4">
                      <span className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-xs font-mono text-gray-500 group-hover:text-[#F27D26] group-hover:border-[#F27D26]">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-lg font-medium">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : !showDetails ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8 w-full max-w-md"
            >
              <div className="space-y-2">
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-5xl font-black uppercase italic tracking-tighter">Battle Clear!</h2>
                <p className="text-gray-400">你展现了惊人的智慧，小兽获得了成长。</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#1C1D21] p-6 rounded-2xl border border-white/10">
                  <div className="text-[10px] font-mono text-gray-500 uppercase mb-1">Accuracy</div>
                  <div className="text-3xl font-bold text-[#F27D26]">{Math.round(score / questions.length * 100)}%</div>
                </div>
                <div className="bg-[#1C1D21] p-6 rounded-2xl border border-white/10">
                  <div className="text-[10px] font-mono text-gray-500 uppercase mb-1">XP Earned</div>
                  <div className="text-3xl font-bold text-[#F27D26]">+{score * XP_PER_CORRECT}</div>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => setShowDetails(true)}
                  className="w-full py-4 bg-white/5 border border-white/10 text-white font-bold text-lg rounded-xl hover:bg-white/10 transition-all"
                >
                  查看解析
                </button>
                <button 
                  onClick={handleFinish}
                  className="w-full py-4 bg-[#F27D26] text-black font-bold text-xl rounded-xl hover:bg-white transition-all shadow-[0_8px_0_rgb(0,0,0,0.2)]"
                >
                  领取奖励并返回
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full space-y-6 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold">答题详情</h3>
              </div>
              <div className="space-y-6 pb-8">
                {questions.map((q, idx) => (
                  <div key={q.id} className="bg-[#1C1D21] p-6 rounded-2xl border border-white/10 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                       <span className="text-sm font-bold text-gray-400">Q{idx + 1}. {q.text}</span>
                       <span className={userAnswers[idx] === q.correctAnswer ? "text-green-500" : "text-red-500"}>
                         {userAnswers[idx] === q.correctAnswer ? "正确" : "错误"}
                       </span>
                    </div>
                    <div className="bg-black/20 p-4 rounded-xl text-sm italic text-gray-400">
                      解析: {q.explanation}
                    </div>
                  </div>
                ))}
                <button 
                   onClick={() => setShowDetails(false)}
                   className="w-full py-4 bg-[#1C1D21] border border-white/10 text-white font-bold text-lg rounded-xl hover:border-[#F27D26] transition-all"
                >
                   返回
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
