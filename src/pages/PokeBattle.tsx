import { Swords, Zap, Trophy, Star, Shield, Flame, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const upcomingFeatures = [
  {
    icon: Swords,
    title: 'PvP Battles',
    description: 'Your Pokes will battle based on stats influenced by Market Cap, engagement, and rarity.',
  },
  {
    icon: Zap,
    title: 'ATK / DEF / SPD Stats',
    description: 'Stats dynamically calculated from token performance and community activity.',
  },
  {
    icon: Star,
    title: 'Vote-Based Boosts',
    description: 'Community can vote to boost their favorite Pokes before battles.',
  },
  {
    icon: Trophy,
    title: 'Weekly Tournaments',
    description: 'Compete in weekly tournaments for SOL rewards and exclusive badges.',
  },
  {
    icon: Shield,
    title: 'Evolution Bonuses',
    description: 'Higher evolution stages grant significant battle advantages.',
  },
  {
    icon: Flame,
    title: 'Legendary Rewards',
    description: 'Winners receive rare items, SOL payouts, and permanent prestige.',
  },
];

export default function PokeBattle() {
  return (
    <div className="min-h-screen bg-background bg-pattern py-8 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-type-shadow/20 border border-type-shadow/30 mb-6">
            <Clock className="w-4 h-4 text-type-shadow" />
            <span className="text-sm font-medium text-type-shadow">Coming Soon</span>
          </div>
          
          <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground mb-4">
            Poke<span className="text-primary">Battle</span> Arena
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Soon your Pokes will clash in epic battles. Stats powered by Market Cap, 
            community engagement, rarity, and evolutions. Winners take all.
          </p>

          {/* Animated Battle Preview */}
          <div className="relative max-w-xl mx-auto mb-12">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-type-electric/20 to-type-shadow/20 blur-3xl rounded-full" />
            <div className="relative bg-card/80 backdrop-blur-sm rounded-2xl border border-border p-8">
              <div className="flex items-center justify-between gap-8">
                {/* Left Fighter */}
                <div className="flex-1 text-center">
                  <div className={cn(
                    'w-24 h-24 mx-auto rounded-2xl flex items-center justify-center mb-3',
                    'bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary/50',
                    'animate-pulse'
                  )}>
                    <span className="text-4xl">🔥</span>
                  </div>
                  <p className="font-display font-bold text-foreground">???</p>
                  <div className="flex justify-center gap-1 mt-2">
                    <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-xs font-mono">ATK: ???</span>
                  </div>
                </div>

                {/* VS */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-legendary-gold to-accent flex items-center justify-center animate-bounce">
                    <span className="font-display font-black text-lg text-background">VS</span>
                  </div>
                  <div className="absolute inset-0 bg-legendary-gold/30 rounded-full blur-xl" />
                </div>

                {/* Right Fighter */}
                <div className="flex-1 text-center">
                  <div className={cn(
                    'w-24 h-24 mx-auto rounded-2xl flex items-center justify-center mb-3',
                    'bg-gradient-to-br from-type-water/30 to-type-water/10 border-2 border-type-water/50',
                    'animate-pulse'
                  )}>
                    <span className="text-4xl">💧</span>
                  </div>
                  <p className="font-display font-bold text-foreground">???</p>
                  <div className="flex justify-center gap-1 mt-2">
                    <span className="px-2 py-0.5 rounded bg-type-water/20 text-type-water text-xs font-mono">DEF: ???</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {upcomingFeatures.map((feature, idx) => (
            <div
              key={feature.title}
              className={cn(
                'group relative bg-card rounded-xl border border-border p-6',
                'hover:border-primary/50 transition-all duration-300',
                'hover:shadow-lg hover:shadow-primary/10'
              )}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className={cn(
                'w-12 h-12 rounded-xl mb-4 flex items-center justify-center',
                'bg-gradient-to-br from-primary/20 to-type-shadow/20',
                'group-hover:from-primary/30 group-hover:to-type-shadow/30 transition-colors'
              )}>
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-br from-card to-secondary/30 rounded-2xl border border-border p-8">
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">
            Prepare Your Pokes
          </h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            The stronger your Poke's market cap and community, the more powerful it will be in battle. 
            Start growing your army now!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="btn-pokemon" onClick={() => window.location.href = '/create'}>
              Create a Poke
            </Button>
            <Button variant="outline" className="border-primary/30" onClick={() => window.location.href = '/discover'}>
              Discover Pokes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
