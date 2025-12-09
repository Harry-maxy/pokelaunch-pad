import { Monster, MonsterType, RARITY_STARS, formatMarketCap } from '@/types/monster';
import { Star, Zap, Flame, Droplets, Leaf, Moon, Laugh, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PokemonCardProps {
  monster: Partial<Monster>;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onClick?: () => void;
}

const TYPE_ICONS: Record<MonsterType, React.ReactNode> = {
  Fire: <Flame className="w-4 h-4" />,
  Water: <Droplets className="w-4 h-4" />,
  Electric: <Zap className="w-4 h-4" />,
  Grass: <Leaf className="w-4 h-4" />,
  Shadow: <Moon className="w-4 h-4" />,
  Meme: <Laugh className="w-4 h-4" />,
};

const TYPE_HEADER_BG: Record<MonsterType, string> = {
  Fire: 'bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500',
  Water: 'bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-400',
  Electric: 'bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-300',
  Grass: 'bg-gradient-to-r from-green-600 via-emerald-500 to-lime-400',
  Shadow: 'bg-gradient-to-r from-purple-700 via-violet-600 to-purple-500',
  Meme: 'bg-gradient-to-r from-cyan-400 via-teal-400 to-green-400',
};

const TYPE_FRAME_CLASSES: Record<MonsterType, string> = {
  Fire: 'border-type-fire shadow-glow-fire',
  Water: 'border-type-water shadow-glow-water',
  Electric: 'border-type-electric shadow-glow-electric',
  Grass: 'border-type-grass shadow-glow-grass',
  Shadow: 'border-type-shadow shadow-glow-shadow',
  Meme: 'border-type-meme shadow-glow-meme',
};

const TYPE_INNER_GLOW: Record<MonsterType, string> = {
  Fire: 'bg-gradient-to-b from-orange-500/10 to-transparent',
  Water: 'bg-gradient-to-b from-cyan-500/10 to-transparent',
  Electric: 'bg-gradient-to-b from-yellow-500/10 to-transparent',
  Grass: 'bg-gradient-to-b from-green-500/10 to-transparent',
  Shadow: 'bg-gradient-to-b from-purple-500/10 to-transparent',
  Meme: 'bg-gradient-to-b from-cyan-400/10 to-transparent',
};

const SIZE_CLASSES = {
  sm: 'w-48 h-72',
  md: 'w-64 h-96',
  lg: 'w-80 h-[480px]',
};

export function PokemonCard({ monster, size = 'md', interactive = true, onClick }: PokemonCardProps) {
  const type = monster.type || 'Meme';
  const rarity = monster.rarity || 'Common';
  const isLegendary = monster.evolutionStage === 4 || rarity === 'Legendary';
  const isEpic = rarity === 'Epic';
  const isRare = rarity === 'Rare';

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative rounded-2xl overflow-hidden transition-all duration-300',
        SIZE_CLASSES[size],
        TYPE_FRAME_CLASSES[type],
        'border-[3px]',
        'bg-gradient-to-b from-card via-card to-background',
        interactive && 'cursor-pointer card-tilt',
        isLegendary && 'animate-pulse-glow energy-border',
        isEpic && 'ring-1 ring-purple-400/30',
        isRare && 'ring-1 ring-blue-400/20'
      )}
      style={{
        boxShadow: isLegendary 
          ? '0 0 50px hsl(45 100% 50% / 0.4), inset 0 0 20px hsl(45 100% 50% / 0.1)' 
          : undefined
      }}
    >
      {/* Inner glow effect */}
      <div className={cn('absolute inset-0 pointer-events-none', TYPE_INNER_GLOW[type])} />

      {/* Header with Type */}
      <div className={cn(
        'h-10 flex items-center justify-between px-3',
        TYPE_HEADER_BG[type]
      )}>
        <div className="flex items-center gap-2">
          <div className="p-1 bg-black/20 rounded-full">
            {TYPE_ICONS[type]}
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-white drop-shadow-md">
            {type}
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-black/30 px-2.5 py-1 rounded-full border border-white/20">
          <span className="text-[10px] font-bold text-red-100">HP</span>
          <span className="text-sm font-black text-white">{monster.hp || 100}</span>
        </div>
      </div>

      {/* Image Area with glossy frame */}
      <div className="relative mx-2 mt-2 rounded-xl overflow-hidden border-2 border-white/10 bg-muted">
        <div className="aspect-[4/3] relative">
          {monster.imageUrl ? (
            <img
              src={monster.imageUrl}
              alt={monster.name || 'Monster'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={cn(
              'w-full h-full flex items-center justify-center',
              TYPE_INNER_GLOW[type]
            )}>
              <div className="text-6xl opacity-30">
                {TYPE_ICONS[type]}
              </div>
            </div>
          )}
          
          {/* Holographic overlay for legendary/epic */}
          {(isLegendary || isEpic) && (
            <div className="absolute inset-0 holographic opacity-60" />
          )}

          {/* Sparkles for legendary */}
          {isLegendary && (
            <div className="absolute top-2 right-2">
              <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
            </div>
          )}
        </div>

        {/* Evolution Badge */}
        {monster.evolutionStage && monster.evolutionStage > 1 && (
          <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-yellow-500/50">
            <span className="text-xs font-bold text-gradient-legendary">
              ★ Stage {monster.evolutionStage}
            </span>
          </div>
        )}
      </div>

      {/* Name and Ticker Panel */}
      <div className="mx-2 mt-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border/50">
        <h3 className="font-display font-bold text-lg text-foreground truncate leading-tight">
          {monster.name || 'Unnamed Monster'}
        </h3>
        {monster.ticker && (
          <p className="font-mono text-xs text-accent font-semibold">${monster.ticker}</p>
        )}
      </div>

      {/* Moves Section */}
      <div className="mx-2 mt-2 px-3 py-2 space-y-1.5 flex-1">
        {monster.moves?.slice(0, 2).map((move, idx) => (
          <div 
            key={idx} 
            className="flex items-center justify-between text-sm py-1 px-2 rounded-lg bg-muted/30 border border-border/30"
          >
            <div className="flex items-center gap-2">
              {/* Energy symbol placeholder */}
              <div className={cn(
                'w-4 h-4 rounded-full flex items-center justify-center text-[8px]',
                TYPE_HEADER_BG[type]
              )}>
                ◆
              </div>
              <span className="text-muted-foreground font-medium truncate">{move.name}</span>
            </div>
            <span className="font-mono font-bold text-foreground">{move.damage}</span>
          </div>
        ))}
        {(!monster.moves || monster.moves.length === 0) && (
          <p className="text-xs text-muted-foreground italic text-center py-2">No moves yet</p>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-card via-card/95 to-transparent">
        <div className="flex items-center justify-between">
          {/* Market Cap */}
          {monster.marketCap !== undefined && (
            <div className="text-sm">
              <span className="text-muted-foreground text-xs">MC </span>
              <span className="font-mono font-bold text-accent">
                {formatMarketCap(monster.marketCap)}
              </span>
            </div>
          )}
          
          {/* Rarity Stars */}
          <div className="flex gap-0.5">
            {Array.from({ length: RARITY_STARS[rarity] }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'w-4 h-4 drop-shadow-lg',
                  isLegendary 
                    ? 'text-yellow-400 fill-yellow-400' 
                    : isEpic
                    ? 'text-purple-400 fill-purple-400'
                    : isRare
                    ? 'text-blue-400 fill-blue-400'
                    : 'text-primary fill-primary'
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Glossy overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/5 to-transparent" />
      </div>
    </div>
  );
}