import { Monster, MonsterType, RARITY_STARS, formatMarketCap } from '@/types/monster';
import { Star, Zap, Flame, Droplets, Leaf, Moon, Laugh } from 'lucide-react';
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

const TYPE_GRADIENTS: Record<MonsterType, string> = {
  Fire: 'from-orange-600 via-red-500 to-yellow-500',
  Water: 'from-blue-600 via-cyan-500 to-blue-400',
  Electric: 'from-yellow-500 via-amber-400 to-yellow-300',
  Grass: 'from-green-600 via-emerald-500 to-lime-400',
  Shadow: 'from-purple-700 via-violet-600 to-purple-500',
  Meme: 'from-green-500 via-emerald-400 to-teal-400',
};

const TYPE_BORDER_COLORS: Record<MonsterType, string> = {
  Fire: 'border-type-fire shadow-[0_0_20px_hsl(14_100%_57%_/_0.4)]',
  Water: 'border-type-water shadow-[0_0_20px_hsl(200_100%_50%_/_0.4)]',
  Electric: 'border-type-electric shadow-[0_0_20px_hsl(48_100%_50%_/_0.4)]',
  Grass: 'border-type-grass shadow-[0_0_20px_hsl(120_60%_45%_/_0.4)]',
  Shadow: 'border-type-shadow shadow-[0_0_20px_hsl(280_60%_50%_/_0.4)]',
  Meme: 'border-type-meme shadow-[0_0_20px_hsl(142_76%_56%_/_0.4)]',
};

const SIZE_CLASSES = {
  sm: 'w-48 h-64',
  md: 'w-64 h-80',
  lg: 'w-80 h-[420px]',
};

export function PokemonCard({ monster, size = 'md', interactive = true, onClick }: PokemonCardProps) {
  const type = monster.type || 'Meme';
  const rarity = monster.rarity || 'Common';
  const isLegendary = monster.evolutionStage === 4 || rarity === 'Legendary';

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative rounded-xl overflow-hidden transition-all duration-300',
        SIZE_CLASSES[size],
        TYPE_BORDER_COLORS[type],
        'border-2 bg-card',
        interactive && 'cursor-pointer hover:scale-105 hover:shadow-2xl',
        isLegendary && 'animate-pulse-glow'
      )}
    >
      {/* Header Gradient */}
      <div className={cn('h-8 bg-gradient-to-r flex items-center justify-between px-3', TYPE_GRADIENTS[type])}>
        <div className="flex items-center gap-1.5">
          {TYPE_ICONS[type]}
          <span className="text-xs font-bold uppercase tracking-wider text-foreground drop-shadow-md">
            {type}
          </span>
        </div>
        <div className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-full">
          <span className="text-xs font-bold text-foreground">HP</span>
          <span className="text-sm font-black text-foreground">{monster.hp || 100}</span>
        </div>
      </div>

      {/* Image Area */}
      <div className="relative h-[45%] bg-gradient-to-b from-muted/50 to-muted overflow-hidden">
        {monster.imageUrl ? (
          <img
            src={monster.imageUrl}
            alt={monster.name || 'Monster'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className={cn('text-6xl', `text-type-${type.toLowerCase()}`)}>
              {TYPE_ICONS[type]}
            </div>
          </div>
        )}
        
        {/* Holographic overlay for legendary */}
        {isLegendary && (
          <div className="absolute inset-0 holographic opacity-50" />
        )}

        {/* Evolution Badge */}
        {monster.evolutionStage && monster.evolutionStage > 1 && (
          <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full">
            <span className="text-xs font-bold text-gradient-legendary">
              Stage {monster.evolutionStage}
            </span>
          </div>
        )}
      </div>

      {/* Name and Ticker */}
      <div className="px-3 py-2 border-b border-border">
        <h3 className="font-display font-bold text-foreground truncate">
          {monster.name || 'Unnamed Monster'}
        </h3>
        {monster.ticker && (
          <p className="font-mono text-xs text-muted-foreground">${monster.ticker}</p>
        )}
      </div>

      {/* Moves */}
      <div className="px-3 py-2 space-y-1 flex-1">
        {monster.moves?.slice(0, 2).map((move, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground truncate">{move.name}</span>
            <span className="font-mono font-bold text-foreground">{move.damage}</span>
          </div>
        ))}
        {(!monster.moves || monster.moves.length === 0) && (
          <p className="text-xs text-muted-foreground italic">No moves yet</p>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-card via-card to-transparent">
        <div className="flex items-center justify-between">
          {/* Market Cap */}
          {monster.marketCap !== undefined && (
            <div className="text-xs">
              <span className="text-muted-foreground">MC </span>
              <span className="font-mono font-bold text-primary">
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
                  'w-3 h-3',
                  isLegendary ? 'text-yellow-400 fill-yellow-400' : 'text-primary fill-primary'
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
