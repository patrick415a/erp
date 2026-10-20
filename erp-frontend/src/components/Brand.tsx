import styles from './Brand.module.scss';
import { useRouter } from 'next/navigation';

export function Brand({ compact = false }: { compact?: boolean; }) {

  const router = useRouter();

  return (
    <div className={`${styles.brand} ${compact ? styles.compact : ''}`} onClick={() => router.push('/dashboard')}>
      <span className={styles.mark} aria-hidden="true">E</span><span>ERP 시스템</span>
    </div>
  );
}
