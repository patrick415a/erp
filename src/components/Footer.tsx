import styles from './Footer.module.scss';
export function Footer() {
  return (
    <footer className={styles.footer}>
      <div><strong>Smart ERP System</strong> v1.0.0 <span>© {new Date().getFullYear()} All rights reserved.</span></div>
      <nav aria-label="서비스 안내"><a href="/support">기술지원</a><a href="/terms">이용약관</a><a href="/manual">사용자 매뉴얼</a></nav>
    </footer>
  );
}
