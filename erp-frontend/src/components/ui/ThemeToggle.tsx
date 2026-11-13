'use client';

import styles from '@/assets/common/Button.module.scss';
import { useAppearance } from '@/store/appearance';
import { Icon } from './Icon';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setPersonalTheme } = useAppearance();
  const isDark = theme === 'DARK';
  const label = isDark ? '라이트 모드로 전환' : '다크 모드로 전환';

  return (
    <button
      type="button"
      className={className ? `${styles.themeToggle} ${className}` : styles.themeToggle}
      aria-label={label}
      title={label}
      onClick={() => setPersonalTheme(isDark ? 'LIGHT' : 'DARK')}
    >
      <Icon name={isDark ? 'sun' : 'moon'} size={20} />
    </button>
  );
}
