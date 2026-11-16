'use client';

import Image from 'next/image';
import styles from '@/assets/layout/Brand.module.scss';
import Link from 'next/link';
import { useAppearance } from '@/store/appearance';

export function Brand({ compact = false, href = '/dashboard' }: { compact?: boolean; href?: string | null }) {
  const { displayName, logo, fallbackToDefaultLogo } = useAppearance();
  const size = compact ? 31 : 36;
  const className = compact ? `${styles.brand} ${styles.compact}` : styles.brand;
  const content = (
    <>
      {logo
        ? <Image className={styles.mark} src={logo} alt="" width={size} height={size} unoptimized onError={fallbackToDefaultLogo} />
        : <span className={styles.mark} style={{ width: size, height: size }} aria-hidden="true" />}
      <span className={styles.name} title={displayName}>{displayName}</span>
    </>
  );

  return href ? <Link className={className} href={href}>{content}</Link> : <div className={className}>{content}</div>;
}
