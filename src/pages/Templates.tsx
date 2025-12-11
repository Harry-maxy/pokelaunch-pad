import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { CustomWalletButton } from '@/components/CustomWalletButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PokemonCard } from '@/components/PokemonCard';
import { TypeSelector } from '@/components/TypeSelector';
import { LaunchSuccessModal } from '@/components/LaunchSuccessModal';
import { createMonster, generateMonsterImage } from '@/lib/api';
import { Monster, MonsterType, Move, Rarity } from '@/types/monster';
import { fetchPopularPokemon, PokemonData } from '@/lib/pokeapi';
import { Rocket, Layout, Loader2, Wallet, Wand2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getWalletBalance, checkMinimumBalance, formatSolBalance, MINIMUM_BALANCE_SOL } from '@/lib/solana';
import { createPumpFunToken, TokenMetadata } from '@/lib/pumpfun';

export default function Templates() {
  const navigate = useNavigate();
  const { publicKey, connected } = useWallet();
  const wallet = useWallet();
  const { connection } = useConnection();
  const [pokemonTemplates, setPokemonTemplates] = useState<PokemonData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showLaunchDialog, setShowLaunchDialog] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [ticker, setTicker] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<MonsterType>('Fire');
  const [hp, setHp] = useState(100);
  const [moves, setMoves] = useState<Move[]>([]);
  const [rarity, setRarity] = useState<Rarity>('Common');
  const [imageUrl, setImageUrl] = useState('');
  const [twitterLink, setTwitterLink] = useState('');
  
  const [isLaunching, setIsLaunching] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [launchedMonster, setLaunchedMonster] = useState<Monster | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  // Fetch wallet balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (connected && publicKey) {
        try {
          const bal = await getWalletBalance(connection, publicKey);
          setBalance(bal);
        } catch (error) {
          console.error('Failed to fetch balance:', error);
        }
      } else {
        setBalance(null);
      }
    };

    fetchBalance();
  }, [connected, publicKey, connection]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      // Fetch real Pokemon data from PokeAPI
      const pokemon = await fetchPopularPokemon();
      setPokemonTemplates(pokemon);
    } catch (error) {
      console.error('Failed to load Pokemon templates:', error);
      toast.error('Failed to load templates');
    }
    setLoading(false);
  };

  const handleSelectPokemon = (pokemon: PokemonData) => {
    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    const pokemonType = pokemon.types[0] as MonsterType || 'Meme';
    const pokemonRarity: Rarity = pokemon.stats.hp > 100 ? 'Epic' : pokemon.stats.hp > 80 ? 'Rare' : 'Uncommon';
    
    setName(pokemon.name);
    setTicker(pokemon.name.toUpperCase().replace(/\s/g, '').slice(0, 10));
    setDescription(`${pokemon.name} - A powerful ${pokemonType} type creature with ${pokemon.stats.hp} HP!`);
    setType(pokemonType);
    setHp(pokemon.stats.hp);
    setMoves(pokemon.moves.map(m => ({ name: m.name, damage: m.power })));
    setRarity(pokemonRarity);
    setImageUrl(pokemon.imageUrl);
    setTwitterLink('');
    setShowLaunchDialog(true);
  };

  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    toast.info('Generating artwork...');
    
    try {
      const prompt = `${name} - ${description}`;
      const generatedUrl = await generateMonsterImage(prompt, type);
      
      if (generatedUrl) {
        setImageUrl(generatedUrl);
        toast.success('Artwork generated!');
      } else {
        toast.error('Failed to generate image');
      }
    } catch (err) {
      toast.error('Image generation failed');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const previewMonster: Partial<Monster> = {
    name,
    ticker,
    description,
    type,
    hp,
    imageUrl: imageUrl || undefined,
    moves,
    rarity,
    marketCap: 0,
    evolutionStage: 1,
  };

  const hasMinBalance = balance !== null && checkMinimumBalance(balance);

  const handleLaunch = async () => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!name || !ticker) {
      toast.error('Please enter a name and ticker');
      return;
    }

    if (!hasMinBalance) {
      toast.error(`Insufficient balance. You need at least ${MINIMUM_BALANCE_SOL} SOL.`);
      return;
    }

    setIsLaunching(true);
    
    try {
      const walletAddress = publicKey.toBase58();
      
      // Deploy to pump.fun
      toast.info('Creating token on Pump.fun...');
      
      const tokenMetadata: TokenMetadata = {
        name,
        symbol: ticker,
        description,
        imageUrl: imageUrl || '/placeholder.svg',
        twitter: twitterLink || undefined,
      };

      const deployResult = await createPumpFunToken(connection, wallet, {
        metadata: tokenMetadata,
        devBuyAmountSol: 0, // No dev buy for templates
      });

      if (!deployResult.success) {
        toast.warning('Pump.fun deployment skipped. Saving locally...');
      } else {
        toast.success('Token created on Pump.fun!');
      }

      const newMonster = await createMonster(walletAddress, {
        name,
        ticker,
        description,
        type,
        hp,
        imageUrl: imageUrl || '/placeholder.svg',
        moves,
        rarity,
        mintAddress: deployResult.mintAddress,
        twitterLink: twitterLink || undefined,
      });
      
      if (newMonster) {
        setLaunchedMonster(newMonster);
        setShowLaunchDialog(false);
        setShowSuccessModal(true);
        toast.success('Monster launched!');
      } else {
        toast.error('Failed to launch monster');
      }
    } catch (err) {
      toast.error('Launch failed');
    } finally {
      setIsLaunching(false);
    }
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
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Layout className="w-8 h-8 text-primary" />
            <h1 className="font-display text-3xl font-bold text-foreground">
              Template Gallery
            </h1>
          </div>
          <p className="text-muted-foreground">
            Choose from AI-generated monster templates and customize before launch
          </p>
          
          {!connected && (
            <div className="mt-4 flex items-center gap-4">
              <CustomWalletButton />
              <span className="text-sm text-muted-foreground">Connect wallet to use templates</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pokemonTemplates.map((pokemon) => {
            const pokemonType = pokemon.types[0] as MonsterType || 'Meme';
            const pokemonRarity: Rarity = pokemon.stats.hp > 100 ? 'Epic' : pokemon.stats.hp > 80 ? 'Rare' : 'Uncommon';
            
            return (
              <div key={pokemon.id} className="group">
                <PokemonCard
                  monster={{
                    name: pokemon.name,
                    type: pokemonType,
                    hp: pokemon.stats.hp,
                    imageUrl: pokemon.imageUrl,
                    moves: pokemon.moves.map(m => ({ name: m.name, damage: m.power })),
                    rarity: pokemonRarity,
                    evolutionStage: 1,
                  }}
                  size="md"
                  onClick={() => handleSelectPokemon(pokemon)}
                />
                <div className="mt-3 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    className="btn-glow"
                    onClick={() => handleSelectPokemon(pokemon)}
                  >
                    Use as Template
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {pokemonTemplates.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Failed to load Pokemon templates. Please refresh.</p>
            <Button className="mt-4" onClick={loadTemplates}>
              Retry
            </Button>
          </div>
        )}
      </div>

      {/* Launch Dialog */}
      <Dialog open={showLaunchDialog} onOpenChange={setShowLaunchDialog}>
        <DialogContent className="max-w-4xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-foreground">
              Customize & Launch
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid md:grid-cols-2 gap-6 py-4">
            {/* Form */}
            <div className="space-y-4">
              {/* Balance info */}
              {balance !== null && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  hasMinBalance 
                    ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
                    : 'bg-destructive/10 border border-destructive/30 text-destructive'
                }`}>
                  <Wallet className="w-4 h-4" />
                  <span className="font-mono text-sm">{formatSolBalance(balance)} SOL</span>
                  {!hasMinBalance && <AlertCircle className="w-4 h-4" />}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Monster Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ticker</Label>
                  <Input
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value.toUpperCase())}
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <TypeSelector value={type} onChange={setType} />
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleGenerateImage}
                disabled={isGeneratingImage}
              >
                {isGeneratingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate AI Image
                  </>
                )}
              </Button>

              <Button
                className="w-full btn-glow"
                onClick={handleLaunch}
                disabled={isLaunching || !hasMinBalance}
              >
                {isLaunching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Launching...
                  </>
                ) : !hasMinBalance ? (
                  <>
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Insufficient Balance
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4 mr-2" />
                    Launch on Pump.fun
                  </>
                )}
              </Button>
            </div>

            {/* Preview */}
            <div className="flex justify-center items-start">
              <PokemonCard monster={previewMonster} size="lg" interactive={false} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <LaunchSuccessModal
        monster={launchedMonster}
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />
    </div>
  );
}
