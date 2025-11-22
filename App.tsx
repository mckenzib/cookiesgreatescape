import React, { useState, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { GameUI } from './components/GameUI';
import { GameState, LevelTheme } from './types';
import { generateCozyMessage } from './services/geminiService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [treatsCollected, setTreatsCollected] = useState(0);
  const [totalTreats, setTotalTreats] = useState(0);
  const [currentTheme, setCurrentTheme] = useState<LevelTheme>(LevelTheme.NEIGHBORHOOD);
  const [aiMessage, setAiMessage] = useState<string>("");

  useEffect(() => {
    const storedHigh = localStorage.getItem('cookie_high_score');
    if (storedHigh) {
      setHighScore(parseInt(storedHigh, 10));
    }
    
    const storedTotalTreats = localStorage.getItem('cookie_total_treats');
    if (storedTotalTreats) {
      setTotalTreats(parseInt(storedTotalTreats, 10));
    }
  }, []);

  const startGame = () => {
    setScore(0);
    setTreatsCollected(0);
    setGameState(GameState.PLAYING);
    setAiMessage("");
  };

  const handleGameOver = (finalScore: number, finalTreats: number) => {
    setScore(finalScore);
    setTreatsCollected(finalTreats);
    setGameState(GameState.GAME_OVER);
    
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('cookie_high_score', finalScore.toString());
    }

    // Update Total Treats Persistence
    const newTotal = totalTreats + finalTreats;
    setTotalTreats(newTotal);
    localStorage.setItem('cookie_total_treats', newTotal.toString());

    // Generate cozy message locally
    const message = generateCozyMessage(finalScore, finalTreats, currentTheme);
    setAiMessage(message);
  };

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center bg-amber-50 overflow-hidden select-none">
      
      {gameState === GameState.PLAYING && (
        <GameCanvas 
          onGameOver={handleGameOver} 
          onScoreUpdate={setScore}
          onTreatUpdate={setTreatsCollected}
          theme={currentTheme}
          onThemeChange={setCurrentTheme}
        />
      )}

      <GameUI 
        gameState={gameState}
        score={score}
        highScore={highScore}
        treats={treatsCollected}
        totalTreats={totalTreats}
        onStart={startGame}
        aiMessage={aiMessage}
        currentTheme={currentTheme}
      />
      
    </div>
  );
};

export default App;