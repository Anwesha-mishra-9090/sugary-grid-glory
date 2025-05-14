
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
        'candy flex items-center justify-center',
        colorToClass[color],
        selected && 'selected',
        matched && 'matched',
        falling && 'falling',
        isNew && 'new'
      )}
      onClick={onClick}
      aria-label={`${color} candy`}
    >
      <CandyIcon size={24} className="text-white/70" />
    </div>
  );
};

export default Candy;
