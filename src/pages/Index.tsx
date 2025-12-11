import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMonsters } from '@/lib/api';
import { Monster } from '@/types/monster';
import { Button } from '@/components/ui/button';
import { Loader2, Zap, Search, Crown, Sparkles } from 'lucide-react';
import { PokemonCard } from '@/components/PokemonCard';

const Index = () => {
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadMonsters();
  }, []);

  const loadMonsters = async () => {
    setLoading(true);
    const data = await fetchMonsters('all');
    setMonsters(data);
    setLoading(false);
  };

  const legendaryCount = monsters.filter(m => m.evolutionStage === 4).length;
  const creatorCount = new Set(monsters.map(m => m.creatorWallet)).size;

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <section className="py-12 px-6 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="font-display text-4xl font-bold text-foreground mb-2">
                Poke<span className="text-primary">Launch</span>
              </h1>
              <p className="text-muted-foreground">
                Create and launch your Poke tokens
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                size="lg" 
                className="btn-pokemon px-8 py-6 text-lg"
                onClick={() => navigate('/create')}
              >
                <Zap className="w-5 h-5 mr-2" />
                Create Poke
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/discover')}
              >
                <Search className="w-4 h-4 mr-1" />
                Discover
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/ranking')}
              >
                <Crown className="w-4 h-4 mr-1" />
                Ranking
              </Button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex gap-6 mt-8 pt-6 border-t border-border/50">
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold text-primary">{monsters.length}</span>
              <span className="text-sm text-muted-foreground">Pokes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold text-legendary-gold">{legendaryCount}</span>
              <span className="text-sm text-muted-foreground">Legendary</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold text-accent">{creatorCount}</span>
              <span className="text-sm text-muted-foreground">Creators</span>
            </div>
          </div>
        </div>
      </section>

      {/* Deployed Tokens Grid */}
      <section className="py-8 px-6">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading pokes...</p>
            </div>
          ) : monsters.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {monsters.map((monster) => (
                <PokemonCard
                  key={monster.id}
                  monster={monster}
                  size="md"
                  interactive
                  onClick={() => navigate(`/poke/${monster.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-2">No Pokes Yet</h3>
              <p className="text-muted-foreground mb-6">Be the first to create one!</p>
              <Button onClick={() => navigate('/create')} className="btn-pokemon">
                <Zap className="w-4 h-4 mr-2" />
                Create Poke
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;