
import React, { useState, useEffect } from 'react';
import GameBoard from './GameBoard';
import ScoreBoard from './ScoreBoard';
import GameOver from './GameOver';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const MAX_MOVES = 20;

const CandyCrushGame: React.FC = () => {
  const [score, setScore] = useState(0);
  const [movesLeft, setMovesLeft] = useState(MAX_MOVES);
  const [isGameOver, setIsGameOver] = useState(false);
  const [key, setKey] = useState(0); // Used to reset the game board
  const { toast } = useToast();

  useEffect(() => {
    if (movesLeft === 0 && !isGameOver) {
      setIsGameOver(true);
    }
  }, [movesLeft, isGameOver]);

  const handleScoreUpdate = (newScore: number) => {
    setScore(newScore);
    
    // Show toast for significant score increases
    if (newScore > score + 50) {
      toast({
        title: "Great move!",
        description: `You gained ${newScore - score} points!`,
        duration: 2000,
      });
    }
  };

  const handleMoveMade = () => {
    setMovesLeft(prev => prev - 1);
  };

  const handlePlayAgain = () => {
    setScore(0);
    setMovesLeft(MAX_MOVES);
    setIsGameOver(false);
    setKey(prev => prev + 1); // Reset the game board
    
    toast({
      title: "New Game Started",
      description: "Good luck!",
      duration: 2000,
    });
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to restart the game?")) {
      handlePlayAgain();
    }
  };

  return (
    <div className="container px-4 py-8 max-w-lg mx-auto">
      <h1 className="text-4xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-candy-red via-candy-orange to-candy-purple">
        Candy Crush
      </h1>
      <p className="text-center mb-6 text-gray-300">Match 3 or more candies to score points!</p>
      
      <div className="flex justify-between items-center mb-4">
        <ScoreBoard score={score} movesLeft={movesLeft} />
        <Button 
          variant="outline" 
          size="icon"
          onClick={handleReset}
          className="ml-2"
        >
          <RefreshCw className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="bg-black/30 rounded-lg p-4 backdrop-blur-sm mb-6">
        <GameBoard 
          key={key}
          onScoreUpdate={handleScoreUpdate} 
          onMoveMade={handleMoveMade} 
        />
      </div>
      
      {isGameOver && (
        <GameOver score={score} onPlayAgain={handlePlayAgain} />
      )}
    </div>
  );
};

export default CandyCrushGame;
