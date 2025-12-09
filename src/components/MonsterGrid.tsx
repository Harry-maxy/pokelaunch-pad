import { Poke, Monster } from '@/types/monster';
import { PokemonCard } from './PokemonCard';
import { useNavigate } from 'react-router-dom';

interface PokeGridProps {
  pokes?: Poke[];
  monsters?: Monster[];
  title?: string;
}

export function MonsterGrid({ pokes, monsters, title }: PokeGridProps) {
  const navigate = useNavigate();
  const items = pokes || monsters || [];

  return (
    <div className="space-y-4">
      {title && (
        <h2 className="font-display text-xl font-bold text-foreground">{title}</h2>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((poke) => (
          <PokemonCard
            key={poke.id}
            monster={poke}
            size="md"
            onClick={() => navigate(`/poke/${poke.id}`)}
          />
        ))}
      </div>
      {items.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No pokes found</p>
        </div>
      )}
    </div>
  );
}
