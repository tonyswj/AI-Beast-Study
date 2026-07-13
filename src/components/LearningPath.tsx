import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Map, ChevronRight, Lock, CheckCircle2, Sparkles, Brain, Trophy } from 'lucide-react';
import { Beast, Subject, LearningPathNode } from '../types';
import { geminiService } from '../services/geminiService';
import { cn } from '../lib/utils';

interface LearningPathProps {
  beast: Beast;
  onNodeClick: (node: LearningPathNode) => void;
}

export const LearningPath: React.FC<LearningPathProps> = ({ beast, onNodeClick }) => {
  const [aiTips, setAiTips] = useState<string>('');
  const [isLoadingTips, setIsLoadingTips] = useState(false);

  // Mock nodes for the path
  const nodes: LearningPathNode[] = [
    { id: '1', title: '基础概念', description: '掌握核心定义与术语', type: 'concept', status: 'completed', xpReward: 50, subject: beast.subject },
    { id: '2', title: '初级挑战', description: '完成5道基础练习题', type: 'quiz', status: 'available', xpReward: 100, subject: beast.subject },
    { id: '3', title: '进阶理论', description: '深入理解复杂逻辑', type: 'concept', status: 'locked', xpReward: 80, subject: beast.subject },
    { id: '4', title: '中级考核', description: '通过进阶知识测试', type: 'quiz', status: 'locked', xpReward: 150, subject: beast.subject },
    { id: '5', title: '领域专家', description: '达成该阶段里程碑', type: 'milestone', status: 'locked', xpReward: 300, subject: beast.subject },
  ];

  useEffect(() => {
    const fetchTips = async () => {
      setIsLoadingTips(true);
      const tips = await geminiService.generateLearningPathTips(beast.subject, beast);
      setAiTips(tips);
      setIsLoadingTips(false);
    };
    fetchTips();
  }, [beast.subject, beast.level]);

  return (
    <div className="space-y-8">
      {/* AI Recommendations */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#F27D26]/20 to-transparent border border-[#F27D26]/30 p-6 rounded-3xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles size={64} />
        </div>
        <div className="flex items-start gap-4 relative z-10">
          <div className="bg-[#F27D26] p-3 rounded-2xl text-black">
            <Brain size={24} />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              AI 学习建议
              {isLoadingTips && (
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full"
                />
              )}
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed italic">
              "{aiTips || '正在感应你的学习进度...'}"
            </p>
          </div>
        </div>
      </motion.div>

      {/* Path Visualization */}
      <div className="relative">
        {/* Connection Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-white/5 z-0" />

        <div className="space-y-6 relative z-10">
          {nodes.map((node, idx) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => node.status !== 'locked' && onNodeClick(node)}
              className={cn(
                "flex items-center gap-6 p-4 rounded-2xl border transition-all group",
                node.status === 'locked' ? "opacity-50 grayscale cursor-not-allowed border-white/5" : 
                node.status === 'completed' ? "bg-white/5 border-green-500/30 cursor-pointer" :
                "bg-[#1C1D21] border-[#F27D26]/50 cursor-pointer hover:border-[#F27D26] shadow-lg shadow-[#F27D26]/10"
              )}
            >
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-110",
                node.status === 'locked' ? "bg-white/5 text-gray-600" :
                node.status === 'completed' ? "bg-green-500/20 text-green-500" :
                "bg-[#F27D26] text-black"
              )}>
                {node.status === 'completed' ? <CheckCircle2 size={32} /> : 
                 node.type === 'concept' ? <Brain size={32} /> :
                 node.type === 'quiz' ? <Trophy size={32} /> : <Sparkles size={32} />}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-white">{node.title}</h4>
                  <span className="text-[10px] font-mono text-[#F27D26] font-bold">+{node.xpReward} XP</span>
                </div>
                <p className="text-xs text-gray-500">{node.description}</p>
              </div>

              <div className="text-gray-600">
                {node.status === 'locked' ? <Lock size={20} /> : <ChevronRight size={20} />}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
