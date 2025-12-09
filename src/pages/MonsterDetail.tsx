import { useParams, useNavigate } from 'react-router-dom';
import { useMonsterStore } from '@/store/monsterStore';
import { PokemonCard } from '@/components/PokemonCard';
import { Button } from '@/components/ui/button';
import { formatMarketCap } from '@/types/monster';
import { 
  ArrowLeft, 
  ExternalLink, 
  Share2, 
  Download, 
  TrendingUp, 
  Users, 
  BarChart3,
  Clock,
  Crown
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function MonsterDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getMonster } = useMonsterStore();
  
  const monster = getMonster(id || '');
  
  if (!monster) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-foreground mb-4">
            Monster Not Found
          </h1>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const evolutionProgress = (monster.evolutionStage / 4) * 100;
  const evolutionThresholds = [
    { stage: 1, label: 'Hatchling', mcRequired: 0 },
    { stage: 2, label: 'Evolved', mcRequired: 50000 },
    { stage: 3, label: 'Mega', mcRequired: 250000 },
    { stage: 4, label: 'Legendary', mcRequired: 1000000 },
  ];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const handleDownload = () => {
    toast.info('Card download feature coming soon!');
  };

  // Mock trade data
  const recentTrades = [
    { type: 'buy', amount: '$1,234', time: '2m ago', wallet: 'xK3...9fP' },
    { type: 'sell', amount: '$567', time: '5m ago', wallet: 'aB2...7qR' },
    { type: 'buy', amount: '$2,890', time: '12m ago', wallet: 'nM8...3vL' },
    { type: 'buy', amount: '$450', time: '18m ago', wallet: 'pQ1...6wX' },
  ];

  return (
    <div className="min-h-screen bg-background bg-pattern py-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Card Display */}
          <div className="flex flex-col items-center">
            <div className="animate-float">
              <PokemonCard monster={monster} size="lg" interactive={false} />
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => window.open(monster.pumpUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Pump
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          {/* Stats & Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                {monster.evolutionStage === 4 && (
                  <Crown className="w-6 h-6 text-yellow-500" />
                )}
                <h1 className="font-display text-3xl font-bold text-foreground">
                  {monster.name}
                </h1>
              </div>
              <p className="font-mono text-primary text-lg">${monster.ticker}</p>
              <p className="text-muted-foreground mt-2">{monster.description}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-sm">Market Cap</span>
                </div>
                <p className="font-display text-2xl font-bold text-primary">
                  {formatMarketCap(monster.marketCap)}
                </p>
              </div>
              
              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">24h Volume</span>
                </div>
                <p className="font-display text-2xl font-bold text-foreground">
                  {formatMarketCap(monster.volume24h || 0)}
                </p>
              </div>
              
              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Holders</span>
                </div>
                <p className="font-display text-2xl font-bold text-foreground">
                  {monster.holders?.toLocaleString() || 0}
                </p>
              </div>
              
              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Launched</span>
                </div>
                <p className="font-display text-lg font-bold text-foreground">
                  {format(new Date(monster.createdAt), 'MMM d, yyyy')}
                </p>
              </div>
            </div>

            {/* Evolution Progress */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-display text-lg font-bold text-foreground mb-4">
                Evolution Progress
              </h3>
              
              <div className="space-y-4">
                <div className="evolution-bar">
                  <div 
                    className="evolution-progress"
                    style={{ width: `${evolutionProgress}%` }}
                  />
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  {evolutionThresholds.map((threshold) => (
                    <div
                      key={threshold.stage}
                      className={`text-center p-2 rounded-lg transition-all ${
                        monster.evolutionStage >= threshold.stage
                          ? 'bg-primary/20 border border-primary'
                          : 'bg-secondary/30 border border-border'
                      }`}
                    >
                      <p className={`text-xs font-bold ${
                        monster.evolutionStage >= threshold.stage
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      }`}>
                        Stage {threshold.stage}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {threshold.label}
                      </p>
                      <p className="text-[10px] font-mono text-muted-foreground">
                        {formatMarketCap(threshold.mcRequired)}+
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Trades */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-display text-lg font-bold text-foreground mb-4">
                Recent Trades
              </h3>
              <div className="space-y-3">
                {recentTrades.map((trade, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                          trade.type === 'buy'
                            ? 'bg-primary/20 text-primary'
                            : 'bg-destructive/20 text-destructive'
                        }`}
                      >
                        {trade.type}
                      </span>
                      <span className="font-mono text-sm text-muted-foreground">
                        {trade.wallet}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-foreground">{trade.amount}</p>
                      <p className="text-xs text-muted-foreground">{trade.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Creator Info */}
            <div className="bg-secondary/30 rounded-xl p-4 border border-border">
              <p className="text-sm text-muted-foreground">
                Created by <span className="font-mono text-primary">{monster.creatorWallet}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
