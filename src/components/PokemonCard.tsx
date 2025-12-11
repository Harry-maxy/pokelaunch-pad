import { Monster, MonsterType, RARITY_STARS, formatMarketCap } from '@/types/monster';
import { Star, Zap, Flame, Droplets, Leaf, Moon, Laugh, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PokemonCardProps {
  monster: Partial<Monster>;
  size?: 'xs' | 'sm' | 'md' | 'lg';
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
  xs: 'w-40 h-60',
  sm: 'w-48 h-72',
  md: 'w-56 h-80',
  lg: 'w-72 h-[420px]',
};

export function PokemonCard({ monster, size = 'md', interactive = true, onClick }: PokemonCardProps) {
  const type = monster.type || 'Meme';
  const rarity = monster.rarity || 'Common';
  const isLegendary = monster.evolutionStage === 4 || rarity === 'Legendary';
  const isEpic = rarity === 'Epic';
  const isRare = rarity === 'Rare';
  const isSmall = size === 'xs' || size === 'sm';

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative rounded-xl overflow-hidden transition-all duration-300',
        SIZE_CLASSES[size],
        TYPE_FRAME_CLASSES[type],
        'border-2',
        'bg-gradient-to-b from-card via-card to-background',
        interactive && 'cursor-pointer card-tilt',
        isLegendary && 'animate-pulse-glow energy-border',
        isEpic && 'ring-1 ring-purple-400/30',
        isRare && 'ring-1 ring-blue-400/20'
      )}
      style={{
        boxShadow: isLegendary 
          ? '0 0 30px hsl(45 100% 50% / 0.3), inset 0 0 10px hsl(45 100% 50% / 0.1)' 
          : undefined
      }}
    >
      {/* Inner glow effect */}
      <div className={cn('absolute inset-0 pointer-events-none', TYPE_INNER_GLOW[type])} />

      {/* Header with Type */}
      <div className={cn(
        'flex items-center justify-between px-2',
        TYPE_HEADER_BG[type],
        isSmall ? 'h-7' : 'h-9'
      )}>
        <div className="flex items-center gap-1">
          <div className={cn("bg-black/20 rounded-full", isSmall ? "p-0.5" : "p-1")}>
            {isSmall ? <span className="w-3 h-3 block">{TYPE_ICONS[type]}</span> : TYPE_ICONS[type]}
          </div>
          <span className={cn(
            "font-bold uppercase tracking-wider text-white drop-shadow-md",
            isSmall ? "text-[8px]" : "text-xs"
          )}>
            {type}
          </span>
        </div>
        <div className={cn(
          "flex items-center gap-1 bg-black/30 rounded-full border border-white/20",
          isSmall ? "px-1.5 py-0.5" : "px-2 py-1"
        )}>
          <span className={cn("font-bold text-red-100", isSmall ? "text-[7px]" : "text-[10px]")}>HP</span>
          <span className={cn("font-black text-white", isSmall ? "text-[10px]" : "text-sm")}>{monster.hp || 100}</span>
        </div>
      </div>

      {/* Image Area */}
      <div className={cn(
        "relative rounded-lg overflow-hidden border border-white/10 bg-muted",
        isSmall ? "mx-1.5 mt-1.5" : "mx-2 mt-2"
      )}>
        <div className="aspect-square relative">
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
              <div className={cn("opacity-30", isSmall ? "text-3xl" : "text-5xl")}>
                {TYPE_ICONS[type]}
              </div>
            </div>
          )}
          
          {(isLegendary || isEpic) && (
            <div className="absolute inset-0 holographic opacity-60" />
          )}

          {isLegendary && (
            <div className="absolute top-1 right-1">
              <Sparkles className={cn("text-yellow-400 animate-pulse", isSmall ? "w-3 h-3" : "w-4 h-4")} />
            </div>
          )}
        </div>

        {monster.evolutionStage && monster.evolutionStage > 1 && (
          <div className={cn(
            "absolute top-1 left-1 bg-black/80 backdrop-blur-sm rounded-full border border-yellow-500/50",
            isSmall ? "px-1.5 py-0.5" : "px-2 py-1"
          )}>
            <span className={cn("font-bold text-gradient-legendary", isSmall ? "text-[8px]" : "text-xs")}>
              ★{monster.evolutionStage}
            </span>
          </div>
        )}
      </div>

      {/* Name Panel */}
      <div className={cn(
        "rounded-md bg-secondary/50 border border-border/50",
        isSmall ? "mx-1.5 mt-1.5 px-2 py-1" : "mx-2 mt-2 px-3 py-2"
      )}>
        <h3 className={cn(
          "font-display font-bold text-foreground truncate leading-tight",
          isSmall ? "text-xs" : "text-base"
        )}>
          {monster.name || 'Unnamed'}
        </h3>
        {monster.ticker && (
          <p className={cn("font-mono text-accent font-semibold", isSmall ? "text-[9px]" : "text-xs")}>
            ${monster.ticker}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-card via-card/95 to-transparent",
        isSmall ? "px-2 py-2" : "px-3 py-2"
      )}>
        <div className="flex items-center justify-between gap-1">
          <div className="flex gap-0.5">
            {Array.from({ length: RARITY_STARS[rarity] }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'drop-shadow-lg',
                  isSmall ? 'w-2.5 h-2.5' : 'w-3 h-3',
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
          
          {monster.marketCap !== undefined && (
            <div className={isSmall ? "text-[10px]" : "text-xs"}>
              <span className="text-muted-foreground">MC </span>
              <span className="font-mono font-bold text-accent">
                {formatMarketCap(monster.marketCap)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Glossy overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-white/5 to-transparent" />
      </div>
    </div>
  );
}