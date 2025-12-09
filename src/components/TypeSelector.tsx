import { MonsterType } from '@/types/monster';
import { cn } from '@/lib/utils';
import { Flame, Droplets, Zap, Leaf, Moon, Laugh } from 'lucide-react';

interface TypeSelectorProps {
  value: MonsterType;
  onChange: (type: MonsterType) => void;
}

const TYPES: { type: MonsterType; icon: React.ReactNode; gradient: string }[] = [
  { type: 'Fire', icon: <Flame className="w-5 h-5" />, gradient: 'from-orange-500 to-red-600' },
  { type: 'Water', icon: <Droplets className="w-5 h-5" />, gradient: 'from-blue-400 to-cyan-600' },
  { type: 'Electric', icon: <Zap className="w-5 h-5" />, gradient: 'from-yellow-400 to-amber-500' },
  { type: 'Grass', icon: <Leaf className="w-5 h-5" />, gradient: 'from-green-400 to-emerald-600' },
  { type: 'Shadow', icon: <Moon className="w-5 h-5" />, gradient: 'from-purple-500 to-violet-700' },
  { type: 'Meme', icon: <Laugh className="w-5 h-5" />, gradient: 'from-green-400 to-teal-500' },
];

export function TypeSelector({ value, onChange }: TypeSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {TYPES.map(({ type, icon, gradient }) => (
        <button
          key={type}
          type="button"
          onClick={() => onChange(type)}
          className={cn(
            'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200',
            value === type
              ? `bg-gradient-to-br ${gradient} border-transparent shadow-lg scale-105`
              : 'bg-secondary/50 border-border hover:border-primary/50 hover:bg-secondary'
          )}
        >
          <div className={cn(value === type ? 'text-foreground' : 'text-muted-foreground')}>
            {icon}
          </div>
          <span className={cn(
            'text-xs font-bold uppercase',
            value === type ? 'text-foreground' : 'text-muted-foreground'
          )}>
            {type}
          </span>
        </button>
      ))}
    </div>
  );
}
