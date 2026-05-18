'use client';

import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_THEME_ID, getTheme, THEME_STORAGE_KEY, type ThemeId } from '@/lib/themes';
import { ThemeContext } from '@/hooks/useTheme';

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '');
  const value = Number.parseInt(normalized, 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function hexToHslTriplet(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  let hue = 0;
  let saturation = 0;
  const lightness = (max + min) / 2;

  if (max !== min) {
    const delta = max - min;
    saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case red:
        hue = (green - blue) / delta + (green < blue ? 6 : 0);
        break;
      case green:
        hue = (blue - red) / delta + 2;
        break;
      default:
        hue = (red - green) / delta + 4;
        break;
    }

    hue /= 6;
  }

  return `${Math.round(hue * 360)} ${Math.round(saturation * 100)}% ${Math.round(lightness * 100)}%`;
}

function applyTheme(themeId: ThemeId) {
  const theme = getTheme(themeId);
  const root = document.documentElement;
  const { colors } = theme;

  root.dataset.appTheme = theme.id;
  root.classList.toggle('dark', theme.dark);

  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-primary-dark', colors.primaryDark);
  root.style.setProperty('--color-accent', colors.accent);
  root.style.setProperty('--color-background', colors.background);
  root.style.setProperty('--color-surface', colors.surface);
  root.style.setProperty('--color-soft-surface', colors.softSurface);
  root.style.setProperty('--color-text', colors.text);
  root.style.setProperty('--color-muted-text', colors.mutedText);
  root.style.setProperty('--color-border', colors.border);

  root.style.setProperty('--background', hexToHslTriplet(colors.background));
  root.style.setProperty('--foreground', hexToHslTriplet(colors.text));
  root.style.setProperty('--card', hexToHslTriplet(colors.surface));
  root.style.setProperty('--card-foreground', hexToHslTriplet(colors.text));
  root.style.setProperty('--popover', hexToHslTriplet(colors.surface));
  root.style.setProperty('--popover-foreground', hexToHslTriplet(colors.text));
  root.style.setProperty('--primary', hexToHslTriplet(colors.primary));
  root.style.setProperty('--primary-foreground', theme.dark ? '0 0% 100%' : '0 0% 100%');
  root.style.setProperty('--secondary', hexToHslTriplet(colors.softSurface));
  root.style.setProperty('--secondary-foreground', hexToHslTriplet(colors.text));
  root.style.setProperty('--muted', hexToHslTriplet(colors.softSurface));
  root.style.setProperty('--muted-foreground', hexToHslTriplet(colors.mutedText));
  root.style.setProperty('--accent', hexToHslTriplet(colors.softSurface));
  root.style.setProperty('--accent-foreground', hexToHslTriplet(colors.text));
  root.style.setProperty('--border', hexToHslTriplet(colors.border));
  root.style.setProperty('--input', hexToHslTriplet(colors.border));
  root.style.setProperty('--ring', hexToHslTriplet(colors.primary));
  root.style.setProperty('--sidebar-background', hexToHslTriplet(colors.surface));
  root.style.setProperty('--sidebar-foreground', hexToHslTriplet(colors.text));
  root.style.setProperty('--sidebar-primary', hexToHslTriplet(colors.primary));
  root.style.setProperty('--sidebar-primary-foreground', '0 0% 100%');
  root.style.setProperty('--sidebar-accent', hexToHslTriplet(colors.softSurface));
  root.style.setProperty('--sidebar-accent-foreground', hexToHslTriplet(colors.text));
  root.style.setProperty('--sidebar-border', hexToHslTriplet(colors.border));
  root.style.setProperty('--sidebar-ring', hexToHslTriplet(colors.primary));
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>(DEFAULT_THEME_ID);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null;
    const nextTheme = getTheme(storedTheme).id;
    setThemeId(nextTheme);
    applyTheme(nextTheme);
  }, []);

  const value = useMemo(
    () => ({
      theme: getTheme(themeId),
      themeId,
      setTheme: (nextThemeId: ThemeId) => {
        const nextTheme = getTheme(nextThemeId).id;
        setThemeId(nextTheme);
        window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        applyTheme(nextTheme);
      },
    }),
    [themeId],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
