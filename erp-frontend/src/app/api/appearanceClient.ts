import { erpApiUrl } from './baseUrl';
import { defaultAppearance, isTheme, type Appearance } from './appearance';

export async function loadAppearance(signal: AbortSignal): Promise<Appearance> {
  try {
    const response = await fetch(erpApiUrl('/api/system/appearance'), { cache: 'no-store', signal });
    if (response.ok) {
      const data: Appearance = await response.json();
      if (typeof data?.name === 'string' && data.name.trim() && isTheme(data.defaultTheme)
          && typeof data.hasLogo === 'boolean' && (data.version === null || Number.isSafeInteger(data.version))) {
        return data;
      }
    }
  } catch {
    // Login remains available while the settings service is starting.
  }
  return defaultAppearance;
}

export function systemLogoUrl(version: Appearance['version']) {
  return erpApiUrl(version === null ? '/api/system/logo' : `/api/system/logo?v=${version}`);
}
