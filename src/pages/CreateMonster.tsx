import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PokemonCard } from '@/components/PokemonCard';
import { TypeSelector } from '@/components/TypeSelector';
import { LaunchSuccessModal } from '@/components/LaunchSuccessModal';
import { useMonsterStore } from '@/store/monsterStore';
import { Monster, MonsterType, Move, Rarity } from '@/types/monster';
import { Rocket, Wand2, Upload, Shuffle } from 'lucide-react';
import { toast } from 'sonner';

const RANDOM_NAMES = [
  'Flamezord', 'Aquabeast', 'Voltiger', 'Leafdrake', 'Shadowmaw', 'Memezilla',
  'Pyrowing', 'Tidalfang', 'Sparkbolt', 'Thornback', 'Voidclaw', 'Dankasaur'
];

const RANDOM_MOVES: Record<MonsterType, Move[]> = {
  Fire: [{ name: 'Flame Burst', damage: 60 }, { name: 'Inferno', damage: 80 }],
  Water: [{ name: 'Hydro Pump', damage: 70 }, { name: 'Tidal Wave', damage: 65 }],
  Electric: [{ name: 'Thunder Shock', damage: 55 }, { name: 'Volt Tackle', damage: 85 }],
  Grass: [{ name: 'Vine Whip', damage: 50 }, { name: 'Solar Beam', damage: 90 }],
  Shadow: [{ name: 'Dark Pulse', damage: 75 }, { name: 'Nightmare', damage: 70 }],
  Meme: [{ name: 'Dank Attack', damage: 69 }, { name: 'Moon Shot', damage: 42 }],
};

export default function CreateMonster() {
  const navigate = useNavigate();
  const { addMonster } = useMonsterStore();
  
  const [name, setName] = useState('');
  const [ticker, setTicker] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<MonsterType>('Fire');
  const [hp, setHp] = useState(100);
  const [imageUrl, setImageUrl] = useState('');
  const [moves, setMoves] = useState<Move[]>([
    { name: 'Basic Attack', damage: 30 },
    { name: 'Special Move', damage: 50 },
  ]);
  const [rarity, setRarity] = useState<Rarity>('Common');
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchedMonster, setLaunchedMonster] = useState<Monster | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const previewMonster: Partial<Monster> = {
    name: name || 'Your Monster',
    ticker: ticker || 'TICK',
    description,
    type,
    hp,
    imageUrl: imageUrl || undefined,
    moves,
    rarity,
    marketCap: 0,
    evolutionStage: 1,
  };

  const handleRandomName = () => {
    const randomName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    setName(randomName);
    setTicker(randomName.toUpperCase().slice(0, 4));
  };

  const handleRandomMoves = () => {
    setMoves(RANDOM_MOVES[type]);
  };

  const handleLaunch = async () => {
    if (!name || !ticker) {
      toast.error('Please enter a name and ticker');
      return;
    }

    setIsLaunching(true);
    
    // Simulate launch delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newMonster = addMonster({
      name,
      ticker,
      description: description || `A powerful ${type.toLowerCase()} type monster.`,
      type,
      hp,
      imageUrl: imageUrl || '/placeholder.svg',
      moves,
      rarity,
      marketCap: Math.floor(Math.random() * 50000) + 5000,
    });
    
    setLaunchedMonster(newMonster);
    setShowSuccessModal(true);
    setIsLaunching(false);
    toast.success('Monster launched successfully!');
  };

  const handleGenerateImage = () => {
    toast.info('AI image generation coming soon! Upload an image for now.');
  };

  return (
    <div className="min-h-screen bg-background bg-pattern py-8 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Create Your Monster
          </h1>
          <p className="text-muted-foreground">
            Design a unique creature and launch it as a token on Pump.fun
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-6 bg-card rounded-xl p-6 border border-border">
            {/* Name & Ticker */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Monster Name</Label>
                <div className="flex gap-2">
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!ticker) setTicker(e.target.value.toUpperCase().slice(0, 4));
                    }}
                    placeholder="Flamezord"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    onClick={handleRandomName}
                  >
                    <Shuffle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticker">Ticker</Label>
                <Input
                  id="ticker"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase().slice(0, 6))}
                  placeholder="FLMZ"
                  className="font-mono"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A powerful fire-type monster born from the blockchain..."
                rows={3}
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label>Type</Label>
              <TypeSelector value={type} onChange={setType} />
            </div>

            {/* HP */}
            <div className="space-y-2">
              <Label htmlFor="hp">HP (Health Points)</Label>
              <Input
                id="hp"
                type="number"
                min={50}
                max={300}
                value={hp}
                onChange={(e) => setHp(Number(e.target.value))}
              />
            </div>

            {/* Moves */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Moves</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRandomMoves}
                >
                  <Shuffle className="w-4 h-4 mr-1" />
                  Random
                </Button>
              </div>
              <div className="space-y-3">
                {moves.map((move, idx) => (
                  <div key={idx} className="flex gap-3">
                    <Input
                      value={move.name}
                      onChange={(e) => {
                        const newMoves = [...moves];
                        newMoves[idx] = { ...move, name: e.target.value };
                        setMoves(newMoves);
                      }}
                      placeholder="Move name"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={move.damage}
                      onChange={(e) => {
                        const newMoves = [...moves];
                        newMoves[idx] = { ...move, damage: Number(e.target.value) };
                        setMoves(newMoves);
                      }}
                      placeholder="DMG"
                      className="w-20 font-mono"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Image */}
            <div className="space-y-2">
              <Label>Monster Image</Label>
              <div className="flex gap-3">
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Image URL or upload"
                  className="flex-1"
                />
                <Button type="button" variant="secondary">
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGenerateImage}
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Generate with AI
              </Button>
            </div>

            {/* Rarity */}
            <div className="space-y-2">
              <Label>Rarity</Label>
              <div className="flex gap-2 flex-wrap">
                {(['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'] as Rarity[]).map((r) => (
                  <Button
                    key={r}
                    type="button"
                    variant={rarity === r ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRarity(r)}
                  >
                    {r}
                  </Button>
                ))}
              </div>
            </div>

            {/* Launch Button */}
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

          {/* Preview */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">
                Live Preview
              </h2>
              <div className="flex justify-center">
                <PokemonCard monster={previewMonster} size="lg" interactive={false} />
              </div>
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
