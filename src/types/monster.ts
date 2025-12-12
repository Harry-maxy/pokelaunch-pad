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
  priceUsd?: number;
  // New fields for Solana integration
  mintAddress?: string;
  twitterLink?: string;
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

export function formatPrice(value: number): string {
  if (value === 0) return '$0';
  if (value >= 1) return `$${value.toFixed(2)}`;
  if (value >= 0.01) return `$${value.toFixed(4)}`;
  if (value >= 0.0001) return `$${value.toFixed(6)}`;
  // For very small values, use scientific-ish notation
  const str = value.toFixed(10);
  const match = str.match(/^0\.(0+)(\d+)/);
  if (match) {
    const zeros = match[1].length;
    const digits = match[2].slice(0, 4);
    return `$0.0(${zeros})${digits}`;
  }
  return `$${value.toFixed(8)}`;
}

export function generateWallet(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
