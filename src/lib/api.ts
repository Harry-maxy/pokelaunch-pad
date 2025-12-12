import { supabase } from '@/integrations/supabase/client';
import { Poke, Template, PokeType, Rarity, Move, Monster, MonsterType } from '@/types/monster';
import { getPumpFunTokenInfo } from './pumpfun';

// Backwards compatibility aliases
export const fetchMonsters = fetchPokes;
export const fetchMonster = fetchPoke;
export const createMonster = createPoke;
export const generateMonsterImage = generatePokeImage;

// Type mappings for database enums
type DbPokeType = 'Fire' | 'Water' | 'Electric' | 'Grass' | 'Shadow' | 'Meme';
type DbPokeRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

interface DbPoke {
  id: string;
  name: string;
  ticker: string;
  description: string | null;
  type: DbPokeType;
  hp: number;
  image_url: string | null;
  moves: Move[] | null;
  rarity: DbPokeRarity;
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
  mint_address: string | null;
  twitter_link: string | null;
}

interface DbTemplate {
  id: string;
  name: string;
  type: DbPokeType;
  image_url: string | null;
  base_moves: Move[] | null;
  rarity: DbPokeRarity;
  hp: number;
  created_at: string;
}

function dbPokeToPoke(db: DbPoke): Poke {
  return {
    id: db.id,
    name: db.name,
    ticker: db.ticker,
    description: db.description || '',
    type: db.type as PokeType,
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
    mintAddress: db.mint_address || undefined,
    twitterLink: db.twitter_link || undefined,
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

/**
 * Enrich a single poke with live data from pump.fun if mint address is available
 */
async function enrichPokeWithPumpData(poke: Poke): Promise<Poke> {
  if (!poke.mintAddress) {
    return poke;
  }

  try {
    const pumpData = await getPumpFunTokenInfo(poke.mintAddress);
    if (pumpData) {
      // Always prefer live data over database values
      return {
        ...poke,
        marketCap: pumpData.marketCap > 0 ? pumpData.marketCap : poke.marketCap,
        volume24h: pumpData.volume24h !== undefined ? pumpData.volume24h : poke.volume24h,
        holders: pumpData.holders !== undefined && pumpData.holders > 0 ? pumpData.holders : poke.holders,
        priceChange24h: pumpData.priceChange24h !== undefined ? pumpData.priceChange24h : poke.priceChange24h,
        priceUsd: pumpData.priceUsd !== undefined && pumpData.priceUsd > 0 ? pumpData.priceUsd : poke.priceUsd,
      };
    }
  } catch (error) {
    console.warn(`Failed to fetch pump.fun data for ${poke.mintAddress}:`, error);
  }

  return poke;
}

export async function fetchPokes(filter?: string, enrichWithLiveData: boolean = false): Promise<Poke[]> {
  let query = supabase.from('monsters').select('*');
  
  if (filter === 'trending') {
    query = query.order('market_cap', { ascending: false });
  } else if (filter === 'legendary') {
    query = query.eq('evolution_stage', 4);
  } else if (filter && filter !== 'all' && filter !== 'new') {
    const typeFilter = filter.charAt(0).toUpperCase() + filter.slice(1);
    query = query.eq('type', typeFilter as DbPokeType);
  }
  
  query = query.order('created_at', { ascending: false });
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching pokes:', error);
    return [];
  }
  
  const pokes = (data as unknown as DbPoke[]).map(dbPokeToPoke);

  // Optionally enrich with live data (only for first page to avoid too many API calls)
  if (enrichWithLiveData) {
    const enrichedPokes = await Promise.all(
      pokes.slice(0, 12).map(poke => enrichPokeWithPumpData(poke))
    );
    return [...enrichedPokes, ...pokes.slice(12)];
  }

  return pokes;
}

export async function fetchPoke(id: string): Promise<Poke | null> {
  const { data, error } = await supabase
    .from('monsters')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error || !data) {
    console.error('Error fetching poke:', error);
    return null;
  }
  
  return dbPokeToPoke(data as unknown as DbPoke);
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

export async function createPoke(
  creatorWallet: string,
  pokeData: {
    name: string;
    ticker: string;
    description: string;
    type: PokeType;
    hp: number;
    imageUrl: string;
    moves: Move[];
    rarity: Rarity;
    mintAddress?: string;
    twitterLink?: string;
  }
): Promise<Poke | null> {
  const initialMarketCap = Math.floor(Math.random() * 50000) + 5000;
  const pokeId = crypto.randomUUID();
  
  // Build insert object with all fields including mint_address
  const insertData = {
    id: pokeId,
    name: pokeData.name,
    ticker: pokeData.ticker,
    description: pokeData.description,
    type: pokeData.type as DbPokeType,
    hp: pokeData.hp,
    image_url: pokeData.imageUrl,
    moves: pokeData.moves as unknown as never,
    rarity: pokeData.rarity as DbPokeRarity,
    market_cap: initialMarketCap,
    evolution_stage: 1,
    pump_url: pokeData.mintAddress 
      ? `https://pump.fun/${pokeData.mintAddress}` 
      : `https://pump.fun/launch/${pokeId}`,
    creator_wallet: creatorWallet,
    volume_24h: Math.floor(Math.random() * 10000) + 500,
    holders: Math.floor(Math.random() * 100) + 10,
    price_change_24h: (Math.random() - 0.3) * 50,
    mint_address: pokeData.mintAddress || null,
    twitter_link: pokeData.twitterLink || null,
  };
  
  const { data, error } = await supabase
    .from('monsters')
    .insert(insertData)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating poke:', error);
    return null;
  }
  
  return dbPokeToPoke(data as unknown as DbPoke);
}

export async function generatePokeImage(prompt: string, pokeType: PokeType): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-monster-image', {
      body: { prompt, monsterType: pokeType }
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

/**
 * Fetch pokes created by a specific wallet address
 */
export async function fetchPokesByCreator(walletAddress: string): Promise<Poke[]> {
  const { data, error } = await supabase
    .from('monsters')
    .select('*')
    .eq('creator_wallet', walletAddress)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching pokes by creator:', error);
    return [];
  }
  
  return (data as unknown as DbPoke[]).map(dbPokeToPoke);
}

/**
 * Update a poke's mint address
 */
export async function updatePokeMintAddress(pokeId: string, mintAddress: string): Promise<boolean> {
  const { error } = await supabase
    .from('monsters')
    .update({ 
      mint_address: mintAddress,
      pump_url: `https://pump.fun/${mintAddress}`
    })
    .eq('id', pokeId);
  
  if (error) {
    console.error('Error updating mint address:', error);
    return false;
  }
  
  return true;
}
