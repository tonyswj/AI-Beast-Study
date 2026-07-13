/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  onSnapshot, 
  addDoc, 
  query, 
  orderBy, 
  limit,
  getDocFromServer,
  deleteDoc
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile, Beast, Subject, StudySession, Question, WrongQuestion, Goal, LeaderboardEntry, Reminder, UserSettings, Achievement, AchievementDef, StudyDifficulty } from './types';
import { getBeastStage, getNextStageLevel, BeastStage } from './beastData';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Flame, 
  BookOpen, 
  Sword, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Zap,
  Brain,
  Star,
  Heart,
  TrendingUp,
  AlertCircle,
  Bell,
  X,
  Palette,
  Award,
  User as UserIcon,
  ArrowLeft,
  Home,
  Globe,
  Volume2,
  MessageSquare,
  ArrowRight,
  Share2
} from 'lucide-react';
import { cn } from './lib/utils';
import { BeastWorld } from './components/BeastWorld';
import { StudyBattle } from './components/StudyBattle';
import { SkillTree } from './components/SkillTree';
import { AchievementSystem, AchievementNotification } from './components/AchievementSystem';
import { AICompanion } from './components/AICompanion';
import { LearningPath } from './components/LearningPath';
import { ACHIEVEMENTS, BEAST_SKILLS } from './constants';

// --- Constants ---
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const XP_PER_CORRECT = 10;
const LEVEL_UP_BASE = 100;
const LEVEL_UP_MULTIPLIER = 1.1;

// --- Helper Functions ---
function calculateLevelXP(level: number) {
  return Math.floor(LEVEL_UP_BASE * Math.pow(LEVEL_UP_MULTIPLIER, level - 1));
}

// --- Components ---

const AuthGuard: React.FC<{ children: (user: any) => React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [authMode, setAuthMode] = useState<'selection' | 'login' | 'register' | 'otp'>('selection');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        // Ensure user profile exists in Firestore
        const userRef = doc(db, 'users', u.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          const newUser: UserProfile = {
            uid: u.uid,
            displayName: u.displayName || 'Anonymous Beast Master',
            photoURL: u.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.uid}`,
            totalXP: 0,
            streak: 0,
            lastStudyDate: new Date().toISOString(),
            settings: {
              theme: 'cyber-dark',
              soundEnabled: true,
              vibrationEnabled: true,
              aiEnabled: true,
              notificationsEnabled: true,
              bgmVolume: 0.5
            }
          };
          await setDoc(userRef, newUser);
        }
      }
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGuestLogin = () => {
    setIsGuest(true);
    setUser({
      uid: 'guest-user',
      displayName: '游客大师',
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest',
      email: 'guest@example.com'
    });
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAuthMode('otp');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOTPAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);
    try {
      // 1. Verify OTP with backend
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // 2. Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: email.split('@')[0],
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#151619] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#F27D26] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#151619] flex flex-col items-center justify-center p-6 text-white font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-8"
        >
          <div className="text-center">
            <div className="relative inline-block">
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="text-8xl mb-4"
              >
                🐉
              </motion.div>
              <div className="absolute -top-2 -right-2 bg-[#F27D26] text-black text-xs font-bold px-2 py-1 rounded-full uppercase tracking-widest">
                Beta
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-5xl font-black tracking-tighter uppercase italic">StudyBeast</h1>
              <p className="text-gray-400 text-lg">把学习变成养成游戏。你的小兽正在等待觉醒。</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {authMode === 'selection' && (
              <motion.div 
                key="selection"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <button 
                  onClick={handleGoogleLogin}
                  className="w-full py-4 bg-white text-black font-bold text-lg rounded-xl hover:bg-[#F27D26] hover:text-white transition-all flex items-center justify-center gap-3 shadow-[0_4px_0_rgb(0,0,0,0.2)]"
                >
                  <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="" />
                  使用 Google 登录
                </button>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setAuthMode('login')}
                    className="flex-1 py-4 bg-[#1C1D21] border border-white/10 text-white font-bold rounded-xl hover:border-[#F27D26] transition-all"
                  >
                    账号登录
                  </button>
                  <button 
                    onClick={() => setAuthMode('register')}
                    className="flex-1 py-4 bg-[#1C1D21] border border-white/10 text-white font-bold rounded-xl hover:border-[#F27D26] transition-all"
                  >
                    注册新账号
                  </button>
                </div>
                <button 
                  onClick={handleGuestLogin}
                  className="w-full py-4 bg-white/5 border border-white/10 text-gray-400 font-bold rounded-xl hover:text-white hover:border-white/20 transition-all"
                >
                  以游客身份体验 (不保存云端进度)
                </button>
              </motion.div>
            )}

            {authMode === 'login' && (
              <motion.form 
                key="login"
                onSubmit={handleEmailLogin}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Email</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#1C1D21] border border-white/10 rounded-xl p-4 focus:border-[#F27D26] outline-none transition-all"
                    placeholder="your@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Password</label>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#1C1D21] border border-white/10 rounded-xl p-4 focus:border-[#F27D26] outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
                {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
                <button 
                  disabled={isProcessing}
                  className="w-full py-4 bg-[#F27D26] text-black font-bold text-lg rounded-xl hover:bg-white transition-all disabled:opacity-50"
                >
                  {isProcessing ? '登录中...' : '立即登录'}
                </button>
                <button 
                  type="button"
                  onClick={() => setAuthMode('selection')}
                  className="w-full text-xs text-gray-500 hover:text-white transition-colors"
                >
                  返回选择
                </button>
              </motion.form>
            )}

            {authMode === 'register' && (
              <motion.form 
                key="register"
                onSubmit={handleSendOTP}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Email</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#1C1D21] border border-white/10 rounded-xl p-4 focus:border-[#F27D26] outline-none transition-all"
                    placeholder="your@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Password</label>
                  <input 
                    type="password" 
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#1C1D21] border border-white/10 rounded-xl p-4 focus:border-[#F27D26] outline-none transition-all"
                    placeholder="至少6位字符"
                  />
                </div>
                {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
                <button 
                  disabled={isProcessing}
                  className="w-full py-4 bg-[#F27D26] text-black font-bold text-lg rounded-xl hover:bg-white transition-all disabled:opacity-50"
                >
                  {isProcessing ? '发送中...' : '发送验证码'}
                </button>
                <button 
                  type="button"
                  onClick={() => setAuthMode('selection')}
                  className="w-full text-xs text-gray-500 hover:text-white transition-colors"
                >
                  返回选择
                </button>
              </motion.form>
            )}

            {authMode === 'otp' && (
              <motion.form 
                key="otp"
                onSubmit={handleVerifyOTPAndRegister}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold">输入验证码</h3>
                  <p className="text-xs text-gray-500">验证码已发送至 {email}</p>
                  <p className="text-[10px] text-[#F27D26] font-mono">(Demo: 请查看服务器终端日志获取验证码)</p>
                </div>
                <input 
                  type="text" 
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full bg-[#1C1D21] border border-white/10 rounded-xl p-4 text-center text-2xl font-black tracking-[0.5em] focus:border-[#F27D26] outline-none transition-all"
                  placeholder="000000"
                />
                {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
                <button 
                  disabled={isProcessing}
                  className="w-full py-4 bg-[#F27D26] text-black font-bold text-lg rounded-xl hover:bg-white transition-all disabled:opacity-50"
                >
                  {isProcessing ? '验证中...' : '完成注册'}
                </button>
                <button 
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="w-full text-xs text-gray-500 hover:text-white transition-colors"
                >
                  重新发送
                </button>
              </motion.form>
            )}
          </AnimatePresence>
          
          <p className="text-xs text-gray-500 uppercase tracking-widest text-center">Powered by Google AI Studio & Firebase</p>
        </motion.div>
      </div>
    );
  }

  return <>{children(user)}</>;
};

const SUBJECT_LABELS: Record<Subject, string> = {
  math: '数学 (Math)',
  english: '英语 (English)',
  chinese: '语文 (Chinese)',
  physics: '物理 (Physics)',
  chemistry: '化学 (Chemistry)',
  biology: '生物 (Biology)',
  politics: '政治 (Politics)',
  history: '历史 (History)',
  geography: '地理 (Geography)'
};

const BeastCard: React.FC<{ beast: Beast; onSelect: () => void; onPet: (e: React.MouseEvent) => void; onOpenSkills: () => void }> = ({ beast, onSelect, onPet, onOpenSkills }) => {
  const stage = getBeastStage(beast.subject, beast.level);
  const nextStageLevel = getNextStageLevel(beast.subject, beast.level);
  const xpToNextLevel = calculateLevelXP(beast.level);
  const progress = (beast.xp / xpToNextLevel) * 100;

  // Mood status
  const getMoodStatus = (mood: number) => {
    if (mood >= 80) return { label: '兴奋', color: 'text-green-400', glow: 'shadow-[0_0_15px_rgba(74,222,128,0.3)]' };
    if (mood >= 50) return { label: '开心', color: 'text-blue-400', glow: '' };
    if (mood >= 20) return { label: '疲惫', color: 'text-yellow-400', glow: '' };
    return { label: '睡觉', color: 'text-red-400', glow: '' };
  };

  const moodStatus = getMoodStatus(beast.mood);

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      onClick={onSelect}
      className={cn(
        "bg-[#1C1D21] border border-white/10 rounded-2xl p-5 cursor-pointer group hover:border-[#F27D26]/50 transition-all relative overflow-hidden",
        moodStatus.glow
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#F27D26] mb-1 block">
            {SUBJECT_LABELS[beast.subject]}
          </span>
          <h3 className="text-xl font-bold text-white leading-tight">{stage.name}</h3>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="bg-white/5 px-2 py-1 rounded text-[10px] font-mono text-gray-400">
            LV.{beast.level}
          </div>
          {beast.level >= 5 && (
            <button 
              onClick={(e) => { e.stopPropagation(); onOpenSkills(); }}
              className="bg-[#F27D26]/10 p-2 rounded-xl text-[#F27D26] hover:bg-[#F27D26] hover:text-black transition-all flex items-center gap-1 group/skill relative"
              title="技能进化树 Skill Tree"
            >
              <Zap size={14} fill={beast.skillPoints > 0 ? "currentColor" : "none"} />
              {beast.skillPoints > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#1C1D21]" />}
            </button>
          )}
        </div>
      </div>

      <div 
        className="h-32 flex items-center justify-center text-6xl mb-6 group-hover:scale-110 transition-transform relative"
        onClick={(e) => {
          e.stopPropagation();
          onPet(e);
        }}
      >
        <motion.div
          animate={beast.mood >= 80 ? {
            scale: [1, 1.05, 1],
            rotate: [0, 2, -2, 0]
          } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          {stage.visual}
        </motion.div>
        {/* Petting Hint */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white/70">
            抚摸
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-mono text-gray-500 uppercase">
          <span>XP Progress</span>
          <span>{beast.xp} / {xpToNextLevel}</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-[#F27D26]"
          />
        </div>
        <div className="flex justify-between items-center">
          {nextStageLevel ? (
            <p className="text-[9px] text-gray-600 uppercase tracking-tighter">
              Next Evolution at LV.{nextStageLevel}
            </p>
          ) : <div />}
          <div className="flex items-center gap-1">
            <Heart size={10} className={cn(beast.mood < 20 ? "text-red-500" : "text-gray-600")} />
            <span className="text-[9px] font-mono text-gray-600">{beast.mood}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Dashboard: React.FC<{ user: any }> = ({ user }) => {
  const isGuest = user.uid === 'guest-user';
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [beasts, setBeasts] = useState<Beast[]>([]);
  const [wrongQuestions, setWrongQuestions] = useState<WrongQuestion[]>([]);
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([]);
  const [unlockedAchievement, setUnlockedAchievement] = useState<AchievementDef | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedBeast, setSelectedBeast] = useState<Beast | null>(null);
  const [isStudying, setIsStudying] = useState(false);
  const [filterSubject, setFilterSubject] = useState<Subject | 'all'>('all');
  const [studyDifficulty, setStudyDifficulty] = useState<StudyDifficulty>('normal');
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [showSkillTree, setShowSkillTree] = useState(false);
  const [isChallengingMistakes, setIsChallengingMistakes] = useState(false);
  const [evolutionData, setEvolutionData] = useState<{ oldStage: BeastStage; newStage: BeastStage } | null>(null);
  const [activeTab, setActiveTab] = useState<'beasts' | 'mistakes' | 'goals' | 'leaderboard' | 'settings' | 'world' | 'achievements' | 'profile'>('beasts');
  const [theme, setTheme] = useState<"cyber-dark" | "study-light" | "neon" | "nature" | "anime">('cyber-dark');
  const [bgmVolume, setBgmVolume] = useState<number>(0.5);
  const [currentAIMessage, setCurrentAIMessage] = useState<string>("主人，今天也要一起努力学习哦！");
  const [isAILoading, setIsAILoading] = useState(false);
  const [isCompanionOpen, setIsCompanionOpen] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showReminder, setShowReminder] = useState<Reminder | null>(null);

  const handleUpdateSettings = async (updates: Partial<UserSettings>) => {
    if (!profile) return;
    const newSettings = { 
      theme: 'cyber-dark',
      soundEnabled: true,
      vibrationEnabled: true,
      aiEnabled: true,
      notificationsEnabled: true,
      bgmVolume: 0.5,
      ...profile.settings, 
      ...updates 
    };
    
    const updatedProfile = { ...profile, settings: newSettings };
    setProfile(updatedProfile);
    if (updates.theme) setTheme(updates.theme);
    if (updates.bgmVolume !== undefined) setBgmVolume(updates.bgmVolume);

    if (isGuest) {
      localStorage.setItem('guest_profile', JSON.stringify(updatedProfile));
    } else {
      await updateDoc(doc(db, 'users', user.uid), { settings: newSettings });
    }
  };

  const checkAchievements = async (type: 'study' | 'beast' | 'streak', value?: number) => {
    if (!user || isGuest) return;

    for (const def of ACHIEVEMENTS) {
      const current = userAchievements.find(a => a.id === def.id);
      if (current?.completed) continue;

      let progress = current?.progress || 0;
      let isCompleted = false;

      if (def.id === 'first_beast' && beasts.length >= 1) isCompleted = true;
      if (def.id === 'study_novice' && profile && profile.totalXP >= 1000) isCompleted = true;
      if (def.id === 'study_expert' && profile && profile.totalXP >= 10000) isCompleted = true;
      if (def.id === 'streak_7' && profile && profile.streak >= 7) isCompleted = true;
      if (def.id === 'streak_30' && profile && profile.streak >= 30) isCompleted = true;
      if (def.id === 'beast_master' && beasts.some(b => b.level >= 10)) isCompleted = true;
      if (def.id === 'all_subjects' && beasts.length >= 9) isCompleted = true;
      if (def.id === 'perfect_accuracy' && type === 'study' && value === 1) isCompleted = true;

      // Update progress if not completed
      if (!isCompleted) {
        if (def.id === 'study_novice' || def.id === 'study_expert') progress = profile?.totalXP || 0;
        if (def.id === 'streak_7' || def.id === 'streak_30') progress = profile?.streak || 0;
        if (def.id === 'all_subjects') progress = beasts.length;
      }

      if (isCompleted || progress !== current?.progress) {
        const achievementData: Achievement = {
          id: def.id,
          unlockedAt: isCompleted ? new Date().toISOString() : (current?.unlockedAt || ''),
          progress: isCompleted ? def.targetValue : progress,
          completed: isCompleted
        };
        
        await setDoc(doc(db, 'users', user.uid, 'achievements', def.id), achievementData);
        
        if (isCompleted && !current?.completed) {
          setUnlockedAchievement(def);
        }
      }
    }
  };

  // Check achievements on state changes
  useEffect(() => {
    if (profile && beasts.length > 0) {
      checkAchievements('beast');
    }
  }, [profile?.totalXP, profile?.streak, beasts.length]);

  useEffect(() => {
    if (isGuest) {
      // Load from localStorage
      const savedProfile = localStorage.getItem('guest_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setProfile(parsed);
        if (parsed.settings) {
          setTheme(parsed.settings.theme || 'cyber-dark');
          setBgmVolume(parsed.settings.bgmVolume ?? 0.5);
        }
      } else {
        const initialProfile: UserProfile = {
          uid: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL,
          totalXP: 0,
          streak: 0,
          lastStudyDate: new Date().toISOString(),
          settings: {
            theme: 'cyber-dark',
            soundEnabled: true,
            vibrationEnabled: true,
            aiEnabled: true,
            notificationsEnabled: true,
            bgmVolume: 0.5
          }
        };
        setProfile(initialProfile);
        setTheme('cyber-dark');
        setBgmVolume(0.5);
        localStorage.setItem('guest_profile', JSON.stringify(initialProfile));
      }

      const savedBeasts = localStorage.getItem('guest_beasts');
      if (savedBeasts) {
        setBeasts(JSON.parse(savedBeasts));
      } else {
        const initialBeasts: Beast[] = [
          { id: 'math-beast', subject: 'math', level: 1, xp: 0, stage: 1, mood: 100, lastInteraction: new Date().toISOString() },
          { id: 'english-beast', subject: 'english', level: 1, xp: 0, stage: 1, mood: 100, lastInteraction: new Date().toISOString() },
          { id: 'chinese-beast', subject: 'chinese', level: 1, xp: 0, stage: 1, mood: 100, lastInteraction: new Date().toISOString() },
          { id: 'physics-beast', subject: 'physics', level: 1, xp: 0, stage: 1, mood: 100, lastInteraction: new Date().toISOString() },
          { id: 'chemistry-beast', subject: 'chemistry', level: 1, xp: 0, stage: 1, mood: 100, lastInteraction: new Date().toISOString() },
          { id: 'biology-beast', subject: 'biology', level: 1, xp: 0, stage: 1, mood: 100, lastInteraction: new Date().toISOString() },
          { id: 'politics-beast', subject: 'politics', level: 1, xp: 0, stage: 1, mood: 100, lastInteraction: new Date().toISOString() },
          { id: 'history-beast', subject: 'history', level: 1, xp: 0, stage: 1, mood: 100, lastInteraction: new Date().toISOString() },
          { id: 'geography-beast', subject: 'geography', level: 1, xp: 0, stage: 1, mood: 100, lastInteraction: new Date().toISOString() }
        ];
        setBeasts(initialBeasts);
        localStorage.setItem('guest_beasts', JSON.stringify(initialBeasts));
      }

      const savedMistakes = localStorage.getItem('guest_mistakes');
      if (savedMistakes) {
        setWrongQuestions(JSON.parse(savedMistakes));
      }
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    const unsubProfile = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setProfile(data);
        if (data.settings) {
          setTheme(data.settings.theme || 'cyber-dark');
          setBgmVolume(data.settings.bgmVolume ?? 0.5);
        }
      }
    });

    const beastsRef = collection(db, 'users', user.uid, 'beasts');
    const unsubBeasts = onSnapshot(beastsRef, (snap) => {
      const bList = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Beast));
      setBeasts(bList);
      
      // Initialize default beasts if none exist
      if (snap.empty) {
        const initialBeasts: Beast[] = [
          { id: 'math-beast', subject: 'math', level: 1, xp: 0, stage: 1, mood: 100, lastInteraction: new Date().toISOString() },
          { id: 'english-beast', subject: 'english', level: 1, xp: 0, stage: 1, mood: 100, lastInteraction: new Date().toISOString() },
          { id: 'chinese-beast', subject: 'chinese', level: 1, xp: 0, stage: 1, mood: 100, lastInteraction: new Date().toISOString() },
          { id: 'physics-beast', subject: 'physics', level: 1, xp: 0, stage: 1, mood: 100, lastInteraction: new Date().toISOString() },
          { id: 'chemistry-beast', subject: 'chemistry', level: 1, xp: 0, stage: 1, mood: 100, lastInteraction: new Date().toISOString() },
          { id: 'biology-beast', subject: 'biology', level: 1, xp: 0, stage: 1, mood: 100, lastInteraction: new Date().toISOString() },
          { id: 'politics-beast', subject: 'politics', level: 1, xp: 0, stage: 1, mood: 100, lastInteraction: new Date().toISOString() },
          { id: 'history-beast', subject: 'history', level: 1, xp: 0, stage: 1, mood: 100, lastInteraction: new Date().toISOString() },
          { id: 'geography-beast', subject: 'geography', level: 1, xp: 0, stage: 1, mood: 100, lastInteraction: new Date().toISOString() }
        ];
        initialBeasts.forEach(b => setDoc(doc(beastsRef, b.id), b));
      }
    });

    const mistakesRef = collection(db, 'users', user.uid, 'wrongQuestions');
    const unsubMistakes = onSnapshot(mistakesRef, (snap) => {
      const mList = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as WrongQuestion));
      setWrongQuestions(mList);
    });

    const goalsRef = collection(db, 'users', user.uid, 'goals');
    const unsubGoals = onSnapshot(goalsRef, (snap) => {
      const gList = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Goal));
      setGoals(gList);
      
      if (snap.empty) {
        const initialGoals: Goal[] = [
          { id: 'g1', userId: user.uid, type: 'daily', title: '今日学习', targetValue: 1, progress: 0, deadline: new Date().toISOString(), completed: false },
          { id: 'g2', userId: user.uid, type: 'daily', title: '获得 50 XP', targetValue: 50, progress: 0, deadline: new Date().toISOString(), completed: false }
        ];
        initialGoals.forEach(g => setDoc(doc(goalsRef, g.id), g));
      }
    });

    const leaderboardRef = collection(db, 'leaderboards');
    const unsubLeaderboard = onSnapshot(leaderboardRef, (snap) => {
      const lList = snap.docs.map(doc => ({ ...doc.data() } as LeaderboardEntry));
      setLeaderboard(lList.sort((a, b) => b.xp - a.xp));
      
      if (snap.empty) {
        const mockData: LeaderboardEntry[] = [
          { userId: 'u1', displayName: 'StudyKing', xp: 5000, streak: 15, rank: 1, photoURL: '', period: 'all-time' },
          { userId: 'u2', displayName: 'MathWizard', xp: 4200, streak: 10, rank: 2, photoURL: '', period: 'all-time' },
          { userId: 'u3', displayName: 'EnglishPro', xp: 3800, streak: 7, rank: 3, photoURL: '', period: 'all-time' }
        ];
        mockData.forEach(l => setDoc(doc(leaderboardRef, l.userId), l));
      }
    });

    const remindersRef = collection(db, 'users', user.uid, 'reminders');
    const unsubReminders = onSnapshot(remindersRef, (snap) => {
      const rList = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Reminder));
      setReminders(rList);
      
      if (snap.empty) {
        const initialReminder: Reminder = {
          id: 'r1', userId: user.uid, type: 'fixed', time: '20:00', enabled: true, repeat: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        };
        setDoc(doc(remindersRef, initialReminder.id), initialReminder);
      }
    });

    const achievementsRef = collection(db, 'users', user.uid, 'achievements');
    const unsubAchievements = onSnapshot(achievementsRef, (snap) => {
      setUserAchievements(snap.docs.map(d => d.data() as Achievement));
    });

    return () => {
      unsubProfile();
      unsubBeasts();
      unsubMistakes();
      unsubGoals();
      unsubLeaderboard();
      unsubReminders();
      unsubAchievements();
    };
  }, [user.uid, isGuest]);

  // Reminder check
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      reminders.forEach(r => {
        if (r.enabled && r.time === currentTime && !showReminder) {
          setShowReminder(r);
          // Auto hide after 10s
          setTimeout(() => setShowReminder(null), 10000);
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [reminders, showReminder]);

  // Mood & Streak logic on login
  useEffect(() => {
    if (!profile || !user) return;

    const checkDailyStatus = async () => {
      const now = new Date();
      const lastDateStr = profile.lastStudyDate;
      const lastDate = lastDateStr ? new Date(lastDateStr) : null;
      
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // 连续登录 bonus (if first login today)
      const lastLoginStr = localStorage.getItem(`last_login_${user.uid}`);
      if (lastLoginStr !== today.toDateString()) {
        const moodBonus = 3;
        const updatedBeasts = beasts.map(b => ({
          ...b,
          mood: Math.min(100, b.mood + moodBonus)
        }));

        if (isGuest) {
          setBeasts(updatedBeasts);
          localStorage.setItem('guest_beasts', JSON.stringify(updatedBeasts));
        } else {
          for (const b of beasts) {
            await updateDoc(doc(db, 'users', user.uid, 'beasts', b.id), {
              mood: Math.min(100, b.mood + moodBonus)
            });
          }
        }
        localStorage.setItem(`last_login_${user.uid}`, today.toDateString());
      }

      if (!lastDate) return;

      const last = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
      const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

      // 48h未学习 penalty
      if (diffDays >= 2) {
        const moodPenalty = 10;
        const updatedBeasts = beasts.map(b => ({
          ...b,
          mood: Math.max(0, b.mood - moodPenalty)
        }));
        
        if (isGuest) {
          setBeasts(updatedBeasts);
          localStorage.setItem('guest_beasts', JSON.stringify(updatedBeasts));
        } else {
          for (const b of beasts) {
            await updateDoc(doc(db, 'users', user.uid, 'beasts', b.id), {
              mood: Math.max(0, b.mood - moodPenalty)
            });
          }
        }
      }
    };

    checkDailyStatus();
  }, [profile?.uid]);

  const calculateNewStreak = (lastDateStr: string, currentStreak: number) => {
    if (!lastDateStr) return 1;
    const now = new Date();
    const lastDate = new Date(lastDateStr);
    
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
    const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return currentStreak;
    if (diffDays === 1) return currentStreak + 1;
    if (diffDays === 2) return currentStreak; // 保留
    return Math.floor(currentStreak / 2) || 1;
  };

  const handlePetBeast = async (beast: Beast) => {
    const newMood = Math.min(100, beast.mood + 2);
    const updatedBeasts = beasts.map(b => b.id === beast.id ? { ...b, mood: newMood } : b);
    
    if (isGuest) {
      setBeasts(updatedBeasts);
      localStorage.setItem('guest_beasts', JSON.stringify(updatedBeasts));
    } else {
      await updateDoc(doc(db, 'users', user.uid, 'beasts', beast.id), {
        mood: newMood
      });
    }

    // Trigger AI response
    generateBeastMessage('被抚摸', { mood: newMood });
  };

  const generateBeastMessage = async (event: string, context?: any) => {
    if (!selectedBeast) return;
    setIsAILoading(true);
    try {
      const stage = getBeastStage(selectedBeast.subject, selectedBeast.level);
      const prompt = `
        你是一只名为 ${stage.name} 的学习灵兽。
        你的学科是 ${SUBJECT_LABELS[selectedBeast.subject]}。
        当前等级: ${selectedBeast.level}，心情: ${selectedBeast.mood}。
        
        当前发生的事件: ${event}
        ${context ? `上下文信息: ${JSON.stringify(context)}` : ''}
        
        请以你的角色身份，给主人说一句话。
        要求: 
        1. 语气符合你的学科特色和当前心情。
        2. 简短有力，富有情感。
        3. 如果是学习完成，给予鼓励；如果是被抚摸，给予亲昵的回应。
        4. 不要使用任何标记，直接输出对话内容。
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      
      setCurrentAIMessage(response.text || "");
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsAILoading(false);
    }
  };

  const handleStudyComplete = async (xpEarned: number, accuracy: number, newWrongQuestions: Question[]) => {
    setIsStudying(false);
    setShowDifficultyModal(false);
    if (!selectedBeast || !profile) return;

    let newXP = selectedBeast.xp + xpEarned;
    let newLevel = selectedBeast.level;
    let xpToNext = calculateLevelXP(newLevel);

    const oldStage = getBeastStage(selectedBeast.subject, selectedBeast.level);

    let newSkillPoints = selectedBeast.skillPoints || 0;

    // Level up logic
    while (newXP >= xpToNext) {
      newXP -= xpToNext;
      newLevel += 1;
      if (newLevel % 5 === 0) newSkillPoints += 1;
      xpToNext = calculateLevelXP(newLevel);
    }

    const newStage = getBeastStage(selectedBeast.subject, newLevel);
    const newStreak = calculateNewStreak(profile.lastStudyDate, profile.streak);
    const newMood = Math.min(100, selectedBeast.mood + 5);

    // Update goals
    const updatedGoals = goals.map(g => {
      if (g.completed) return g;
      let newProgress = g.progress;
      if (g.title === '今日学习') newProgress += 1;
      if (g.title === '获得 50 XP') newProgress += xpEarned;
      
      const completed = newProgress >= g.targetValue;
      return { ...g, progress: newProgress, completed };
    });

    // Check for evolution
    if (newStage.stage > oldStage.stage) {
      setEvolutionData({ oldStage, newStage });
    }

    // Check achievements
    checkAchievements('study', accuracy);

    if (isGuest) {
      const updatedBeasts = beasts.map(b => 
        b.id === selectedBeast.id 
          ? { ...b, xp: newXP, level: newLevel, stage: newStage.stage, mood: newMood, skillPoints: newSkillPoints, lastInteraction: new Date().toISOString() }
          : b
      );
      setBeasts(updatedBeasts);
      localStorage.setItem('guest_beasts', JSON.stringify(updatedBeasts));

      const updatedProfile = {
        ...profile,
        totalXP: profile.totalXP + xpEarned,
        streak: newStreak,
        lastStudyDate: new Date().toISOString()
      };
      setProfile(updatedProfile);
      localStorage.setItem('guest_profile', JSON.stringify(updatedProfile));

      setGoals(updatedGoals);
      localStorage.setItem('guest_goals', JSON.stringify(updatedGoals));

      // Save wrong questions
      const currentMistakes = [...wrongQuestions];
      newWrongQuestions.forEach(q => {
        if (!currentMistakes.find(m => m.id === q.id)) {
          currentMistakes.push({ ...q, subject: selectedBeast.subject, addedAt: new Date().toISOString() });
        }
      });
      setWrongQuestions(currentMistakes);
      localStorage.setItem('guest_mistakes', JSON.stringify(currentMistakes));
      
      setIsStudying(false);
      return;
    }

    const beastRef = doc(db, 'users', user.uid, 'beasts', selectedBeast.id);
    const userRef = doc(db, 'users', user.uid);

    await updateDoc(beastRef, {
      xp: newXP,
      level: newLevel,
      stage: newStage.stage,
      mood: newMood,
      skillPoints: newSkillPoints,
      lastInteraction: new Date().toISOString()
    });

    await updateDoc(userRef, {
      totalXP: profile.totalXP + xpEarned,
      streak: newStreak,
      lastStudyDate: new Date().toISOString()
    });

    // Update goals in Firestore
    for (const g of updatedGoals) {
      await updateDoc(doc(db, 'users', user.uid, 'goals', g.id), {
        progress: g.progress,
        completed: g.completed
      });
    }

    // Save wrong questions to Firestore
    const mistakesRef = collection(db, 'users', user.uid, 'wrongQuestions');
    for (const q of newWrongQuestions) {
      await setDoc(doc(mistakesRef, q.id), {
        ...q,
        subject: selectedBeast.subject,
        addedAt: new Date().toISOString()
      });
    }

    // Log session
    await addDoc(collection(db, 'users', user.uid, 'studySessions'), {
      subject: selectedBeast.subject,
      xpEarned,
      accuracy,
      timestamp: new Date().toISOString(),
      duration: 0 // Mock duration
    });

    generateBeastMessage('学习完成', { xpEarned, accuracy });

    setIsStudying(false);
  };

  const handleMistakeChallengeComplete = async (xpEarned: number, accuracy: number, remainingWrong: Question[]) => {
    if (!profile) return;

    if (isGuest) {
      const updatedProfile = {
        ...profile,
        totalXP: profile.totalXP + xpEarned,
        lastStudyDate: new Date().toISOString()
      };
      setProfile(updatedProfile);
      localStorage.setItem('guest_profile', JSON.stringify(updatedProfile));

      // Update mistakes: remove those that were answered correctly
      // remainingWrong contains questions still answered incorrectly
      setWrongQuestions(remainingWrong as WrongQuestion[]);
      localStorage.setItem('guest_mistakes', JSON.stringify(remainingWrong));
      
      setIsChallengingMistakes(false);
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      totalXP: profile.totalXP + xpEarned,
      lastStudyDate: new Date().toISOString()
    });

    // Remove correctly answered questions from Firestore
    const mistakesRef = collection(db, 'users', user.uid, 'wrongQuestions');
    const solvedIds = wrongQuestions
      .filter(mq => !remainingWrong.find(rq => rq.id === mq.id))
      .map(mq => mq.id);
    
    for (const id of solvedIds) {
      await deleteDoc(doc(mistakesRef, id));
    }

    setIsChallengingMistakes(false);
  };

  const handleLogout = () => {
    if (isGuest) {
      window.location.reload(); // Simple way to reset guest state
    } else {
      signOut(auth);
    }
  };

  const THEME_CLASSES: Record<string, string> = {
    'cyber-dark': 'bg-[#151619] text-white',
    'study-light': 'bg-[#F5F7FA] text-gray-900',
    'neon': 'bg-[#0A0A0A] text-[#00FF00]',
    'nature': 'bg-[#F0F4F0] text-[#2D5A27]',
    'anime': 'bg-[#FFF0F5] text-[#FF69B4]'
  };

  const handleUnlockSkill = async (skillId: string) => {
    if (!selectedBeast || !profile || (selectedBeast.skillPoints || 0) <= 0) return;
    
    const subjectSkills = BEAST_SKILLS[selectedBeast.subject] || [];
    const skill = subjectSkills.find(s => s.id === skillId);
    if (!skill) return;

    const currentSkills = selectedBeast.skills || [];
    const newSkills = [
      ...currentSkills.filter(s => s.id !== skillId),
      { ...skill, unlocked: true }
    ];
    
    const newSkillPoints = selectedBeast.skillPoints - 1;

    if (isGuest) {
      const updatedBeasts = beasts.map(b => b.id === selectedBeast.id ? { ...b, skills: newSkills, skillPoints: newSkillPoints } : b);
      setBeasts(updatedBeasts);
      localStorage.setItem('guest_beasts', JSON.stringify(updatedBeasts));
    } else {
      const beastRef = doc(db, 'users', user.uid, 'beasts', selectedBeast.id);
      await updateDoc(beastRef, { skills: newSkills, skillPoints: newSkillPoints });
    }
    
    setSelectedBeast({ ...selectedBeast, skills: newSkills, skillPoints: newSkillPoints });
  };

  const handleShareAchievement = async () => {
    if (!selectedBeast) return;
    const stage = getBeastStage(selectedBeast.subject, selectedBeast.level);
    const text = `训练成果展示：我的灵兽 【${stage.name}】 已达到 LV.${selectedBeast.level}！在 Beast Study 跟我和灵兽一起变强吧！`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Beast Study 灵兽进化展示',
          text: text,
          url: window.location.href
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      await navigator.clipboard.writeText(text);
      setCurrentAIMessage("已复制分享文案到剪贴板，快去发给小伙伴吧！ ✨");
      setTimeout(() => generateBeastMessage('空闲'), 3000);
    }
  };

  return (
    <div className={cn("min-h-screen font-sans selection:bg-[#F27D26] selection:text-white transition-colors duration-500", THEME_CLASSES[theme] || THEME_CLASSES['cyber-dark'])}>
      {/* Sidebar / Navigation */}
      <nav className="fixed left-0 top-0 bottom-0 w-20 bg-[#1C1D21] border-r border-white/5 flex flex-col items-center py-8 gap-8 z-40 hidden md:flex">
        <button 
          onClick={() => setActiveTab('beasts')}
          className="text-2xl font-black italic text-[#F27D26] hover:scale-110 transition-transform"
        >
          SB
        </button>
        <div className="flex-1 flex flex-col gap-6">
          <button 
            onClick={() => setActiveTab('beasts')}
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
              activeTab === 'beasts' ? "bg-[#F27D26] text-black shadow-lg shadow-[#F27D26]/20" : "bg-white/5 text-gray-500 hover:text-white hover:bg-white/10"
            )}
          >
            <Home size={20} />
          </button>
          <button 
            onClick={() => setActiveTab('mistakes')}
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
              activeTab === 'mistakes' ? "bg-[#F27D26] text-black shadow-lg shadow-[#F27D26]/20" : "bg-white/5 text-gray-500 hover:text-white hover:bg-white/10"
            )}
          >
            <BookOpen size={20} />
          </button>
          <button 
            onClick={() => setActiveTab('goals')}
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
              activeTab === 'goals' ? "bg-[#F27D26] text-black shadow-lg shadow-[#F27D26]/20" : "bg-white/5 text-gray-500 hover:text-white hover:bg-white/10"
            )}
          >
            <TrendingUp size={20} />
          </button>
          <button 
            onClick={() => setActiveTab('world')}
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
              activeTab === 'world' ? "bg-[#F27D26] text-black shadow-lg shadow-[#F27D26]/20" : "bg-white/5 text-gray-500 hover:text-white hover:bg-white/10"
            )}
          >
            <Globe size={20} />
          </button>
          <button 
            onClick={() => setActiveTab('leaderboard')}
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
              activeTab === 'leaderboard' ? "bg-[#F27D26] text-black shadow-lg shadow-[#F27D26]/20" : "bg-white/5 text-gray-500 hover:text-white hover:bg-white/10"
            )}
          >
            <Trophy size={20} />
          </button>
          <button 
            onClick={() => setActiveTab('achievements')}
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
              activeTab === 'achievements' ? "bg-[#F27D26] text-black shadow-lg shadow-[#F27D26]/20" : "bg-white/5 text-gray-500 hover:text-white hover:bg-white/10"
            )}
          >
            <Award size={20} />
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
              activeTab === 'settings' ? "bg-[#F27D26] text-black shadow-lg shadow-[#F27D26]/20" : "bg-white/5 text-gray-500 hover:text-white hover:bg-white/10"
            )}
          >
            <Settings size={20} />
          </button>
        </div>
        <button onClick={handleLogout} className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all">
          <LogOut size={20} />
        </button>
      </nav>

      {/* Main Content */}
      <main className="md:pl-20 min-h-screen">
        {/* Reminder Notification & Modals */}
        <AnimatePresence>
          {showReminder && (
            <motion.div 
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="fixed top-10 right-10 z-50 bg-[#F27D26] text-black p-6 rounded-2xl shadow-2xl flex items-center gap-4 border-4 border-white/20"
            >
              <div className="bg-white/20 p-3 rounded-full">
                <Bell size={24} />
              </div>
              <div>
                <div className="font-black uppercase italic text-sm">学习提醒</div>
                <div className="font-bold">该学习啦，主人！</div>
              </div>
              <button onClick={() => setShowReminder(null)} className="ml-4 hover:opacity-50">
                <X size={20} />
              </button>
            </motion.div>
          )}

          {isStudying && selectedBeast && (
            <StudyBattle 
              beast={selectedBeast} 
              difficulty={studyDifficulty}
              onComplete={handleStudyComplete}
              onCancel={() => setIsStudying(false)}
            />
          )}

          {isChallengingMistakes && (
            <StudyBattle 
              beast={{ subject: 'chinese', level: 1, xp: 0, stage: 1, mood: 100, lastInteraction: '', id: 'mistake-challenge' }} 
              difficulty={studyDifficulty}
              onComplete={handleMistakeChallengeComplete}
              onCancel={() => setIsChallengingMistakes(false)}
              customQuestions={wrongQuestions}
            />
          )}
        </AnimatePresence>

        {/* AI Companion */}
        <AnimatePresence>
          {isCompanionOpen && (selectedBeast || beasts[0]) && (
            <AICompanion 
              activeBeast={selectedBeast || beasts[0]} 
              allBeasts={beasts}
              onBeastSelect={(beast) => setSelectedBeast(beast)}
              onClose={() => setIsCompanionOpen(false)} 
            />
          )}
        </AnimatePresence>

        {/* Companion Toggle Button */}
        {!isCompanionOpen && beasts.length > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setIsCompanionOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-[#F27D26] text-black rounded-full shadow-2xl flex items-center justify-center z-[60] hover:scale-110 transition-transform"
          >
            <MessageSquare size={24} />
          </motion.button>
        )}

        <header className="p-6 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col md:flex-row md:items-end gap-8">
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic mb-1">
                Beast Master <span className="text-[#F27D26]">{profile?.displayName?.split(' ')[0]}</span>
              </h1>
              <div className="flex items-center gap-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                <div className="flex items-center gap-1">
                  <Flame size={12} className="text-[#F27D26]" />
                  <span>{profile?.streak || 0} Day Streak</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={12} className="text-yellow-500" />
                  <span>{profile?.totalXP || 0} Total XP</span>
                </div>
              </div>
            </div>

            <div className="flex gap-6 border-b border-white/5 pb-1">
              <button 
                onClick={() => setActiveTab('beasts')}
                className={cn(
                  "text-sm font-bold uppercase tracking-widest transition-all pb-2 border-b-2",
                  activeTab === 'beasts' ? "text-[#F27D26] border-[#F27D26]" : "text-gray-500 border-transparent hover:text-white"
                )}
              >
                我的灵兽
              </button>
              <button 
                onClick={() => setActiveTab('mistakes')}
                className={cn(
                  "text-sm font-bold uppercase tracking-widest transition-all pb-2 border-b-2 flex items-center gap-2",
                  activeTab === 'mistakes' ? "text-[#F27D26] border-[#F27D26]" : "text-gray-500 border-transparent hover:text-white"
                )}
              >
                错题集
                {wrongQuestions.length > 0 && (
                  <span className="bg-[#F27D26] text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    {wrongQuestions.length}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setActiveTab('goals')}
                className={cn(
                  "text-sm font-bold uppercase tracking-widest transition-all pb-2 border-b-2 flex items-center gap-2",
                  activeTab === 'goals' ? "text-[#F27D26] border-[#F27D26]" : "text-gray-500 border-transparent hover:text-white"
                )}
              >
                每日目标
                {goals.filter(g => !g.completed).length > 0 && (
                  <span className="bg-[#F27D26] text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    {goals.filter(g => !g.completed).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[#1C1D21] p-2 pr-6 rounded-2xl border border-white/5">
            <img src={user.photoURL || ''} alt="" className="w-10 h-10 rounded-xl border border-white/10" />
            <div className="hidden sm:block">
              <div className="text-xs font-bold">{profile?.displayName}</div>
              <div className="text-[9px] font-mono text-gray-500 uppercase tracking-tighter">Rank: Novice Tamer</div>
            </div>
          </div>
        </header>

        <section className="px-6 md:px-10 pb-20">
          {activeTab === 'beasts' ? (
            <div className="space-y-8">
              {/* Subject Selector */}
              <div className="flex gap-2 pb-4 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setFilterSubject('all')}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-xs font-bold uppercase transition-all whitespace-nowrap",
                    filterSubject === 'all' ? "bg-[#F27D26] text-black shadow-[0_4px_0_rgb(0,0,0,0.2)]" : "bg-white/5 text-gray-500 hover:bg-white/10"
                  )}
                >
                  全部 All
                </button>
                {(Object.keys(SUBJECT_LABELS) as Subject[]).map(s => (
                  <button
                    key={s}
                    onClick={() => setFilterSubject(s)}
                    className={cn(
                      "px-6 py-2.5 rounded-xl text-xs font-bold uppercase transition-all whitespace-nowrap",
                      filterSubject === s ? "bg-[#F27D26] text-black shadow-[0_4px_0_rgb(0,0,0,0.2)]" : "bg-white/5 text-gray-500 hover:bg-white/10"
                    )}
                  >
                    {SUBJECT_LABELS[s]}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {beasts
                  .filter(b => filterSubject === 'all' || b.subject === filterSubject)
                  .map(beast => (
                <div key={beast.id} className={cn("relative transition-all duration-500", selectedBeast?.id === beast.id ? "scale-[1.02]" : "scale-100")}>
                  {selectedBeast?.id === beast.id && currentAIMessage && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 bg-white text-black p-3 rounded-2xl text-[10px] font-bold shadow-xl z-20 after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-transparent after:border-t-white"
                    >
                      {isAILoading ? '...' : currentAIMessage}
                    </motion.div>
                  )}
                  <BeastCard 
                    beast={beast} 
                    onSelect={() => {
                      if (selectedBeast?.id === beast.id) {
                        setShowDifficultyModal(true);
                      } else {
                        setSelectedBeast(beast);
                        generateBeastMessage('点击查看');
                      }
                    }} 
                    onPet={(e) => handlePetBeast(beast)}
                    onOpenSkills={() => {
                      setSelectedBeast(beast);
                      setShowSkillTree(true);
                    }}
                  />
                  {selectedBeast?.id === beast.id && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap"
                    >
                      <button 
                        onClick={() => setShowDifficultyModal(true)}
                        className="bg-[#F27D26] text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase italic shadow-[0_4px_0_rgba(0,0,0,0.2)] hover:bg-white transition-all flex items-center gap-2"
                      >
                        <Zap size={14} fill="currentColor" />
                        开始训练 Start Training
                      </button>
                    </motion.div>
                  )}
                </div>
              ))}
              
              {/* Add New Subject Placeholder */}
              <div className="border-2 border-dashed border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 opacity-50 hover:opacity-100 transition-opacity cursor-not-allowed">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                  <Settings size={24} className="text-gray-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-400">解锁新学科</h3>
                  <p className="text-xs text-gray-600">达到总等级 10 以解锁</p>
                </div>
              </div>
            </div>
          </div>
          ) : activeTab === 'mistakes' ? (
            <div className="space-y-8">
              <button 
                onClick={() => setActiveTab('beasts')}
                className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                <span>返回主界面</span>
              </button>
              <div className="bg-[#1C1D21] border border-white/5 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold">错题挑战</h3>
                  <p className="text-gray-400 max-w-md">
                    温故而知新。挑战你曾经答错的题目，彻底掌握这些知识点。
                  </p>
                </div>
                <button 
                  disabled={wrongQuestions.length === 0}
                  onClick={() => setIsChallengingMistakes(true)}
                  className="px-12 py-4 bg-[#F27D26] text-black font-bold text-xl rounded-xl hover:bg-white transition-all shadow-[0_8px_0_rgb(0,0,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  开始挑战 ({wrongQuestions.length})
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wrongQuestions.map((q) => (
                  <div key={q.id} className="bg-[#1C1D21] border border-white/5 rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-1 bg-white/5 rounded text-[10px] font-bold text-[#F27D26] uppercase">
                        {SUBJECT_LABELS[q.subject]}
                      </span>
                      <span className="text-[10px] font-mono text-gray-600">
                        Added: {new Date(q.addedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold leading-tight">{q.text}</h4>
                    <div className="p-4 bg-white/5 rounded-xl text-sm text-gray-400">
                      <span className="text-[#F27D26] font-bold mr-2">正确答案:</span>
                      {q.options[q.correctAnswer]}
                    </div>
                  </div>
                ))}
                {wrongQuestions.length === 0 && (
                  <div className="col-span-full py-20 text-center space-y-4">
                    <div className="text-6xl">✨</div>
                    <p className="text-gray-500 font-medium">太棒了！你目前没有任何错题。</p>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'world' ? (
            <div className="space-y-8">
              <button 
                onClick={() => setActiveTab('beasts')}
                className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                <span>返回主界面</span>
              </button>
              <BeastWorld beasts={beasts} volume={bgmVolume} />
            </div>
          ) : activeTab === 'leaderboard' ? (
            <div className="space-y-8">
              <button 
                onClick={() => setActiveTab('beasts')}
                className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                <span>返回主界面</span>
              </button>
              <div className="bg-[#1C1D21] border border-white/5 rounded-3xl p-8">
                <h3 className="text-3xl font-bold mb-8">全球排行榜</h3>
                <div className="space-y-4">
                  {leaderboard.map((entry, idx) => (
                    <div key={entry.userId} className={cn(
                      "flex items-center justify-between p-4 rounded-2xl border transition-all",
                      entry.userId === user.uid ? "bg-[#F27D26]/10 border-[#F27D26]/30" : "bg-white/5 border-transparent"
                    )}>
                      <div className="flex items-center gap-6">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                          idx === 0 ? "bg-yellow-500 text-black" : 
                          idx === 1 ? "bg-gray-300 text-black" : 
                          idx === 2 ? "bg-amber-600 text-white" : "bg-white/10 text-gray-400"
                        )}>
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-bold">{entry.displayName}</div>
                          <div className="text-[10px] text-gray-500 uppercase font-mono">Streak: {entry.streak} days</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-[#F27D26]">{entry.xp} XP</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab === 'achievements' ? (
            <div className="space-y-8">
              <button 
                onClick={() => setActiveTab('beasts')}
                className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                <span>返回主界面</span>
              </button>
              <AchievementSystem userAchievements={userAchievements} />
            </div>
          ) : activeTab === 'settings' ? (
            <div className="space-y-8">
              <button 
                onClick={() => setActiveTab('beasts')}
                className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                <span>返回主界面</span>
              </button>
              <div className="bg-[#1C1D21] border border-white/5 rounded-3xl p-8 space-y-12">
                <section>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Palette size={20} className="text-[#F27D26]" />
                    主题设置
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {( [
                      { id: 'cyber-dark', name: '赛博黑', color: 'bg-[#151619]' },
                      { id: 'study-light', name: '清新白', color: 'bg-white' },
                      { id: 'neon', name: '霓虹绿', color: 'bg-black border border-[#00FF00]' },
                      { id: 'nature', name: '自然绿', color: 'bg-[#F0F4F0]' },
                      { id: 'anime', name: '樱花粉', color: 'bg-[#FFF0F5]' }
                    ] as const).map(t => (
                      <button 
                        key={t.id}
                        onClick={() => handleUpdateSettings({ theme: t.id })}
                        className={cn(
                          "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3",
                          theme === t.id ? "border-[#F27D26] bg-[#F27D26]/5" : "border-white/5 hover:border-white/20"
                        )}
                      >
                        <div className={cn("w-10 h-10 rounded-full shadow-lg", t.color)} />
                        <span className="text-xs font-bold">{t.name}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Volume2 size={20} className="text-[#F27D26]" />
                    声音设置
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                      <div className="flex-1 mr-8">
                        <div className="flex justify-between mb-2">
                          <span className="font-bold">背景音乐音量</span>
                          <span className="text-xs font-mono text-[#F27D26]">{Math.round(bgmVolume * 100)}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.01" 
                          value={bgmVolume} 
                          onChange={(e) => handleUpdateSettings({ bgmVolume: parseFloat(e.target.value) })}
                          className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#F27D26]"
                        />
                      </div>
                      <Volume2 size={20} className="text-gray-500" />
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Bell size={20} className="text-[#F27D26]" />
                    通知提醒
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                      <div>
                        <div className="font-bold">学习提醒</div>
                        <div className="text-xs text-gray-500">每天固定时间提醒你学习</div>
                      </div>
                      <div className="w-12 h-6 bg-[#F27D26] rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <UserIcon size={20} className="text-[#F27D26]" />
                    账户管理
                  </h3>
                  <button 
                    onClick={handleLogout}
                    className="px-6 py-3 bg-red-500/10 text-red-500 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-all"
                  >
                    退出登录
                  </button>
                </section>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <button 
                onClick={() => setActiveTab('beasts')}
                className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                <span>返回主界面</span>
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {goals.map(goal => (
                  <div key={goal.id} className={cn(
                    "bg-[#1C1D21] border p-6 rounded-2xl transition-all",
                    goal.completed ? "border-green-500/30 bg-green-500/5" : "border-white/5"
                  )}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 block">
                          {goal.type === 'daily' ? '每日目标' : '每周目标'}
                        </span>
                        <h4 className="text-xl font-bold">{goal.title}</h4>
                      </div>
                      {goal.completed && (
                        <div className="bg-green-500 text-black p-1 rounded-full">
                          <Zap size={12} fill="currentColor" />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-gray-500">进度</span>
                        <span className={cn(goal.completed ? "text-green-400" : "text-white")}>
                          {goal.progress} / {goal.targetValue}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (goal.progress / goal.targetValue) * 100)}%` }}
                          className={cn("h-full transition-colors", goal.completed ? "bg-green-500" : "bg-[#F27D26]")}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Selected Beast Overlay */}
        <AnimatePresence>
          {selectedBeast && !isStudying && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-[#1C1D21] w-full max-w-4xl rounded-3xl overflow-hidden border border-white/10 flex flex-col md:flex-row"
              >
                <div className="md:w-1/2 p-10 bg-gradient-to-br from-[#F27D26]/20 to-transparent flex flex-col items-center justify-center text-center relative">
                  <button 
                    onClick={() => setSelectedBeast(null)}
                    className="absolute top-6 left-6 text-gray-500 hover:text-white"
                  >
                    <ChevronRight className="rotate-180" />
                  </button>
                  
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="text-[120px] mb-8"
                  >
                    {getBeastStage(selectedBeast.subject, selectedBeast.level).visual}
                  </motion.div>
                  
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-2">
                    {getBeastStage(selectedBeast.subject, selectedBeast.level).name}
                  </h2>
                  <p className="text-gray-400 text-sm max-w-xs">
                    {getBeastStage(selectedBeast.subject, selectedBeast.level).description}
                  </p>
                </div>

                <div className="md:w-1/2 p-10 space-y-8 overflow-y-auto max-h-[80vh] custom-scrollbar">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Current Level</div>
                      <div className="text-5xl font-black italic">LV.{selectedBeast.level}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Mood</div>
                      <div className="flex items-center gap-1 text-[#F27D26] font-bold">
                        <Heart size={16} fill="currentColor" />
                        <span>{selectedBeast.mood}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500">
                        <Brain size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] font-mono text-gray-500 uppercase">Intelligence</div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full mt-1">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }} />
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-500">
                        <Sword size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] font-mono text-gray-500 uppercase">Power</div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full mt-1">
                          <div className="h-full bg-orange-500 rounded-full" style={{ width: '40%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6">学习路径</h3>
                    <LearningPath 
                      beast={selectedBeast} 
                      onNodeClick={(node) => {
                        if (node.type === 'quiz') setIsStudying(true);
                      }} 
                    />
                  </div>

                  <div className="sticky bottom-0 pt-6 bg-[#1C1D21]">
                    <button 
                      onClick={() => setIsStudying(true)}
                      className="w-full py-5 bg-[#F27D26] text-black font-black text-xl rounded-2xl hover:bg-white transition-all shadow-[0_8px_0_rgb(0,0,0,0.2)] flex items-center justify-center gap-3"
                    >
                      <Sword size={24} />
                      开始学习挑战
                    </button>
                    
                    <p className="text-center text-[10px] text-gray-600 uppercase tracking-widest mt-4">
                      完成挑战可获得大量 XP 和心情值
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Study Battle Overlay */}
        {/* Consolidate: removing duplicate overlay here as it is already handled in the AnimatePresence at the top of the main content area */}

        {/* Evolution Overlay */}
        <AnimatePresence>
          {/* Skill Tree Modal */}
          <AnimatePresence>
            {showSkillTree && selectedBeast && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6 text-white">
                <SkillTree 
                  beast={selectedBeast}
                  onUnlockSkill={handleUnlockSkill}
                  onClose={() => setShowSkillTree(false)}
                />
              </div>
            )}
          </AnimatePresence>

          {/* Difficulty Selection Modal */}
          <AnimatePresence>
            {showDifficultyModal && selectedBeast && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6 text-white">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[#1C1D21] border border-white/10 rounded-3xl p-8 max-w-sm w-full space-y-8 shadow-2xl relative overflow-hidden"
                >
                   <div className="absolute top-0 left-0 w-1 h-full bg-[#F27D26]" />
                   <div className="text-center space-y-2">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-[#F27D26]/10 rounded-2xl flex items-center justify-center text-[#F27D26] animate-pulse">
                        <Zap size={32} fill="currentColor" />
                      </div>
                    </div>
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter">训练强度 Selection</h2>
                    <p className="text-xs text-gray-400 font-medium">选择合适的难度以最大化学习效率</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 text-white">
                    {[
                      { id: 'easy', name: '简单 Easy', desc: '轻松巩固基础', xp: 'x0.5 XP', color: 'hover:bg-green-500/10 hover:border-green-500/30' },
                      { id: 'normal', name: '普通 Normal', desc: '标准学习模式', xp: 'x1.0 XP', color: 'hover:bg-[#F27D26]/10 hover:border-[#F27D26]/30' },
                      { id: 'hard', name: '困难 Hard', desc: '高强度强化训练', xp: 'x2.0 XP', color: 'hover:bg-purple-500/10 hover:border-purple-500/30' },
                      { id: 'hell', name: '地狱 Hell', desc: '突破极限的试炼', xp: 'x5.0 XP', color: 'hover:bg-red-500/10 hover:border-red-500/30 font-black' }
                    ].map(d => (
                      <button
                        key={d.id}
                        onClick={() => {
                          setStudyDifficulty(d.id as any);
                          setIsStudying(true);
                          setShowDifficultyModal(false);
                        }}
                        className={cn(
                          "p-4 bg-white/5 border border-white/5 rounded-2xl text-left transition-all group flex justify-between items-center",
                          d.color
                        )}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white group-hover:text-[#F27D26] transition-colors">{d.name}</span>
                            <span className={cn("text-[9px] font-mono", d.id === 'hell' ? "text-red-500" : "text-gray-500")}>{d.xp}</span>
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{d.desc}</div>
                        </div>
                        <ArrowRight size={16} className="text-gray-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => setShowDifficultyModal(false)}
                    className="w-full text-gray-500 text-[10px] font-bold uppercase py-2 hover:text-white transition-colors"
                  >
                    取消 Cancel
                  </button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Share Fab button - Only in profile or beasts */}
          <AnimatePresence>
            {(activeTab === 'profile' || activeTab === 'beasts') && selectedBeast && (
               <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={handleShareAchievement}
                className="fixed bottom-24 right-6 w-14 h-14 bg-white text-black rounded-full shadow-2xl flex items-center justify-center z-[60] hover:scale-110 transition-transform group border border-black/10"
               >
                 <Share2 size={24} />
                 <span className="absolute right-full mr-3 px-3 py-1 bg-white text-black text-[10px] font-black uppercase rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl border border-black/5">
                   分享成就 Share
                 </span>
               </motion.button>
            )}
          </AnimatePresence>

          {evolutionData && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#F27D26] z-[100] flex items-center justify-center p-6 text-black"
            >
              <motion.div 
                initial={{ scale: 0.5, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                className="text-center space-y-8"
              >
                <div className="relative">
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-white rounded-full blur-3xl"
                  />
                  <div className="text-[160px] relative z-10">{evolutionData.newStage.visual}</div>
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-7xl font-black uppercase italic tracking-tighter">EVOLUTION!</h2>
                  <p className="text-xl font-bold opacity-80">
                    你的小兽已进化为 <span className="underline">{evolutionData.newStage.name}</span>
                  </p>
                </div>

                <button 
                  onClick={() => setEvolutionData(null)}
                  className="px-12 py-4 bg-black text-white font-black text-xl rounded-full hover:scale-105 transition-transform"
                >
                  太棒了！
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Achievement Notification */}
        <AnimatePresence>
          {unlockedAchievement && (
            <AchievementNotification 
              achievement={unlockedAchievement} 
              onComplete={() => setUnlockedAchievement(null)} 
            />
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#1C1D21] border-t border-white/5 flex items-center justify-around md:hidden z-40">
        <button 
          onClick={() => setActiveTab('beasts')}
          className={cn(activeTab === 'beasts' ? "text-[#F27D26]" : "text-gray-500")}
        >
          <Home size={24} />
        </button>
        <button 
          onClick={() => setActiveTab('mistakes')}
          className={cn(activeTab === 'mistakes' ? "text-[#F27D26]" : "text-gray-500")}
        >
          <BookOpen size={24} />
        </button>
        <button 
          onClick={() => setActiveTab('world')}
          className={cn(activeTab === 'world' ? "text-[#F27D26]" : "text-gray-500")}
        >
          <Globe size={24} />
        </button>
        <button 
          onClick={() => setActiveTab('leaderboard')}
          className={cn(activeTab === 'leaderboard' ? "text-[#F27D26]" : "text-gray-500")}
        >
          <Trophy size={24} />
        </button>
        <button 
          onClick={() => setActiveTab('achievements')}
          className={cn(activeTab === 'achievements' ? "text-[#F27D26]" : "text-gray-500")}
        >
          <Award size={24} />
        </button>
        <button 
          onClick={() => setActiveTab('goals')}
          className={cn(activeTab === 'goals' ? "text-[#F27D26]" : "text-gray-500")}
        >
          <TrendingUp size={24} />
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={cn(activeTab === 'settings' ? "text-[#F27D26]" : "text-gray-500")}
        >
          <Settings size={24} />
        </button>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthGuard>
      {(user) => <Dashboard user={user} />}
    </AuthGuard>
  );
}
