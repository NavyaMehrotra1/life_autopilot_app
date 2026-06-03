import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import {
  ThemeColors,
  ThemeMode,
  elevation,
  palette,
} from '@/constants/theme';

type ThemeContextValue = {
  mode: ThemeMode;
  colors: ThemeColors;
  shadow: ReturnType<typeof elevation>;
  /** True once the persisted preference has loaded. */
  ready: boolean;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
};

const STORAGE_KEY = 'la:theme-mode';

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [ready, setReady] = useState(false);

  // Load the saved preference once; fall back to the system scheme.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (active) {
          if (saved === 'light' || saved === 'dark') setModeState(saved);
          else if (system === 'dark') setModeState('dark');
        }
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => {
      active = false;
    };
    // Intentionally run once — system is only the first-run default.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  };

  const toggle = () => setMode(mode === 'dark' ? 'light' : 'dark');

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      colors: palette(mode),
      shadow: elevation(mode),
      ready,
      toggle,
      setMode,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode, ready],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
