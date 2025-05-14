
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
      <div className="bg-gradient-to-b from-candy-purple/80 to-candy-blue/80 p-8 rounded-xl shadow-lg text-center w-11/12 max-w-md backdrop-blur-md border border-white/20">
        <h2 className="text-4xl font-bold mb-4">Game Over!</h2>
        <div className="flex justify-center mb-4">
          <Trophy className="text-candy-yellow w-16 h-16" />
        </div>
        <p className="text-xl mb-2">Your Score:</p>
        <p className="text-5xl font-bold mb-6 text-candy-yellow">{score}</p>
        <Button 
          onClick={onPlayAgain}
          className="bg-gradient-to-r from-candy-red to-candy-orange hover:opacity-90 text-white px-8 py-6 text-xl"
        >
          Play Again
        </Button>
      </div>
    </div>
  );
};

export default GameOver;
