
import React from 'react';
import { Candy as CandyIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CandyColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple';

interface CandyProps {
  color: CandyColor;
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
  selected,
  matched,
  falling,
  isNew,
  onClick
}) => {
  return (
    <div
      className={cn(
        'candy flex items-center justify-center shadow-inner',
        colorToClass[color],
        colorToShape[color],
        'border border-white/30',
        selected && 'selected',
        matched && 'matched',
        falling && 'falling',
        isNew && 'new'
      )}
      onClick={onClick}
      aria-label={`${color} candy`}
    >
      <div className="candy-highlight absolute inset-0 opacity-60 bg-gradient-to-br from-white/60 to-transparent rounded-[inherit]" style={{clipPath: 'polygon(0 0, 100% 0, 100% 40%, 0% 40%)'}}></div>
    </div>
  );
};

export default Candy;
