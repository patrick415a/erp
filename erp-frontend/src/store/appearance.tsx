'use client';

import { createContext, useContext, useLayoutEffect, useState, type ReactNode } from 'react';
import { defaultAppearance, logoUrl, themeCookie, type Appearance, type Theme } from '@/app/api/appearance';

interface AppearanceContext {
  appearance: Appearance;
  theme: Theme;
  setPersonalTheme: (theme: Theme) => void;
  applyAppearance: (appearance: Appearance) => void;
}

const AppearanceContext = createContext<AppearanceContext>({
  appearance: defaultAppearance,
  theme: 'LIGHT',
  setPersonalTheme: () => {},
  applyAppearance: () => {},
});

export function AppearanceProvider({ initial, savedTheme, children }: {
  initial: Appearance;
  savedTheme: Theme | null;
  children: ReactNode;
}) {
  const [personalTheme, setTheme] = useState(savedTheme);
  const [updated, setUpdated] = useState<Appearance | null>(null);
  const appearance = updated && (updated.version ?? -1) > (initial.version ?? -1) ? updated : initial;
  const theme = personalTheme ?? appearance.defaultTheme;

  useLayoutEffect(() => {
    const root = document.documentElement;
    const nextTheme = theme.toLowerCase();
    if (root.dataset.theme === nextTheme) return;

    root.dataset.themeSwitching = '';
    root.dataset.theme = nextTheme;
    // Apply the new colors before restoring hover and focus transitions.
    void root.offsetHeight;
    delete root.dataset.themeSwitching;
  }, [theme]);

  function setPersonalTheme(value: Theme) {
    document.cookie = `${themeCookie}=${value}; Path=/; Max-Age=31536000; SameSite=Lax`;
    setTheme(value);
  }

  function applyAppearance(value: Appearance) {
    setUpdated(value);
    document.title = value.name;
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (favicon) favicon.href = logoUrl(value);
  }

  return (
    <AppearanceContext.Provider value={{ appearance, theme, setPersonalTheme, applyAppearance }}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  return useContext(AppearanceContext);
}
