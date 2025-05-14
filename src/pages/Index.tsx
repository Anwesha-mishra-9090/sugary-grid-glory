
import React from 'react';
import CandyCrushGame from '@/components/CandyCrushGame';

const Index = () => {
  return (
    <div className="min-h-screen bg-candy-bg overflow-auto py-8">
      <div className="max-w-screen-md mx-auto px-4">
        <CandyCrushGame />
        
        <div className="mt-8 text-center text-sm text-white/60">
          <p>A Candy Crush inspired game. Match 3 or more candies of the same color!</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
