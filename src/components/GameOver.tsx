
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Award } from 'lucide-react';

interface GameOverProps {
  score: number;
  highScore: number;
  level: number;
  onPlayAgain: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ score, highScore, level, onPlayAgain }) => {
  const isNewHighScore = score > highScore;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-gradient-to-b from-pink-500/90 to-blue-600/90 p-8 rounded-xl shadow-lg text-center w-11/12 max-w-md backdrop-blur-md border border-white/20">
        <h2 className="text-4xl font-bold mb-4 text-white">Game Over!</h2>
        <div className="flex justify-center mb-4">
          {isNewHighScore ? (
            <Trophy className="text-candy-yellow w-16 h-16 animate-bounce" />
          ) : (
            <Award className="text-candy-yellow w-16 h-16" />
          )}
        </div>
        
        <div className="mb-8 space-y-4">
          <p className="text-xl mb-2 text-white/90">Your Score:</p>
          <p className="text-5xl font-bold text-candy-yellow">{score.toLocaleString()}</p>
          
          <div className="flex items-center justify-center gap-2">
            <Star className="text-candy-yellow h-5 w-5" />
            <p className="text-lg text-white">Level {level} Reached</p>
          </div>
          
          {isNewHighScore && (
            <div className="bg-candy-yellow/20 p-3 rounded-lg text-candy-yellow mt-2">
              <p className="text-xl font-bold">New High Score!</p>
            </div>
          )}
        </div>
        
        <Button 
          onClick={onPlayAgain}
          className="bg-gradient-to-r from-pink-500 to-pink-600 hover:opacity-90 text-white px-8 py-6 text-xl"
        >
          Play Again
        </Button>
      </div>
    </div>
  );
};

export default GameOver;
