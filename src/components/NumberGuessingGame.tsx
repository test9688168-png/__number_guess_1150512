import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCcw, Gauge, Trophy as TrophyIcon, AlertTriangle, Timer } from 'lucide-react';

/**
 * 賽車遊戲狀態介面
 */
interface GameState {
  targetSpeed: number;
  laps: number[];
  feedback: string;
  isFinished: boolean;
}

/**
 * 賽車風格猜數字遊戲 - 「極速猜測賽」
 */
const RacingGuessGame: React.FC = () => {
  // 初始化賽事狀態
  const [gameState, setGameState] = useState<GameState>({
    targetSpeed: generateTargetSpeed(),
    laps: [],
    feedback: '準備起跑！請輸入 1-100 的目標時速！',
    isFinished: false,
  });

  const [inputValue, setInputValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  function generateTargetSpeed(): number {
    return Math.floor(Math.random() * 100) + 1;
  }

  const handleReset = useCallback(() => {
    setGameState({
      targetSpeed: generateTargetSpeed(),
      laps: [],
      feedback: '賽道清空，重新開始下一回合測試！',
      isFinished: false,
    });
    setInputValue('');
    setError(null);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const speed = parseInt(inputValue);

    if (isNaN(speed)) {
      setError('請輸入有效的時速數字！');
      return;
    }

    if (speed < 1 || speed > 100) {
      setError('時速範圍必須在 1-100 之間！');
      return;
    }

    const { targetSpeed, laps } = gameState;
    const newLaps = [speed, ...laps];
    const diff = Math.abs(speed - targetSpeed);
    let newFeedback = '';
    let finished = false;

    if (speed === targetSpeed) {
      newFeedback = `衝線！你成功鎖定了精確時速 ${targetSpeed} KM/H！`;
      finished = true;
    } else if (speed > targetSpeed) {
      newFeedback = `超速了！（快了 ${diff}）請降低供油量。`;
    } else {
      newFeedback = `動力不足！（慢了 ${diff}）請加大馬力。`;
    }

    setGameState({
      ...gameState,
      laps: newLaps,
      feedback: newFeedback,
      isFinished: finished,
    });

    setInputValue('');
  };

  return (
    <div className="min-h-screen bg-[#111] flex items-center justify-center p-4 font-sans text-white">
      {/* 賽道方格背景裝飾 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#1a1a1a] border-4 border-red-600 rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.3)] relative z-10"
      >
        {/* Checkered Flag Header */}
        <div className="h-10 w-full bg-white flex flex-wrap">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className={`h-5 w-5 ${((Math.floor(i / 20) + i) % 2 === 0) ? 'bg-black' : 'bg-white'}`} />
          ))}
        </div>

        {/* Dashboard UI */}
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="italic">
              <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none font-racing">
                GRID <span className="text-red-600">CHALLENGE</span>
              </h1>
              <p className="text-[12px] font-bold text-red-500 uppercase tracking-[0.3em] mt-2">Numerical Racing League</p>
            </div>
            <div className="bg-red-600 p-3 rounded-lg rotate-3 shadow-lg">
              <Gauge size={40} className="text-white" />
            </div>
          </div>

          {/* Speedometer Area */}
          <div className="relative bg-[#222] border-2 border-dashed border-gray-700 p-8 rounded-2xl mb-8 overflow-hidden">
             {/* 裝飾線條 */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 rounded-full -mr-12 -mt-12 blur-2xl" />
            
            <AnimatePresence mode="wait">
              <motion.div
                key={gameState.feedback}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                className={`text-center italic font-black text-2xl leading-snug font-racing
                  ${gameState.isFinished ? 'text-yellow-400 text-3xl' : 'text-gray-200'}`}
              >
                {gameState.feedback}
              </motion.div>
            </AnimatePresence>

            {gameState.isFinished && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-6 flex flex-col items-center gap-2"
              >
                <div className="flex items-center gap-2 bg-yellow-400 text-black px-6 py-2 rounded-md font-black text-lg skew-x-[-12deg]">
                  <TrophyIcon size={24} />
                  <span>分站冠軍！完成了 {gameState.laps.length} 次單圈測試</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Driver Controls */}
          {!gameState.isFinished ? (
            <form onSubmit={handleSubmit} className="space-y-6 relative">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-red-600 z-10">
                  <span className="font-black italic text-xl font-racing">KM/H</span>
                </div>
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="---"
                  className={`w-full pl-28 pr-6 py-7 bg-black border-l-12 rounded-xl text-6xl font-black italic transition-all outline-none text-white tracking-widest font-racing
                    ${error ? 'border-red-500 ring-2 ring-red-500/20' : 'border-red-600 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/10'}`}
                  autoFocus
                />
                
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute -bottom-8 left-0 right-0"
                    >
                      <span className="text-red-500 text-sm font-black uppercase flex items-center justify-center gap-2">
                        <AlertTriangle size={16} /> {error}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.button
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-xl font-black text-2xl italic flex items-center justify-center gap-4 shadow-[0_10px_0_rgb(153,27,27)] active:shadow-none active:translate-y-2 transition-all uppercase tracking-tighter"
              >
                <span>加速測試</span>
                <div className="w-10 h-1 bg-white/40" />
              </motion.button>
            </form>
          ) : (
            <motion.button
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.02, rotate: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleReset}
              className="w-full bg-yellow-400 text-black py-6 rounded-xl font-black text-2xl italic flex items-center justify-center gap-4 shadow-[0_10px_0_rgb(161,98,7)] active:shadow-none active:translate-y-2 transition-all uppercase tracking-tighter"
            >
              <RefreshCcw size={28} />
              進入維修站重啟
            </motion.button>
          )}

          {/* Lap Timing History */}
          <div className="mt-12 pt-8 border-t border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.4em] flex items-center gap-3">
                <Timer size={18} /> LAP RECORDS ({gameState.laps.length})
              </h3>
            </div>
            
            <div className="grid grid-cols-5 gap-4">
              <AnimatePresence>
                {gameState.laps.length === 0 ? (
                  <div className="col-span-5 text-center py-6 text-gray-700 font-bold italic border-2 border-dashed border-gray-800 rounded-lg text-lg">
                    WAITING FOR START...
                  </div>
                ) : (
                  gameState.laps.map((speed, i) => (
                    <motion.div
                      layout
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      key={`${speed}-${i}`}
                      className={`relative flex items-center justify-center h-16 rounded-xl font-black italic text-xl font-racing
                        ${i === 0 && !gameState.isFinished ? 'bg-red-600 text-white shadow-lg z-10 scale-110' : 'bg-[#222] text-gray-500 border border-white/5'}`}
                    >
                      <span className="text-[10px] absolute -top-2 -left-1 opacity-40">P{gameState.laps.length - i}</span>
                      {speed}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Bottom Finisher */}
        <div className="bg-black py-3 border-t border-white/10 flex justify-center gap-8">
            <div className="flex items-center gap-1.5 grayscale">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Live Engine</span>
            </div>
            <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                Fastest Lap: {gameState.laps.length > 0 ? Math.min(...gameState.laps) : '--'}
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RacingGuessGame;
