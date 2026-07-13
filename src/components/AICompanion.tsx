import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Sparkles, Minimize2, Maximize2 } from 'lucide-react';
import { Beast, CompanionMessage } from '../types';
import { geminiService } from '../services/geminiService';
import { getBeastStage } from '../beastData';
import { cn } from '../lib/utils';

interface AICompanionProps {
  activeBeast: Beast;
  allBeasts: Beast[];
  onBeastSelect: (beast: Beast) => void;
  onClose: () => void;
}

export const AICompanion: React.FC<AICompanionProps> = ({ activeBeast, allBeasts, onBeastSelect, onClose }) => {
  const [messages, setMessages] = useState<Record<string, CompanionMessage[]>>({});
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showBeastSelector, setShowBeastSelector] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const stage = getBeastStage(activeBeast.subject, activeBeast.level);
  const currentMessages = messages[activeBeast.id] || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentMessages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: CompanionMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => ({
      ...prev,
      [activeBeast.id]: [...(prev[activeBeast.id] || []), userMsg]
    }));
    setInput('');
    setIsTyping(true);

    const history = currentMessages.map(m => ({ role: m.role, content: m.content }));
    const aiResponse = await geminiService.chatWithCompanion(input, activeBeast, stage.name, history);

    const assistantMsg: CompanionMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString(),
      beastId: activeBeast.id
    };

    setMessages(prev => ({
      ...prev,
      [activeBeast.id]: [...(prev[activeBeast.id] || []), assistantMsg]
    }));
    setIsTyping(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0,
        height: isMinimized ? '64px' : '500px',
        width: isMinimized ? '200px' : '350px'
      }}
      className="fixed bottom-6 right-6 bg-[#1C1D21] border border-white/10 rounded-2xl shadow-2xl z-[60] flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#F27D26]/10 to-transparent relative z-20">
        <div 
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setShowBeastSelector(!showBeastSelector)}
        >
          <div className="text-2xl">{stage.visual}</div>
          <div>
            <div className="flex items-center gap-1">
              <h3 className="text-sm font-bold text-white">{stage.name}</h3>
              <motion.div
                animate={{ rotate: showBeastSelector ? 180 : 0 }}
                className="text-gray-500"
              >
                ▼
              </motion.div>
            </div>
            <p className="text-[10px] text-[#F27D26] font-bold uppercase tracking-widest">AI 陪伴中</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-500 hover:text-white transition-colors"
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Beast Selector Dropdown */}
        <AnimatePresence>
          {showBeastSelector && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-4 right-4 bg-[#1C1D21] border border-white/10 rounded-xl shadow-2xl mt-2 overflow-hidden z-30"
            >
              <div className="p-2 max-h-48 overflow-y-auto custom-scrollbar">
                {allBeasts.map((beast) => {
                  const bStage = getBeastStage(beast.subject, beast.level);
                  return (
                    <button
                      key={beast.id}
                      onClick={() => {
                        onBeastSelect(beast);
                        setShowBeastSelector(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left",
                        beast.id === activeBeast.id ? "bg-[#F27D26]/20 border border-[#F27D26]/30" : "hover:bg-white/5"
                      )}
                    >
                      <span className="text-xl">{bStage.visual}</span>
                      <div>
                        <div className="text-xs font-bold text-white">{bStage.name}</div>
                        <div className="text-[9px] text-gray-500 uppercase">LV.{beast.level}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!isMinimized && (
        <>
          {/* Chat Body */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
          >
            {currentMessages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                <Sparkles className="text-[#F27D26]" size={32} />
                <p className="text-xs text-gray-400 max-w-[200px]">
                  我是你的学习伙伴 {stage.name}。有什么学习上的问题或者想聊聊的吗？
                </p>
              </div>
            )}
            {currentMessages.map((msg) => (
              <div 
                key={msg.id}
                className={cn(
                  "flex flex-col max-w-[80%]",
                  msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div className={cn(
                  "p-3 rounded-2xl text-sm leading-relaxed",
                  msg.role === 'user' 
                    ? "bg-[#F27D26] text-black rounded-tr-none" 
                    : "bg-white/5 text-white border border-white/10 rounded-tl-none"
                )}>
                  {msg.content}
                </div>
                <span className="text-[9px] text-gray-600 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-2 text-gray-500 italic text-xs">
                <motion.div 
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  {stage.name} 正在思考...
                </motion.div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10 bg-black/20">
            <div className="relative">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="输入消息..."
                className="w-full bg-[#151619] border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:border-[#F27D26] outline-none transition-all"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#F27D26] hover:text-white disabled:opacity-50 transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};
