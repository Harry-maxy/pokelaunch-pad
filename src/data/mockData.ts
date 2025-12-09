import { Monster, Template, MonsterType, Rarity, Move, generateWallet, getEvolutionStage } from '@/types/monster';

const MONSTER_NAMES = [
  'Flamezard', 'Aquadrake', 'Voltspark', 'Leafmaw', 'Shadowfang', 'Memechamp',
  'Infernotail', 'Tidalwave', 'Thunderclaw', 'Vinelash', 'Voidwalker', 'Gigapepe',
  'Blazewing', 'Frostbite', 'Staticshock', 'Thornback', 'Nightshade', 'Dankmaster',
  'Pyrodragon', 'Icebreaker', 'Zapstrike', 'Florahorn', 'Phantomsteel', 'Lolking'
];

const MOVE_NAMES: Record<MonsterType, string[]> = {
  Fire: ['Flame Burst', 'Inferno Blast', 'Burn Strike', 'Fire Tornado', 'Magma Surge'],
  Water: ['Hydro Pump', 'Tidal Wave', 'Aqua Jet', 'Ice Beam', 'Tsunami Crash'],
  Electric: ['Thunder Shock', 'Volt Tackle', 'Lightning Strike', 'Spark Storm', 'Electro Ball'],
  Grass: ['Vine Whip', 'Solar Beam', 'Leaf Blade', 'Nature Power', 'Root Crush'],
  Shadow: ['Dark Pulse', 'Shadow Ball', 'Nightmare', 'Void Strike', 'Soul Drain'],
  Meme: ['Dank Attack', 'HODL Power', 'Moon Shot', 'Diamond Hands', 'Rug Pull'],
};

function generateMove(type: MonsterType): Move {
  const moves = MOVE_NAMES[type];
  return {
    name: moves[Math.floor(Math.random() * moves.length)],
    damage: Math.floor(Math.random() * 80) + 20,
  };
}

function generateMonster(index: number): Monster {
  const types: MonsterType[] = ['Fire', 'Water', 'Electric', 'Grass', 'Shadow', 'Meme'];
  const rarities: Rarity[] = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
  
  const type = types[Math.floor(Math.random() * types.length)];
  const rarity = rarities[Math.floor(Math.random() * rarities.length)];
  const name = MONSTER_NAMES[index % MONSTER_NAMES.length];
  const marketCap = Math.floor(Math.random() * 1500000) + 1000;
  
  return {
    id: `monster-${index}`,
    name,
    ticker: name.toUpperCase().slice(0, 4),
    description: `A powerful ${type.toLowerCase()} type monster with incredible abilities. Born from the blockchain, destined for the moon.`,
    type,
    hp: Math.floor(Math.random() * 150) + 50,
    imageUrl: `/placeholder.svg`,
    moves: [generateMove(type), generateMove(type)],
    rarity,
    marketCap,
    evolutionStage: getEvolutionStage(marketCap),
    pumpUrl: `https://pump.fun/launch/monster-${index}`,
    creatorWallet: generateWallet(),
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    volume24h: Math.floor(Math.random() * 100000) + 1000,
    holders: Math.floor(Math.random() * 5000) + 50,
    priceChange24h: (Math.random() - 0.3) * 200,
  };
}

export const MOCK_MONSTERS: Monster[] = Array.from({ length: 24 }, (_, i) => generateMonster(i));

export const MOCK_TEMPLATES: Template[] = [
  {
    id: 'template-1',
    name: 'Blazing Phoenix',
    type: 'Fire',
    imageUrl: '/placeholder.svg',
    baseMoves: [{ name: 'Phoenix Rise', damage: 90 }, { name: 'Flame Tornado', damage: 70 }],
    rarity: 'Epic',
    hp: 160,
  },
  {
    id: 'template-2',
    name: 'Ocean Leviathan',
    type: 'Water',
    imageUrl: '/placeholder.svg',
    baseMoves: [{ name: 'Deep Dive', damage: 80 }, { name: 'Whirlpool', damage: 65 }],
    rarity: 'Rare',
    hp: 140,
  },
  {
    id: 'template-3',
    name: 'Thunder Beast',
    type: 'Electric',
    imageUrl: '/placeholder.svg',
    baseMoves: [{ name: 'Gigavolt', damage: 100 }, { name: 'Chain Lightning', damage: 55 }],
    rarity: 'Legendary',
    hp: 180,
  },
  {
    id: 'template-4',
    name: 'Ancient Treant',
    type: 'Grass',
    imageUrl: '/placeholder.svg',
    baseMoves: [{ name: 'Root Prison', damage: 60 }, { name: 'Nature Wrath', damage: 85 }],
    rarity: 'Rare',
    hp: 150,
  },
  {
    id: 'template-5',
    name: 'Void Reaper',
    type: 'Shadow',
    imageUrl: '/placeholder.svg',
    baseMoves: [{ name: 'Soul Harvest', damage: 95 }, { name: 'Dark Matter', damage: 75 }],
    rarity: 'Epic',
    hp: 130,
  },
  {
    id: 'template-6',
    name: 'Pepe Supreme',
    type: 'Meme',
    imageUrl: '/placeholder.svg',
    baseMoves: [{ name: 'Rare Pepe', damage: 69 }, { name: 'Kek Beam', damage: 42 }],
    rarity: 'Legendary',
    hp: 169,
  },
  {
    id: 'template-7',
    name: 'Inferno Drake',
    type: 'Fire',
    imageUrl: '/placeholder.svg',
    baseMoves: [{ name: 'Dragon Breath', damage: 85 }, { name: 'Lava Pool', damage: 60 }],
    rarity: 'Uncommon',
    hp: 120,
  },
  {
    id: 'template-8',
    name: 'Frost Serpent',
    type: 'Water',
    imageUrl: '/placeholder.svg',
    baseMoves: [{ name: 'Ice Fang', damage: 70 }, { name: 'Blizzard', damage: 80 }],
    rarity: 'Rare',
    hp: 135,
  },
  {
    id: 'template-9',
    name: 'Storm Falcon',
    type: 'Electric',
    imageUrl: '/placeholder.svg',
    baseMoves: [{ name: 'Sky Strike', damage: 75 }, { name: 'Thunder Dive', damage: 90 }],
    rarity: 'Uncommon',
    hp: 110,
  },
  {
    id: 'template-10',
    name: 'Mushroom King',
    type: 'Grass',
    imageUrl: '/placeholder.svg',
    baseMoves: [{ name: 'Spore Cloud', damage: 50 }, { name: 'Toxic Bloom', damage: 70 }],
    rarity: 'Common',
    hp: 100,
  },
  {
    id: 'template-11',
    name: 'Phantom Knight',
    type: 'Shadow',
    imageUrl: '/placeholder.svg',
    baseMoves: [{ name: 'Ghost Slash', damage: 80 }, { name: 'Shadow Step', damage: 60 }],
    rarity: 'Rare',
    hp: 145,
  },
  {
    id: 'template-12',
    name: 'Doge Warrior',
    type: 'Meme',
    imageUrl: '/placeholder.svg',
    baseMoves: [{ name: 'Much Attack', damage: 77 }, { name: 'Very Power', damage: 55 }],
    rarity: 'Epic',
    hp: 140,
  },
];

export function getFilteredMonsters(filter: string): Monster[] {
  if (filter === 'all' || filter === 'new') {
    return [...MOCK_MONSTERS].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  if (filter === 'trending') {
    return [...MOCK_MONSTERS].sort((a, b) => b.marketCap - a.marketCap);
  }
  if (filter === 'legendary') {
    return MOCK_MONSTERS.filter(m => m.evolutionStage === 4);
  }
  const typeFilter = filter.charAt(0).toUpperCase() + filter.slice(1) as MonsterType;
  return MOCK_MONSTERS.filter(m => m.type === typeFilter);
}
