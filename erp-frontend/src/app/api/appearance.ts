import defaultLogo from '../../../public/default-logo.png';

export { defaultLogo };

export const emptyFavicon = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>')}`;

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

export const themeStorageKey = 'erp-theme';

export function isTheme(value: unknown): value is Theme {
  return value === 'LIGHT' || value === 'DARK';
}
