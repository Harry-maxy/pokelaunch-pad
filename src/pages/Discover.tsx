import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMonsters } from '@/lib/api';
import { Monster, MonsterType } from '@/types/monster';
import { PokemonCard } from '@/components/PokemonCard';
import { FilterBar } from '@/components/FilterBar';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'trending' | 'newest' | MonsterType;

export default function Discover() {
  const navigate = useNavigate();
  const [pokes, setPokes] = useState<Monster[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  useEffect(() => {
    loadPokes();
  }, [activeFilter]);

  const loadPokes = async () => {
    setLoading(true);
    let data: Monster[];
    
    if (activeFilter === 'trending') {
      data = await fetchMonsters('trending');
    } else if (activeFilter === 'newest') {
      data = await fetchMonsters('newest');
    } else if (activeFilter === 'all') {
      data = await fetchMonsters('all');
    } else {
      // Filter by type
      data = await fetchMonsters('all');
      data = data.filter(p => p.type === activeFilter);
    }
    
    setPokes(data);
    setLoading(false);
  };

  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'trending', label: 'Trending' },
    { value: 'newest', label: 'New' },
    { value: 'Fire', label: '🔥 Fire' },
    { value: 'Water', label: '💧 Water' },
    { value: 'Electric', label: '⚡ Electric' },
    { value: 'Grass', label: '🌿 Grass' },
    { value: 'Shadow', label: '👻 Shadow' },
    { value: 'Meme', label: '🐸 Meme' },
  ];

  return (
    <div className="min-h-screen bg-background bg-pattern py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Search className="w-6 h-6 text-background" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                Discover Pokes
              </h1>
              <p className="text-muted-foreground">
                Explore all launched Poke tokens
              </p>
            </div>
          </div>
          <Button className="btn-pokemon" onClick={() => navigate('/create')}>
            <Sparkles className="w-4 h-4 mr-2" />
            Create Poke
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {filters.map((filter) => (
            <Button
              key={filter.value}
              variant={activeFilter === filter.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter(filter.value)}
              className={cn(
                'rounded-full',
                activeFilter === filter.value && 'btn-pokemon'
              )}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : pokes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pokes.map((poke) => (
              <PokemonCard
                key={poke.id}
                monster={poke}
                size="md"
                interactive
                onClick={() => navigate(`/poke/${poke.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg mb-4">
              No Pokes found with this filter.
            </p>
            <Button className="btn-pokemon" onClick={() => navigate('/create')}>
              Be the First to Create One!
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
