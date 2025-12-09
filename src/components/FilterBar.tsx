import { cn } from '@/lib/utils';
import { Flame, Droplets, Zap, Leaf, Moon, Laugh, TrendingUp, Clock, Crown, Sparkles } from 'lucide-react';

interface FilterBarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const FILTERS = [
  { id: 'all', label: 'All', icon: Sparkles, color: null },
  { id: 'trending', label: 'Trending', icon: TrendingUp, color: 'text-primary' },
  { id: 'new', label: 'New', icon: Clock, color: 'text-neon-cyan' },
  { id: 'legendary', label: 'Legendary', icon: Crown, color: 'text-yellow-400' },
  { id: 'fire', label: 'Fire', icon: Flame, color: 'text-type-fire' },
  { id: 'water', label: 'Water', icon: Droplets, color: 'text-type-water' },
  { id: 'electric', label: 'Electric', icon: Zap, color: 'text-type-electric' },
  { id: 'grass', label: 'Grass', icon: Leaf, color: 'text-type-grass' },
  { id: 'shadow', label: 'Shadow', icon: Moon, color: 'text-type-shadow' },
  { id: 'meme', label: 'Meme', icon: Laugh, color: 'text-type-meme' },
];

const ACTIVE_BG: Record<string, string> = {
  all: 'bg-primary',
  trending: 'bg-primary',
  new: 'bg-neon-cyan text-black',
  legendary: 'bg-gradient-to-r from-yellow-500 to-orange-500',
  fire: 'bg-gradient-to-r from-red-500 to-orange-500',
  water: 'bg-gradient-to-r from-blue-500 to-cyan-500',
  electric: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black',
  grass: 'bg-gradient-to-r from-green-500 to-emerald-500',
  shadow: 'bg-gradient-to-r from-purple-600 to-violet-500',
  meme: 'bg-gradient-to-r from-cyan-400 to-green-400 text-black',
};

export function FilterBar({ activeFilter, onFilterChange }: FilterBarProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-hide">
      {FILTERS.map((filter) => {
        const isActive = activeFilter === filter.id;
        const Icon = filter.icon;
        
        return (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap',
              'transition-all duration-300 border-2',
              isActive
                ? cn(ACTIVE_BG[filter.id], 'border-transparent text-white shadow-lg')
                : cn(
                    'bg-secondary/50 border-border/50',
                    'hover:bg-secondary hover:border-border hover:scale-105',
                    filter.color || 'text-foreground'
                  )
            )}
            style={{
              boxShadow: isActive 
                ? `0 4px 0 rgba(0,0,0,0.3), 0 0 20px hsl(var(--primary) / 0.3)` 
                : undefined
            }}
          >
            <Icon className={cn('w-4 h-4', isActive && 'animate-pulse')} />
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}