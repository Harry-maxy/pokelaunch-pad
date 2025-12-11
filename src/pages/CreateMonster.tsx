import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { CustomWalletButton } from '@/components/CustomWalletButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PokemonCard } from '@/components/PokemonCard';
import { TypeSelector } from '@/components/TypeSelector';
import { LaunchSuccessModal } from '@/components/LaunchSuccessModal';
import { createMonster, generateMonsterImage } from '@/lib/api';
import { Monster, MonsterType, Move, Rarity } from '@/types/monster';
import { Rocket, Wand2, Upload, Shuffle, Loader2, Wallet, AlertCircle, Twitter, Coins, ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { getWalletBalance, checkMinimumBalance, formatSolBalance, MINIMUM_BALANCE_SOL } from '@/lib/solana';
import { createPumpFunToken, TokenMetadata } from '@/lib/pumpfun';
import { captureElementAsImage } from '@/lib/cardCapture';

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
  const { publicKey, connected } = useWallet();
  const wallet = useWallet();
  const { connection } = useConnection();
  
  const [name, setName] = useState('');
  const [ticker, setTicker] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<MonsterType>('Fire');
  const [hp, setHp] = useState(100);
  const [imageUrl, setImageUrl] = useState('');
  const [twitterLink, setTwitterLink] = useState('');
  const [devBuyAmount, setDevBuyAmount] = useState<string>('0');
  const [moves, setMoves] = useState<Move[]>([
    { name: 'Basic Attack', damage: 30 },
    { name: 'Special Move', damage: 50 },
  ]);
  const [rarity, setRarity] = useState<Rarity>('Common');
  const [isLaunching, setIsLaunching] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [launchedMonster, setLaunchedMonster] = useState<Monster | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [useCardAsLogo, setUseCardAsLogo] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Fetch wallet balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (connected && publicKey) {
        setIsCheckingBalance(true);
        try {
          const bal = await getWalletBalance(connection, publicKey);
          setBalance(bal);
        } catch (error) {
          console.error('Failed to fetch balance:', error);
        } finally {
          setIsCheckingBalance(false);
        }
      } else {
        setBalance(null);
      }
    };

    fetchBalance();
  }, [connected, publicKey, connection]);

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

  const handleGenerateImage = async () => {
    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    setIsGeneratingImage(true);
    toast.info('Generating your unique monster artwork...');
    
    try {
      const prompt = `${name || 'Powerful creature'} - ${description || 'A mysterious and powerful monster'}`;
      const generatedUrl = await generateMonsterImage(prompt, type);
      
      if (generatedUrl) {
        setImageUrl(generatedUrl);
        toast.success('Monster artwork generated!');
      } else {
        toast.error('Failed to generate image. Try again.');
      }
    } catch (err) {
      toast.error('Image generation failed');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const devBuyAmountNum = parseFloat(devBuyAmount) || 0;
  const totalRequired = MINIMUM_BALANCE_SOL + devBuyAmountNum;

  // Convert image to square 1:1 and return as data URL
  const cropToSquare = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const size = Math.min(img.width, img.height);
          const targetSize = 512; // Output size
          
          canvas.width = targetSize;
          canvas.height = targetSize;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          // Calculate crop position (center crop)
          const sx = (img.width - size) / 2;
          const sy = (img.height - size) / 2;
          
          // Draw cropped and resized image
          ctx.drawImage(img, sx, sy, size, size, 0, 0, targetSize, targetSize);
          
          resolve(canvas.toDataURL('image/png', 0.9));
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploadingImage(true);
    try {
      const squareImageUrl = await cropToSquare(file);
      setImageUrl(squareImageUrl);
      toast.success('Image uploaded and cropped to square!');
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to process image');
    } finally {
      setIsUploadingImage(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const clearImage = () => {
    setImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLaunch = async () => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!name || !ticker) {
      toast.error('Please enter a name and ticker');
      return;
    }

    // Check balance including dev buy
    if (balance === null || balance < totalRequired) {
      toast.error(`Insufficient balance. You need at least ${totalRequired.toFixed(3)} SOL (${MINIMUM_BALANCE_SOL} for fees + ${devBuyAmountNum} for dev buy).`);
      return;
    }

    setIsLaunching(true);
    
    try {
      const walletAddress = publicKey.toBase58();
      
      // Step 1: Capture card as logo if enabled
      let finalImageUrl = imageUrl || '/placeholder.svg';
      
      if (useCardAsLogo && cardRef.current) {
        toast.info('Capturing card as logo...');
        try {
          const cardImage = await captureElementAsImage(cardRef.current, 512);
          finalImageUrl = cardImage;
          toast.success('Card captured!');
        } catch (err) {
          console.warn('Failed to capture card, using original image:', err);
        }
      }
      
      // Step 2: Deploy token on Pump.fun
      toast.info('Creating token on Pump.fun...');
      
      const tokenMetadata: TokenMetadata = {
        name,
        symbol: ticker,
        description: description || `A powerful ${type.toLowerCase()} type Poke monster.`,
        imageUrl: finalImageUrl,
        twitter: twitterLink || undefined,
      };

      // Deploy token on pump.fun via Edge Function proxy
      const deployResult = await createPumpFunToken(
        connection,
        wallet,
        {
          metadata: tokenMetadata,
          devBuyAmountSol: devBuyAmountNum,
        }
      );

      const mintAddress = deployResult.mintAddress;

      if (deployResult.success) {
        toast.success('🎉 Token created on Pump.fun!');
      } else {
        console.warn('Pump.fun deployment issue:', deployResult.error);
        toast.warning(deployResult.error || 'Token saved locally');
      }

      // Step 2: Save to database (always proceed even if pump.fun fails)
      const newMonster = await createMonster(walletAddress, {
        name,
        ticker,
        description: description || `A powerful ${type.toLowerCase()} type monster.`,
        type,
        hp,
        imageUrl: imageUrl || '/placeholder.svg',
        moves,
        rarity,
        mintAddress,
        twitterLink: twitterLink || undefined,
      });
      
      if (newMonster) {
        setLaunchedMonster(newMonster);
        setShowSuccessModal(true);
        toast.success('Monster launched successfully!');
      } else {
        toast.error('Failed to save monster to database');
      }
    } catch (err) {
      console.error('Launch error:', err);
      toast.error('Launch failed. Please try again.');
    } finally {
      setIsLaunching(false);
    }
  };

  const hasMinBalance = balance !== null && balance >= totalRequired;

  if (!connected) {
    return (
      <div className="min-h-screen bg-background bg-pattern py-8 px-6 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-type-electric/20 flex items-center justify-center border border-primary/30">
            <Wallet className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Connect Your Wallet
          </h1>
          <p className="text-muted-foreground">
            Connect your Phantom wallet to create and launch your own Pokes on Pump.fun.
          </p>
          <div className="flex justify-center">
            <CustomWalletButton size="lg" />
          </div>
          <p className="text-xs text-muted-foreground">
            You'll need at least {MINIMUM_BALANCE_SOL} SOL to create a token
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-pattern py-8 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Create Your Poke
          </h1>
          <p className="text-muted-foreground">
            Design a unique Poke and launch it as a token on Pump.fun
          </p>
          
          {/* Balance Info */}
          {balance !== null && (
            <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl ${
              hasMinBalance 
                ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
                : 'bg-destructive/10 border border-destructive/30 text-destructive'
            }`}>
              <Wallet className="w-4 h-4" />
              <span className="font-mono text-sm">{formatSolBalance(balance)} SOL</span>
              {!hasMinBalance && (
                <>
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-xs">Need ≥ {totalRequired.toFixed(3)} SOL</span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-6 bg-card rounded-xl p-6 border border-border">
            {/* Name & Ticker */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Poke Name</Label>
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
                <Label htmlFor="ticker">Ticker (max 10 chars)</Label>
                <Input
                  id="ticker"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase().slice(0, 10))}
                  placeholder="FLAMEZORD"
                  className="font-mono"
                  maxLength={10}
                />
                <p className="text-xs text-muted-foreground">{ticker.length}/10</p>
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

            {/* Twitter Link */}
            <div className="space-y-2">
              <Label htmlFor="twitter" className="flex items-center gap-2">
                <Twitter className="w-4 h-4" />
                Twitter Link (optional)
              </Label>
              <Input
                id="twitter"
                value={twitterLink}
                onChange={(e) => setTwitterLink(e.target.value)}
                placeholder="https://twitter.com/yourpoke"
                type="url"
              />
            </div>

            {/* Dev Buy Amount */}
            <div className="space-y-2">
              <Label htmlFor="devBuy" className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-yellow-500" />
                Dev Buy Amount (SOL)
              </Label>
              <Input
                id="devBuy"
                type="number"
                min={0}
                step={0.1}
                value={devBuyAmount}
                onChange={(e) => setDevBuyAmount(e.target.value)}
                placeholder="0"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Initial purchase amount in SOL when token is created. Set to 0 for no initial buy.
              </p>
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
            <div className="space-y-3">
              <Label>Monster Image</Label>
              
              {/* Image Preview */}
              {imageUrl && (
                <div className="relative w-full aspect-square max-w-[200px] mx-auto rounded-lg overflow-hidden border-2 border-primary/30 bg-secondary/50">
                  <img 
                    src={imageUrl} 
                    alt="Monster preview" 
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={clearImage}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs py-1 text-center">
                    1:1 Square
                  </div>
                </div>
              )}

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />

              {/* Upload & Generate buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                >
                  {isUploadingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ImagePlus className="w-4 h-4 mr-2" />
                      Upload Image
                    </>
                  )}
                </Button>
                <Button
                  type="button"
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
                      AI Generate
                    </>
                  )}
                </Button>
              </div>

              {/* URL input */}
              <div className="flex gap-2">
                <Input
                  value={imageUrl.startsWith('data:') ? '' : imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Or paste image URL"
                  className="flex-1 text-sm"
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Images are automatically cropped to 1:1 square format
              </p>
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

            {/* Cost Summary */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Coins className="w-4 h-4 text-primary" />
                Estimated Deploy Cost
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network Fee</span>
                  <span className="font-mono text-foreground">~0.00051 SOL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Priority Fee</span>
                  <span className="font-mono text-foreground">~0.0005 SOL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Rent</span>
                  <span className="font-mono text-foreground">~0.012 SOL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dev Buy</span>
                  <span className="font-mono text-foreground">{devBuyAmountNum.toFixed(4)} SOL</span>
                </div>
              </div>
              <div className="border-t border-primary/20 pt-3 flex justify-between items-center">
                <span className="font-semibold">Total Required:</span>
                <span className="font-mono text-lg font-bold text-primary">
                  ~{(0.013 + devBuyAmountNum).toFixed(4)} SOL
                </span>
              </div>
            </div>

            {/* Launch Button */}
            <Button
              className="w-full btn-glow text-lg py-6"
              size="lg"
              onClick={handleLaunch}
              disabled={isLaunching || !hasMinBalance}
            >
              {isLaunching ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Launching...
                </>
              ) : !hasMinBalance ? (
                <>
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Insufficient Balance
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5 mr-2" />
                  Launch on Pump.fun
                </>
              )}
            </Button>
            
            {!hasMinBalance && (
              <p className="text-xs text-center text-muted-foreground">
                You need at least {totalRequired.toFixed(3)} SOL to launch this token
              </p>
            )}
          </div>

          {/* Preview */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-bold text-foreground">
                  Live Preview
                </h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCardAsLogo}
                    onChange={(e) => setUseCardAsLogo(e.target.checked)}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-xs text-muted-foreground">Use as Pump.fun logo</span>
                </label>
              </div>
              <div className="flex justify-center" ref={cardRef}>
                <PokemonCard monster={previewMonster} size="lg" interactive={false} />
              </div>
              {useCardAsLogo && (
                <p className="text-xs text-center text-muted-foreground mt-3">
                  ✨ This card will be used as your token logo on Pump.fun
                </p>
              )}
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
