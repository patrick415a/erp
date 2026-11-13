import { cache } from 'react';
import { defaultAppearance, isTheme, type Appearance } from './appearance';

export function requestAppearanceResource(path: string) {
  const base = process.env.ERP_API_URL || process.env.NEXT_PUBLIC_ERP_API_URL || 'http://127.0.0.1:8080';
  return fetch(base.replace(/\/$/, '') + path, { cache: 'no-store', signal: AbortSignal.timeout(2500) });
}

export const loadAppearance = cache(async (): Promise<Appearance> => {
  try {
    const response = await requestAppearanceResource('/api/system/appearance');
    if (response.ok) {
      const data: Appearance = await response.json();
      if (typeof data.name === 'string' && isTheme(data.defaultTheme) && typeof data.hasLogo === 'boolean') return data;
    }
  } catch {
    // Login remains available while the settings service is starting.
  }
  return defaultAppearance;
});
