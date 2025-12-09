import { Monster } from '@/types/monster';
import { PokemonCard } from './PokemonCard';
import { useNavigate } from 'react-router-dom';

interface MonsterGridProps {
  monsters: Monster[];
  title?: string;
}

export function MonsterGrid({ monsters, title }: MonsterGridProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {title && (
        <h2 className="font-display text-xl font-bold text-foreground">{title}</h2>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {monsters.map((monster) => (
          <PokemonCard
            key={monster.id}
            monster={monster}
            size="md"
            onClick={() => navigate(`/monster/${monster.id}`)}
          />
        ))}
      </div>
      {monsters.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No monsters found</p>
        </div>
      )}
    </div>
  );
}
