/**
 * PokeAPI Integration for fetching real Pokemon data
 * https://pokeapi.co/
 */

export interface PokemonData {
  id: number;
  name: string;
  types: string[];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  imageUrl: string;
  moves: { name: string; power: number }[];
}

// Map PokeAPI types to our MonsterType
const TYPE_MAPPING: Record<string, string> = {
  fire: 'Fire',
  water: 'Water',
  electric: 'Electric',
  grass: 'Grass',
  dark: 'Shadow',
  ghost: 'Shadow',
  psychic: 'Shadow',
  normal: 'Meme',
  fairy: 'Meme',
  fighting: 'Fire',
  ground: 'Grass',
  rock: 'Grass',
  bug: 'Grass',
  poison: 'Shadow',
  flying: 'Electric',
  ice: 'Water',
  dragon: 'Fire',
  steel: 'Electric',
};

/**
 * Fetch a single Pokemon by ID or name
 */
export async function fetchPokemon(idOrName: string | number): Promise<PokemonData | null> {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${idOrName}`);
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    // Get primary type
    const primaryType = data.types[0]?.type?.name || 'normal';
    const mappedType = TYPE_MAPPING[primaryType] || 'Meme';

    // Extract stats
    const stats = {
      hp: data.stats.find((s: any) => s.stat.name === 'hp')?.base_stat || 100,
      attack: data.stats.find((s: any) => s.stat.name === 'attack')?.base_stat || 50,
      defense: data.stats.find((s: any) => s.stat.name === 'defense')?.base_stat || 50,
      speed: data.stats.find((s: any) => s.stat.name === 'speed')?.base_stat || 50,
    };

    // Get some moves with power
    const movesWithPower = await Promise.all(
      data.moves.slice(0, 10).map(async (m: any) => {
        try {
          const moveRes = await fetch(m.move.url);
          const moveData = await moveRes.json();
          return {
            name: formatName(m.move.name),
            power: moveData.power || Math.floor(Math.random() * 50) + 30,
          };
        } catch {
          return {
            name: formatName(m.move.name),
            power: Math.floor(Math.random() * 50) + 30,
          };
        }
      })
    );

    // Filter moves that have actual power and pick 2
    const filteredMoves = movesWithPower
      .filter(m => m.power > 0)
      .slice(0, 2);

    if (filteredMoves.length < 2) {
      filteredMoves.push(
        { name: 'Basic Attack', power: 30 },
        { name: 'Special Move', power: 60 }
      );
    }

    return {
      id: data.id,
      name: formatName(data.name),
      types: [mappedType],
      stats,
      imageUrl: data.sprites.other?.['official-artwork']?.front_default || 
                data.sprites.front_default ||
                '/placeholder.svg',
      moves: filteredMoves.slice(0, 2),
    };
  } catch (error) {
    console.error('Error fetching Pokemon:', error);
    return null;
  }
}

/**
 * Fetch multiple random Pokemon for templates
 */
export async function fetchRandomPokemon(count: number = 12): Promise<PokemonData[]> {
  // Get random Pokemon IDs (1-898 are valid)
  const randomIds = Array.from({ length: count }, () => 
    Math.floor(Math.random() * 151) + 1 // Gen 1 Pokemon (1-151)
  );

  const pokemon = await Promise.all(
    randomIds.map(id => fetchPokemon(id))
  );

  return pokemon.filter((p): p is PokemonData => p !== null);
}

/**
 * Fetch popular/iconic Pokemon for templates
 */
export async function fetchPopularPokemon(): Promise<PokemonData[]> {
  const popularIds = [
    25,  // Pikachu
    6,   // Charizard
    150, // Mewtwo
    149, // Dragonite
    143, // Snorlax
    94,  // Gengar
    130, // Gyarados
    9,   // Blastoise
    3,   // Venusaur
    131, // Lapras
    144, // Articuno
    145, // Zapdos
  ];

  const pokemon = await Promise.all(
    popularIds.map(id => fetchPokemon(id))
  );

  return pokemon.filter((p): p is PokemonData => p !== null);
}

/**
 * Format Pokemon name (capitalize, replace hyphens)
 */
function formatName(name: string): string {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}


