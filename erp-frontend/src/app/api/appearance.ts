export type Theme = 'LIGHT' | 'DARK';

export interface Appearance {
  name: string;
  defaultTheme: Theme;
  hasLogo: boolean;
  version: number | null;
}

export const defaultAppearance: Appearance = {
  name: 'ERP 시스템',
  defaultTheme: 'LIGHT',
  hasLogo: false,
  version: null,
};

export const defaultLogo = '/default-logo.png';
export const themeCookie = 'erp-theme';

export function isTheme(value: unknown): value is Theme {
  return value === 'LIGHT' || value === 'DARK';
}

export function logoUrl(appearance: Appearance) {
  return appearance.hasLogo ? `/system-logo?v=${appearance.version}` : defaultLogo;
}
