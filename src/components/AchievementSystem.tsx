import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Lock, CheckCircle2, Star, Award } from 'lucide-react';
import { Achievement, AchievementDef } from '../types';
import { ACHIEVEMENTS } from '../constants';
import { cn } from '../lib/utils';

interface AchievementProps {
  userAchievements: Achievement[];
  onClose?: () => void;
}

export const AchievementSystem: React.FC<AchievementProps> = ({ userAchievements, onClose }) => {
  return (
    <div className="space-y-8 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-[#F27D26] to-[#FFD700] bg-clip-text text-transparent">
            成就殿堂
          </h2>
          <p className="text-gray-400 text-sm mt-1">记录你的每一次成长与突破</p>
        </div>
        <div className="bg-[#F27D26]/10 px-4 py-2 rounded-2xl border border-[#F27D26]/20">
          <span className="text-[#F27D26] font-bold">
            {userAchievements.filter(a => a.completed).length} / {ACHIEVEMENTS.length}
          </span>
          <span className="text-xs text-gray-500 ml-2">已解锁</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACHIEVEMENTS.map((def) => {
          const userAch = userAchievements.find(a => a.id === def.id);
          const isUnlocked = userAch?.completed;
          
          return (
            <motion.div
              key={def.id}
              whileHover={{ y: -5 }}
              className={cn(
                "relative group p-6 rounded-3xl border-2 transition-all duration-300 overflow-hidden",
                isUnlocked 
                  ? "bg-gradient-to-br from-[#1C1D21] to-[#2A2B30] border-[#F27D26]/30 shadow-lg shadow-[#F27D26]/5" 
                  : "bg-[#151619] border-white/5 grayscale opacity-60"
              )}
            >
              {isUnlocked && (
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#F27D26]/10 rounded-full blur-2xl group-hover:bg-[#F27D26]/20 transition-colors" />
              )}
              
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner",
                  isUnlocked ? "bg-[#F27D26]/20" : "bg-white/5"
                )}>
                  {def.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className={cn(
                    "font-bold truncate",
                    isUnlocked ? "text-white" : "text-gray-500"
                  )}>
                    {def.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {def.description}
                  </p>
                  
                  {isUnlocked ? (
                    <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-[#F27D26] uppercase tracking-wider">
                      <CheckCircle2 size={12} />
                      已达成 · {new Date(userAch.unlockedAt).toLocaleDateString()}
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (userAch?.progress || 0) / def.targetValue * 100)}%` }}
                          className="h-full bg-gray-600"
                        />
                      </div>
                      <span className="text-[10px] text-gray-600 font-mono">
                        {Math.floor((userAch?.progress || 0) / def.targetValue * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {!isUnlocked && (
                <div className="absolute top-4 right-4 text-gray-700">
                  <Lock size={16} />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export const AchievementNotification: React.FC<{ achievement: AchievementDef; onComplete: () => void }> = ({ achievement, onComplete }) => {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -100, opacity: 0, scale: 0.9 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md"
    >
      <div className="bg-[#1C1D21] border-2 border-[#F27D26] rounded-3xl p-6 shadow-2xl shadow-[#F27D26]/20 flex items-center gap-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#F27D26]/5 to-transparent pointer-events-none" />
        
        <div className="relative">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-16 h-16 bg-[#F27D26]/20 rounded-2xl flex items-center justify-center text-4xl shadow-lg"
          >
            {achievement.icon}
          </motion.div>
          <div className="absolute -top-2 -right-2">
            <Star className="text-[#FFD700] fill-[#FFD700] animate-pulse" size={20} />
          </div>
        </div>

        <div className="flex-1">
          <div className="text-[#F27D26] text-xs font-bold uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
            <Award size={14} />
            解锁新成就
          </div>
          <h3 className="text-xl font-black text-white mb-1">{achievement.title}</h3>
          <p className="text-gray-400 text-sm">{achievement.description}</p>
        </div>

        <button 
          onClick={onComplete}
          className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-500 hover:text-white"
        >
          <Trophy size={20} />
        </button>
      </div>
    </motion.div>
  );
};
