import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Poke, Template, getEvolutionStage, generateWallet } from '@/types/monster';
import { MOCK_POKES, MOCK_TEMPLATES } from '@/data/mockData';

interface PokeStore {
  pokes: Poke[];
  templates: Template[];
  addPoke: (poke: Omit<Poke, 'id' | 'pumpUrl' | 'creatorWallet' | 'createdAt' | 'evolutionStage'>) => Poke;
  addMonster: (poke: Omit<Poke, 'id' | 'pumpUrl' | 'creatorWallet' | 'createdAt' | 'evolutionStage'>) => Poke;
  getPoke: (id: string) => Poke | undefined;
  getFilteredPokes: (filter: string) => Poke[];
  updateMarketCaps: () => void;
}

export const usePokeStore = create<PokeStore>()(
  persist(
    (set, get) => ({
      pokes: MOCK_POKES,
      templates: MOCK_TEMPLATES,
      
      addPoke: (pokeData) => {
        const id = `poke-${Date.now()}`;
        const newPoke: Poke = {
          ...pokeData,
          id,
          pumpUrl: `https://pump.fun/launch/${id}`,
          creatorWallet: generateWallet(),
          createdAt: new Date(),
          evolutionStage: getEvolutionStage(pokeData.marketCap),
          volume24h: Math.floor(Math.random() * 10000) + 500,
          holders: Math.floor(Math.random() * 100) + 10,
          priceChange24h: (Math.random() - 0.3) * 50,
        };
        
        set((state) => ({
          pokes: [newPoke, ...state.pokes],
        }));
        
        return newPoke;
      },
      
      get addMonster() {
        return this.addPoke;
      },
      
      getPoke: (id) => {
        return get().pokes.find((p) => p.id === id);
      },
      
      getFilteredPokes: (filter) => {
        const { pokes } = get();
        
        if (filter === 'all' || filter === 'new') {
          return [...pokes].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
        if (filter === 'trending') {
          return [...pokes].sort((a, b) => b.marketCap - a.marketCap);
        }
        if (filter === 'legendary') {
          return pokes.filter((p) => p.evolutionStage === 4);
        }
        
        const typeFilter = filter.charAt(0).toUpperCase() + filter.slice(1);
        return pokes.filter((p) => p.type === typeFilter);
      },
      
      updateMarketCaps: () => {
        set((state) => ({
          pokes: state.pokes.map((poke) => {
            const change = (Math.random() - 0.4) * 0.1;
            const newMarketCap = Math.max(1000, poke.marketCap * (1 + change));
            return {
              ...poke,
              marketCap: newMarketCap,
              evolutionStage: getEvolutionStage(newMarketCap),
              priceChange24h: change * 100,
            };
          }),
        }));
      },
    }),
    {
      name: 'pokelaunch-pokes',
      partialize: (state) => ({ pokes: state.pokes }),
    }
  )
);

// Backwards compatibility alias
export const useMonsterStore = usePokeStore;
