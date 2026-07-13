import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Beast, BeastSkill } from '../types';
import { BEAST_SKILLS } from '../constants';
import { Sparkles, Lock, CheckCircle2, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

interface SkillTreeProps {
  beast: Beast;
  onUnlockSkill: (skillId: string) => void;
  onClose: () => void;
}

export const SkillTree: React.FC<SkillTreeProps> = ({ beast, onUnlockSkill, onClose }) => {
  const availableSkills = BEAST_SKILLS[beast.subject] || [];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-[#1C1D21] border border-white/10 rounded-3xl p-6 w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col gap-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-2">
            <Zap className="text-[#F27D26]" />
            技能进化树 Skill Tree
          </h2>
          <p className="text-xs text-gray-400 font-mono mt-1">Available Points: {beast.skillPoints || 0}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-all">
           关闭 Close
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {availableSkills.map((skill) => {
          const isUnlocked = beast.skills?.some(s => s.id === skill.id && s.unlocked);
          const canUnlock = !isUnlocked && beast.level >= skill.requiredLevel && (beast.skillPoints || 0) > 0;
          const isLocked = !isUnlocked && beast.level < skill.requiredLevel;

          return (
            <div 
              key={skill.id}
              className={cn(
                "relative p-4 rounded-2xl border transition-all flex flex-col gap-3 overflow-hidden",
                isUnlocked ? "bg-[#F27D26]/10 border-[#F27D26]/30" : "bg-black/20 border-white/5",
                isLocked ? "opacity-60" : "opacity-100"
              )}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg",
                    isUnlocked ? "bg-[#F27D26] text-black" : "bg-white/5 text-gray-500"
                  )}>
                    {skill.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{skill.name}</h3>
                    <div className="text-[10px] uppercase font-mono text-[#F27D26]">Level {skill.requiredLevel} Required</div>
                  </div>
                </div>
                {isUnlocked ? (
                  <CheckCircle2 className="text-[#F27D26]" size={20} />
                ) : isLocked ? (
                  <Lock className="text-gray-600" size={20} />
                ) : (
                  <Sparkles className="animate-pulse text-yellow-400" size={20} />
                )}
              </div>

              <p className="text-xs text-gray-400 line-clamp-2">{skill.description}</p>
              
              <div className="mt-auto pt-2 border-t border-white/5 flex justify-between items-center">
                <span className="text-[10px] font-mono text-[#F27D26] uppercase">Effect: {skill.effect}</span>
                {!isUnlocked && (
                  <button
                    disabled={!canUnlock}
                    onClick={() => onUnlockSkill(skill.id)}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all",
                      canUnlock 
                        ? "bg-[#F27D26] text-black hover:scale-105" 
                        : "bg-white/5 text-gray-600 cursor-not-allowed"
                    )}
                  >
                    解锁 Unlock
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-[#F27D26]/5 rounded-2xl border border-[#F27D26]/10">
        <div className="text-[10px] font-mono text-gray-500 uppercase mb-2">Pro Tip</div>
        <p className="text-xs text-gray-400 italic">
          进化技能可以大幅提升学习效率。每升 5 级即可获得 1 个技能点。
        </p>
      </div>
    </motion.div>
  );
};
