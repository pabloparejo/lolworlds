import { ThemeToggle } from 'presentation/components/shared/ThemeToggle';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-card))] backdrop-blur supports-[backdrop-filter]:bg-[rgba(var(--color-card),0.9)]">
      <div className="mx-auto flex w-full max-w-screen-xl items-center justify-between px-3 py-3 sm:px-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[rgb(var(--color-foreground))]">
            Worlds Simulator
          </h1>
          <span className="hidden text-sm text-[rgb(var(--color-muted-foreground))] sm:inline">
            League of Legends - Worlds Championship Simulator
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
