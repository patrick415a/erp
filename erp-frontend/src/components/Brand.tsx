import styles from '@/assets/layout/Brand.module.scss';
import Link from 'next/link';

export function Brand({ compact = false, href = '/dashboard' }: { compact?: boolean; href?: string }) {
  return (
    <Link
      className={`${styles.brand} ${compact ? styles.compact : ''}`}
      href={href}
    >
      <span className={styles.mark} aria-hidden="true">
        E
      </span>
      <span>ERP 시스템</span>
    </Link>
  );
}
