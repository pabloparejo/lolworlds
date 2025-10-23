export type Theme = 'light' | 'dark' | 'auto';
export type EffectiveTheme = 'light' | 'dark';

const STORAGE_KEY = 'worlds-simulator-theme';

export class ThemeManager {
  private mediaQuery: MediaQueryList;
  private listeners: Set<(theme: EffectiveTheme) => void>;

  constructor() {
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.listeners = new Set();
  }

  /**
   * Get the currently stored theme preference
   * @returns The stored theme or 'auto' if not set
   */
  getTheme(): Theme {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'auto') {
        return stored;
      }
      return 'auto';
    } catch (error) {
      console.error('Failed to get theme:', error);
      return 'auto';
    }
  }

  /**
   * Set the theme preference
   * @param theme - The theme to set
   */
  setTheme(theme: Theme): void {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
      this.applyTheme(theme);
    } catch (error) {
      console.error('Failed to set theme:', error);
    }
  }

  /**
   * Get the effective theme (resolved 'auto' to 'light' or 'dark')
   * @param theme - The theme preference
   * @returns The effective theme that should be applied
   */
  getEffectiveTheme(theme: Theme): EffectiveTheme {
    if (theme === 'auto') {
      return this.mediaQuery.matches ? 'dark' : 'light';
    }
    return theme;
  }

  /**
   * Apply the theme to the document
   * @param theme - The theme to apply
   */
  private applyTheme(theme: Theme): void {
    const effectiveTheme = this.getEffectiveTheme(theme);

    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Notify listeners of theme change
    this.notifyListeners(effectiveTheme);
  }

  /**
   * Subscribe to system theme changes
   * @param callback - Function to call when effective theme changes
   * @returns Unsubscribe function
   */
  onSystemThemeChange(callback: (theme: EffectiveTheme) => void): () => void {
    this.listeners.add(callback);

    // Set up media query listener
    const handleChange = (e: MediaQueryListEvent) => {
      const currentTheme = this.getTheme();
      if (currentTheme === 'auto') {
        const effectiveTheme = e.matches ? 'dark' : 'light';
        this.applyTheme('auto');
      }
    };

    this.mediaQuery.addEventListener('change', handleChange);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
      this.mediaQuery.removeEventListener('change', handleChange);
    };
  }

  /**
   * Notify all listeners of theme change
   */
  private notifyListeners(theme: EffectiveTheme): void {
    this.listeners.forEach(listener => {
      try {
        listener(theme);
      } catch (error) {
        console.error('Theme listener error:', error);
      }
    });
  }

  /**
   * Initialize theme on app startup
   */
  initialize(): void {
    const theme = this.getTheme();
    this.applyTheme(theme);
  }
}

// Singleton instance
export const themeManager = new ThemeManager();
