import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock localStorage for tests
const localStorageMock = {
  getItem: (key: string): string | null => {
    return localStorageMock[key] || null;
  },
  setItem: (key: string, value: string): void => {
    localStorageMock[key] = value;
  },
  removeItem: (key: string): void => {
    delete localStorageMock[key];
  },
  clear: (): void => {
    Object.keys(localStorageMock).forEach((key) => {
      if (key !== 'getItem' && key !== 'setItem' && key !== 'removeItem' && key !== 'clear') {
        delete localStorageMock[key];
      }
    });
  },
};

global.localStorage = localStorageMock as Storage;

// Mock matchMedia for theme tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  }),
});
