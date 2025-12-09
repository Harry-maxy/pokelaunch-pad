import { cn } from '@/lib/utils';
import { Flame, Droplets, Zap, Leaf, Moon, Laugh, TrendingUp, Clock, Crown } from 'lucide-react';

interface FilterBarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const FILTERS = [
  { id: 'all', label: 'All', icon: null },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'new', label: 'New', icon: Clock },
  { id: 'legendary', label: 'Legendary', icon: Crown },
  { id: 'fire', label: 'Fire', icon: Flame },
  { id: 'water', label: 'Water', icon: Droplets },
  { id: 'electric', label: 'Electric', icon: Zap },
  { id: 'grass', label: 'Grass', icon: Leaf },
  { id: 'shadow', label: 'Shadow', icon: Moon },
  { id: 'meme', label: 'Meme', icon: Laugh },
];

export function FilterBar({ activeFilter, onFilterChange }: FilterBarProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {FILTERS.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap',
            'transition-all duration-200 border',
            activeFilter === filter.id
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-secondary/50 text-secondary-foreground border-border hover:bg-secondary hover:border-primary/50'
          )}
        >
          {filter.icon && <filter.icon className="w-4 h-4" />}
          {filter.label}
        </button>
      ))}
    </div>
  );
}
