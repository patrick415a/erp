'use client';

import Image from 'next/image';
import styles from '@/assets/layout/Brand.module.scss';
import Link from 'next/link';
import { logoUrl } from '@/app/api/appearance';
import { useAppearance } from '@/store/appearance';

export function Brand({ compact = false, href = '/dashboard' }: { compact?: boolean; href?: string | null }) {
  const { appearance } = useAppearance();
  const size = compact ? 31 : 36;
  const className = compact ? `${styles.brand} ${styles.compact}` : styles.brand;
  const content = (
    <>
      <Image className={styles.mark} src={logoUrl(appearance)} alt="" width={size} height={size} unoptimized />
      <span className={styles.name} title={appearance.name}>{appearance.name}</span>
    </>
  );

  return href ? <Link className={className} href={href}>{content}</Link> : <div className={className}>{content}</div>;
}
