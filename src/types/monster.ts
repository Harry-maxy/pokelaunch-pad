export type PokeType = 'Fire' | 'Water' | 'Electric' | 'Grass' | 'Shadow' | 'Meme';

// Backwards compatibility aliases
export type MonsterType = PokeType;
export type Monster = Poke;

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

export interface Move {
  name: string;
  damage: number;
  description?: string;
}

export interface Poke {
  id: string;
  name: string;
  ticker: string;
  description: string;
  type: PokeType;
  hp: number;
  imageUrl: string;
  moves: Move[];
  rarity: Rarity;
  marketCap: number;
  evolutionStage: 1 | 2 | 3 | 4;
  pumpUrl: string;
  creatorWallet: string;
  createdAt: Date;
  volume24h?: number;
  holders?: number;
  priceChange24h?: number;
}

export interface Template {
  id: string;
  name: string;
  type: PokeType;
  imageUrl: string;
  baseMoves: Move[];
  rarity: Rarity;
  hp: number;
}

export const TYPE_COLORS: Record<PokeType, string> = {
  Fire: 'fire',
  Water: 'water',
  Electric: 'electric',
  Grass: 'grass',
  Shadow: 'shadow',
  Meme: 'meme',
};

export const RARITY_STARS: Record<Rarity, number> = {
  Common: 1,
  Uncommon: 2,
  Rare: 3,
  Epic: 4,
  Legendary: 5,
};

export function getEvolutionStage(marketCap: number): 1 | 2 | 3 | 4 {
  if (marketCap >= 1000000) return 4;
  if (marketCap >= 250000) return 3;
  if (marketCap >= 50000) return 2;
  return 1;
}

export function formatMarketCap(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

export function generateWallet(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
