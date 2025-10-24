import { DrawAlgorithm } from 'domain/entities/types';

interface DrawSelectorProps {
  algorithm: DrawAlgorithm;
  onChange: (algorithm: DrawAlgorithm) => void;
  disabled?: boolean;
}

export function DrawSelector({ algorithm, onChange, disabled = false }: DrawSelectorProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-card))] px-2 py-1">
      <p className="text-[rgb(var(--color-foreground))]">
        Winning Chances:
      </p>

      <div className="flex gap-2">
        <button
          onClick={() => onChange(DrawAlgorithm.RANDOM)}
          disabled={disabled}
          className={`
            px-4 py-2 rounded-lg font-medium transition-colors
            ${algorithm === DrawAlgorithm.RANDOM
              ? 'bg-blue-600 text-white'
              : 'bg-[rgb(var(--color-muted))] text-[rgb(var(--color-muted-foreground))] hover:bg-[rgb(var(--color-accent))]'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          Even Odds (50/50)
        </button>

        <button
          onClick={() => onChange(DrawAlgorithm.BIASED)}
          disabled={disabled}
          className={`
            px-4 py-2 rounded-lg font-medium transition-colors
            ${algorithm === DrawAlgorithm.BIASED
              ? 'bg-blue-600 text-white'
              : 'bg-[rgb(var(--color-muted))] text-[rgb(var(--color-muted-foreground))] hover:bg-[rgb(var(--color-accent))]'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          Regional Bias
        </button>
      </div>

      {algorithm === DrawAlgorithm.BIASED && (
        <span className="text-sm text-[rgb(var(--color-muted-foreground))]">
          LCK &gt; LPL &gt; LCP &gt; LEC &gt; LCS
        </span>
      )}
    </div>
  );
}
