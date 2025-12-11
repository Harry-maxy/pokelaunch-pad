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
    // Use enrichWithLiveData=true to fetch real-time data from pump.fun for first 12 tokens
    const data = await fetchMonsters('all', true);
    setMonsters(data);
    setLoading(false);
  };

  // Calculate all stats
  const legendaryCount = monsters.filter(m => m.rarity === 'Legendary').length;
  const epicCount = monsters.filter(m => m.rarity === 'Epic').length;
  const rareCount = monsters.filter(m => m.rarity === 'Rare').length;
  const creatorCount = new Set(monsters.map(m => m.creatorWallet)).size;

  // Type breakdown
  const typeStats = {
    Fire: monsters.filter(m => m.type === 'Fire').length,
    Water: monsters.filter(m => m.type === 'Water').length,
    Electric: monsters.filter(m => m.type === 'Electric').length,
    Grass: monsters.filter(m => m.type === 'Grass').length,
    Shadow: monsters.filter(m => m.type === 'Shadow').length,
    Meme: monsters.filter(m => m.type === 'Meme').length
  };
  return <div className="min-h-screen bg-background">
      {/* Stats Bar - aligned with sidebar borders */}
      <div className="border-b border-sidebar-border">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Left: Stats */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-bold text-primary">{monsters.length}</span>
              <span className="text-xs text-muted-foreground">Pokes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-bold text-legendary-gold">{legendaryCount}</span>
              <span className="text-xs text-muted-foreground">Legendary</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-bold text-type-shadow">{epicCount}</span>
              <span className="text-xs text-muted-foreground">Epic</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-bold text-type-water">{rareCount}</span>
              <span className="text-xs text-muted-foreground">Rare</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-bold text-accent">{creatorCount}</span>
              <span className="text-xs text-muted-foreground">Creators</span>
            </div>
            <div className="h-4 w-px bg-border" />
            {/* Type Stats inline */}
            {Object.entries(typeStats).map(([type, count]) => {})}
          </div>
          
          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2">
            <Button className="btn-pokemon h-8 text-sm" onClick={() => navigate('/create')}>
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              Create Poke
            </Button>
            <Button variant="outline" size="sm" className="h-8" onClick={() => navigate('/discover')}>
              <Search className="w-3.5 h-3.5 mr-1.5" />
              Discover
            </Button>
            <Button variant="outline" size="sm" className="h-8" onClick={() => navigate('/ranking')}>
              <Crown className="w-3.5 h-3.5 mr-1.5" />
              Ranking
            </Button>
          </div>
        </div>
      </div>

      {/* Deployed Tokens Grid */}
      <section className="p-6">
        {loading ? <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading pokes...</p>
          </div> : monsters.length > 0 ? <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {monsters.map(monster => <PokemonCard key={monster.id} monster={monster} size="xs" interactive onClick={() => navigate(`/poke/${monster.id}`)} />)}
          </div> : <div className="text-center py-16">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground mb-2">No Pokes Yet</h3>
            <p className="text-sm text-muted-foreground mb-5">Be the first to create one!</p>
            <Button onClick={() => navigate('/create')} className="btn-pokemon">
              <Zap className="w-4 h-4 mr-2" />
              Create Poke
            </Button>
          </div>}
      </section>
    </div>;
};
export default Index;