import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMonsters } from '@/lib/api';
import { formatMarketCap, Monster } from '@/types/monster';
import { Button } from '@/components/ui/button';
import { Trophy, Crown, TrendingUp, Calendar, ArrowUpDown, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type SortField = 'marketCap' | 'evolutionStage' | 'createdAt';

export default function Leaderboard() {
  const navigate = useNavigate();
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('marketCap');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadMonsters();
  }, []);

  const loadMonsters = async () => {
    setLoading(true);
    const data = await fetchMonsters('trending');
    setMonsters(data);
    setLoading(false);
  };

  const sortedMonsters = [...monsters].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'marketCap':
        comparison = a.marketCap - b.marketCap;
        break;
      case 'evolutionStage':
        comparison = a.evolutionStage - b.evolutionStage;
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
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

  const getTypeBadgeClass = (type: string) => {
    return `type-${type.toLowerCase()}`;
  };

  const getEvolutionBadge = (stage: number) => {
    const badges = ['Hatchling', 'Evolved', 'Mega', 'Legendary'];
    const colors = [
      'bg-muted text-muted-foreground',
      'bg-blue-500/20 text-blue-400',
      'bg-purple-500/20 text-purple-400',
      'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400',
    ];
    return (
      <span className={cn('px-2 py-1 rounded-full text-xs font-bold', colors[stage - 1])}>
        {badges[stage - 1]}
      </span>
    );
  };

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
        <div className="flex items-center gap-3 mb-8">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Hall of Launches
            </h1>
            <p className="text-muted-foreground">
              The greatest monsters in the ecosystem
            </p>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <SortButton field="marketCap">
            <TrendingUp className="w-4 h-4" />
            Market Cap
          </SortButton>
          <SortButton field="evolutionStage">
            <Crown className="w-4 h-4" />
            Evolution
          </SortButton>
          <SortButton field="createdAt">
            <Calendar className="w-4 h-4" />
            Launch Date
          </SortButton>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left p-4 font-display text-sm text-muted-foreground">#</th>
                  <th className="text-left p-4 font-display text-sm text-muted-foreground">Monster</th>
                  <th className="text-left p-4 font-display text-sm text-muted-foreground">Type</th>
                  <th className="text-left p-4 font-display text-sm text-muted-foreground">Evolution</th>
                  <th className="text-right p-4 font-display text-sm text-muted-foreground">Market Cap</th>
                  <th className="text-left p-4 font-display text-sm text-muted-foreground">Creator</th>
                  <th className="text-left p-4 font-display text-sm text-muted-foreground">Launched</th>
                </tr>
              </thead>
              <tbody>
                {sortedMonsters.map((monster, idx) => (
                  <tr
                    key={monster.id}
                    onClick={() => navigate(`/monster/${monster.id}`)}
                    className="border-b border-border hover:bg-secondary/20 cursor-pointer transition-colors"
                  >
                    <td className="p-4">
                      <span className={cn(
                        'font-display font-bold',
                        idx === 0 && 'text-yellow-500',
                        idx === 1 && 'text-gray-400',
                        idx === 2 && 'text-orange-600',
                        idx > 2 && 'text-muted-foreground'
                      )}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden',
                          `card-frame-${monster.type.toLowerCase()}`
                        )}>
                          {monster.imageUrl && monster.imageUrl !== '/placeholder.svg' ? (
                            <img
                              src={monster.imageUrl}
                              alt={monster.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-lg">🔥</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{monster.name}</p>
                          <p className="text-xs font-mono text-muted-foreground">${monster.ticker}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={cn('type-badge', getTypeBadgeClass(monster.type))}>
                        {monster.type}
                      </span>
                    </td>
                    <td className="p-4">
                      {getEvolutionBadge(monster.evolutionStage)}
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-mono font-bold text-primary">
                        {formatMarketCap(monster.marketCap)}
                      </span>
                      {monster.priceChange24h !== undefined && (
                        <span className={cn(
                          'text-xs ml-2',
                          monster.priceChange24h >= 0 ? 'text-primary' : 'text-destructive'
                        )}>
                          {monster.priceChange24h >= 0 ? '↑' : '↓'}
                          {Math.abs(monster.priceChange24h).toFixed(1)}%
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-sm text-muted-foreground">
                        {monster.creatorWallet}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(monster.createdAt), 'MMM d, yyyy')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {monsters.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No monsters launched yet. Be the first!</p>
            <Button className="mt-4" onClick={() => navigate('/create')}>
              Create Monster
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
