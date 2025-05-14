
import React from 'react';

interface ScoreBoardProps {
  score: number;
  movesLeft: number;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ score, movesLeft }) => {
  return (
    <div className="flex justify-between items-center bg-black/30 rounded-lg p-4 mb-4 w-full max-w-md mx-auto">
      <div>
        <h2 className="text-xl font-bold">Score</h2>
        <p className="text-3xl font-bold text-candy-yellow">{score}</p>
      </div>
      <div>
        <h2 className="text-xl font-bold">Moves Left</h2>
        <p className="text-3xl font-bold text-candy-yellow">{movesLeft}</p>
      </div>
    </div>
  );
};

export default ScoreBoard;
