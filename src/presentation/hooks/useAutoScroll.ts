import { useEffect, useRef, RefObject } from 'react';

interface UseAutoScrollParams {
  scrollRef: RefObject<HTMLDivElement>;
  currentRound: number;
  enabled: boolean;
}

/**
 * Custom hook for automatically scrolling to newly simulated rounds
 * Watches currentRound changes and triggers smooth scroll to the latest round
 */
export function useAutoScroll({ scrollRef, currentRound, enabled }: UseAutoScrollParams): void {
  const prevRound = useRef(currentRound);

  useEffect(() => {
    if (!enabled) return;

    if (currentRound > prevRound.current) {
      // New round was simulated - auto-scroll after DOM update
      const delay = setTimeout(() => {
        const container = scrollRef.current;
        if (!container) return;

        const roundElements = container.querySelectorAll<HTMLElement>('[data-round]');
        const lastRound = roundElements[roundElements.length - 1];

        if (!lastRound) return;

        lastRound.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'end'
        });

        // Focus management for accessibility
        const roundHeader = lastRound.querySelector<HTMLElement>('h3');
        roundHeader?.focus();
      }, 300);

      prevRound.current = currentRound;
      return () => clearTimeout(delay);
    }
  }, [currentRound, scrollRef, enabled]);
}
