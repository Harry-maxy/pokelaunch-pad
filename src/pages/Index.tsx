import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilterBar } from '@/components/FilterBar';
import { MonsterGrid } from '@/components/MonsterGrid';
import { fetchMonsters } from '@/lib/api';
import { Monster, formatMarketCap } from '@/types/monster';
import { Button } from '@/components/ui/button';
import { PlusCircle, Download, Layout, TrendingUp, Sparkles, Crown, Loader2, Zap, Trophy, Users, Swords } from 'lucide-react';
import { PokemonCard } from '@/components/PokemonCard';
import { cn } from '@/lib/utils';

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
  const newestMonsters = [...monsters].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);
  const legendaryMonsters = monsters.filter(m => m.evolutionStage === 4).slice(0, 3);

  // Calculate top creators
  const creatorMap = new Map<string, { wallet: string; count: number; totalMC: number }>();
  monsters.forEach(m => {
    const wallet = m.creatorWallet || 'Unknown';
    const existing = creatorMap.get(wallet) || { wallet, count: 0, totalMC: 0 };
    existing.count++;
    existing.totalMC += m.marketCap;
    creatorMap.set(wallet, existing);
  });
  const topCreators = Array.from(creatorMap.values())
    .sort((a, b) => b.totalMC - a.totalMC)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-16 px-6 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-pattern opacity-50" />
        
        {/* Animated particles */}
        <div className="absolute top-20 left-20 w-2 h-2 rounded-full bg-primary/50 animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute top-40 right-32 w-3 h-3 rounded-full bg-accent/50 animate-float" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-20 left-1/3 w-2 h-2 rounded-full bg-type-electric/50 animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 right-20 w-4 h-4 rounded-full bg-type-shadow/30 animate-float" style={{ animationDelay: '1.5s' }} />
        
        <div className="relative max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="flex-1 space-y-6 animate-slide-up">
              <h1 className="font-display text-5xl lg:text-6xl font-bold text-foreground title-shadow leading-tight">
                Launch Your <br />
                <span className="text-gradient-legendary">Poke</span> Token
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                Create unique Pokes, deploy them as tokens on Pump.fun, 
                and watch them <span className="text-accent font-semibold">evolve</span> as their market cap grows.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Button size="lg" className="btn-pokemon px-8 py-6 text-lg" onClick={() => navigate('/create')}>
                  <Zap className="w-5 h-5 mr-2" />
                  Create Poke
                </Button>
                <Button size="lg" variant="secondary" className="px-6 py-6 border-2 border-border hover:border-accent/50 hover:bg-accent/10 transition-all" onClick={() => navigate('/ranking')}>
                  <Trophy className="w-5 h-5 mr-2" />
                  View Ranking
                </Button>
                <Button size="lg" variant="outline" className="px-6 py-6 hover:bg-type-shadow/10 hover:border-type-shadow/50" onClick={() => navigate('/discover')}>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Discover
                </Button>
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-6">
                <div className="text-center">
                  <p className="font-display text-3xl font-bold text-gradient-fire">{monsters.length}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Pokes</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-3xl font-bold text-gradient-electric">{legendaryMonsters.length}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Legendary</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-3xl font-bold text-gradient-meme">{topCreators.length}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Creators</p>
                </div>
              </div>
            </div>
            
            {/* Featured Card */}
            {trendingMonsters[0] && (
              <div className="animate-float animate-slide-up-delay-2">
                <PokemonCard monster={trendingMonsters[0]} size="lg" onClick={() => navigate(`/poke/${trendingMonsters[0].id}`)} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <div className="absolute inset-0 w-12 h-12 rounded-full bg-primary/20 animate-ping" />
          </div>
          <p className="text-muted-foreground font-medium animate-pulse">Loading pokes...</p>
        </div>
      ) : (
        <>
          {/* Trending Section */}
          {trendingMonsters.length > 0 && (
            <section className="py-12 px-6 border-t border-border">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/20 border border-primary/30">
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-display text-3xl font-bold text-foreground">Trending</h2>
                      <p className="text-sm text-muted-foreground">Top performing Pokes</p>
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => navigate('/discover')}>
                    View All →
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {trendingMonsters.map((monster, idx) => (
                    <div key={monster.id} className="animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                      <PokemonCard monster={monster} size="md" onClick={() => navigate(`/poke/${monster.id}`)} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* New Launches Section */}
          {newestMonsters.length > 0 && (
            <section className="py-12 px-6 border-t border-border">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-accent/20 border border-accent/30">
                      <Sparkles className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h2 className="font-display text-3xl font-bold text-foreground">New Launches</h2>
                      <p className="text-sm text-muted-foreground">Fresh Pokes just deployed</p>
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => navigate('/discover')}>
                    View All →
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {newestMonsters.map((monster, idx) => (
                    <div key={monster.id} className="animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                      <PokemonCard monster={monster} size="md" onClick={() => navigate(`/poke/${monster.id}`)} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Top Creators Preview */}
          {topCreators.length > 0 && (
            <section className="py-12 px-6 border-t border-border">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-legendary-gold/20 border border-legendary-gold/30">
                      <Crown className="w-6 h-6 text-legendary-gold" />
                    </div>
                    <div>
                      <h2 className="font-display text-3xl font-bold text-foreground">Top Creators</h2>
                      <p className="text-sm text-muted-foreground">Leading the PokeLaunch revolution</p>
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => navigate('/ranking')}>
                    Full Ranking →
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {topCreators.map((creator, idx) => (
                    <div
                      key={creator.wallet}
                      onClick={() => navigate('/ranking')}
                      className={cn(
                        'p-4 rounded-xl border cursor-pointer transition-all hover:scale-105',
                        idx === 0 ? 'bg-gradient-to-br from-legendary-gold/10 to-yellow-500/5 border-legendary-gold/30' :
                        idx === 1 ? 'bg-gradient-to-br from-gray-300/10 to-gray-500/5 border-gray-400/30' :
                        idx === 2 ? 'bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/30' :
                        'bg-card border-border'
                      )}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className={cn(
                          'font-display font-bold text-lg',
                          idx === 0 && 'text-legendary-gold',
                          idx === 1 && 'text-gray-400',
                          idx === 2 && 'text-orange-500',
                          idx > 2 && 'text-muted-foreground'
                        )}>
                          #{idx + 1}
                        </span>
                        <Users className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <p className="font-mono text-sm text-foreground truncate">
                        {creator.wallet.slice(0, 8)}...
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {creator.count} Pokes • {formatMarketCap(creator.totalMC)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* PokeBattle CTA */}
          <section className="py-12 px-6 border-t border-border">
            <div className="max-w-4xl mx-auto">
              <div className="relative bg-gradient-to-r from-type-shadow/10 via-primary/5 to-type-shadow/10 rounded-2xl border border-type-shadow/30 p-8 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-type-shadow/20 rounded-full blur-3xl" />
                <div className="relative flex flex-col md:flex-row items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-type-shadow/20 flex items-center justify-center">
                    <Swords className="w-8 h-8 text-type-shadow" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                      PokeBattle Arena — Coming Soon
                    </h3>
                    <p className="text-muted-foreground">
                      Your Pokes will soon battle based on stats influenced by Market Cap, engagement, and more!
                    </p>
                  </div>
                  <Button variant="outline" className="border-type-shadow/50 hover:bg-type-shadow/10" onClick={() => navigate('/battle')}>
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Legendary Section */}
          {legendaryMonsters.length > 0 && (
            <section className="py-12 px-6 border-t border-border relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-transparent to-purple-500/5" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(45_100%_50%_/_0.03)_0%,transparent_70%)]" />
              
              <div className="relative max-w-6xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border border-yellow-500/40 animate-pulse-glow">
                    <Crown className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h2 className="font-display text-3xl font-bold text-gradient-legendary">Legendary</h2>
                    <p className="text-sm text-muted-foreground">Stage 4 Evolutions • $1M+ Market Cap</p>
                  </div>
                  <div className="ml-auto">
                    <span className="sparkle px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold">
                      RARE
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {legendaryMonsters.map((monster, idx) => (
                    <div key={monster.id} className="animate-slide-up" style={{ animationDelay: `${idx * 0.15}s` }}>
                      <PokemonCard monster={monster} size="lg" onClick={() => navigate(`/poke/${monster.id}`)} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* All Pokes Section */}
          <section className="py-12 px-6 border-t border-border">
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-neon-cyan/20 border border-neon-cyan/30">
                  <Sparkles className="w-6 h-6 text-neon-cyan" />
                </div>
                <div>
                  <h2 className="font-display text-3xl font-bold text-foreground">Explore</h2>
                  <p className="text-sm text-muted-foreground">Discover all Pokes</p>
                </div>
              </div>
              
              <FilterBar activeFilter={filter} onFilterChange={setFilter} />
              
              <MonsterGrid monsters={monsters} />
              
              {monsters.length === 0 && (
                <div className="text-center py-16 pokedex-panel p-8">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground mb-2">No Pokes Found</h3>
                  <p className="text-muted-foreground mb-6">Be the first to create one and start the revolution!</p>
                  <Button onClick={() => navigate('/create')} className="btn-legendary px-8 py-4 text-lg">
                    <Zap className="w-5 h-5 mr-2" />
                    Create Poke
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