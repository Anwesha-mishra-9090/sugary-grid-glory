
import React from 'react';
import { Candy as CandyIcon, Star, Sparkle, Bolt, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CandyColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple';
export type CandyType = 'regular' | 'striped-horizontal' | 'striped-vertical' | 'wrapped' | 'color-bomb';

interface CandyProps {
  color: CandyColor;
  type: CandyType;
  selected: boolean;
  matched: boolean;
  falling: boolean;
  isNew: boolean;
  onClick: () => void;
}

export const colorToClass: Record<CandyColor, string> = {
  red: 'bg-candy-red',
  orange: 'bg-candy-orange',
  yellow: 'bg-candy-yellow',
  green: 'bg-candy-green',
  blue: 'bg-candy-blue',
  purple: 'bg-candy-purple',
};

// Map colors to candy shapes/styles
export const colorToShape: Record<CandyColor, string> = {
  red: 'rounded-sm', // Red candies are bean-shaped in the original game
  orange: 'rounded-full', // Orange candies are round
  yellow: 'rounded-full', // Yellow candies are round
  green: 'rounded-md', // Green candies are square with rounded corners
  blue: 'rounded-full', // Blue candies are round
  purple: 'rounded-lg', // Purple candies are more like special shapes
};

const Candy: React.FC<CandyProps> = ({
  color,
  type = 'regular',
  selected,
  matched,
  falling,
  isNew,
  onClick
}) => {
  return (
    <div
      className={cn(
        'candy flex items-center justify-center shadow-inner relative',
        colorToClass[color],
        colorToShape[color],
        'border border-white/30',
        selected && 'selected',
        matched && 'matched',
        falling && 'falling',
        isNew && 'new',
        type === 'striped-horizontal' && 'striped-h',
        type === 'striped-vertical' && 'striped-v',
        type === 'wrapped' && 'wrapped',
        type === 'color-bomb' && 'color-bomb'
      )}
      onClick={onClick}
      aria-label={`${color} ${type} candy`}
    >
      <div className="candy-highlight absolute inset-0 opacity-60 bg-gradient-to-br from-white/60 to-transparent rounded-[inherit]" style={{clipPath: 'polygon(0 0, 100% 0, 100% 40%, 0% 40%)'}}></div>
      
      {/* Special candy indicators */}
      {type === 'striped-horizontal' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Bolt className="text-white/70 h-4 w-4" />
        </div>
      )}
      {type === 'striped-vertical' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Bolt className="text-white/70 h-4 w-4 rotate-90" />
        </div>
      )}
      {type === 'wrapped' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkle className="text-white/70 h-5 w-5" />
        </div>
      )}
      {type === 'color-bomb' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Star className="text-white h-6 w-6" />
        </div>
      )}
    </div>
  );
};

export default Candy;
