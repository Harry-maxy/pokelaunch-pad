import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilterBar } from '@/components/FilterBar';
import { MonsterGrid } from '@/components/MonsterGrid';
import { fetchMonsters } from '@/lib/api';
import { Monster } from '@/types/monster';
import { Button } from '@/components/ui/button';
import { PlusCircle, Download, Layout, TrendingUp, Sparkles, Crown, Loader2 } from 'lucide-react';
import { PokemonCard } from '@/components/PokemonCard';

const Index = () => {
  const [filter, setFilter] = useState('all');
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    loadMonsters();
  }, [filter]);

  const loadMonsters = async () => {
    setLoading(true);
    const data = await fetchMonsters(filter);
    setMonsters(data);
    setLoading(false);
  };

  const trendingMonsters = [...monsters].sort((a, b) => b.marketCap - a.marketCap).slice(0, 4);
  const legendaryMonsters = monsters.filter(m => m.evolutionStage === 4).slice(0, 3);

  return (
    <div className="min-h-screen bg-background bg-pattern">
      {/* Hero Section */}
      <section className="relative py-12 px-6 border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-type-shadow/5" />
        <div className="relative max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1 space-y-4">
              <h1 className="font-display text-4xl lg:text-5xl font-black text-foreground">
                Launch Your <span className="text-primary glow-text">Monster</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Create unique Pokémon-inspired creatures, deploy them as tokens on Pump.fun, 
                and watch them evolve as their market cap grows.
              </p>
              <div className="flex flex-wrap gap-3 pt-4">
                <Button 
                  size="lg" 
                  className="btn-glow"
                  onClick={() => navigate('/create')}
                >
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Create Monster
                </Button>
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={() => navigate('/import')}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Import Stats
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate('/templates')}
                >
                  <Layout className="w-5 h-5 mr-2" />
                  Templates
                </Button>
              </div>
            </div>
            
            {/* Featured Card */}
            {trendingMonsters[0] && (
              <div className="animate-float">
                <PokemonCard 
                  monster={trendingMonsters[0]} 
                  size="lg"
                  onClick={() => navigate(`/monster/${trendingMonsters[0].id}`)}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Trending Section */}
          {trendingMonsters.length > 0 && (
            <section className="py-8 px-6 border-b border-border">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-2xl font-bold text-foreground">Trending Monsters</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {trendingMonsters.map((monster) => (
                    <PokemonCard
                      key={monster.id}
                      monster={monster}
                      size="md"
                      onClick={() => navigate(`/monster/${monster.id}`)}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Legendary Section */}
          {legendaryMonsters.length > 0 && (
            <section className="py-8 px-6 border-b border-border bg-gradient-to-r from-primary/5 via-transparent to-type-shadow/5">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-2 mb-6">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <h2 className="font-display text-2xl font-bold text-gradient-legendary">Legendary Monsters</h2>
                  <span className="text-xs text-muted-foreground ml-2">Stage 4 Evolutions</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {legendaryMonsters.map((monster) => (
                    <PokemonCard
                      key={monster.id}
                      monster={monster}
                      size="lg"
                      onClick={() => navigate(`/monster/${monster.id}`)}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* All Monsters Section */}
          <section className="py-8 px-6">
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-2xl font-bold text-foreground">Explore</h2>
                </div>
              </div>
              
              <FilterBar activeFilter={filter} onFilterChange={setFilter} />
              
              <MonsterGrid monsters={monsters} />
              
              {monsters.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No monsters found. Be the first to create one!</p>
                  <Button onClick={() => navigate('/create')} className="btn-glow">
                    Create Monster
                  </Button>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Index;
