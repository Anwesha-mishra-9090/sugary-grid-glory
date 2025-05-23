
import React from 'react';

interface ScoreBoardProps {
  score: number;
  movesLeft: number;
  level: number;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ score, movesLeft, level }) => {
  // Target score is based on level
  const targetScore = level * 1000;
  
  return (
    <div className="flex justify-between items-center w-full max-w-md mx-auto">
      {/* Score meter */}
      <div className="relative w-1/3">
        <div className="h-6 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full shadow-inner overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-200 to-blue-300 transition-all duration-300 ease-out" 
            style={{ width: `${Math.min(100, (score / targetScore) * 100)}%` }}
          ></div>
        </div>
        <div className="absolute -top-6 left-2 text-sm font-bold text-white">
          {score.toLocaleString()}
        </div>
      </div>
      
      {/* Level indicator */}
      <div className="bg-pink-500 rounded-full w-16 h-16 flex items-center justify-center border-4 border-white shadow-lg relative">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full opacity-80"></div>
        <div className="text-white text-2xl font-bold relative z-10">{level}</div>
      </div>
      
      {/* Target score to level up */}
      <div className="bg-pink-500 text-white px-4 py-2 rounded-xl shadow-lg flex flex-col items-center justify-center">
        <div className="text-xs font-bold">Level Up:</div>
        <div className="text-xl font-bold">{targetScore.toLocaleString()}</div>
      </div>
    </div>
  );
};

export default ScoreBoard;
