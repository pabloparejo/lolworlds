import { ThemeToggle } from '../shared/ThemeToggle';

export function Header() {
  return (
    <header className="border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-card))]">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[rgb(var(--color-foreground))]">
              Worlds Simulator
            </h1>
            <span className="text-sm text-[rgb(var(--color-muted-foreground))] hidden sm:inline">
              League of Legends Tournament Simulator
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
