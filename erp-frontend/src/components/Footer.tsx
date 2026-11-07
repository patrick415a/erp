import Link from 'next/link';
import styles from '@/assets/layout/Footer.module.scss';
export function Footer() {
  return (
    <footer className={styles.footer}>
      <div>
        <strong>Smart ERP System</strong> v1.0.0{' '}
        <span>© {new Date().getFullYear()} All rights reserved.</span>
      </div>
      <nav aria-label="서비스 안내">
        <Link href="/dashboard/support">기술지원</Link>
        <Link href="/dashboard/terms">이용약관</Link>
        <Link href="/dashboard/manual">사용자 매뉴얼</Link>
      </nav>
    </footer>
  );
}
