import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchMonster } from '@/lib/api';
import { getPumpFunTokenInfo, PumpFunTokenData } from '@/lib/pumpfun';
import { PokemonCard } from '@/components/PokemonCard';
import { Button } from '@/components/ui/button';
import { Monster, formatMarketCap } from '@/types/monster';
import { 
  ArrowLeft, 
  ExternalLink, 
  Share2, 
  Download, 
  TrendingUp, 
  Users, 
  BarChart3,
  Clock,
  Crown,
  Loader2,
  Copy,
  Check,
  Twitter,
  Wallet,
  RefreshCw,
  LineChart
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function MonsterDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [monster, setMonster] = useState<Monster | null>(null);
  const [loading, setLoading] = useState(true);
  const [pumpData, setPumpData] = useState<PumpFunTokenData | null>(null);
  const [loadingPumpData, setLoadingPumpData] = useState(false);
  const [copiedMint, setCopiedMint] = useState(false);
  const [copiedCreator, setCopiedCreator] = useState(false);
  const [chartSource, setChartSource] = useState<'dexscreener' | 'birdeye' | 'geckoterminal'>('dexscreener');
  
  useEffect(() => {
    if (id) {
      loadMonster(id);
    }
  }, [id]);

  const loadMonster = async (monsterId: string) => {
    setLoading(true);
    const data = await fetchMonster(monsterId);
    setMonster(data);
    setLoading(false);
    
    // Load pump.fun data if mint address exists
    if (data?.mintAddress) {
      loadPumpData(data.mintAddress);
    }
  };

  const loadPumpData = async (mintAddress: string) => {
    setLoadingPumpData(true);
    try {
      const data = await getPumpFunTokenInfo(mintAddress);
      setPumpData(data);
    } catch (error) {
      console.error('Failed to load pump.fun data:', error);
    } finally {
      setLoadingPumpData(false);
    }
  };

  const refreshPumpData = () => {
    if (monster?.mintAddress) {
      loadPumpData(monster.mintAddress);
      toast.success('Refreshing market data...');
    }
  };

  const copyToClipboard = (text: string, type: 'mint' | 'creator') => {
    navigator.clipboard.writeText(text);
    if (type === 'mint') {
      setCopiedMint(true);
      setTimeout(() => setCopiedMint(false), 2000);
    } else {
      setCopiedCreator(true);
      setTimeout(() => setCopiedCreator(false), 2000);
    }
    toast.success('Copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!monster) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-foreground mb-4">
            Poke Not Found
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

  // Use pump.fun data if available, otherwise use local data
  const displayMarketCap = pumpData?.marketCap || monster.marketCap;
  const displayVolume = pumpData?.volume24h !== undefined ? pumpData.volume24h : monster.volume24h || 0;
  const displayHolders = pumpData?.holders !== undefined ? pumpData.holders : monster.holders || 0;
  const displayPriceChange = pumpData?.priceChange24h !== undefined ? pumpData.priceChange24h : monster.priceChange24h || 0;

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
            
            <div className="flex gap-3 mt-6 flex-wrap justify-center">
              <Button
                variant="outline"
                onClick={() => window.open(monster.pumpUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Pump
              </Button>
              {monster.twitterLink && (
                <Button
                  variant="outline"
                  onClick={() => window.open(monster.twitterLink, '_blank')}
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  Twitter
                </Button>
              )}
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

            {/* Mint Address */}
            {monster.mintAddress && (
              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    Token Address (Mint)
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshPumpData}
                    disabled={loadingPumpData}
                    className="h-8"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingPumpData ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 font-mono text-sm text-foreground bg-secondary/50 px-3 py-2 rounded break-all">
                    {monster.mintAddress}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(monster.mintAddress!, 'mint')}
                    className="shrink-0"
                  >
                    {copiedMint ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-sm">Market Cap</span>
                  {pumpData && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">LIVE</span>
                  )}
                </div>
                <p className="font-display text-2xl font-bold text-primary">
                  ${displayMarketCap.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
              
              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">24h Volume</span>
                  {pumpData && displayVolume > 0 && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">LIVE</span>
                  )}
                </div>
                <p className="font-display text-2xl font-bold text-foreground">
                  ${displayVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
              
              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Holders</span>
                  {pumpData && displayHolders > 0 && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">LIVE</span>
                  )}
                </div>
                <p className="font-display text-2xl font-bold text-foreground">
                  {displayHolders.toLocaleString()}
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

            {/* Price Chart */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                  <LineChart className="w-5 h-5" />
                  Price Chart
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(monster.pumpUrl, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Pump.fun
                  </Button>
                </div>
              </div>
              
              {monster.mintAddress ? (
                <div className="space-y-3">
                  {/* Chart Source Selector */}
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={chartSource === 'dexscreener' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChartSource('dexscreener')}
                      className="text-xs"
                    >
                      DexScreener
                    </Button>
                    <Button
                      variant={chartSource === 'birdeye' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChartSource('birdeye')}
                      className="text-xs"
                    >
                      Birdeye
                    </Button>
                    <Button
                      variant={chartSource === 'geckoterminal' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChartSource('geckoterminal')}
                      className="text-xs"
                    >
                      GeckoTerminal
                    </Button>
                  </div>
                  
                  {/* Chart Embed */}
                  <div className="relative w-full rounded-lg overflow-hidden border border-border/50" style={{ paddingBottom: '65%' }}>
                    {chartSource === 'dexscreener' && (
                      <iframe
                        src={`https://dexscreener.com/solana/${monster.mintAddress}?embed=1&theme=dark&trades=0&info=0`}
                        className="absolute top-0 left-0 w-full h-full"
                        title="DexScreener Chart"
                        loading="lazy"
                      />
                    )}
                    {chartSource === 'birdeye' && (
                      <iframe
                        src={`https://birdeye.so/tv-widget/${monster.mintAddress}?chain=solana&viewMode=pair&chartInterval=15&chartType=CANDLE&chartTimezone=Europe%2FMoscow&chartLeftToolbar=show&theme=dark`}
                        className="absolute top-0 left-0 w-full h-full"
                        title="Birdeye Chart"
                        loading="lazy"
                      />
                    )}
                    {chartSource === 'geckoterminal' && (
                      <iframe
                        src={`https://www.geckoterminal.com/solana/tokens/${monster.mintAddress}?embed=1&info=0&swaps=0`}
                        className="absolute top-0 left-0 w-full h-full"
                        title="GeckoTerminal Chart"
                        loading="lazy"
                      />
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Chart may take a few minutes to load for new tokens
                  </p>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center bg-secondary/30 rounded-lg border border-border/50">
                  <div className="text-center text-muted-foreground">
                    <LineChart className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No token address available</p>
                  </div>
                </div>
              )}
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

            {/* Creator Info */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <Crown className="w-4 h-4" />
                Creator Wallet
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-sm text-primary bg-secondary/50 px-3 py-2 rounded break-all">
                  {monster.creatorWallet}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(monster.creatorWallet, 'creator')}
                  className="shrink-0"
                >
                  {copiedCreator ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`https://solscan.io/account/${monster.creatorWallet}`, '_blank')}
                  className="shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
