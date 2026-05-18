import { createContext, useContext } from 'react';
import type { AppTheme, ThemeId } from '@/lib/themes';

interface ThemeContextValue {
  theme: AppTheme;
  themeId: ThemeId;
  setTheme: (themeId: ThemeId) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
}
