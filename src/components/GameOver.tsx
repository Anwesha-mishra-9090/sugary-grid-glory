
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';

interface GameOverProps {
  score: number;
  onPlayAgain: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ score, onPlayAgain }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-gradient-to-b from-pink-500/90 to-blue-600/90 p-8 rounded-xl shadow-lg text-center w-11/12 max-w-md backdrop-blur-md border border-white/20">
        <h2 className="text-4xl font-bold mb-4 text-white">Game Over!</h2>
        <div className="flex justify-center mb-4">
          <Trophy className="text-candy-yellow w-16 h-16" />
        </div>
        <p className="text-xl mb-2 text-white/90">Your Score:</p>
        <p className="text-5xl font-bold mb-6 text-candy-yellow">{score.toLocaleString()}</p>
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
