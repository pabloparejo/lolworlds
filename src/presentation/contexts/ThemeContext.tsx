import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Theme, EffectiveTheme, themeManager } from '../../infrastructure/theme/ThemeManager';

interface ThemeContextValue {
  theme: Theme;
  effectiveTheme: EffectiveTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => themeManager.getTheme());
  const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>(() =>
    themeManager.getEffectiveTheme(themeManager.getTheme())
  );

  useEffect(() => {
    // Initialize theme on mount
    themeManager.initialize();

    // Subscribe to system theme changes
    const unsubscribe = themeManager.onSystemThemeChange(newEffectiveTheme => {
      setEffectiveTheme(newEffectiveTheme);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const setTheme = (newTheme: Theme) => {
    themeManager.setTheme(newTheme);
    setThemeState(newTheme);
    setEffectiveTheme(themeManager.getEffectiveTheme(newTheme));
  };

  const value: ThemeContextValue = {
    theme,
    effectiveTheme,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
