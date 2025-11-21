import React from 'react';
import { GameState, LevelTheme } from '../types';

interface GameUIProps {
  gameState: GameState;
  score: number;
  highScore: number;
  treats: number;
  onStart: () => void;
  aiMessage: string;
  isLoadingAi: boolean;
  currentTheme: LevelTheme;
}

export const GameUI: React.FC<GameUIProps> = ({
  gameState,
  score,
  highScore,
  treats,
  onStart,
  aiMessage,
  isLoadingAi,
  currentTheme
}) => {
  if (gameState === GameState.PLAYING) {
    return (
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none font-mono text-2xl text-[#5D4037]">
        <div className="flex flex-col gap-2">
          <div className="bg-white/80 px-4 py-2 rounded-lg shadow-sm border-2 border-[#8D6E63]">
            SCORE: {Math.floor(score)}
          </div>
          <div className="bg-white/80 px-4 py-2 rounded-lg shadow-sm border-2 border-[#8D6E63] text-sm">
            THEME: {currentTheme.toUpperCase()}
          </div>
        </div>
        <div className="bg-white/80 px-4 py-2 rounded-lg shadow-sm border-2 border-[#8D6E63] flex items-center gap-2">
          <span>🍖</span> {treats}
        </div>
      </div>
    );
  }

  if (gameState === GameState.MENU) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-10">
        <div className="bg-[#FFF8E1] p-8 rounded-xl border-4 border-[#8D6E63] shadow-2xl text-center max-w-md">
          <h1 className="text-5xl mb-2 text-[#D84315] font-bold drop-shadow-sm">Cookie's Escape</h1>
          <p className="text-xl mb-6 text-[#5D4037]">A cozy run through the park!</p>

          <div className="mb-8 flex justify-center gap-4 text-[#5D4037]">
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold">JUMP</span>
              <span className="bg-white border-2 border-[#8D6E63] px-2 py-1 rounded text-xs mt-1">SPACE / TAP</span>
            </div>
          </div>

          <button
            onClick={onStart}
            className="bg-[#4CAF50] hover:bg-[#43A047] text-white text-2xl px-8 py-3 rounded-lg border-b-4 border-[#2E7D32] active:border-b-0 active:mt-1 transition-all"
          >
            START RUNNING
          </button>
        </div>
      </div>
    );
  }

  if (gameState === GameState.GAME_OVER) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-md z-10">
        <div className="bg-[#FFF8E1] p-8 rounded-xl border-4 border-[#8D6E63] shadow-2xl text-center max-w-lg w-[90%]">
          <h2 className="text-4xl mb-4 text-[#D84315] font-bold">Need a Nap!!!!</h2>

          <div className="grid grid-cols-2 gap-4 mb-6 text-[#5D4037]">
            <div className="bg-white p-3 rounded border border-[#8D6E63]">
              <p className="text-xs uppercase tracking-widest">Score</p>
              <p className="text-2xl font-bold">{Math.floor(score)}</p>
            </div>
            <div className="bg-white p-3 rounded border border-[#8D6E63]">
              <p className="text-xs uppercase tracking-widest">Treats</p>
              <p className="text-2xl font-bold">{treats}</p>
            </div>
            <div className="col-span-2 bg-[#FFF3E0] p-2 rounded border border-[#FFB74D]">
              <p className="text-sm text-[#E65100]">High Score: {highScore}</p>
            </div>
          </div>

          {/* Gemini AI Narrator Section */}
          <div className="mb-6 min-h-[80px] flex items-center justify-center bg-white p-4 rounded-lg border-2 border-dashed border-[#A1887F] relative">
            {isLoadingAi ? (
              <div className="flex items-center gap-2 text-[#A1887F]">
                <div className="animate-bounce">🐾</div>
                <span>Writing a story...</span>
              </div>
            ) : (
              <p className="text-lg italic text-[#5D4037] font-serif leading-tight">
                "{aiMessage}"
              </p>
            )}
          </div>

          <button
            onClick={onStart}
            className="bg-[#4CAF50] hover:bg-[#43A047] text-white text-2xl px-8 py-3 rounded-lg border-b-4 border-[#2E7D32] active:border-b-0 active:mt-1 transition-all"
          >
            RUN AGAIN
          </button>
        </div>
      </div>
    );
  }

  return null;
};