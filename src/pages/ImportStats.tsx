import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PokemonCard } from '@/components/PokemonCard';
import { TypeSelector } from '@/components/TypeSelector';
import { LaunchSuccessModal } from '@/components/LaunchSuccessModal';
import { useMonsterStore } from '@/store/monsterStore';
import { Monster, MonsterType, Move, Rarity } from '@/types/monster';
import { Search, Loader2, Rocket, Wand2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PokemonAPICard {
  name: string;
  hp?: string;
  types?: string[];
  attacks?: { name: string; damage: string }[];
  rarity?: string;
}

function mapPokemonType(types: string[]): MonsterType {
  const typeMap: Record<string, MonsterType> = {
    Fire: 'Fire',
    Water: 'Water',
    Lightning: 'Electric',
    Grass: 'Grass',
    Psychic: 'Shadow',
    Darkness: 'Shadow',
    Dragon: 'Fire',
    Metal: 'Shadow',
    Fairy: 'Meme',
    Colorless: 'Meme',
  };
  return typeMap[types[0]] || 'Meme';
}

function mapRarity(rarity?: string): Rarity {
  if (!rarity) return 'Common';
  if (rarity.includes('Rare Holo')) return 'Epic';
  if (rarity.includes('Rare')) return 'Rare';
  if (rarity.includes('Uncommon')) return 'Uncommon';
  if (rarity.includes('Common')) return 'Common';
  return 'Uncommon';
}

export default function ImportStats() {
  const navigate = useNavigate();
  const { addMonster } = useMonsterStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<PokemonAPICard[]>([]);
  const [selectedCard, setSelectedCard] = useState<PokemonAPICard | null>(null);
  const [error, setError] = useState('');
  
  // Form state (from imported stats)
  const [name, setName] = useState('');
  const [ticker, setTicker] = useState('');
  const [type, setType] = useState<MonsterType>('Fire');
  const [hp, setHp] = useState(100);
  const [moves, setMoves] = useState<Move[]>([]);
  const [rarity, setRarity] = useState<Rarity>('Common');
  
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchedMonster, setLaunchedMonster] = useState<Monster | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setError('');
    setSearchResults([]);
    
    try {
      const response = await fetch(
        `https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(searchQuery)}&pageSize=6`
      );
      
      if (!response.ok) throw new Error('API request failed');
      
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        setSearchResults(data.data);
      } else {
        setError('No Pokémon found with that name. Try another search.');
      }
    } catch (err) {
      setError('Failed to fetch from Pokémon API. Please try again.');
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectCard = (card: PokemonAPICard) => {
    setSelectedCard(card);
    
    // Map stats to our monster format
    const mappedType = mapPokemonType(card.types || []);
    const mappedMoves: Move[] = (card.attacks || []).slice(0, 2).map(a => ({
      name: a.name,
      damage: parseInt(a.damage) || 30,
    }));
    
    setName(`${card.name} Inspired`);
    setTicker(card.name.toUpperCase().slice(0, 4));
    setType(mappedType);
    setHp(parseInt(card.hp || '100'));
    setMoves(mappedMoves.length > 0 ? mappedMoves : [{ name: 'Basic Attack', damage: 30 }]);
    setRarity(mapRarity(card.rarity));
  };

  const previewMonster: Partial<Monster> = {
    name: name || 'Your Monster',
    ticker: ticker || 'TICK',
    description: `A reimagined ${type.toLowerCase()} monster based on classic stats.`,
    type,
    hp,
    moves,
    rarity,
    marketCap: 0,
    evolutionStage: 1,
  };

  const handleLaunch = async () => {
    if (!name || !ticker) {
      toast.error('Please import stats and customize your monster first');
      return;
    }

    setIsLaunching(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newMonster = addMonster({
      name,
      ticker,
      description: `A reimagined ${type.toLowerCase()} monster inspired by classic designs.`,
      type,
      hp,
      imageUrl: '/placeholder.svg', // Never use official Pokémon images
      moves,
      rarity,
      marketCap: Math.floor(Math.random() * 50000) + 5000,
    });
    
    setLaunchedMonster(newMonster);
    setShowSuccessModal(true);
    setIsLaunching(false);
    toast.success('Monster launched successfully!');
  };

  return (
    <div className="min-h-screen bg-background bg-pattern py-8 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Import from Pokémon API
          </h1>
          <p className="text-muted-foreground">
            Search for Pokémon stats to inspire your monster. Images are NOT imported - only stats!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Search & Form */}
          <div className="space-y-6">
            {/* Search */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">
                Search Pokémon Stats
              </h2>
              <div className="flex gap-3">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter Pokémon name (e.g., Charizard)"
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              {error && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-muted-foreground">Select a card to import stats:</p>
                  <div className="grid grid-cols-2 gap-3">
                    {searchResults.map((card, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectCard(card)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          selectedCard === card
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-secondary/30 hover:border-primary/50'
                        }`}
                      >
                        <p className="font-bold text-foreground truncate">{card.name}</p>
                        <p className="text-xs text-muted-foreground">
                          HP: {card.hp || '?'} | {card.types?.join(', ') || 'Unknown'}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Imported Stats Form */}
            {selectedCard && (
              <div className="bg-card rounded-xl p-6 border border-border space-y-6 animate-fade-in">
                <h2 className="font-display text-xl font-bold text-foreground">
                  Customize Your Monster
                </h2>
                
                <div className="grid grid-cols-2 gap-4">
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
                  <Label>Type</Label>
                  <TypeSelector value={type} onChange={setType} />
                </div>

                <div className="space-y-2">
                  <Label>HP: {hp}</Label>
                  <Input
                    type="number"
                    value={hp}
                    onChange={(e) => setHp(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Moves (from API)</Label>
                  <div className="space-y-2">
                    {moves.map((move, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Input
                          value={move.name}
                          onChange={(e) => {
                            const newMoves = [...moves];
                            newMoves[idx].name = e.target.value;
                            setMoves(newMoves);
                          }}
                          className="flex-1"
                        />
                        <span className="font-mono text-primary font-bold">{move.damage}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-secondary/30 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Wand2 className="w-4 h-4 text-primary" />
                    <span className="font-bold text-foreground">AI Image Generation</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Generate an original {type} monster image (no Pokémon copyrighted content)
                  </p>
                  <Button variant="outline" className="w-full" onClick={() => toast.info('AI generation coming soon!')}>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Original Image
                  </Button>
                </div>

                <Button
                  className="w-full btn-glow text-lg py-6"
                  size="lg"
                  onClick={handleLaunch}
                  disabled={isLaunching}
                >
                  {isLaunching ? (
                    <>Launching...</>
                  ) : (
                    <>
                      <Rocket className="w-5 h-5 mr-2" />
                      Launch on Pump
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">
                Live Preview
              </h2>
              <div className="flex justify-center">
                <PokemonCard monster={previewMonster} size="lg" interactive={false} />
              </div>
              <p className="text-xs text-center text-muted-foreground mt-4">
                * Only stats imported. Image must be AI-generated or uploaded.
              </p>
            </div>
          </div>
        </div>
      </div>

      <LaunchSuccessModal
        monster={launchedMonster}
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />
    </div>
  );
}
