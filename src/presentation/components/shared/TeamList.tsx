import type { Team } from 'domain/entities/types';
import { TeamCard } from '../swiss/TeamCard';

interface TeamListProps {
  title: string;
  teams: Team[];
  emptyMessage?: string;
}

export function TeamList({ title, teams, emptyMessage = 'No teams yet' }: TeamListProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-[rgb(var(--color-foreground))]">
        {title} ({teams.length})
      </h3>

      {teams.length === 0 ? (
        <div className="text-center py-8 text-[rgb(var(--color-muted-foreground))]">
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-2">
          {teams.map(team => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
}
