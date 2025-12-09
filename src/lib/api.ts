import { supabase } from '@/integrations/supabase/client';
import { Monster, Template, MonsterType, Rarity, Move } from '@/types/monster';

// Type mappings for database enums
type DbMonsterType = 'Fire' | 'Water' | 'Electric' | 'Grass' | 'Shadow' | 'Meme';
type DbMonsterRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

interface DbMonster {
  id: string;
  name: string;
  ticker: string;
  description: string | null;
  type: DbMonsterType;
  hp: number;
  image_url: string | null;
  moves: Move[] | null;
  rarity: DbMonsterRarity;
  market_cap: number | null;
  evolution_stage: number | null;
  pump_url: string | null;
  creator_id: string | null;
  creator_wallet: string | null;
  volume_24h: number | null;
  holders: number | null;
  price_change_24h: number | null;
  created_at: string;
  updated_at: string;
}

interface DbTemplate {
  id: string;
  name: string;
  type: DbMonsterType;
  image_url: string | null;
  base_moves: Move[] | null;
  rarity: DbMonsterRarity;
  hp: number;
  created_at: string;
}

function dbMonsterToMonster(db: DbMonster): Monster {
  return {
    id: db.id,
    name: db.name,
    ticker: db.ticker,
    description: db.description || '',
    type: db.type as MonsterType,
    hp: db.hp,
    imageUrl: db.image_url || '/placeholder.svg',
    moves: (db.moves as Move[]) || [],
    rarity: db.rarity as Rarity,
    marketCap: Number(db.market_cap) || 0,
    evolutionStage: (db.evolution_stage || 1) as 1 | 2 | 3 | 4,
    pumpUrl: db.pump_url || '',
    creatorWallet: db.creator_wallet || '',
    createdAt: new Date(db.created_at),
    volume24h: Number(db.volume_24h) || 0,
    holders: db.holders || 0,
    priceChange24h: Number(db.price_change_24h) || 0,
  };
}

function dbTemplateToTemplate(db: DbTemplate): Template {
  return {
    id: db.id,
    name: db.name,
    type: db.type,
    imageUrl: db.image_url || '/placeholder.svg',
    baseMoves: (db.base_moves as Move[]) || [],
    rarity: db.rarity,
    hp: db.hp,
  };
}

export async function fetchMonsters(filter?: string): Promise<Monster[]> {
  let query = supabase.from('monsters').select('*');
  
  if (filter === 'trending') {
    query = query.order('market_cap', { ascending: false });
  } else if (filter === 'legendary') {
    query = query.eq('evolution_stage', 4);
  } else if (filter && filter !== 'all' && filter !== 'new') {
    const typeFilter = filter.charAt(0).toUpperCase() + filter.slice(1);
    query = query.eq('type', typeFilter as DbMonsterType);
  }
  
  query = query.order('created_at', { ascending: false });
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching monsters:', error);
    return [];
  }
  
  return (data as unknown as DbMonster[]).map(dbMonsterToMonster);
}

export async function fetchMonster(id: string): Promise<Monster | null> {
  const { data, error } = await supabase
    .from('monsters')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error || !data) {
    console.error('Error fetching monster:', error);
    return null;
  }
  
  return dbMonsterToMonster(data as unknown as DbMonster);
}

export async function fetchTemplates(): Promise<Template[]> {
  const { data, error } = await supabase
    .from('templates')
    .select('*');
  
  if (error) {
    console.error('Error fetching templates:', error);
    return [];
  }
  
  return (data as unknown as DbTemplate[]).map(dbTemplateToTemplate);
}

function generateWallet(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createMonster(
  userId: string,
  monsterData: {
    name: string;
    ticker: string;
    description: string;
    type: MonsterType;
    hp: number;
    imageUrl: string;
    moves: Move[];
    rarity: Rarity;
  }
): Promise<Monster | null> {
  const initialMarketCap = Math.floor(Math.random() * 50000) + 5000;
  const monsterId = crypto.randomUUID();
  
  const { data, error } = await supabase
    .from('monsters')
    .insert({
      id: monsterId,
      name: monsterData.name,
      ticker: monsterData.ticker,
      description: monsterData.description,
      type: monsterData.type as DbMonsterType,
      hp: monsterData.hp,
      image_url: monsterData.imageUrl,
      moves: monsterData.moves as unknown as never,
      rarity: monsterData.rarity as DbMonsterRarity,
      market_cap: initialMarketCap,
      evolution_stage: 1,
      pump_url: `https://pump.fun/launch/${monsterId}`,
      creator_id: userId,
      creator_wallet: generateWallet(),
      volume_24h: Math.floor(Math.random() * 10000) + 500,
      holders: Math.floor(Math.random() * 100) + 10,
      price_change_24h: (Math.random() - 0.3) * 50,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating monster:', error);
    return null;
  }
  
  return dbMonsterToMonster(data as unknown as DbMonster);
}

export async function generateMonsterImage(prompt: string, monsterType: MonsterType): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-monster-image', {
      body: { prompt, monsterType }
    });
    
    if (error) {
      console.error('Error generating image:', error);
      return null;
    }
    
    return data?.imageUrl || null;
  } catch (err) {
    console.error('Failed to generate image:', err);
    return null;
  }
}
