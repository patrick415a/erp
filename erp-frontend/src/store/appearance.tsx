'use client';

import { createContext, useContext, useEffect, useLayoutEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { defaultAppearance, defaultLogo, emptyFavicon, isTheme, themeStorageKey, type Appearance, type Theme } from '@/app/api/appearance';
import { loadAppearance, systemLogoUrl } from '@/app/api/appearanceClient';

interface AppearanceContext {
  appearance: Appearance;
  displayName: string;
  logo: string | typeof defaultLogo | null;
  fallbackToDefaultLogo: () => void;
  theme: Theme;
  setPersonalTheme: (theme: Theme) => void;
  applyAppearance: (appearance: Appearance) => void;
}

const AppearanceContext = createContext<AppearanceContext>({
  appearance: defaultAppearance,
  displayName: '',
  logo: null,
  fallbackToDefaultLogo: () => {},
  theme: defaultAppearance.defaultTheme,
  setPersonalTheme: () => {},
  applyAppearance: () => {},
});

const themeChangeEvent = 'erp-theme-change';
const appearanceTimeout = 2500;

function subscribeToTheme(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(themeChangeEvent, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(themeChangeEvent, onChange);
  };
}

function getStoredTheme(): Theme | null {
  try {
    const value = window.localStorage.getItem(themeStorageKey);
    return isTheme(value) ? value : null;
  } catch {
    return null;
  }
}

function getServerTheme() {
  return null;
}

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const storedTheme = useSyncExternalStore(subscribeToTheme, getStoredTheme, getServerTheme);
  const [sessionTheme, setSessionTheme] = useState<Theme | null>(null);
  const [loadedAppearance, setAppearance] = useState<Appearance | null>(null);
  const [logoResult, setLogoResult] = useState<{ url: string; available: boolean } | null>(null);
  const appearance = loadedAppearance ?? defaultAppearance;
  const displayName = loadedAppearance?.name ?? '';
  const theme = sessionTheme ?? storedTheme ?? appearance.defaultTheme;
  const customLogo = appearance.hasLogo ? systemLogoUrl(appearance.version) : null;
  let logo: AppearanceContext['logo'] = null;
  if (loadedAppearance && !customLogo) logo = defaultLogo;
  if (customLogo && logoResult?.url === customLogo) logo = logoResult.available ? customLogo : defaultLogo;

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), appearanceTimeout);
    let active = true;

    void loadAppearance(controller.signal).then((value) => {
      window.clearTimeout(timeout);
      if (active) setAppearance((current) => current ?? value);
    });

    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!customLogo) return;

    const image = new window.Image();
    const timeout = window.setTimeout(() => finish(false), appearanceTimeout);

    function cleanup() {
      window.clearTimeout(timeout);
      image.onload = null;
      image.onerror = null;
    }

    const finish = (available: boolean) => {
      cleanup();
      setLogoResult({ url: customLogo, available });
    };

    image.onload = () => finish(true);
    image.onerror = () => finish(false);
    image.src = customLogo;
    return cleanup;
  }, [customLogo]);

  useEffect(() => {
    document.title = displayName;
  }, [displayName]);

  useEffect(() => {
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (favicon) favicon.href = typeof logo === 'string' ? logo : logo?.src ?? emptyFavicon;
  }, [logo]);

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
    try {
      window.localStorage.setItem(themeStorageKey, value);
      setSessionTheme(null);
      window.dispatchEvent(new Event(themeChangeEvent));
    } catch {
      setSessionTheme(value);
    }
  }

  function applyAppearance(value: Appearance) {
    setAppearance(value);
  }

  function fallbackToDefaultLogo() {
    if (customLogo) setLogoResult({ url: customLogo, available: false });
  }

  return (
    <AppearanceContext.Provider value={{ appearance, displayName, logo, fallbackToDefaultLogo, theme, setPersonalTheme, applyAppearance }}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  return useContext(AppearanceContext);
}
