import { createContext, useContext, ReactNode } from 'react';
import { useTournament } from 'application/hooks/useTournament';
import type { UseTournamentReturn } from 'application/hooks/useTournament';

const TournamentContext = createContext<UseTournamentReturn | undefined>(undefined);

interface TournamentProviderProps {
  children: ReactNode;
}

export function TournamentProvider({ children }: TournamentProviderProps) {
  const tournament = useTournament();

  return (
    <TournamentContext.Provider value={tournament}>
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournamentContext(): UseTournamentReturn {
  const context = useContext(TournamentContext);

  if (context === undefined) {
    throw new Error('useTournamentContext must be used within a TournamentProvider');
  }

  return context;
}
