import { useRef, useCallback, RefObject } from 'react';

interface UseHorizontalScrollReturn {
  scrollRef: RefObject<HTMLDivElement>;
  scrollToRound: (roundIndex: number) => void;
  scrollToEnd: () => void;
}

/**
 * Custom hook for managing horizontal scroll behavior
 * Provides programmatic scrolling to specific rounds or to the end of the timeline
 */
export function useHorizontalScroll(): UseHorizontalScrollReturn {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToRound = useCallback((roundIndex: number) => {
    if (!scrollRef.current) return;

    const roundElement = scrollRef.current.children[roundIndex] as HTMLElement;
    if (roundElement) {
      roundElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start'
      });
    }
  }, []);

  const scrollToEnd = useCallback(() => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollTo({
      left: scrollRef.current.scrollWidth,
      behavior: 'smooth'
    });
  }, []);

  return { scrollRef, scrollToRound, scrollToEnd };
}
