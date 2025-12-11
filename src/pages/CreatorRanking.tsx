import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMonsters } from '@/lib/api';
import { formatMarketCap, Monster } from '@/types/monster';
import { Button } from '@/components/ui/button';
import { 
  Trophy, Crown, TrendingUp, Calendar, ArrowUpDown, Loader2, 
  Coins, Star, Award, Users, Sparkles 
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type SortField = 'marketCap' | 'evolutionStage' | 'popularity' | 'rewards';

interface CreatorData {
  wallet: string;
  monsters: Monster[];
  totalMarketCap: number;
  totalPopularity: number;
  rewardsEarned: number;
  topMonster: Monster | null;
  rank: number;
}

const calculatePopularity = (monster: Monster): number => {
  const mcScore = Math.log10(monster.marketCap + 1) * 10;
  const evolutionScore = monster.evolutionStage * 25;
  const holderScore = (monster.holders || 0) * 0.5;
  return Math.round(mcScore + evolutionScore + holderScore);
};

const calculateRewards = (popularity: number, rank: number): number => {
  const baseReward = popularity * 0.001;
  const rankMultiplier = Math.max(1, 10 - rank) / 5;
  return parseFloat((baseReward * rankMultiplier).toFixed(3));
};

const getRankBadge = (rank: number) => {
  if (rank === 1) return { label: 'Champion', color: 'bg-gradient-to-r from-legendary-gold to-yellow-400 text-background', icon: Crown };
  if (rank === 2) return { label: 'Elite', color: 'bg-gradient-to-r from-gray-300 to-gray-400 text-background', icon: Award };
  if (rank === 3) return { label: 'Master', color: 'bg-gradient-to-r from-orange-400 to-orange-600 text-background', icon: Trophy };
  if (rank <= 10) return { label: 'Pro', color: 'bg-primary/20 text-primary', icon: Star };
  return { label: 'Trainer', color: 'bg-secondary text-muted-foreground', icon: Users };
};

export default function CreatorRanking() {
  const navigate = useNavigate();
  const [creators, setCreators] = useState<CreatorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('popularity');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadCreators();
  }, []);

  const loadCreators = async () => {
    setLoading(true);
    const monsters = await fetchMonsters('trending');
    
    // Group by creator
    const creatorMap = new Map<string, Monster[]>();
    monsters.forEach(monster => {
      const wallet = monster.creatorWallet || 'Unknown';
      if (!creatorMap.has(wallet)) {
        creatorMap.set(wallet, []);
      }
      creatorMap.get(wallet)!.push(monster);
    });

    // Calculate creator stats
    const creatorList: CreatorData[] = Array.from(creatorMap.entries()).map(([wallet, monsterList]) => {
      const totalMarketCap = monsterList.reduce((sum, m) => sum + m.marketCap, 0);
      const totalPopularity = monsterList.reduce((sum, m) => sum + calculatePopularity(m), 0);
      const topMonster = monsterList.sort((a, b) => b.marketCap - a.marketCap)[0] || null;
      
      return {
        wallet,
        monsters: monsterList,
        totalMarketCap,
        totalPopularity,
        rewardsEarned: 0,
        topMonster,
        rank: 0,
      };
    });

    // Sort by popularity and assign ranks
    creatorList.sort((a, b) => b.totalPopularity - a.totalPopularity);
    creatorList.forEach((creator, idx) => {
      creator.rank = idx + 1;
      creator.rewardsEarned = calculateRewards(creator.totalPopularity, creator.rank);
    });

    setCreators(creatorList);
    setLoading(false);
  };

  const sortedCreators = [...creators].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'marketCap':
        comparison = a.totalMarketCap - b.totalMarketCap;
        break;
      case 'evolutionStage':
        const aMax = Math.max(...a.monsters.map(m => m.evolutionStage));
        const bMax = Math.max(...b.monsters.map(m => m.evolutionStage));
        comparison = aMax - bMax;
        break;
      case 'popularity':
        comparison = a.totalPopularity - b.totalPopularity;
        break;
      case 'rewards':
        comparison = a.rewardsEarned - b.rewardsEarned;
        break;
    }
    return sortDirection === 'desc' ? -comparison : comparison;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className={cn(
        'flex items-center gap-1',
        sortField === field && 'text-primary'
      )}
    >
      {children}
      <ArrowUpDown className="w-3 h-3" />
    </Button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-pattern py-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-legendary-gold to-accent flex items-center justify-center">
            <Crown className="w-6 h-6 text-background" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Creator Rankings
            </h1>
            <p className="text-muted-foreground">
              Top creators earn weekly SOL rewards
            </p>
          </div>
        </div>

        {/* Rewards Banner */}
        <div className="bg-gradient-to-r from-legendary-gold/10 via-accent/10 to-primary/10 rounded-xl border border-legendary-gold/30 p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-legendary-gold/20 flex items-center justify-center">
              <Coins className="w-7 h-7 text-legendary-gold" />
            </div>
            <div className="flex-1">
              <h2 className="font-display font-bold text-lg text-foreground mb-1">
                Weekly Reward Pool
              </h2>
              <p className="text-sm text-muted-foreground">
                Top creators receive SOL payouts based on their popularity score. 
                Higher ranking = greater rewards and visibility!
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-display font-bold text-legendary-gold">~10 SOL</p>
              <p className="text-xs text-muted-foreground">distributed weekly</p>
            </div>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <SortButton field="popularity">
            <Sparkles className="w-4 h-4" />
            Popularity
          </SortButton>
          <SortButton field="marketCap">
            <TrendingUp className="w-4 h-4" />
            Total Market Cap
          </SortButton>
          <SortButton field="rewards">
            <Coins className="w-4 h-4" />
            Rewards
          </SortButton>
        </div>

        {/* Ranking Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left p-4 font-display text-sm text-muted-foreground">Rank</th>
                  <th className="text-left p-4 font-display text-sm text-muted-foreground">Creator</th>
                  <th className="text-left p-4 font-display text-sm text-muted-foreground">Top Poke</th>
                  <th className="text-center p-4 font-display text-sm text-muted-foreground">Pokes</th>
                  <th className="text-right p-4 font-display text-sm text-muted-foreground">Popularity</th>
                  <th className="text-right p-4 font-display text-sm text-muted-foreground">Total MC</th>
                  <th className="text-right p-4 font-display text-sm text-muted-foreground">Rewards</th>
                </tr>
              </thead>
              <tbody>
                {sortedCreators.map((creator) => {
                  const badge = getRankBadge(creator.rank);
                  const BadgeIcon = badge.icon;
                  
                  return (
                    <tr
                      key={creator.wallet}
                      className="border-b border-border hover:bg-secondary/20 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'font-display font-bold text-lg w-8',
                            creator.rank === 1 && 'text-legendary-gold',
                            creator.rank === 2 && 'text-gray-400',
                            creator.rank === 3 && 'text-orange-500',
                            creator.rank > 3 && 'text-muted-foreground'
                          )}>
                            #{creator.rank}
                          </span>
                          <span className={cn('px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1', badge.color)}>
                            <BadgeIcon className="w-3 h-3" />
                            {badge.label}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-sm text-foreground">
                          {creator.wallet.slice(0, 6)}...{creator.wallet.slice(-4)}
                        </span>
                      </td>
                      <td className="p-4">
                        {creator.topMonster ? (
                          <button
                            onClick={() => navigate(`/poke/${creator.topMonster!.id}`)}
                            className="flex items-center gap-2 hover:text-primary transition-colors"
                          >
                            <div className={cn(
                              'w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden',
                              `card-frame-${creator.topMonster.type.toLowerCase()}`
                            )}>
                              {creator.topMonster.imageUrl && creator.topMonster.imageUrl !== '/placeholder.svg' ? (
                                <img
                                  src={creator.topMonster.imageUrl}
                                  alt={creator.topMonster.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-sm">🔥</span>
                              )}
                            </div>
                            <span className="font-medium text-sm">{creator.topMonster.name}</span>
                          </button>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-2 py-1 rounded-full bg-secondary text-sm font-medium">
                          {creator.monsters.length}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-mono font-bold text-accent">
                          {creator.totalPopularity.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-mono font-bold text-primary">
                          {formatMarketCap(creator.totalMarketCap)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-mono font-bold text-legendary-gold">
                          {creator.rewardsEarned} SOL
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {creators.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No creators yet. Be the first!</p>
            <Button className="mt-4 btn-pokemon" onClick={() => navigate('/create')}>
              Create Your Poke
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
