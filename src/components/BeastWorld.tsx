import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Beast, Subject } from '../types';
import { getBeastStage } from '../beastData';
import { Brain, Heart, Star, X, Info, Sparkles, Volume2, VolumeX, Sun, Moon, CloudRain, CloudSnow, Wind, Leaf, Utensils, Hand, Gift, Coffee } from 'lucide-react';
import { cn } from '../lib/utils';

interface BeastWorldProps {
  beasts: Beast[];
  volume?: number;
}

type Habitat = 'sky' | 'land' | 'ocean';
type Weather = 'clear' | 'rain' | 'snow' | 'wind';
type Season = 'spring' | 'summer' | 'autumn' | 'winter';

const getBeastHabitat = (beast: Beast): Habitat => {
  const stage = getBeastStage(beast.subject, beast.level);
  
  // Specific logic for Math (Snake -> Dragon)
  if (beast.subject === 'math') {
    if (stage.stage <= 2) return 'land';
    return 'sky';
  }
  
  // Specific logic for Chinese (Fish -> Turtle/Xuanwu)
  if (beast.subject === 'chinese') {
    if (stage.stage <= 4) return 'ocean';
    return 'land';
  }

  // Default habitats based on subject
  const defaults: Record<Subject, Habitat> = {
    math: 'land',
    english: 'land',
    chinese: 'ocean',
    physics: 'land',
    chemistry: 'land',
    biology: 'land',
    politics: 'land',
    history: 'sky',
    geography: 'land',
  };

  return defaults[beast.subject] || 'land';
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
  geography: '地理 (Geography)',
};

const BeastAvatar: React.FC<{ 
  beast: Beast; 
  onClick: () => void; 
  volume: number;
  onInteract?: () => 'none' | 'feed' | 'pet';
}> = ({ beast, onClick, volume, onInteract }) => {
  const stage = getBeastStage(beast.subject, beast.level);
  const primaryHabitat = getBeastHabitat(beast);
  const [interactionEffect, setInteractionEffect] = useState<'heart' | 'star' | null>(null);

  // Define habitat boundaries (percentage of container)
  const BOUNDARIES = {
    sky: { minX: 5, maxX: 90, minY: 5, maxY: 25 },
    land: { minX: 5, maxX: 90, minY: 40, maxY: 65 },
    ocean: { minX: 5, maxX: 90, minY: 75, maxY: 95 }
  };

  const getInitialPosition = () => {
    const b = BOUNDARIES[primaryHabitat];
    return {
      x: b.minX + Math.random() * (b.maxX - b.minX),
      y: b.minY + Math.random() * (b.maxY - b.minY)
    };
  };

  const [position, setPosition] = useState(getInitialPosition());

  const playBeastSound = () => {
    const sounds = {
      math: 'https://assets.mixkit.co/sfx/preview/mixkit-magic-sparkle-whoosh-2350.mp3',
      english: 'https://assets.mixkit.co/sfx/preview/mixkit-cat-meow-1453.mp3',
      chinese: 'https://assets.mixkit.co/sfx/preview/mixkit-water-splash-1311.mp3',
      physics: 'https://assets.mixkit.co/sfx/preview/mixkit-monkey-scream-2033.mp3',
      chemistry: 'https://assets.mixkit.co/sfx/preview/mixkit-tiger-roar-2034.mp3',
      biology: 'https://assets.mixkit.co/sfx/preview/mixkit-cricket-chirp-2035.mp3',
      politics: 'https://assets.mixkit.co/sfx/preview/mixkit-insect-buzz-2036.mp3',
      history: 'https://assets.mixkit.co/sfx/preview/mixkit-bird-chirp-2037.mp3',
      geography: 'https://assets.mixkit.co/sfx/preview/mixkit-deer-call-2038.mp3'
    };
    
    const audio = new Audio(sounds[beast.subject as keyof typeof sounds] || sounds.math);
    audio.volume = volume;
    audio.play().catch(() => {});
  };

  const handleClick = () => {
    if (onInteract) {
      if (interactionEffect) return; // Prevent spam
      
      const type = onInteract(); // Get mode from parent
      if (type === 'feed') {
        setInteractionEffect('star');
        setTimeout(() => setInteractionEffect(null), 2000);
      } else if (type === 'pet') {
        setInteractionEffect('heart');
        setTimeout(() => setInteractionEffect(null), 2000);
      }
    }
    playBeastSound();
    onClick();
  };

  useEffect(() => {
    const move = () => {
      const b = BOUNDARIES[primaryHabitat];
      setPosition(prev => ({
        x: Math.min(b.maxX, Math.max(b.minX, prev.x + (Math.random() - 0.5) * 15)),
        y: Math.min(b.maxY, Math.max(b.minX, prev.y + (Math.random() - 0.5) * 10))
      }));
    };

    const interval = setInterval(move, 6000 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, [primaryHabitat]);

  return (
    <motion.div
      animate={{ 
        left: `${position.x}%`, 
        top: `${position.y}%`,
        scale: interactionEffect ? [1, 1.2, 1] : [1, 1.05, 1],
        rotate: interactionEffect ? [0, -10, 10, 0] : 0
      }}
      transition={{ 
        left: { duration: 6, ease: "easeInOut" },
        top: { duration: 6, ease: "easeInOut" },
        scale: { duration: interactionEffect ? 0.5 : 3, repeat: interactionEffect ? 0 : Infinity, ease: "easeInOut" },
        rotate: { duration: 0.5 }
      }}
      className="absolute cursor-pointer group -translate-x-1/2 -translate-y-1/2 z-10"
      onClick={handleClick}
    >
      <div className="relative">
        <AnimatePresence>
          {interactionEffect && (
            <motion.div
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: 1, y: -40, scale: 1.5 }}
              exit={{ opacity: 0 }}
              className="absolute -top-10 left-1/2 -translate-x-1/2 pointer-events-none"
            >
              {interactionEffect === 'heart' ? (
                <Heart className="text-red-500 fill-red-500" size={24} />
              ) : (
                <Star className="text-yellow-400 fill-yellow-400" size={24} />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-4xl md:text-6xl drop-shadow-lg filter group-hover:scale-125 transition-transform duration-300">
          {stage.visual}
        </div>
        
        {/* Mood/Level indicator */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white whitespace-nowrap border border-white/20 shadow-xl scale-90 group-hover:scale-100">
          <span className="font-bold text-[#F27D26]">LV.{beast.level}</span> {stage.name}
        </div>

        {/* Shadow/Reflection */}
        <div className={cn(
          "absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-2 bg-black/20 rounded-full blur-sm transition-opacity",
          primaryHabitat === 'sky' ? "opacity-20" : "opacity-40"
        )} />
      </div>
    </motion.div>
  );
};

export const BeastWorld: React.FC<BeastWorldProps> = ({ beasts, volume = 0.5 }) => {
  const [selectedBeast, setSelectedBeast] = useState<Beast | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [time, setTime] = useState(12); // 0-23
  const [weather, setWeather] = useState<Weather>('clear');
  const [season, setSeason] = useState<Season>('spring');
  const [interactionMode, setInteractionMode] = useState<'none' | 'feed' | 'pet'>('none');
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Day/Night and Weather cycle
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prev => (prev + 0.1) % 24);
    }, 5000);

    const weatherTimer = setInterval(() => {
      const weathers: Weather[] = ['clear', 'rain', 'snow', 'wind'];
      if (Math.random() > 0.7) {
        setWeather(weathers[Math.floor(Math.random() * weathers.length)]);
      }
    }, 30000);

    const seasonTimer = setInterval(() => {
      const seasons: Season[] = ['spring', 'summer', 'autumn', 'winter'];
      setSeason(prev => {
        const idx = seasons.indexOf(prev);
        return seasons[(idx + 1) % 4];
      });
    }, 120000);

    return () => {
      clearInterval(timer);
      clearInterval(weatherTimer);
      clearInterval(seasonTimer);
    };
  }, []);

  const isNight = time < 6 || time > 18;

  useEffect(() => {
    // Ambient sound URL (Nature/Ambient)
    const audio = new Audio('https://assets.mixkit.co/music/preview/mixkit-ambient-meditation-109.mp3');
    audio.loop = true;
    audio.volume = isMuted ? 0 : volume;
    audioRef.current = audio;

    const playAudio = () => {
      audio.play().catch(err => console.log("Autoplay blocked:", err));
    };

    // Try to play on mount (might be blocked)
    playAudio();

    // Also play on first user interaction with the world
    window.addEventListener('click', playAudio, { once: true });

    return () => {
      audio.pause();
      audio.src = '';
      window.removeEventListener('click', playAudio);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const ambientElements = useMemo(() => {
    return {
      clouds: Array.from({ length: 5 }).map((_, i) => ({
        id: i,
        y: Math.random() * 20,
        scale: 0.5 + Math.random(),
        duration: 20 + Math.random() * 20,
        delay: -Math.random() * 40 // Random start point
      })),
      fishes: Array.from({ length: 8 }).map((_, i) => ({
        id: i,
        y: 80 + Math.random() * 15,
        duration: 10 + Math.random() * 10,
        delay: -Math.random() * 20
      })),
      birds: Array.from({ length: 4 }).map((_, i) => ({
        id: i,
        y: 5 + Math.random() * 15,
        duration: 15 + Math.random() * 10,
        delay: -Math.random() * 25
      })),
      bubbles: Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: 75 + Math.random() * 20,
        size: 4 + Math.random() * 8,
        duration: 3 + Math.random() * 5
      }))
    };
  }, []);

  return (
    <div className={cn(
      "relative w-full h-[600px] md:h-[800px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 transition-colors duration-1000",
      isNight ? "bg-slate-900" : "bg-gradient-to-b from-sky-400 via-emerald-400 to-blue-600"
    )}>
      {/* Time Overlay */}
      <div className={cn(
        "absolute inset-0 transition-opacity duration-1000 pointer-events-none z-20",
        isNight ? "bg-blue-900/40 opacity-100" : "opacity-0"
      )} />

      {/* Weather Effects */}
      <AnimatePresence>
        {weather === 'rain' && (
          <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={`rain-${i}`}
                initial={{ y: -20, x: `${Math.random() * 100}%` }}
                animate={{ y: 800 }}
                transition={{ repeat: Infinity, duration: 0.5 + Math.random() * 0.5, ease: "linear" }}
                className="absolute w-[1px] h-4 bg-blue-200/40"
              />
            ))}
          </div>
        )}
        {weather === 'snow' && (
          <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={`snow-${i}`}
                initial={{ y: -20, x: `${Math.random() * 100}%` }}
                animate={{ y: 800, x: `${(Math.random() - 0.5) * 20}%` }}
                transition={{ repeat: Infinity, duration: 3 + Math.random() * 2, ease: "linear" }}
                className="absolute w-2 h-2 bg-white/60 rounded-full blur-[1px]"
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Sky Layer */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-300/30 to-transparent pointer-events-none" />
      
      {/* Sun/Moon */}
      <motion.div
        animate={{ 
          top: isNight ? '80%' : '10%',
          left: isNight ? '80%' : '10%',
          opacity: isNight ? 0 : 1
        }}
        className="absolute text-6xl filter drop-shadow-[0_0_20px_rgba(255,255,0,0.5)]"
      >
        ☀️
      </motion.div>
      <motion.div
        animate={{ 
          top: isNight ? '10%' : '80%',
          left: isNight ? '10%' : '80%',
          opacity: isNight ? 1 : 0
        }}
        className="absolute text-5xl filter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
      >
        🌙
      </motion.div>

      {ambientElements.clouds.map(cloud => (
        <motion.div
          key={`cloud-${cloud.id}`}
          animate={{ left: ['-20%', '120%'] }}
          transition={{ repeat: Infinity, duration: cloud.duration, ease: "linear", delay: cloud.delay }}
          className="absolute text-4xl opacity-40 pointer-events-none"
          style={{ top: `${cloud.y}%`, scale: cloud.scale }}
        >
          ☁️
        </motion.div>
      ))}
      {ambientElements.birds.map(bird => (
        <motion.div
          key={`bird-${bird.id}`}
          animate={{ left: ['120%', '-20%'], y: [0, -10, 0] }}
          transition={{ 
            left: { repeat: Infinity, duration: bird.duration, ease: "linear", delay: bird.delay },
            y: { repeat: Infinity, duration: 2, ease: "easeInOut" }
          }}
          className="absolute text-xl opacity-30 pointer-events-none"
          style={{ top: `${bird.y}%` }}
        >
          🕊️
        </motion.div>
      ))}

      {/* Land Layer */}
      <div className="absolute top-[30%] left-0 right-0 h-[40%] bg-gradient-to-b from-emerald-500/20 to-emerald-800/20 pointer-events-none" />
      <div className="absolute top-[65%] left-0 right-0 h-4 bg-emerald-900/10 blur-sm pointer-events-none" />
      
      {/* Trees/Decorations */}
      <motion.div whileTap={{ scale: 0.9, rotate: 5 }} className="absolute top-[40%] left-[10%] text-4xl opacity-60 cursor-pointer select-none">🌳</motion.div>
      <motion.div whileTap={{ scale: 0.9, rotate: -5 }} className="absolute top-[55%] left-[80%] text-5xl opacity-60 cursor-pointer select-none">🌲</motion.div>
      <motion.div whileTap={{ scale: 1.2 }} className="absolute top-[35%] left-[45%] text-3xl opacity-60 cursor-pointer select-none">🌸</motion.div>
      <motion.div whileTap={{ scale: 0.9, rotate: 5 }} className="absolute top-[60%] left-[25%] text-4xl opacity-60 cursor-pointer select-none">🌳</motion.div>
      <motion.div whileTap={{ scale: 1.5 }} className="absolute top-[50%] left-[65%] text-3xl opacity-60 cursor-pointer select-none">🍄</motion.div>

      {/* Seasonal Decorations */}
      {season === 'spring' && (
        <>
          <div className="absolute top-[45%] left-[15%] text-2xl opacity-80 animate-bounce">🦋</div>
          <div className="absolute top-[38%] left-[48%] text-xl opacity-80">🐝</div>
        </>
      )}
      {season === 'summer' && (
        <>
          <div className="absolute top-[42%] left-[12%] text-2xl opacity-80">🍉</div>
          <div className="absolute top-[58%] left-[78%] text-2xl opacity-80">🍦</div>
        </>
      )}
      {season === 'autumn' && (
        <>
          <div className="absolute top-[42%] left-[12%] text-2xl opacity-80">🏮</div>
          <div className="absolute top-[58%] left-[78%] text-2xl opacity-80">🏮</div>
          <div className="absolute top-[52%] left-[42%] text-3xl opacity-80">🎑</div>
        </>
      )}
      {season === 'winter' && (
        <>
          <div className="absolute top-[42%] left-[12%] text-3xl opacity-80">⛄</div>
          <div className="absolute top-[58%] left-[78%] text-2xl opacity-80">🎁</div>
          <div className="absolute top-[32%] left-[42%] text-2xl opacity-80">🎄</div>
        </>
      )}

      {/* Season Effects */}
      {season === 'autumn' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={`leaf-${i}`}
              initial={{ y: -20, x: `${Math.random() * 100}%`, rotate: 0 }}
              animate={{ y: 800, rotate: 360, x: `${(Math.random() - 0.5) * 30}%` }}
              transition={{ repeat: Infinity, duration: 5 + Math.random() * 5, ease: "linear" }}
              className="absolute text-orange-400 opacity-40"
            >
              🍂
            </motion.div>
          ))}
        </div>
      )}

      {/* Ocean Layer */}
      <div className="absolute top-[70%] left-0 right-0 bottom-0 bg-blue-500/30 backdrop-blur-[2px] pointer-events-none border-t-2 border-white/20">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/water.png')] opacity-20" />
      </div>
      {ambientElements.fishes.map(fish => (
        <motion.div
          key={`fish-${fish.id}`}
          animate={{ left: ['120%', '-20%'] }}
          transition={{ repeat: Infinity, duration: fish.duration, ease: "linear", delay: fish.delay }}
          className="absolute text-xl opacity-30 pointer-events-none"
          style={{ top: `${fish.y}%` }}
        >
          🐟
        </motion.div>
      ))}
      {ambientElements.bubbles.map(bubble => (
        <motion.div
          key={`bubble-${bubble.id}`}
          initial={{ x: `${bubble.x}%`, y: '100%', opacity: 0 }}
          animate={{ y: '-20%', opacity: [0, 0.4, 0] }}
          transition={{ repeat: Infinity, duration: bubble.duration, ease: "easeOut" }}
          className="absolute bg-white/40 rounded-full blur-[1px] pointer-events-none"
          style={{ 
            left: `${bubble.x}%`, 
            top: `${bubble.y}%`,
            width: bubble.size, 
            height: bubble.size 
          }}
        />
      ))}

      {/* Beasts */}
      {beasts.map(beast => (
        <BeastAvatar 
          key={beast.id} 
          beast={beast} 
          volume={volume}
          onInteract={() => interactionMode}
          onClick={() => {
            if (interactionMode === 'feed') {
              new Audio('https://assets.mixkit.co/sfx/preview/mixkit-crunchy-bite-707.mp3').play().catch(() => {});
            } else if (interactionMode === 'pet') {
              new Audio('https://assets.mixkit.co/sfx/preview/mixkit-magic-sparkle-whoosh-2350.mp3').play().catch(() => {});
            }
            setSelectedBeast(beast);
          }} 
        />
      ))}

      {/* Interaction Tools */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-4 z-40">
        <button 
          onClick={() => setInteractionMode(prev => prev === 'feed' ? 'none' : 'feed')}
          className={cn(
            "p-4 rounded-2xl border backdrop-blur-md transition-all flex flex-col items-center gap-1",
            interactionMode === 'feed' ? "bg-[#F27D26] border-[#F27D26] text-black shadow-lg shadow-[#F27D26]/40 scale-110" : "bg-black/40 border-white/10 text-white hover:bg-white/10"
          )}
        >
          <Utensils size={20} />
          <span className="text-[10px] font-bold uppercase">喂食</span>
        </button>
        <button 
          onClick={() => setInteractionMode(prev => prev === 'pet' ? 'none' : 'pet')}
          className={cn(
            "p-4 rounded-2xl border backdrop-blur-md transition-all flex flex-col items-center gap-1",
            interactionMode === 'pet' ? "bg-[#F27D26] border-[#F27D26] text-black shadow-lg shadow-[#F27D26]/40 scale-110" : "bg-black/40 border-white/10 text-white hover:bg-white/10"
          )}
        >
          <Hand size={20} />
          <span className="text-[10px] font-bold uppercase">抚摸</span>
        </button>
      </div>

      {/* Beast Info Modal */}
      <AnimatePresence>
        {selectedBeast && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedBeast(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#1C1D21] w-full max-w-md rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative p-8 flex flex-col items-center text-center space-y-6">
                <button 
                  onClick={() => setSelectedBeast(null)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>

                <div className="relative">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="text-8xl md:text-9xl drop-shadow-[0_0_30px_rgba(242,125,38,0.3)]"
                  >
                    {getBeastStage(selectedBeast.subject, selectedBeast.level).visual}
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-4 -right-4 text-yellow-400"
                  >
                    <Sparkles size={32} />
                  </motion.div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">
                    {getBeastStage(selectedBeast.subject, selectedBeast.level).name}
                  </h2>
                  <div className="flex items-center justify-center gap-4">
                    <span className="px-3 py-1 bg-[#F27D26]/20 text-[#F27D26] rounded-full text-xs font-bold border border-[#F27D26]/30">
                      {SUBJECT_LABELS[selectedBeast.subject]}
                    </span>
                    <span className="px-3 py-1 bg-white/5 text-gray-400 rounded-full text-xs font-bold border border-white/10">
                      LV.{selectedBeast.level}
                    </span>
                  </div>
                </div>

                <p className="text-gray-400 text-sm leading-relaxed px-4">
                  {getBeastStage(selectedBeast.subject, selectedBeast.level).description}
                </p>

                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-2">
                    <Heart size={20} className="text-red-500" />
                    <div className="text-[10px] text-gray-500 uppercase font-mono">Mood</div>
                    <div className="text-xl font-bold text-white">{selectedBeast.mood}%</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-2">
                    <Star size={20} className="text-yellow-500" />
                    <div className="text-[10px] text-gray-500 uppercase font-mono">XP</div>
                    <div className="text-xl font-bold text-white">{selectedBeast.xp}</div>
                  </div>
                </div>

                <div className="w-full pt-4">
                  <div className="flex justify-between text-[10px] font-mono text-gray-500 uppercase mb-2">
                    <span>Intelligence</span>
                    <span>{Math.min(100, selectedBeast.level * 0.3 + 20).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, selectedBeast.level * 0.3 + 20)}%` }}
                      className="h-full bg-blue-500"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* World UI */}
      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none">
        <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 pointer-events-auto">
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <Sparkles size={16} className="text-yellow-400" />
            灵兽世界
          </h3>
          <p className="text-[10px] text-gray-400 mt-1">点击灵兽进行互动，查看它们的悠闲生活</p>
        </div>
        
        <div className="flex gap-2 pointer-events-auto">
          <div className="bg-black/40 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 text-white text-[10px] font-bold flex items-center gap-2">
            {weather === 'clear' && <Sun size={14} className="text-yellow-400" />}
            {weather === 'rain' && <CloudRain size={14} className="text-blue-400" />}
            {weather === 'snow' && <CloudSnow size={14} className="text-white" />}
            {weather === 'wind' && <Wind size={14} className="text-gray-300" />}
            {weather.toUpperCase()}
          </div>
          <div className="bg-black/40 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 text-white text-[10px] font-bold flex items-center gap-2">
            {season === 'spring' && <Sparkles size={14} className="text-pink-400" />}
            {season === 'summer' && <Sun size={14} className="text-yellow-400" />}
            {season === 'autumn' && <Leaf size={14} className="text-orange-400" />}
            {season === 'winter' && <CloudSnow size={14} className="text-blue-200" />}
            {season.toUpperCase()}
          </div>
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/10 text-white hover:bg-white/10 transition-colors"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <div className="bg-black/40 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 text-white text-[10px] font-bold flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            天空区域
          </div>
          <div className="bg-black/40 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 text-white text-[10px] font-bold flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            大陆区域
          </div>
          <div className="bg-black/40 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 text-white text-[10px] font-bold flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            海洋区域
          </div>
        </div>
      </div>
    </div>
  );
};
