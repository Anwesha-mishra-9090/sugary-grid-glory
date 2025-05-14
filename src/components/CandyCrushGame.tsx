
import React, { useState, useEffect } from 'react';
import GameBoard from './GameBoard';
import ScoreBoard from './ScoreBoard';
import GameOver from './GameOver';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trophy, Star } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const BASE_MOVES = 20;
const MOVES_PER_LEVEL = 5;

const CandyCrushGame: React.FC = () => {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [movesLeft, setMovesLeft] = useState(BASE_MOVES);
  const [isGameOver, setIsGameOver] = useState(false);
  const [key, setKey] = useState(0); // Used to reset the game board
  const [highScore, setHighScore] = useState<number>(() => {
    const savedScore = localStorage.getItem('candyCrushHighScore');
    return savedScore ? parseInt(savedScore) : 0;
  });
  const { toast } = useToast();

  // Calculate max moves based on level
  const maxMoves = BASE_MOVES + (MOVES_PER_LEVEL * (level - 1));

  useEffect(() => {
    if (movesLeft === 0 && !isGameOver) {
      setIsGameOver(true);
      
      // Update high score if beaten
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('candyCrushHighScore', score.toString());
        
        toast({
          title: "New High Score!",
          description: `You've beaten your previous record of ${highScore} points!`,
          duration: 4000,
        });
      }
    }
  }, [movesLeft, isGameOver, score, highScore]);

  // Level progression
  useEffect(() => {
    const nextLevelScore = level * 1000;
    if (score >= nextLevelScore && level < 10) {
      const newLevel = level + 1;
      setLevel(newLevel);
      
      // Award bonus moves for level up
      setMovesLeft(prev => prev + 5);
      
      toast({
        title: `Level Up! Level ${newLevel}`,
        description: "You've earned 5 bonus moves!",
        duration: 3000,
      });
    }
  }, [score, level]);

  const handleScoreUpdate = (newScore: number) => {
    setScore(newScore);
    
    // Show toast for significant score increases
    if (newScore > score + 50) {
      toast({
        title: "Sweet!",
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
    setLevel(1);
    setMovesLeft(BASE_MOVES);
    setIsGameOver(false);
    setKey(prev => prev + 1); // Reset the game board
    
    toast({
      title: "New Game Started",
      description: "Sweet! Let's crush some candies!",
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
        <div className="flex items-center gap-2">
          <div className="bg-pink-500 rounded-full w-12 h-12 flex items-center justify-center border-4 border-white shadow-lg">
            <span className="text-white text-xl font-bold">{level}</span>
          </div>
          <div className="text-xs text-gray-300">Level</div>
        </div>
        
        {highScore > 0 && (
          <div className="flex items-center gap-2">
            <Trophy className="text-candy-yellow h-5 w-5" />
            <span className="text-candy-yellow font-bold">{highScore.toLocaleString()}</span>
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <ScoreBoard score={score} movesLeft={movesLeft} level={level} />
      </div>
      
      <div className="bg-gradient-to-b from-pink-500/20 to-blue-500/20 rounded-lg p-4 backdrop-blur-sm mb-6 shadow-xl">
        <GameBoard 
          key={key}
          onScoreUpdate={handleScoreUpdate} 
          onMoveMade={handleMoveMade}
          level={level}
        />
      </div>
      
      <div className="flex justify-between items-center">
        <div className="bg-pink-600/80 px-4 py-2 rounded-xl shadow-lg">
          <div className="text-xs text-white/80">Moves Left</div>
          <div className="text-2xl font-bold text-white">{movesLeft}/{maxMoves}</div>
        </div>
        
        <Button 
          variant="outline" 
          size="icon"
          onClick={handleReset}
          className="bg-pink-600/80 text-white hover:bg-pink-700/80"
        >
          <RefreshCw className="h-5 w-5" />
        </Button>
      </div>
      
      {isGameOver && (
        <GameOver score={score} highScore={highScore} level={level} onPlayAgain={handlePlayAgain} />
      )}
    </div>
  );
};

export default CandyCrushGame;
