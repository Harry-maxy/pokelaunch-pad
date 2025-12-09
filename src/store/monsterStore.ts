import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Monster, Template, getEvolutionStage, generateWallet } from '@/types/monster';
import { MOCK_MONSTERS, MOCK_TEMPLATES } from '@/data/mockData';

interface MonsterStore {
  monsters: Monster[];
  templates: Template[];
  addMonster: (monster: Omit<Monster, 'id' | 'pumpUrl' | 'creatorWallet' | 'createdAt' | 'evolutionStage'>) => Monster;
  getMonster: (id: string) => Monster | undefined;
  getFilteredMonsters: (filter: string) => Monster[];
  updateMarketCaps: () => void;
}

export const useMonsterStore = create<MonsterStore>()(
  persist(
    (set, get) => ({
      monsters: MOCK_MONSTERS,
      templates: MOCK_TEMPLATES,
      
      addMonster: (monsterData) => {
        const id = `monster-${Date.now()}`;
        const newMonster: Monster = {
          ...monsterData,
          id,
          pumpUrl: `https://pump.fun/launch/${id}`,
          creatorWallet: generateWallet(),
          createdAt: new Date(),
          evolutionStage: getEvolutionStage(monsterData.marketCap),
          volume24h: Math.floor(Math.random() * 10000) + 500,
          holders: Math.floor(Math.random() * 100) + 10,
          priceChange24h: (Math.random() - 0.3) * 50,
        };
        
        set((state) => ({
          monsters: [newMonster, ...state.monsters],
        }));
        
        return newMonster;
      },
      
      getMonster: (id) => {
        return get().monsters.find((m) => m.id === id);
      },
      
      getFilteredMonsters: (filter) => {
        const { monsters } = get();
        
        if (filter === 'all' || filter === 'new') {
          return [...monsters].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
        if (filter === 'trending') {
          return [...monsters].sort((a, b) => b.marketCap - a.marketCap);
        }
        if (filter === 'legendary') {
          return monsters.filter((m) => m.evolutionStage === 4);
        }
        
        const typeFilter = filter.charAt(0).toUpperCase() + filter.slice(1);
        return monsters.filter((m) => m.type === typeFilter);
      },
      
      updateMarketCaps: () => {
        set((state) => ({
          monsters: state.monsters.map((monster) => {
            const change = (Math.random() - 0.4) * 0.1;
            const newMarketCap = Math.max(1000, monster.marketCap * (1 + change));
            return {
              ...monster,
              marketCap: newMarketCap,
              evolutionStage: getEvolutionStage(newMarketCap),
              priceChange24h: change * 100,
            };
          }),
        }));
      },
    }),
    {
      name: 'pokelaunch-monsters',
      partialize: (state) => ({ monsters: state.monsters }),
    }
  )
);
